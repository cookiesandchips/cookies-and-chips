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
// The published storefront has no internal review navigation or reference screen.
html=html
.replace(/<title>.*?<\/title>/,'<title>Cookies &amp; Chips</title>')
.replace(/<div class="review">[\s\S]*?<\/div><main id="app">/,'<main id="app">')
.replace(/if\(page==='reference'\)html=[\s\S]*?;if\(\[/,"if([");
html=html
.replace("function go(p){page=p;", "function go(p){if(!['home','shop','product','checkout'].includes(p))p='home';page=p;")
.replace('<small>Featured assortment is provisional.</small>','')
.replace('Proposed seasonal feature · $20 / dozen','$20 / dozen')
.replace(' Placeholder price for review.','')
.replace('A little introduction to the person behind your cookies.','Small batches. Freshly baked cookies. A little everyday joy.')
.replace('Final founder story goes here. This copy is a layout placeholder.','Baked with love in Arizona.')
.replace('“A little space for a very happy cookie customer.”','Good cookies make a brighter day.')
.replace('<p><small>Sample review layout, not a real testimonial</small></p><span style="color:#C99155">★★★★★</span>','')
.replace("openDialog('Design preview'", "openDialog('Cookies & Chips'")
.replace('Checkout preview only. Do not enter real personal information. No payment will be taken.','Online ordering is not available yet. No payment will be taken.')
.replace('PREVIEW PAYMENT STEP →','ORDERING COMING SOON')
.replace("Preview complete. Production checkout will calculate tax, confirm the total, and then open PayPal.","Online ordering is coming soon. Your order has not been submitted and no payment has been taken.")
.replace('Email signup is a design preview. Nothing was submitted.','Cookie club signup is coming soon. Your email has not been submitted.')
.replace('Search and remaining content pages follow in the next specification pass.','')
.replaceAll(' — generated illustration','')
.replaceAll('Generated bakery inspiration','Freshly baked cookies')
.replaceAll('Generated chocolate chip cookie stack','Chocolate chip cookie stack')
.replaceAll('Generated pumpkin chocolate chip cookies','Pumpkin chocolate chip cookies');
writeFileSync('public/review/index.html',html);
console.log('Prepared customer review with approved assets and account navigation.');
