import {createHash,createHmac,timingSafeEqual} from 'node:crypto';

const cookieName='mito_admin';
const password=()=>process.env.MITO_ADMIN_PASSWORD||'';
const signature=()=>createHmac('sha256',password()).update('mito-admin-session-v1').digest('hex');
const equal=(a,b)=>timingSafeEqual(createHash('sha256').update(String(a)).digest(),createHash('sha256').update(String(b)).digest());

export function authConfigured(){return password().length>=12}
export function isAdmin(req){if(!authConfigured())return false;const cookies=Object.fromEntries(String(req.headers.cookie||'').split(';').map(x=>x.trim().split('=').map(decodeURIComponent)).filter(x=>x.length===2));return equal(cookies[cookieName]||'',signature())}
export function validPassword(value){return authConfigured()&&equal(value,password())}
export function sessionCookie(){return `${cookieName}=${signature()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`}
export function clearCookie(){return `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`}
