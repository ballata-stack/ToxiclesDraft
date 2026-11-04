import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {publicConfig} from './config';
export async function serverClient(){const {url,key}=publicConfig();const jar=await cookies();return createServerClient(url,key,{cookies:{getAll(){return jar.getAll()},setAll(values){try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* The proxy refreshes cookies for Server Components. */}}}});}
