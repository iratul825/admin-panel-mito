import test from 'node:test';
import assert from 'node:assert/strict';
import {updateAdminOrder,updateAdminBooking} from '../api/_lib/admin-records.js';

test('order cancellation restores product stock',()=>{
  const state={products:[{id:'p1',stock:2}],orders:[{id:'MT-1',status:'Pending',lines:[{productId:'p1',qty:3}]}]};
  updateAdminOrder(state,'MT-1',{status:'Cancelled'});
  assert.equal(state.orders[0].status,'Cancelled');
  assert.equal(state.products[0].stock,5);
});

test('booking financial and session fields are validated',()=>{
  const state={bookings:[{id:'BK-1',expertId:'e1',date:'2026-12-12',time:'16:00',status:'Pending',fee:0,paid:0,sessions:1,completedSessions:0}]};
  updateAdminBooking(state,'BK-1',{status:'Confirmed',fee:2500,paid:1000,sessions:3,completedSessions:1});
  assert.deepEqual({...state.bookings[0]},{id:'BK-1',expertId:'e1',date:'2026-12-12',time:'16:00',status:'Confirmed',fee:2500,paid:1000,sessions:3,completedSessions:1});
  assert.throws(()=>updateAdminBooking(state,'BK-1',{status:'Completed',fee:2500,paid:3000,sessions:3,completedSessions:3}),/Paid amount/);
});
