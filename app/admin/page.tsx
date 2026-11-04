import {adminContext,readContent} from '../../lib/server';
import {AdminEditor} from './editor';
import {GoogleSignIn} from './sign-in';
export const dynamic='force-dynamic';
export default async function Admin({searchParams}:{searchParams:Promise<{error?:string}>}){
 const auth=await adminContext();
 if(auth.allowed){const data=await readContent();return <AdminEditor initial={data.content} revision={data.revision} email={auth.user!.email!} signOut="/auth/signout"/>}
 const params=await searchParams;
 return <main className="access-page"><a className="back-link" href="/">← Back to Toxicles</a><div className="access-card"><img src="/images/toxicles-horses.png" alt="Toxicles emblem"/><span className="eyebrow">PRIVATE STUDIO</span><h1>Admin access.</h1>{auth.configured?<><p>Approved Google accounts only.</p>{params.error&&<p role="alert">Sign-in could not be completed. Please try again.</p>}{auth.user?<><p className="access-note">{auth.user.email} is not on the admin list.</p><form action="/auth/signout" method="post"><button className="button">Use another account</button></form></>:<GoogleSignIn/>}</>:<><p>Admin setup is pending.</p><small>Follow the included setup guide to connect Google sign-in and add the first admins.</small></>}</div></main>
}
