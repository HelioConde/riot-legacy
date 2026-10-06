import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const H={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, content-type, x-client-info",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Content-Type":"application/json; charset=utf-8",
  "Cache-Control":"no-store"
};

const out=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:H});

async function sha256Hex(value:string){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("");
}

async function authUser(req:Request,url:string,anon:string){
  const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"").trim();
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
  const clientId=Deno.env.get("RIOT_RSO_CLIENT_ID")||"";
  const redirectUri=Deno.env.get("RIOT_RSO_REDIRECT_URI")||"";

  if(!url||!service||!anon) return out({error:"backend_not_configured"},503);
  if(!clientId||!redirectUri){
    return out({
      error:"rso_not_configured",
      message:"RSO becomes available only after Riot approves the production application and issues an RSO client."
    },503);
  }

  const user=await authUser(req,url,anon);
  if(!user) return out({error:"authentication_required"},401);

  const state=crypto.randomUUID().replace(/-/g,"")+crypto.randomUUID().replace(/-/g,"");
  const stateHash=await sha256Hex(state);
  const expiresAt=new Date(Date.now()+10*60*1000).toISOString();

  const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  await db.from("riot_legacy_rso_states").delete().eq("user_id",user.id).lt("expires_at",new Date().toISOString());

  const {error}=await db.from("riot_legacy_rso_states").insert({
    user_id:user.id,
    state_hash:stateHash,
    redirect_uri:redirectUri,
    expires_at:expiresAt
  });
  if(error) return out({error:"state_write_failed"},502);

  const authorize=new URL("https://auth.riotgames.com/authorize");
  authorize.searchParams.set("client_id",clientId);
  authorize.searchParams.set("redirect_uri",redirectUri);
  authorize.searchParams.set("response_type","code");
  authorize.searchParams.set("scope","openid offline_access");
  authorize.searchParams.set("state",state);

  return out({
    authorizeUrl:authorize.toString(),
    expiresAt
  });
});
