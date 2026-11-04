import {z} from 'zod';
import {adminContext,authorizeWrite,apiError} from '../../../../lib/server';
import {serverClient} from '../../../../lib/supabase/server';
export const dynamic='force-dynamic';
export async function GET(){const auth=await adminContext();if(!auth.allowed)return apiError('Studio access is required.',403);const db=await serverClient();const {data,error}=await db.from('studio_admins').select('email,is_owner').order('email');if(error)return apiError('The admin list could not be loaded.',503);return Response.json({members:data.map(m=>({email:m.email,primary:m.is_owner}))},{headers:{'Cache-Control':'no-store'}})}
async function change(request:Request,remove:boolean){
 const auth=await authorizeWrite(request);if(auth.error)return auth.error;
 const parsed=z.object({email:z.string().trim().toLowerCase().email().max(254)}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return apiError('Enter a valid email address.');
 const db=await serverClient();const {error}=await db.rpc('manage_studio_admin',{p_email:parsed.data.email,p_remove:remove});
 if(error){if(error.code==='PT400')return apiError('Primary admins and your own access cannot be removed here.');return apiError('Admin access could not be changed.',503)}
 return Response.json({ok:true});
}
export async function POST(request:Request){return change(request,false)}
export async function DELETE(request:Request){return change(request,true)}
