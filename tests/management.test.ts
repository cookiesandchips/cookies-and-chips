import {test} from 'node:test';
import assert from 'node:assert/strict';
import {salePrice,imageUrl,productDetails,socials} from '../src/lib/management/validation';
test('markup uses the base without compounding and rounds to cents',()=>{assert.equal(salePrice(3000,'percent',10),3300);assert.equal(salePrice(3000,'fixed',2.5),3250);for(const value of [-1,NaN,Infinity,10001])assert.throws(()=>salePrice(3000,'percent',value));});
test('image URLs cannot point at another project or executable content',()=>{assert.equal(imageUrl('/brand/logo.png'),'/brand/logo.png');for(const url of ['javascript:alert(1)','https://other.supabase.co/storage/v1/object/public/product-images/a.png','/brand/../private','https://example.com/pic.svg'])assert.throws(()=>imageUrl(url));});
test('public product details exclude private recipe fields',()=>{const d=productDetails({category:'Cookies',recipe:'secret',method:'secret',description:'Cookie'});assert.equal(d.recipe,undefined);assert.equal(d.method,undefined);});
test('social profile validation rejects misleading and insecure domains',()=>{assert.equal(socials([{platform:'instagram',url:'https://www.instagram.com/cook.ies_and_chips/',visible:true}]).length,1);for(const url of ['http://instagram.com/x','https://instagram.com.evil.test/x','https://user:pass@instagram.com/x'])assert.throws(()=>socials([{platform:'instagram',url}]));});
