export function sameOrigin(req){
  const origin=req.headers.origin;
  if(!origin)return false;
  try{return new URL(origin).host===req.headers.host}catch{return false}
}

export function clientIp(req){
  return String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim()
}
