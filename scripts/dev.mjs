import {spawn} from 'node:child_process';
const input=process.argv.slice(2);const args=['dev','--webpack'];
for(let i=0;i<input.length;i++){if(input[i]==='--host')args.push('--hostname',input[++i]);else if(input[i]==='--strictPort')continue;else args.push(input[i]);}
const child=spawn(process.execPath,['node_modules/next/dist/bin/next',...args],{stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));child.on('exit',code=>process.exit(code??1));
