import {seedState} from './data.js';

let database,state,backend=false,authenticated=false;
const listeners=new Set();
let queue=Promise.resolve();
const request=operation=>new Promise((resolve,reject)=>{operation.onsuccess=()=>resolve(operation.result);operation.onerror=()=>reject(operation.error)});
const localHost=()=>['127.0.0.1','localhost'].includes(location.hostname);

async function writeLocal(value){
  if(database)await request(database.transaction('site','readwrite').objectStore('site').put(value,'state'));
}

async function fetchState(){
  const response=await fetch('/api/state',{headers:{Accept:'application/json'}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok||!body.state)throw new Error(body.error||'The shared admin workspace is unavailable.');
  backend=true;
  authenticated=!!body.admin;
  state=body.state;
  await writeLocal(state);
  return state;
}

export async function initStore(){
  const open=indexedDB.open('mito-admin-state-v1',1);
  open.onupgradeneeded=()=>open.result.createObjectStore('site');
  database=await request(open);
  try{return await fetchState()}catch{
    state=await request(database.transaction('site').objectStore('site').get('state'))||await seedState();
    authenticated=localHost();
    await writeLocal(state);
    return state;
  }
}

export function getState(){return state}
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
export function isBackendConnected(){return backend}
export function isAdminAuthenticated(){return authenticated}

async function notify(){
  await writeLocal(state);
  for(const fn of listeners)fn();
}

async function patchRecord(kind,id,changes){
  if(!backend)throw new Error('Record updates require the connected admin backend.');
  const response=await fetch('/api/admin-record',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,id,changes})});
  const body=await response.json().catch(()=>({}));
  if(!response.ok){if(response.status===401)authenticated=false;throw new Error(body.error||'The record could not be updated.')}
  state=body.state;
  await notify();
}

async function persistContent(updated){
  if(!backend){state=updated;await notify();return}
  const response=await fetch('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:updated})});
  const body=await response.json().catch(()=>({}));
  if(!response.ok){if(response.status===401)authenticated=false;throw new Error(body.error||'The change was not saved.')}
  state=body.state;
  await notify();
}

export function change(mutator){
  const run=async()=>{
    const before=structuredClone(state);
    const updated=structuredClone(state);
    const returned=mutator(updated);
    const orderChanges=updated.orders.filter(order=>JSON.stringify(order)!==JSON.stringify(before.orders.find(item=>item.id===order.id)));
    const bookingChanges=updated.bookings.filter(booking=>JSON.stringify(booking)!==JSON.stringify(before.bookings.find(item=>item.id===booking.id)));
    if(orderChanges.length||bookingChanges.length){
      for(const order of orderChanges)await patchRecord('order',order.id,{status:order.status});
      for(const booking of bookingChanges)await patchRecord('booking',booking.id,{status:booking.status,fee:booking.fee,paid:booking.paid,sessions:booking.sessions,completedSessions:booking.completedSessions});
    }else await persistContent(updated);
    return returned;
  };
  const result=queue.then(run,run);
  queue=result.catch(()=>{});
  return result;
}

export async function loginAdmin(password){
  const response=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error||'Sign-in failed.');
  authenticated=true;
  await fetchState();
  await notify();
}

export async function logoutAdmin(){
  await fetch('/api/auth',{method:'DELETE'});
  authenticated=false;
  backend=true;
  for(const fn of listeners)fn();
}
