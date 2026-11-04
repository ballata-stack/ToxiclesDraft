'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,BookOpen} from 'lucide-react';
import type {PageFlip} from 'page-flip';
import type {WorkItem} from '../lib/content';
import {bookSettings,createBookPages,resizeBook} from '../lib/book-pages';
export function TattooBook({works,name,logo,onSelect}:{works:WorkItem[];name:string;logo:string;onSelect:(item:WorkItem)=>void}){
 const host=useRef<HTMLDivElement>(null);const fallback=useRef<HTMLDivElement>(null);const engine=useRef<PageFlip|null>(null);const select=useRef(onSelect);const [ready,setReady]=useState(false);const [index,setIndex]=useState(0);const [total,setTotal]=useState(works.length+2+(works.length%2));const [portrait,setPortrait]=useState(false);const [turning,setTurning]=useState(false);
 useEffect(()=>{select.current=onSelect},[onSelect]);
 useEffect(()=>{
  let cancelled=false;let instance:PageFlip|null=null;let resizeObserver:ResizeObserver|null=null;let resizeTimer:number|undefined;let visibilityObserver:IntersectionObserver|null=null;setReady(false);setIndex(0);setTurning(false);
  if(!works.length||!host.current)return;
  const container=host.current;
  async function initialize(){try{
   const {PageFlip}=await import('page-flip');if(cancelled)return;
   const inner=document.createElement('div');inner.className='portfolio-flip-engine';container.replaceChildren(inner);
   const pages=createBookPages(works,name,logo,item=>select.current(item));pages.forEach(page=>inner.append(page));
   const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   let measuredWidth=container.clientWidth;
   instance=new PageFlip(inner,bookSettings(reducedMotion,measuredWidth));engine.current=instance;
   const update=()=>{if(!instance||cancelled)return;setIndex(instance.getCurrentPageIndex());setTotal(instance.getPageCount());setPortrait(instance.getOrientation()==='portrait')};
   instance.on('init',()=>{update();setReady(true)}).on('flip',update).on('changeOrientation',update).on('changeState',event=>{if(!cancelled)setTurning(event.data==='flipping')});
   instance.loadFromHTML(pages);
   resizeObserver=new ResizeObserver(()=>{const width=container.clientWidth;if(Math.abs(width-measuredWidth)<2)return;window.clearTimeout(resizeTimer);resizeTimer=window.setTimeout(()=>{if(!instance||cancelled)return;measuredWidth=container.clientWidth;resizeBook(instance,inner,measuredWidth,reducedMotion);update()},120)});
   resizeObserver.observe(container);
  }catch{if(instance){instance.destroy();instance=null}container.replaceChildren();engine.current=null}}
  if('IntersectionObserver' in window){visibilityObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){visibilityObserver?.disconnect();initialize()}},{rootMargin:'240px 0px'});visibilityObserver.observe(container.closest('section')||container)}else initialize();
  return()=>{cancelled=true;window.clearTimeout(resizeTimer);visibilityObserver?.disconnect();resizeObserver?.disconnect();engine.current=null;instance?.destroy();container.replaceChildren()};
 },[works,name,logo]);
 if(!works.length)return null;
 function turn(direction:number){if(engine.current){if(direction>0)engine.current.flipNext('bottom');else engine.current.flipPrev('bottom')}else fallback.current?.scrollBy({left:direction*(fallback.current.clientWidth*.85),behavior:'smooth'})}
 const pageLabel=index===0?'Cover':index>works.length?'End':String(index).padStart(2,'0')+(!portrait&&index<works.length?'–'+String(index+1).padStart(2,'0'):'')+' / '+String(works.length).padStart(2,'0');
 return <section className="section tattoo-book-section" id="tattoo-book" aria-label="Tattoo portfolio book"><div className="section-head"><div><span className="eyebrow"><BookOpen size={13}/>TATTOOS</span><h2 className="book-title">The tattoo book.</h2></div><Link className="text-link" href="/work">View the gallery <ArrowUpRight size={17}/></Link></div><div className={'portfolio-book '+(ready?'is-ready':'')} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();turn(1)}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1)}}} tabIndex={0} aria-label="Swipe or use the arrow keys to turn the tattoo book" aria-busy={turning}><div className="book-table"><div ref={host} className="portfolio-book-host"/><div ref={fallback} className="book-fallback"><div className="book-fallback-cover"><img src={logo} alt="" decoding="async"/><h3>{name}</h3><span>TATTOOS</span></div>{works.map(item=><button key={item.id} className="book-fallback-photo" onClick={()=>onSelect(item)} aria-label={'View tattoo '+item.title}><img src={item.image} alt={item.title+' tattoo by '+name} loading="lazy" decoding="async"/><span>{item.title}</span></button>)}</div></div><div className="book-controls"><button aria-label="Previous book page" disabled={turning||(ready&&index===0)} onClick={()=>turn(-1)}><ArrowLeft size={18}/></button><div className="book-position"><span aria-live="polite">{ready?pageLabel:'Tattoo portfolio'}</span><div className="book-progress"><i style={{width:ready?Math.max(3,index/(total-1)*100)+'%':'3%'}}/></div></div><button aria-label="Next book page" disabled={turning||(ready&&index>=total-1)} onClick={()=>turn(1)}><ArrowRight size={18}/></button><span className="book-gesture">SWIPE TO TURN</span></div></div></section>
}
