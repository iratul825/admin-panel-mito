import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.csv':'text/csv; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/'){
      res.writeHead(302,{Location:'/admin'}).end();
      return;
    }
    if(url.pathname.startsWith('/api/')){
      res.writeHead(404,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({error:'Local API functions require Vercel development or a deployed project.'}));
      return;
    }
    if(req.method!=='GET'&&req.method!=='HEAD'){
      res.writeHead(405).end();
      return;
    }
    const pathname=decodeURIComponent(url.pathname);
    const relative=path.extname(pathname)?pathname.replace(/^\/+/, ''):'index.html';
    const target=path.resolve(root,relative);
    if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return}
    const file=await readFile(target);
    res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:file);
  }catch(error){
    res.writeHead(error.code==='ENOENT'?404:500,{'Content-Type':'text/plain'}).end('Unable to load this page.');
  }
});

server.listen(4174,'127.0.0.1',()=>console.log('Mito Admin: http://127.0.0.1:4174/admin'));
