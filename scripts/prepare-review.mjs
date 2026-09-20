import {mkdirSync,readFileSync,writeFileSync,cpSync} from 'node:fs';
mkdirSync('public/review',{recursive:true});
mkdirSync('public/brand',{recursive:true});
for (const file of ['generated-v1','cookies-and-chips-logo.png','homepage-production-reference-2026-09-19.png','logo-package/masters/cookie-icon.png']) cpSync('docs/brand/'+file,'public/brand/'+file,{recursive:true});
cpSync('docs/visual-review/social-icons','public/review/social-icons',{recursive:true});
let html=readFileSync('docs/visual-review/index.html','utf8')
.replaceAll('../brand/','/brand/').replaceAll('src="social-icons/','src="/review/social-icons/')
.replace('Visual review 01','Customer approval review')
.replace('/ Visual review 01','/ Customer approval review')
.replace('No orders, emails, payments or account changes','Shopping and admin are demonstrations; no orders or payments. My account opens real account registration')
.replace('<button data-page="reference">Reference</button>','<button data-page="reference">Reference</button><a href="/account">My account ↗</a>')
.replace('<button onclick="showCart()">Bag','<a href="/account">Account</a><button onclick="showCart()">Bag')
.replace("info('Sign-in is a preview only. Return to Guest to explore checkout.')","location.href='/account'")
.replace("info('Password reset will send a secure email in the live application.')","location.href='/account'")
.replace('Description and suggested imagery','Manually entered description and uploaded photo')
.replace("function go(p){page=p;","function go(p){page=p;history.replaceState(null,'','#'+p);")
.replace("go('home');","go(['home','shop','product','checkout','admin','reference'].includes(location.hash.slice(1))?location.hash.slice(1):'home');");
html=html.replace('<meta name="viewport"','<meta name="robots" content="noindex,nofollow"><meta name="viewport"');
writeFileSync('public/review/index.html',html);
console.log('Prepared customer review with approved assets and account navigation.');
