import {readContent} from '../lib/server';
import {bookingsConfigured} from '../lib/supabase/service';
import {Site,type SitePage} from './site';

export async function PublicPage({page,idea=''}:{page:SitePage;idea?:string}){
 const {content}=await readContent();
 return <Site content={content} page={page} bookingsEnabled={bookingsConfigured()} initialIdea={idea}/>;
}
