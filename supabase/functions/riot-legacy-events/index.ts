import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const H={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"content-type, x-client-info",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Content-Type":"application/json; charset=utf-8"
};

const ALLOWED=new Set([
  "app_open",
  "profile_lookup",
  "profile_loaded",
  "profile_partial",
  "profile_fallback",
  "snapshot_loaded",
  "tab_open",
  "share",
  "download_card",
  "favorite_milestone",
  "install_prompt_available",
  "pwa_installed"
]);

function clean(value:unknown,max:number){
  return String(value??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max);
}

function out(body:unknown,status=200){
  return new Response(JSON.stringify(body),{status,headers:H});
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:H});
  if(req.method!=="POST") return out({error:"method_not_allowed"},405);

  let body:any={};
  try{body=await req.json()}catch{return out({error:"invalid_json"},400)}

  const eventName=clean(body?.eventName,80);
  const sessionId=clean(body?.sessionId,80);
  if(!ALLOWED.has(eventName)||sessionId.length<8) return out({error:"invalid_event"},400);

  const url=Deno.env.get("SUPABASE_URL")||"";
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
  if(!url||!service) return out({error:"backend_not_configured"},503);

  const context:any={};
  const sourceState=clean(body?.context?.sourceState,20);
  const platform=clean(body?.context?.platform,8).toLowerCase();
  const tab=clean(body?.context?.tab,20);
  const snapshotCount=Number(body?.context?.snapshotCount);
  if(sourceState) context.sourceState=sourceState;
  if(platform) context.platform=platform;
  if(tab) context.tab=tab;
  if(Number.isFinite(snapshotCount) && snapshotCount>=0 && snapshotCount<=1000) context.snapshotCount=Math.floor(snapshotCount);

  const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error}=await db.from("client_event_logs").insert({
    session_id:sessionId,
    event_name:eventName,
    level:"info",
    area:"riot-legacy",
    message:null,
    context,
    page_path:clean(body?.pagePath,200)||null,
    app_version:clean(body?.appVersion,40)||null,
    duration_ms:null
  });

  if(error){
    console.error("[riot-legacy-events]",error.message);
    return out({error:"write_failed"},502);
  }

  return out({ok:true});
});
