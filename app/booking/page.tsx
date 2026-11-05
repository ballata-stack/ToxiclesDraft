import {PublicPage} from '../site-page';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{idea?:string}>}){const query=await searchParams;return <PublicPage page="booking" idea={typeof query.idea==='string'?query.idea.slice(0,5000):''}/>;}
