import {serverClient} from './supabase/server';
import {isConfigured} from './supabase/config';
import {defaultContent,contentSchema,type SiteContent} from './content';
export async function readContent():Promise<{content:SiteContent;revision:number}>{
 if(!isConfigured())return {content:defaultContent,revision:0};
 const db=await serverClient();const {data,error}=await db.from('studio_content').select('data,revision').eq('id','main').maybeSingle();
 if(error)throw new Error('Studio content could not be loaded.');
 if(!data)return {content:defaultContent,revision:0};
 const parsed=contentSchema.safeParse(data.data);if(!parsed.success)throw new Error('The saved content needs review.');
 return {content:parsed.data,revision:data.revision};
}
export async function adminContext(){
 if(!isConfigured())return {user:null,allowed:false,configured:false};
 const db=await serverClient();const {data:{user},error}=await db.auth.getUser();
 if(error||!user?.email||!user.email_confirmed_at||user.app_metadata.provider!=='google')return {user:null,allowed:false,configured:true};
 const {data,error:permissionError}=await db.rpc('is_studio_admin');
 return {user,allowed:!permissionError&&data===true,configured:true};
}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');return Boolean(origin&&origin===new URL(request.url).origin);}
export function apiError(message:string,status=400){return Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});}
export async function authorizeWrite(request:Request){
 if(!sameOrigin(request))return {error:apiError('The request must come from this site.',403)};
 const auth=await adminContext();if(!auth.configured)return {error:apiError('Studio services are not configured.',503)};
 if(!auth.user)return {error:apiError('Sign in with Google first.',401)};
 if(!auth.allowed)return {error:apiError('This account does not have studio access.',403)};
 return {user:auth.user};
}
