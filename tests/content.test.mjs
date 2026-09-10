import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {seedState} from '../public/data.js';
import {upgradeContent} from '../public/content-upgrade.js';
import {bookVisit} from '../public/domain.js';
async function seed(){const original=global.fetch;global.fetch=async()=>new Response(await readFile(new URL('../public/products.csv',import.meta.url)));try{return await seedState()}finally{global.fetch=original}}
test('new seed combines reference profiles and 47 services with the original 72-row inventory',async()=>{const s=await seed();assert.equal(s.experts.length,7);assert.equal(s.experts[0].name,'Jahanara Akter');assert.equal(s.experts[2].department,'nutrition');assert.equal(s.services.length,47);assert.equal(s.products.length,72);assert.equal(s.products.filter(p=>p.price===null).length,5);assert.equal(s.settings.hours[0].open,'16:00');assert.equal(s.settings.heroVideo,'/assets/reference/hero.mp4')});
test('content upgrades preserve inventory, orders and subsequent admin edits',async()=>{const s=await seed();s.products[0].stock=83;s.orders.push({id:'demo-order'});s.settings.heroTitle='Custom headline';s.experts[0].bio='Custom biography';assert.equal(upgradeContent(s),false);assert.equal(s.products[0].stock,83);assert.equal(s.orders[0].id,'demo-order');assert.equal(s.settings.heroTitle,'Custom headline');assert.equal(s.experts[0].bio,'Custom biography')});
test('booking rejects an expert from another department',async()=>{const s=await seed();assert.throws(()=>bookVisit(s,{name:'Demo Visitor',phone:'01700000000',serviceId:s.services.find(x=>x.department==='skin').id,expertId:'e3',date:'2099-09-10',time:'16:00'}),/selected department/)});
