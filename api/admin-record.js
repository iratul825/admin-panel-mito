import {isAdmin} from './_lib/auth.js';
import {mutateState,storageConfigured} from './_lib/db.js';
import {sameOrigin} from './_lib/request.js';
import {updateAdminOrder,updateAdminBooking} from './_lib/admin-records.js';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='PATCH'){
    res.setHeader('Allow','PATCH');
    return res.status(405).json({error:'Method not allowed.'});
  }
  if(!sameOrigin(req))return res.status(403).json({error:'Request origin is not allowed.'});
  if(!isAdmin(req))return res.status(401).json({error:'Sign in to update records.'});
  if(!storageConfigured())return res.status(503).json({error:'Shared storage is not configured.'});
  try{
    const kind=req.body?.kind;
    const id=String(req.body?.id||'');
    const changes=req.body?.changes||{};
    const {state,result}=await mutateState(current=>kind==='order'?updateAdminOrder(current,id,changes):kind==='booking'?updateAdminBooking(current,id,changes):(()=>{throw new Error('Unknown record type.')})());
    return res.status(200).json({state,result,admin:true});
  }catch(error){return res.status(400).json({error:error.message||'The record could not be updated.'})}
}
