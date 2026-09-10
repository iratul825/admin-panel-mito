import {updateOrder} from '../../public/domain.js';

const fail=message=>{throw new Error(message)};

export function updateAdminOrder(state,id,changes){
  updateOrder(state,String(id||''),changes?.status);
  return state.orders.find(order=>order.id===id);
}

export function updateAdminBooking(state,id,changes){
  const booking=state.bookings.find(item=>item.id===id);
  if(!booking)fail('Booking not found.');
  const status=String(changes?.status||'');
  const fee=Number(changes?.fee);
  const paid=Number(changes?.paid);
  const sessions=Number(changes?.sessions);
  const completedSessions=Number(changes?.completedSessions);
  if(!['Pending','Confirmed','Completed','Cancelled'].includes(status))fail('Invalid booking status.');
  if(!Number.isFinite(fee)||fee<0||!Number.isFinite(paid)||paid<0||paid>fee)fail('Paid amount must be between zero and the consultation fee.');
  if(!Number.isInteger(sessions)||sessions<1||sessions>100||!Number.isInteger(completedSessions)||completedSessions<0||completedSessions>sessions)fail('Completed sessions cannot exceed total sessions.');
  if(status!=='Cancelled'&&state.bookings.some(item=>item.id!==id&&item.expertId===booking.expertId&&item.date===booking.date&&item.time===booking.time&&item.status!=='Cancelled'))fail('This expert already has another active booking at that time.');
  Object.assign(booking,{status,fee,paid,sessions,completedSessions});
  return booking;
}
