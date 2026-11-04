import {z} from 'zod';
import {contentSchema} from '../../../lib/content';
import {readContent,authorizeWrite,apiError} from '../../../lib/server';
import {serverClient} from '../../../lib/supabase/server';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await readContent(),{headers:{'Cache-Control':'no-store'}})}catch{return apiError('The gallery is temporarily unavailable.',503)}}
export async function PUT(request:Request){
 const auth=await authorizeWrite(request);if(auth.error)return auth.error;
 if(Number(request.headers.get('content-length')||0)>1000000)return apiError('Content is too large.',413);
 const parsed=z.object({content:contentSchema,revision:z.number().int().nonnegative()}).safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return apiError(parsed.error.issues[0]?.message||'Check the content fields.');
 if(JSON.stringify(parsed.data.content).length>1000000)return apiError('Content is too large.',413);
 const db=await serverClient();const {data,error}=await db.rpc('save_studio_content',{p_content:parsed.data.content,p_expected_revision:parsed.data.revision});
 if(error){if(error.code==='PT409')return apiError('Another admin saved changes. Reload the latest version before saving again.',409);return apiError('Changes could not be saved. Try again.',503)}
 return Response.json({revision:data},{headers:{'Cache-Control':'no-store'}});
}
