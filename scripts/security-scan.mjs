import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const roots=["src","scripts","supabase",".github"];
const forbidden=[/sb_secret_[A-Za-z0-9_-]{10,}/g,/service_role[^\n]{0,30}eyJ[A-Za-z0-9_-]+/gi,/CLOUDFLARE_API_TOKEN\s*=\s*[^\s#]+/g];

async function walk(dir){
  const entries=await readdir(dir,{withFileTypes:true}).catch(()=>[]);
  const files=[];
  for(const e of entries){const p=join(dir,e.name);if(e.isDirectory())files.push(...await walk(p));else files.push(p)}
  return files;
}

let failed=false;
for(const root of roots){
  for(const file of await walk(root)){
    const text=await readFile(file,"utf8").catch(()=>null);
    if(text===null)continue;
    for(const rule of forbidden){rule.lastIndex=0;if(rule.test(text)){console.error(`Potential secret in ${file}`);failed=true}}
  }
}
if(failed)process.exit(1);
console.log("Security scan passed.");
