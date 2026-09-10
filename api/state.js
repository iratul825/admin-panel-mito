import {authConfigured,isAdmin} from './_lib/auth.js';
import {loadState,mutateState,storageConfigured} from './_lib/db.js';
import {sameOrigin} from './_lib/request.js';

const validState=value=>value&&value.version===1&&Array.isArray(value.products)&&Array.isArray(value.experts)&&Array.isArray(value.services)&&Array.isArray(value.departments)&&Array.isArray(value.groups)&&value.settings&&value.chatbot;

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(!storageConfigured())return res.status(503).json({error:'Shared storage is not configured.'});
  try{
    if(req.method==='GET'){
      if(!isAdmin(req))return res.status(401).json({error:'Sign in to open the admin workspace.',authConfigured:authConfigured()});
      const state=await loadState();
      return res.status(200).json({state,admin:true,authConfigured:authConfigured()});
    }
    if(req.method==='PUT'){
      if(!sameOrigin(req))return res.status(403).json({error:'Request origin is not allowed.'});
      if(!isAdmin(req))return res.status(401).json({error:'Sign in to update the website.'});
      if(!validState(req.body?.state))return res.status(400).json({error:'The website data is invalid.'});
      const incoming=structuredClone(req.body.state);
      const {state}=await mutateState(current=>{incoming.orders=current.orders;incoming.bookings=current.bookings;incoming.cart=[];Object.keys(current).forEach(key=>delete current[key]);Object.assign(current,incoming)});
      return res.status(200).json({state,admin:true});
    }
    res.setHeader('Allow','GET, PUT');return res.status(405).json({error:'Method not allowed.'});
  }catch(error){return res.status(500).json({error:error.message||'The website data could not be loaded.'})}
}
