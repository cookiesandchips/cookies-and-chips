import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('src/storefront/index.html','utf8');
function runtime(){let storage='{}';const context=vm.createContext({document:{addEventListener(){}},localStorage:{getItem:()=>storage,setItem:(_key:string,value:string)=>{storage=value;}}});const code=html.match(/<script>([\s\S]*?)<\/script>/)![1].replace("restoreBag();readLocation();addEventListener('popstate',readLocation);addEventListener('hashchange',readLocation);",'');vm.runInContext(code,context);return {run:(code:string)=>vm.runInContext(code,context),setStorage:(value:string)=>{storage=value;},getStorage:()=>storage};}
test('bag restores valid product quantities but rejects tampered input',()=>{const r=runtime();r.setStorage(JSON.stringify({'0':2,'6':1,'999':4,'1':-2,'2':1.5,'3':100,'evil':1}));r.run('restoreBag()');assert.equal(r.run('cart'),3);assert.equal(r.run('total()'),48);assert.deepEqual(JSON.parse(r.getStorage()),{'0':2,'6':1});});
test('corrupt storage does not break storefront startup',()=>{const r=runtime();r.setStorage('not-json');assert.doesNotThrow(()=>r.run('restoreBag()'));assert.equal(r.run('cart'),0);});
test('storefront has accessible account icon and working story destination without review toolbar',()=>{assert.match(html,/class="profile-link"[^>]*aria-label="My account"/);assert.match(html,/href="\/my-story"/);assert.doesNotMatch(html,/<div class="review">/);assert.doesNotMatch(html,/<a href="\/account">Account<\/a>/);});
