import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {publicCatalog} from '@/lib/catalog/storefront';
export const revalidate=30;
export async function GET(){
 const template=readFileSync(join(process.cwd(),'src/storefront/index.html'),'utf8');
 let store='null';
 try{store=JSON.stringify(await publicCatalog()).replace(/</g,'\\u003c');}catch{store='null';}
 const html=template.replace('<script>',`<script>window.__STORE__=${store}</script><script>`);
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=0, s-maxage=30, stale-while-revalidate=120'}});
}
