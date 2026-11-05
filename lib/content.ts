import { z } from 'zod';
const safeUrl = z.string().max(2000).refine(v => !v || /^https:\/\//i.test(v) || /^\/(images|media)\/[a-zA-Z0-9_.\/-]+$/.test(v), 'Use an HTTPS URL or uploaded media.');
const text = z.string().max(5000);
export const flashSchema = z.object({id:z.string().max(100),title:text,image:safeUrl.refine(Boolean,'Upload an image for each flash sheet.'),category:z.enum(['Flash sheets','Original art']).default('Flash sheets'),status:z.enum(['Ask Tox','Available','Claimed']),price:z.number().min(0).max(10000000).nullable(),description:text,source:safeUrl});
export const workSchema = z.object({id:z.string().max(100),title:text,image:safeUrl.refine(Boolean,'Upload an image for each tattoo.'),description:text,source:safeUrl});
export const eventSchema = z.object({id:z.string().max(100),title:text,location:text,date:z.string().max(30),endDate:z.string().max(30),description:text,image:safeUrl,url:safeUrl,status:z.enum(['Upcoming','Past'])});
export const merchSchema = z.object({id:z.string().max(100),title:text,image:safeUrl,category:z.enum(['Original Artworks','Prints','Merch','Wearables','Extras']).transform(v=>v==='Wearables'||v==='Extras'?'Merch':v),description:text,price:z.number().min(0).max(10000000).nullable(),status:z.enum(['Available','Check shop','Coming soon','Sold out']),sizes:text,orderUrl:safeUrl,gallery:z.array(safeUrl).max(12).default([]),source:safeUrl.default(''),mockup:z.enum(['tee','print','sticker','none'])});
export const artworkCategories=['Paintings & Drawings','Objects'] as const;
export const shopCategories=['Original Artworks','Prints','Merch'] as const;
export const artworkSchema=z.object({id:z.string().max(100),title:text,image:safeUrl.refine(Boolean,'Upload an image for each artwork.'),category:z.enum(['Paintings & Drawings','Objects','Paintings','Drawings']).transform(v=>v==='Paintings'||v==='Drawings'?'Paintings & Drawings':v),description:text,source:safeUrl.default(''),gallery:z.array(safeUrl).max(12).default([])});
export const studioPhotoSchema=z.object({id:z.string().max(100),title:text,image:safeUrl.refine(Boolean,'Upload a studio photo.'),description:text});
export const faqSchema=z.object({id:z.string().max(100),question:z.string().trim().min(1).max(500),answer:z.string().trim().min(1).max(5000)});
export const studioTagline='Traditional • Japanese • Custom Tattoos by Tox';
const taglineText=text.transform(value=>/^traditional tattoos?\.?$/i.test(value.trim())?studioTagline:value);
export const contentSchema = z.object({settings:z.object({name:z.string().min(1).max(80),tagline:taglineText,description:text,location:text,studioName:text.default('TOX Tattoo Studio'),studioAddress:text,mapQuery:text,mapConfirmed:z.boolean(),mapUrl:safeUrl.default(''),mapEmbedUrl:safeUrl.default(''),merchShopUrl:safeUrl.default('https://shopee.ph/goodbyesunday'),merchInstagram:safeUrl.default('https://www.instagram.com/goodbye.sunday.ph/'),instagram:safeUrl,bookingUrl:safeUrl,logo:safeUrl,wordmark:safeUrl,heroVideo:safeUrl,videoPoster:safeUrl,videoCaption:text,currency:z.enum(['PHP','USD','THB','EUR']),eventsIntro:text,merchIntro:text,footerText:taglineText}),flash:z.array(flashSchema).max(150),work:z.array(workSchema).max(150),events:z.array(eventSchema).max(100),merch:z.array(merchSchema).max(100),artworks:z.array(artworkSchema).max(150).default([]),studioPhotos:z.array(studioPhotoSchema).max(60).default([]),faqs:z.array(faqSchema).max(100).default([])});
export type SiteContent=z.infer<typeof contentSchema>;
export type FlashItem=z.infer<typeof flashSchema>;
export type WorkItem=z.infer<typeof workSchema>;
export type MerchItem=z.infer<typeof merchSchema>;
export type ArtworkItem=z.infer<typeof artworkSchema>;
export type StudioPhoto=z.infer<typeof studioPhotoSchema>;
export const defaultContent:SiteContent={
 settings:{name:'Toxicles',tagline:'Traditional • Japanese • Custom Tattoos by Tox',description:'',location:'Taguig, Metro Manila',studioName:'TOX Tattoo Studio',studioAddress:'Unit A, Phase 4 AFPOVAI, 8 Llanera Street, Taguig, 1630 Metro Manila',mapQuery:'TOX Tattoo Studio, Unit A, Phase 4 AFPOVAI, 8 Llanera Street, Taguig, 1630 Metro Manila',mapConfirmed:true,mapUrl:'https://maps.app.goo.gl/dC8FULo3jpLNYU9T7',mapEmbedUrl:'https://maps.google.com/maps?cid=10933773881425842630&output=embed&z=17',merchShopUrl:'https://shopee.ph/goodbyesunday',merchInstagram:'https://www.instagram.com/goodbye.sunday.ph/',instagram:'https://www.instagram.com/toxicles/',bookingUrl:'https://www.instagram.com/toxicles/',logo:'/images/toxicles-horses.webp',wordmark:'',heroVideo:'',videoPoster:'',videoCaption:'TATTOO PREPARATION',currency:'PHP',eventsIntro:'Guest spots & conventions.',merchIntro:'Original artworks, prints & Goodbye Sunday merch.',footerText:'Traditional • Japanese • Custom Tattoos by Tox'},
 flash:[
 {
  "id": "flash-01",
  "title": "Classic Trad Flash",
  "image": "/images/uploads/flash-design-01.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": "https://www.instagram.com/toxicles/p/DfMJriRzGvM/"
 },
 {
  "id": "flash-02",
  "title": "Portraits & Roses",
  "image": "/images/uploads/flash-design-02.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": "https://www.instagram.com/toxicles/p/DeRJWPHTq9J/"
 },
 {
  "id": "flash-03",
  "title": "Portrait Collection",
  "image": "/images/uploads/flash-design-03.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": ""
 },
 {
  "id": "flash-04",
  "title": "Geisha Portraits",
  "image": "/images/uploads/flash-design-04.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": ""
 },
 {
  "id": "flash-05",
  "title": "Lotus & Masks",
  "image": "/images/uploads/flash-design-05.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": ""
 },
 {
  "id": "flash-06",
  "title": "Yokai & Trad Classics",
  "image": "/images/uploads/flash-design-06.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": ""
 },
 {
  "id": "flash-07",
  "title": "Black & Grey Pin-ups",
  "image": "/images/uploads/flash-design-07.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": ""
 },
 {
  "id": "flash-08",
  "title": "Colour Creature Flash",
  "image": "/images/uploads/flash-design-08.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": ""
 },
 {
  "id": "flash-09",
  "title": "Black & Grey Classics",
  "image": "/images/uploads/flash-design-09.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": ""
 },
 {
  "id": "flash-10",
  "title": "Moto Portraits",
  "image": "/images/uploads/flash-design-10.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": ""
 },
 {
  "id": "flash-11",
  "title": "Japanese Masks",
  "image": "/images/uploads/flash-design-11.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": ""
 },
 {
  "id": "flash-12",
  "title": "Daggers & Beasts",
  "image": "/images/uploads/flash-design-12.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": ""
 },
 {
  "id": "flash-13",
  "title": "Tropical Trad Flash",
  "image": "/images/uploads/flash-design-13.webp",
  "category": "Flash sheets",
  "status": "Ask Tox",
  "price": null,
  "description": "",
  "source": ""
 }
],
 work:[{id:'work-01',title:'Scorpion',image:'/images/DeyvG4rk-Ye.webp',description:'Scorpion · black & grey',source:'https://www.instagram.com/toxicles/p/DeyvG4rk-Ye/'},{id:'work-02',title:'Tiger & portraits',image:'/images/DeULc84zNut.webp',description:'Tiger & faces · colour',source:'https://www.instagram.com/toxicles/p/DeULc84zNut/'},{id:'work-03',title:'Floral fan',image:'/images/Dd3twCPTbit.webp',description:'Floral fan · colour',source:'https://www.instagram.com/toxicles/p/Dd3twCPTbit/'},{id:'work-04',title:'Traditional sleeve',image:'/images/DeJroMUzVBp.webp',description:'Traditional sleeve · black & grey',source:'https://www.instagram.com/toxicles/reel/DeJroMUzVBp/'}],
 artworks:[
 {
  "id": "artwork-01",
  "title": "Tattoo Study",
  "image": "/images/uploads/artwork-01.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-02",
  "title": "Robot & Serpent",
  "image": "/images/uploads/artwork-02.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-03",
  "title": "Dragon in the Storm",
  "image": "/images/uploads/artwork-03.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-04",
  "title": "Toad & Warrior",
  "image": "/images/uploads/artwork-04.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-05",
  "title": "Roaring Kaiju",
  "image": "/images/uploads/artwork-05.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-06",
  "title": "Skull & Swallow",
  "image": "/images/uploads/artwork-06.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "https://www.instagram.com/toxicles/p/Debrj12E0mS/",
  "gallery": []
 },
 {
  "id": "artwork-07",
  "title": "Blue Portrait",
  "image": "/images/uploads/artwork-07.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-08",
  "title": "Saxophone Player",
  "image": "/images/uploads/artwork-08.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-09",
  "title": "Robot Tattoo Session",
  "image": "/images/uploads/artwork-09.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-10",
  "title": "Twin Dragons",
  "image": "/images/uploads/artwork-10.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-11",
  "title": "Seated Figure",
  "image": "/images/uploads/artwork-11.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-12",
  "title": "Hannya & Serpent",
  "image": "/images/uploads/artwork-12.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-13",
  "title": "Coiled Dragon",
  "image": "/images/uploads/artwork-13.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-14",
  "title": "Red Oni",
  "image": "/images/uploads/artwork-14.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "artwork-15",
  "title": "Kappa",
  "image": "/images/uploads/artwork-15.webp",
  "category": "Paintings & Drawings",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "object-helmet-1",
  "title": "Traditional Flash Helmet",
  "image": "/images/uploads/object-helmet-1-1.webp",
  "category": "Objects",
  "description": "",
  "source": "",
  "gallery": [
   "/images/uploads/object-helmet-1-2.webp",
   "/images/uploads/object-helmet-1-3.webp",
   "/images/uploads/object-helmet-1-4.webp"
  ]
 },
 {
  "id": "object-helmet-2",
  "title": "Tiger & Oni Helmet",
  "image": "/images/uploads/object-helmet-2-1.webp",
  "category": "Objects",
  "description": "",
  "source": "",
  "gallery": [
   "/images/uploads/object-helmet-2-2.webp",
   "/images/uploads/object-helmet-2-3.webp"
  ]
 },
 {
  "id": "object-lucky-cat-1",
  "title": "Blue & White Lucky Cat",
  "image": "/images/uploads/object-lucky-cat-1-1.webp",
  "category": "Objects",
  "description": "",
  "source": "",
  "gallery": [
   "/images/uploads/object-lucky-cat-1-2.webp",
   "/images/uploads/object-lucky-cat-1-3.webp",
   "/images/uploads/object-lucky-cat-1-4.webp"
  ]
 },
 {
  "id": "object-lucky-cat-2",
  "title": "Gold & Teal Lucky Cat",
  "image": "/images/uploads/object-lucky-cat-2-1.webp",
  "category": "Objects",
  "description": "",
  "source": "",
  "gallery": [
   "/images/uploads/object-lucky-cat-2-2.webp"
  ]
 },
 {
  "id": "object-mirror",
  "title": "Eagle & Rose Mirror",
  "image": "/images/uploads/object-mirror.webp",
  "category": "Objects",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "object-table-1",
  "title": "Golden Tiger Table",
  "image": "/images/uploads/object-table-1.webp",
  "category": "Objects",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "object-table-2",
  "title": "Purple Panther Table",
  "image": "/images/uploads/object-table-2.webp",
  "category": "Objects",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "object-table-3",
  "title": "Three Horses Table",
  "image": "/images/uploads/object-table-3.webp",
  "category": "Objects",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "object-table-4",
  "title": "Blue Tiger Table",
  "image": "/images/uploads/object-table-4.webp",
  "category": "Objects",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "object-wall-art-1",
  "title": "Crying Face Wall Art",
  "image": "/images/uploads/object-wall-art-1.webp",
  "category": "Objects",
  "description": "",
  "source": "",
  "gallery": []
 },
 {
  "id": "object-wall-art-2",
  "title": "Panther & Dagger Wall Art",
  "image": "/images/uploads/object-wall-art-2.webp",
  "category": "Objects",
  "description": "",
  "source": "",
  "gallery": []
 }
],
 studioPhotos:[],
 faqs:[],
 events:[],
 merch:[
 {id:'merch-rooster',title:'Rooster tee',image:'/images/merch-DWWF_ilkvzg.webp',category:'Merch',description:'Black graphic tee by Goodbye Sunday.',price:null,status:'Check shop',sizes:'',orderUrl:'https://shopee.ph/goodbyesunday',gallery:[],source:'https://www.instagram.com/goodbye.sunday.ph/p/DWWF_ilkvzg/',mockup:'none'},
 {id:'merch-tiger',title:'Frog tee',image:'/images/merch-DWWFuAHktFK.webp',category:'Merch',description:'White frog graphic tee by Goodbye Sunday.',price:null,status:'Check shop',sizes:'',orderUrl:'https://shopee.ph/goodbyesunday',gallery:[],source:'https://www.instagram.com/goodbye.sunday.ph/p/DWWFuAHktFK/',mockup:'none'},
 {id:'merch-jacket',title:'Tiger & snake jacket',image:'/images/merch-DQ35rQ6EinE.webp',category:'Merch',description:'Black jacket with tiger-and-snake artwork.',price:null,status:'Check shop',sizes:'',orderUrl:'https://shopee.ph/goodbyesunday',gallery:['/images/merch-DQ35l7WEnrS.webp','/images/merch-DQ357ZiEicI.webp','/images/merch-DQ352Z7kvSq.webp','/images/merch-DQ35xddEktW.webp'],source:'https://www.instagram.com/goodbye.sunday.ph/p/DQ35rQ6EinE/',mockup:'none'},
 {id:'merch-pouch',title:'Denim pouch',image:'/images/merch-DQ35eaJEh69.webp',category:'Merch',description:'Zip pouch by Goodbye Sunday.',price:null,status:'Check shop',sizes:'',orderUrl:'https://shopee.ph/goodbyesunday',gallery:[],source:'https://www.instagram.com/goodbye.sunday.ph/p/DQ35eaJEh69/',mockup:'none'}]

};
export function formatPrice(value:number|null,currency:string){return value===null?'Price on request':new Intl.NumberFormat('en-PH',{style:'currency',currency,maximumFractionDigits:0}).format(value);}
