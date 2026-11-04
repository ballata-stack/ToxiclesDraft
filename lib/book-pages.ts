import type {WorkItem} from './content';
import type {PageFlip} from 'page-flip';
export function bookSettings(reducedMotion=false,availableWidth=1280):Record<string,string|number|boolean>{
 const width=Math.max(240,availableWidth);const portrait=width<720;const pageWidth=portrait?width:width/2;
 const pageHeight=portrait?Math.min(760,pageWidth*1.368):Math.max(460,Math.min(760,pageWidth*1.04));
 return {width:pageWidth,height:pageHeight,size:'stretch',minWidth:portrait?Math.floor(width/2)+1:300,maxWidth:2000,minHeight:280,maxHeight:2000,startPage:1,drawShadow:!reducedMotion,flippingTime:reducedMotion?1:650,usePortrait:true,startZIndex:1,autoSize:true,maxShadowOpacity:.3,showCover:true,mobileScrollSupport:true,clickEventForward:true,useMouseEvents:true,swipeDistance:30,showPageCorners:!reducedMotion,disableFlipByClick:false};
}
export function resizeBook(book:PageFlip,root:HTMLElement,width:number,reducedMotion=false){
 const settings=bookSettings(reducedMotion,width);Object.assign(book.getSettings(),settings);root.style.minWidth=settings.minWidth+'px';book.getUI().setOrientationStyle(width<720?'portrait':'landscape');book.update();
}

export function createBookPages(works:WorkItem[],name:string,logo:string,onSelect?:(item:WorkItem)=>void):HTMLElement[]{
 function element(tag:string,className:string,value?:string){const node=document.createElement(tag);node.className=className;if(value)node.textContent=value;return node}
 function cover(back=false){const page=element('div','portfolio-page portfolio-cover'+(back?' portfolio-back-cover':''));page.dataset.density='hard';const inner=element('div','book-cover-inner');inner.append(element('span','book-cover-label','TATTOO PORTFOLIO'));const image=document.createElement('img');image.src=logo;image.alt=name+' emblem';image.draggable=false;image.decoding='async';inner.append(image,element('h3','book-cover-title',name),element('span','book-cover-subtitle',back?'TATTOOS':'THE WORK'));if(!back)inner.append(element('span','book-cover-hint','SWIPE TO OPEN'));page.append(inner);return page}
 const pages=[cover()];
 works.forEach((item,index)=>{const page=element('div','portfolio-page portfolio-photo-page');const content=element('div','book-page-inner');const top=element('div','book-page-heading');top.append(element('span','',name),element('span','','TATTOOS'));const photo=element('button','book-photo');photo.setAttribute('aria-label','View tattoo '+item.title);photo.setAttribute('type','button');photo.addEventListener('click',event=>{event.stopPropagation();onSelect?.(item)});const image=document.createElement('img');image.src=item.image;image.alt=item.title+' tattoo by '+name;image.loading=index<4?'eager':'lazy';image.draggable=false;image.decoding='async';photo.append(image);const caption=element('div','book-page-caption');caption.append(element('span','',item.title),element('span','book-page-number',String(index+1).padStart(2,'0')));content.append(top,photo,caption);page.append(content);pages.push(page)});
 if(works.length%2!==0){const end=element('div','portfolio-page portfolio-endpaper');const image=document.createElement('img');image.src=logo;image.alt='';end.append(image,element('span','',name));pages.push(end)}
 pages.push(cover(true));return pages;
}
