import {mkdirSync,readFileSync,writeFileSync,cpSync} from 'node:fs';
mkdirSync('public/review',{recursive:true});
mkdirSync('public/brand',{recursive:true});
for (const file of ['generated-v1','story-section-reference.png','cookies-and-chips-logo.png','logo-package/masters/cookie-icon.png']) cpSync('docs/brand/'+file,'public/brand/'+file,{recursive:true});
cpSync('docs/visual-review/social-icons','public/review/social-icons',{recursive:true});
writeFileSync('public/review/index.html',readFileSync('src/storefront/index.html','utf8'));
console.log('Prepared storefront assets.');
