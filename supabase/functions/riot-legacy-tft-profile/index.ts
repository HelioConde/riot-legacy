import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const H={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Content-Type":"application/json; charset=utf-8",
  "Cache-Control":"no-store"
};

const out=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:H});

function clean(value:unknown,max:number){
  return String(value??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max);
}

function regionFor(platform:string){
  if(["br1","na1","la1","la2"].includes(platform)) return "americas";
  if(["kr","jp1"].includes(platform)) return "asia";
  if(["ph2","sg2","th2","tw2","vn2","oc1"].includes(platform)) return "sea";
  return "europe";
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:H});
  if(req.method!=="POST") return out({_transportError:{code:"method_not_allowed",status:405}},200);

  let body:any={};
  try{body=await req.json()}catch{return out({_transportError:{code:"invalid_json",status:400}},200)}

  const gameName=clean(body?.gameName,16);
  const tagLine=clean(body?.tagLine,5).replace(/^#/,"");
  const platform=clean(body?.platform,8).toLowerCase();
  if(!gameName||!tagLine||!platform){
    return out({_transportError:{code:"invalid_identity",status:400,message:"Riot ID inválido."}},200);
  }

  const url=Deno.env.get("SUPABASE_URL")||"";
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
  if(!url||!service){
    return out({_transportError:{code:"backend_not_configured",status:503,message:"Backend indisponível."}},200);
  }

  let upstreamStatus=0;
  let upstreamBody:any=null;
  try{
    const response=await fetch(url+"/functions/v1/public-tft-profile",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body),
      signal:AbortSignal.timeout(14000)
    });
    upstreamStatus=response.status;
    try{upstreamBody=await response.json()}catch{upstreamBody=null}
    if(response.ok&&upstreamBody&&!upstreamBody.error){
      return out({...upstreamBody,cacheMeta:{stale:false,upstreamStatus}});
    }
  }catch{
    upstreamStatus=0;
  }

  const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const region=regionFor(platform);
  const cacheKey=`${region}:${platform}:${gameName.toLowerCase()}#${tagLine.toLowerCase()}`;
  const {data:player}=await db
    .from("riot_player_cache")
    .select("puuid")
    .eq("cache_key",cacheKey)
    .maybeSingle();

  if(player?.puuid){
    const {data:historyRows}=await db
      .from("riot_legacy_snapshots")
      .select("snapshot_date,captured_at,summary,lol,tft")
      .eq("puuid",player.puuid)
      .eq("platform",platform)
      .order("snapshot_date",{ascending:false})
      .limit(12);

    const history=Array.isArray(historyRows)?historyRows:[];
    const latest=history[0];
    const cached=latest?.tft;
    if(cached&&typeof cached==="object"&&Object.keys(cached).length){
      return out({
        ...cached,
        matches:Array.isArray(cached.matches)?cached.matches:[],
        cacheMeta:{
          stale:true,
          snapshotDate:latest.snapshot_date,
          capturedAt:latest.captured_at,
          upstreamStatus,
          upstreamCode:upstreamBody?.error||null,
          history
        }
      });
    }
  }

  const code=String(upstreamBody?.error||"riot_unavailable");
  const status=Number(upstreamStatus||503);
  return out({
    _transportError:{
      code,
      status,
      message:upstreamBody?.message||"Os dados Riot estão temporariamente indisponíveis."
    }
  });
});
