import {readContent} from '../../lib/server';import {Site} from '../site';
export const dynamic='force-dynamic';
export default async function Page(){const {content}=await readContent();return <Site content={content} page="events"/>;}
