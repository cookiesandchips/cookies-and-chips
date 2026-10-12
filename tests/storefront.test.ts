import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('src/storefront/index.html','utf8');
function runtime(){let storage='{}';const context=vm.createContext({document:{addEventListener(){}},localStorage:{getItem:()=>storage,setItem:(_key:string,value:string)=>{storage=value;}}});const code=html.match(/<script>([\s\S]*?)<\/script>/)![1].replace("restoreBag();readLocation();loadStore();loadSession();addEventListener('popstate',readLocation);addEventListener('hashchange',readLocation);",'');vm.runInContext(code,context);return {run:(code:string)=>vm.runInContext(code,context),setStorage:(value:string)=>{storage=value;},getStorage:()=>storage};}
test('bag restores valid product quantities but rejects tampered input',()=>{const r=runtime();r.setStorage(JSON.stringify({'0':2,'6':1,'999':4,'1':-2,'2':1.5,'3':100,'evil':1}));r.run('restoreBag()');assert.equal(r.run('cart'),3);assert.equal(r.run('total()'),70);assert.deepEqual(JSON.parse(r.run('JSON.stringify(bag)')),{'0':2,'6':1});});
test('corrupt storage does not break storefront startup',()=>{const r=runtime();r.setStorage('not-json');assert.doesNotThrow(()=>r.run('restoreBag()'));assert.equal(r.run('cart'),0);});
test('homepage pink and gold lines come from site content',()=>{const r=runtime();r.run("document.querySelector=()=>({set innerHTML(value){document.markup=value;}});catalog.length=0;catalog[0]={name:'Cookie',image:'https://example.com/c.png',description:'',price:1,unit:'dozen',active:true,featured:false};catalogReady=true;siteContent={...siteContent,heroAccent:'sweeter.',storyGreeting:'Hello there.',closingAccent:'With care,'};render()");const markup=r.run('document.markup');assert.match(markup,/sweeter\./);assert.match(markup,/Hello there\./);assert.match(markup,/With care,/);});
test('storefront account control names a signed-in customer and offers sign in otherwise',()=>{assert.match(html,/class="account-signin"[^>]*>Sign in</);assert.match(html,/My orders/);assert.match(html,/>Account</);assert.match(html,/Manage Bakery/);assert.match(html,/Sign out/);assert.match(html,/account-name-full/);assert.match(html,/href="\/my-story"/);assert.match(html,/Gourmet Cookies/);assert.match(html,/Dog Treats/);assert.match(html,/Half Dozen \(6 Cookies\)/);assert.match(html,/7 oz\. Bag/);assert.doesNotMatch(html,/class="profile-link"/);assert.doesNotMatch(html,/<div class="review">/);assert.match(html,/gtag\/js\?id=G-CX6QRV8WC5/);assert.match(html,/gtag\('config','G-CX6QRV8WC5'\)/);const r=runtime();assert.match(r.run('accountControl()'),/Sign in/);assert.doesNotMatch(r.run('accountControl()'),/My orders/);r.run("session={name:'Brant Wadsworth',email:'brant@email.com',isAdmin:true}");const menu=r.run('accountControl()');assert.match(menu,/Brant Wadsworth/);assert.match(menu,/account-name-short">Brant</);assert.match(menu,/brant@email.com/);assert.match(menu,/href="\/account#orders"/);assert.match(menu,/href="\/account">Account</);assert.match(menu,/href="\/admin">Manage Bakery</);assert.match(menu,/Sign out/);});
test('nutrition panel shows one-cookie serving, daily values, and unavailable nutrients safely',()=>{const r=runtime();const panel=r.run("nutritionFacts({servingsPerContainer:12,servingGrams:42,values:{calories:200,fat:7.8,protein:null}})");assert.match(panel,/1 cookie \(42 g\)/);assert.match(panel,/12 servings per container/);assert.match(panel,/10%/);assert.match(panel,/Not available/);assert.match(panel,/Estimated from USDA/);});
test('shop grouping recognizes all assigned groups and legacy products',()=>{const r=runtime();assert.equal(r.run("groupValues({categories:['Cookies','Gifts']},'category').includes('Gifts')"),true);assert.equal(r.run("groupValues({category:'Cookies'},'category')[0]"),'Cookies');assert.equal(r.run("groupValues({collections:['Seasonal','Favorites']},'collection').length"),2);});
test('initial and failed catalog loads never render default product photos',()=>{
 const r=runtime();
 r.run("document.querySelector=()=>({set innerHTML(value){document.markup=value;}}); render()");
 const pending=r.run('document.markup');assert.match(pending,/Loading our latest/);assert.doesNotMatch(pending,/generated-v1|pumpkin-patch|sandies-treats|Ali’s Classic/);
 r.run('catalogError=true;render()');const failed=r.run('document.markup');assert.match(failed,/Try again/);assert.doesNotMatch(failed,/generated-v1|pumpkin-patch|sandies-treats/);
});
test('cookies and dog treats stay on separate menus and sell in the requested sizes',()=>{
 const r=runtime();
 r.run(`const fields={};document.querySelector=sel=>{if(sel==='#app')return {set innerHTML(v){document.markup=v}};if(!fields[sel])fields[sel]={value:''};return fields[sel]};document.fields=fields;catalog.length=0;prices.length=0;catalog[8]={name:'Chip',description:'Soft cookie',price:30,active:true,productType:'human-cookie',packageCount:12,category:'Cookies',collection:'Everyday',image:''};catalog[9]={name:'Pup',description:'For dogs',price:10,active:true,productType:'dog-treat',packageCount:10,packageLabel:'7 oz. Bag',category:'Dog Treats',collection:'Everyday',image:''};catalogReady=true;shopState.menu='cookies';page='shop';render();`);
 const cookies=r.run('document.fields["#shop-grid"].innerHTML');
 assert.match(cookies,/Chip/);assert.doesNotMatch(cookies,/Pup/);
 r.run(`shopState.menu='treats';page='shop';render();`);
 const treats=r.run('document.fields["#shop-grid"].innerHTML');
 assert.match(treats,/Pup/);assert.doesNotMatch(treats,/Chip/);
 r.run(`page='product';activeProduct=8;render();`);
 const cookiePage=r.run('document.markup');
 assert.match(cookiePage,/Half Dozen \(6 Cookies\) — \$15\.00/);assert.match(cookiePage,/Full Dozen \(12 Cookies\) — \$30\.00/);assert.match(cookiePage,/id="qty"/);assert.doesNotMatch(cookiePage,/id="size"[\s\S]*7 oz/);
 r.run(`page='product';activeProduct=9;render();`);
 const treatPage=r.run('document.markup');
 assert.match(treatPage,/\$10\.00 <small>\(7 oz\. Bag\)<\/small>/);assert.match(treatPage,/id="qty"/);assert.doesNotMatch(treatPage,/Select size/);
});
test('loaded homepage cards, monthly feature and gallery use saved product images',()=>{
 const r=runtime();r.run("document.querySelector=()=>({set innerHTML(value){document.markup=value;}});catalog.length=0;catalog[0]={name:'Updated cookie',image:'https://example.com/updated-cookie.png',description:'Saved description',price:12,unit:'dozen',active:true};siteContent.monthlyProductId='0';catalogReady=true;render()");
 const rendered=r.run('document.markup');assert.equal((rendered.match(/src="https:\/\/example.com\/updated-cookie.png"/g)||[]).length,3);assert.doesNotMatch(rendered,/src="\/brand\/generated-v1\//);
});
