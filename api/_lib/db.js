import {Redis} from '@upstash/redis';
import seed from './seed.js';

const key='mito:site-state:v1';
const lockKey='mito:site-state:v1:lock';
let client;
export function storageConfigured(){return !!((process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL)&&(process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN))}
function redis(){if(!storageConfigured())throw new Error('Shared storage is not configured.');return client||=new Redis({url:process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL,token:process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN})}
export async function loadState(){let state=await redis().get(key);if(!state){await redis().set(key,seed,{nx:true});state=await redis().get(key)}return structuredClone(state||seed)}
export async function saveState(state){await redis().set(key,state);return state}
export async function mutateState(mutator){const store=redis(),token=crypto.randomUUID();for(let attempt=0;attempt<24;attempt++){const acquired=await store.set(lockKey,token,{nx:true,px:5000});if(acquired){try{const state=await loadState(),result=await mutator(state);await saveState(state);return{state,result}}finally{await store.eval("if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",[lockKey],[token]).catch(()=>{})}}await new Promise(resolve=>setTimeout(resolve,75))}throw new Error('The website is busy. Please try again.')}
