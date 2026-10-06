import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const H={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, content-type, x-client-info",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Content-Type":"application/json; charset=utf-8",
  "Cache-Control":"no-store"
};

const out=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:H});

function clean(value:unknown,max:number){
  return String(value??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max);
}

function slugify(value:string){
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-|-$/g,"")
    .slice(0,48);
}

function regionFor(platform:string){
  if(["br1","na1","la1","la2"].includes(platform)) return "americas";
  if(["kr","jp1"].includes(platform)) return "asia";
  if(["ph2","sg2","th2","tw2","vn2","oc1"].includes(platform)) return "sea";
  return "europe";
}

async function authUser(req:Request, url:string, anon:string){
  const header=req.headers.get("authorization")||"";
  const token=header.replace(/^Bearer\s+/i,"").trim();
  if(!token) return null;
  const client=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await client.auth.getUser(token);
  return error?null:data.user;
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:H});
  if(req.method!=="POST") return out({error:"method_not_allowed"},405);

  const url=Deno.env.get("SUPABASE_URL")||"";
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
  const anon=Deno.env.get("SUPABASE_ANON_KEY")||"";
  if(!url||!service||!anon) return out({error:"backend_not_configured"},503);

  let body:any={};
  try{body=await req.json()}catch{return out({error:"invalid_json"},400)}
  const action=clean(body?.action,32).toLowerCase();
  const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});

  if(action==="read"){
    const slug=clean(body?.slug,64).toLowerCase();
    if(!/^[a-z0-9][a-z0-9-]{2,63}$/.test(slug)) return out({error:"invalid_slug"},400);

    const {data:profile,error}=await db
      .from("riot_legacy_public_profiles")
      .select("public_slug,platform,ownership_verified_at,published_at,puuid")
      .eq("public_slug",slug)
      .eq("is_public",true)
      .not("ownership_verified_at","is",null)
      .maybeSingle();

    if(error||!profile) return out({error:"not_found"},404);

    const {data:snapshot}=await db
      .from("riot_legacy_snapshots")
      .select("snapshot_date,summary,lol,tft")
      .eq("puuid",profile.puuid)
      .eq("platform",profile.platform)
      .order("snapshot_date",{ascending:false})
      .limit(1)
      .maybeSingle();

    return out({
      profile:{
        slug:profile.public_slug,
        platform:profile.platform,
        publishedAt:profile.published_at,
        verified:true
      },
      snapshot:snapshot||null
    });
  }

  const user=await authUser(req,url,anon);
  if(!user) return out({error:"authentication_required"},401);

  if(action==="status"){
    const {data,error}=await db
      .from("riot_legacy_public_profiles")
      .select("public_slug,is_public,indexing_opt_in,ownership_method,ownership_verified_at,published_at,revoked_at,platform")
      .eq("user_id",user.id)
      .order("updated_at",{ascending:false})
      .limit(10);
    if(error) return out({error:"status_failed"},502);
    return out({profiles:data||[]});
  }

  const gameName=clean(body?.gameName,16);
  const tagLine=clean(body?.tagLine,5).replace(/^#/,"");
  const platform=clean(body?.platform,8).toLowerCase();
  if(!gameName||!tagLine||!platform) return out({error:"invalid_identity"},400);

  const cacheKey=`${regionFor(platform)}:${platform}:${gameName.toLowerCase()}#${tagLine.toLowerCase()}`;
  const {data:cached,error:cacheError}=await db
    .from("riot_player_cache")
    .select("puuid,game_name,tag_line")
    .eq("cache_key",cacheKey)
    .maybeSingle();
  if(cacheError||!cached?.puuid) return out({error:"identity_not_cached"},409);

  if(action==="draft"){
    const requested=clean(body?.slug,64).toLowerCase();
    const base=slugify(requested||`${cached.game_name||gameName}-${cached.tag_line||tagLine}`)||"riot-legacy";
    const slug=`${base.slice(0,54)}-${user.id.replace(/-/g,"").slice(0,8)}`.slice(0,63);

    const {data,error}=await db
      .from("riot_legacy_public_profiles")
      .upsert({
        user_id:user.id,
        puuid:cached.puuid,
        platform,
        public_slug:slug,
        is_public:false,
        indexing_opt_in:false,
        updated_at:new Date().toISOString()
      },{onConflict:"user_id,puuid,platform"})
      .select("public_slug,is_public,indexing_opt_in,ownership_verified_at")
      .single();

    if(error) return out({error:"draft_failed"},502);
    return out({profile:data,verificationRequired:true});
  }

  const {data:existing,error:existingError}=await db
    .from("riot_legacy_public_profiles")
    .select("*")
    .eq("user_id",user.id)
    .eq("puuid",cached.puuid)
    .eq("platform",platform)
    .maybeSingle();

  if(existingError||!existing) return out({error:"draft_required"},409);

  if(action==="publish"){
    if(!existing.ownership_verified_at){
      return out({
        error:"ownership_verification_required",
        verificationMethod:"rso",
        message:"Riot account ownership must be verified before publication."
      },409);
    }

    const indexingOptIn=body?.indexingOptIn===true;
    const now=new Date().toISOString();
    const {data,error}=await db
      .from("riot_legacy_public_profiles")
      .update({
        is_public:true,
        indexing_opt_in:indexingOptIn,
        published_at:now,
        revoked_at:null,
        updated_at:now
      })
      .eq("id",existing.id)
      .select("public_slug,is_public,indexing_opt_in,published_at")
      .single();
    if(error) return out({error:"publish_failed"},502);
    return out({profile:data});
  }

  if(action==="revoke"){
    const now=new Date().toISOString();
    const {data,error}=await db
      .from("riot_legacy_public_profiles")
      .update({
        is_public:false,
        indexing_opt_in:false,
        revoked_at:now,
        updated_at:now
      })
      .eq("id",existing.id)
      .select("public_slug,is_public,indexing_opt_in,revoked_at")
      .single();
    if(error) return out({error:"revoke_failed"},502);
    return out({profile:data});
  }

  return out({error:"unsupported_action"},400);
});
