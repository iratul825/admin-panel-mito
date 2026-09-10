import {initStore,loginAdmin,subscribe} from './store.js';
import {renderAdmin,handleAdminClick,handleAdminSubmit,handleAdminChange,adminSearch} from './admin.js';
import {showError,toast} from './ui.js';

const app=document.querySelector('#app');
const modal=document.querySelector('#modal');
const websiteUrl=document.querySelector('meta[name="website-url"]')?.content.replace(/\/$/,'')||'https://mito-skin-lab-bd.vercel.app';
let searchTimer;

function externalizeWebsiteLinks(){
  for(const anchor of document.querySelectorAll('a[href="/"],a[href="/shop"],a[href="/book"]')){
    const path=anchor.getAttribute('href');
    anchor.href=websiteUrl+(path==='/'?'':path);
    anchor.target='_blank';
    anchor.rel='noopener noreferrer';
  }
}

function render(){
  app.innerHTML=renderAdmin();
  document.title='Mito Studio — Admin';
  externalizeWebsiteLinks();
  const aiStatus=document.querySelector('#ai-status');
  if(aiStatus)fetch('/api/chat',{headers:{Accept:'application/json'}}).then(response=>response.json()).then(result=>{aiStatus.textContent=result.configured?'Live AI is connected.':'Built-in clinic guide is active.'}).catch(()=>{aiStatus.textContent='AI status is temporarily unavailable.'});
}

function navigate(url){
  history.pushState({},'',url);
  adminSearch.value='';
  render();
  window.scrollTo(0,0);
  document.querySelector('#main')?.focus({preventScroll:true});
}

document.addEventListener('click',async event=>{
  const anchor=event.target.closest('a');
  if(anchor&&anchor.origin===location.origin&&anchor.pathname.startsWith('/admin')&&!anchor.target){
    event.preventDefault();
    navigate(anchor.pathname+anchor.search);
    return;
  }
  const target=event.target.closest('[data-action]');
  if(!target)return;
  try{
    if(target.dataset.action==='close-modal'){
      modal.close();
      modal.innerHTML='';
      return;
    }
    if(await handleAdminClick(target.dataset.action,target.dataset,{navigate,render,toast}))render();
  }catch(error){toast(error.message)}
});

document.addEventListener('submit',async event=>{
  const form=event.target;
  if(!(form instanceof HTMLFormElement))return;
  event.preventDefault();
  const button=form.querySelector('button[type="submit"]');
  if(button)button.disabled=true;
  try{
    const values=Object.fromEntries(new FormData(form));
    if(form.id==='admin-login')await loginAdmin(values.password);
    else await handleAdminSubmit(form,values);
    render();
  }catch(error){showError(form,error)}finally{if(button)button.disabled=false}
});

document.addEventListener('change',async event=>{
  try{await handleAdminChange(event);render()}catch(error){toast(error.message);render()}
});

document.addEventListener('input',event=>{
  if(event.target.id!=='admin-search')return;
  adminSearch.value=event.target.value;
  clearTimeout(searchTimer);
  searchTimer=setTimeout(render,180);
});

window.addEventListener('popstate',render);
subscribe(render);
if(!location.pathname.startsWith('/admin'))history.replaceState({},'', '/admin');
await initStore();
render();
