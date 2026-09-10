import {authConfigured,isAdmin,validPassword,sessionCookie,clearCookie} from './_lib/auth.js';
import {clientIp,sameOrigin} from './_lib/request.js';

const attempts=new Map();
function allowed(req){const now=Date.now(),ip=clientIp(req),entry=attempts.get(ip)||{count:0,until:now+15*60_000};if(entry.until<now){entry.count=0;entry.until=now+15*60_000}entry.count++;attempts.set(ip,entry);return entry.count<=8}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET')return res.status(200).json({configured:authConfigured(),authenticated:isAdmin(req)});
  if(req.method==='POST'){
    if(!sameOrigin(req))return res.status(403).json({error:'Request origin is not allowed.'});
    if(!authConfigured())return res.status(503).json({error:'Admin access is not configured.'});
    if(!allowed(req))return res.status(429).json({error:'Too many sign-in attempts. Please wait and try again.'});
    if(!validPassword(req.body?.password))return res.status(401).json({error:'The password is incorrect.'});
    attempts.delete(clientIp(req));res.setHeader('Set-Cookie',sessionCookie());return res.status(200).json({authenticated:true});
  }
  if(req.method==='DELETE'){if(!sameOrigin(req))return res.status(403).json({error:'Request origin is not allowed.'});res.setHeader('Set-Cookie',clearCookie());return res.status(200).json({authenticated:false})}
  res.setHeader('Allow','GET, POST, DELETE');return res.status(405).json({error:'Method not allowed.'});
}
