import {referenceContent} from './reference-content.js';
export function upgradeContent(s){
  if(s.contentRevision>=2)return false;
  const st=s.settings;
  const oldHero=!st.heroImage||st.heroImage.includes('1-home-2-rev-background-img-01.jpg');
  if(oldHero){st.heroImage='/assets/reference/hero-poster.jpg';st.heroVideo='/assets/reference/hero.mp4'}
  if(!st.logo||st.logo.includes('mian-logo.png'))st.logo='/assets/reference/logo.png';
  if(st.heroTitle==='A little care.\nA little glow.\nA little more you.')st.heroTitle='Look your best.\nFeel your best.';
  if(st.heroText.startsWith('Thoughtful treatments,'))st.heroText='Dermatology, aesthetic medicine, cosmetic surgery, dental care and nutrition — delivered by a multidisciplinary team, under one roof.';
  if(st.aboutTitle==='Care that sees the whole you.')st.aboutTitle='Excellence, innovation and patient-centred care';
  if(st.aboutText.startsWith('At Mito Skin Lab,'))st.aboutText='Mito Skin Lab is a multidisciplinary clinic offering services in dermatology, aesthetic medicine, cosmetic surgery, dental care and nutrition. Our philosophy goes beyond enhancing appearance — we strive to help every client feel confident, comfortable and empowered in their own skin.';
  if(st.email==='info.mitoskinlab@gmail.com')st.email='info@mitoskinlab.com';
  if(!st.facebook)st.facebook='https://www.facebook.com/share/1NvanyXphb/';
  if(st.hours.every(h=>h.open==='09:00'&&h.close==='17:00'))st.hours.forEach(h=>{h.open='16:00';h.close='20:00'});
  referenceContent.doctors.forEach((d,i)=>{
    const x=s.experts.find(x=>x.id==='e'+(i+1));
    if(x&&x.credentials==='Mito Skin Lab')Object.assign(x,{name:d.name,title:d.title,title2:d.title2,department:['skin','skin','nutrition','skin','surgery','dental','skin'][i],credentials:d.edu,bio:d.bio,image:'/assets/reference/doctor-'+(i+1)+'.png'});
  });
  referenceContent.departments.forEach(d=>{
    const x=s.departments.find(x=>x.id===d.id);
    if(x){x.fullName=d.name;if(!x.image||x.image.includes('mitoskinlab.com')||x.image==='/assets/treatment.webp')x.image='/assets/reference/department-'+d.id+'.jpg'}
  });
  const defaults=s.services.length===7&&s.services.every(x=>/^s[1-7]$/.test(x.id));
  const services=referenceContent.departments.flatMap(d=>d.groups.flatMap((g,gi)=>g.items.map(([name,description],i)=>({id:'svc-'+d.id+'-'+gi+'-'+i,department:d.id,group:g.name,name,description,active:true,featured:referenceContent.popular.some(p=>p[0]===name)}))));
  if(defaults)s.services=services;else for(const service of services)if(!s.services.some(x=>x.name.toLowerCase()===service.name.toLowerCase()))s.services.push(service);
  s.contentRevision=2;
  return true;
}
