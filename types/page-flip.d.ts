declare module 'page-flip' {
 export interface FlipEvent {data:number|string|boolean|object;object:PageFlip;}
 export class PageFlip {
  constructor(parent:HTMLElement,settings:Record<string,number|string|boolean>);
  on(event:string,callback:(event:FlipEvent)=>void):this;
  off(event:string):void;
  loadFromHTML(items:HTMLElement[]|NodeListOf<HTMLElement>):void;
  getPageCount():number;
  getCurrentPageIndex():number;
  getOrientation():'portrait'|'landscape';
  flipNext(corner?:'top'|'bottom'):void;
  flipPrev(corner?:'top'|'bottom'):void;
  getSettings():Record<string,number|string|boolean>;
  getUI():{setOrientationStyle(orientation:'portrait'|'landscape'):void};
  update():void;
  destroy():void;
 }
}
