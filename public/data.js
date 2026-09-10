import {importProducts} from './domain.js';
import {upgradeContent} from './content-upgrade.js';
const host='https://mitoskinlab.com/wp-content/uploads/';
export async function seedState(){const response=await fetch('/products.csv');if(!response.ok)throw Error('The product list could not be loaded. Refresh to try again.');const products=importProducts(await response.text());const seed={
version:1,cart:[],orders:[],bookings:[],products,
experts:[
{id:'e1',name:'Dr. Jahanara Akhter',title:'Consultant',credentials:'Mito Skin Lab',bio:'Book a personal consultation with Dr. Jahanara Akhter at Mito Skin Lab.',image:host+'2021/04/jahanaraakter-1536x1536.webp',order:1,active:true},
{id:'e2',name:'Dr. Tasnim Khan',title:'Consultant',credentials:'Mito Skin Lab',bio:'Speak with Dr. Tasnim Khan about a care plan that fits your individual needs.',image:host+'2021/08/tasnimkhan-1536x1536.webp',order:2,active:true},
{id:'e3',name:'Aysha Siddika',title:'Expert',credentials:'Mito Skin Lab',bio:'Meet Aysha Siddika for a personal consultation at Mito Skin Lab.',image:host+'2021/04/ayshasiddika-1536x1536.webp',order:3,active:true},
{id:'e4',name:'Dr. Kamrun Nahar',title:'Consultant',credentials:'Mito Skin Lab',bio:'Meet Dr. Kamrun Nahar and discuss your care journey at Mito Skin Lab.',image:host+'2021/04/kamrunnahar-1536x1536.webp',order:4,active:true},
{id:'e5',name:'Dr. Ilmoon Kabir',title:'Consultant',credentials:'Mito Skin Lab',bio:'Book a personal consultation with Dr. Ilmoon Kabir.',image:host+'2021/04/ilmoonkabir-1536x1536.webp',order:5,active:true},
{id:'e6',name:'Dr. Ikratuz Jahan',title:'Consultant',credentials:'Mito Skin Lab',bio:'Discuss your goals with Dr. Ikratuz Jahan at Mito Skin Lab.',image:host+'2021/08/ikratuzjaman-1536x1536.webp',order:6,active:true},
{id:'e7',name:'Dr. Shahinur Sultana',title:'Consultant',credentials:'Mito Skin Lab',bio:'Meet Dr. Shahinur Sultana for a personal consultation.',image:host+'2026/08/shahinursultana-1536x1536.webp',order:7,active:true}
],
departments:[
{id:'skin',name:'Skin, laser & aesthetics',fullName:'Skin, Laser & Aesthetic Dermatology',description:'Personal care for your skin, from everyday concerns to aesthetic treatments.',image:'/assets/treatment.webp'},
{id:'surgery',name:'Plastic & aesthetic surgery',fullName:'Plastic & Aesthetic Surgery',description:'Begin with a conversation about your goals and the options available to you.',image:host+'2026/08/HOME-2-REV-SLIDE-2.jpg'},
{id:'dental',name:'Dental & oral care',fullName:'Dental & Oral Care',description:'Thoughtful attention to your smile and everyday oral wellbeing.',image:''},
{id:'nutrition',name:'Nutrition & lifestyle',fullName:'Nutrition & Lifestyle Medicine',description:'A personal approach to nutrition, daily habits, and feeling well.',image:''}
],
groups:['Skin care','Sun care','Cleansers','Body care','Hair care','Wellness'].map((name,i)=>({id:'g'+i,name,image:'',description:''})),
services:[
['s1','skin','Skin consultation','Talk through your skin concerns and explore a personal care plan.'],
['s2','skin','Chemical peels','Consult an expert about whether a peel is appropriate for your skin.'],
['s3','skin','Laser skin treatments','Discuss your concerns and available laser treatment options.'],
['s4','skin','Microneedling','Explore skin texture concerns in a consultation with an expert.'],
['s5','surgery','Aesthetic surgery consultation','Discuss your goals, suitability, and the considerations around surgical care.'],
['s6','dental','Dental consultation','Start with a conversation about your teeth, smile, and oral health.'],
['s7','nutrition','Nutrition consultation','Discuss an approach to food and daily habits that works for you.']
].map(([id,department,name,description])=>({id,department,name,description,active:true})),
settings:{name:'Mito Skin Lab',logo:'/assets/reference/brand-logo.svg',heroImage:host+'2026/08/1-home-2-rev-background-img-01.jpg',groupImage:'',heroTitle:'A little care.\nA little glow.\nA little more you.',heroText:'Thoughtful treatments, expert guidance, and everyday care. A space to feel comfortable in your own skin.',aboutTitle:'Care that sees the whole you.',aboutText:'At Mito Skin Lab, skin, beauty, and wellbeing belong in the same conversation. We bring together expertise across skin, aesthetics, dental care, and nutrition to help you explore a personal approach to care.',phone:'+8801813010074',email:'info.mitoskinlab@gmail.com',address:'Zakir Hossain Road by lane, Chattogram, Bangladesh',instagram:'https://www.instagram.com/mitoskinlab/',video:'https://drive.google.com/file/d/1UCeMFzwNA1dV783mw5fxJirEYgdcDIfS/preview',shipping:0,hours:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day=>({day,open:'09:00',close:'17:00',closed:day==='Friday'}))},
chatbot:{enabled:true,name:'Mito Care Guide',welcome:'Hello, and welcome to Mito. I can help you explore our services, find opening hours, or start a consultation request. What would you like to know?',guidance:'Use a warm, concise tone. Help visitors navigate services, products and booking. Never diagnose or recommend a treatment without an expert consultation.'}
};upgradeContent(seed);return seed;}
