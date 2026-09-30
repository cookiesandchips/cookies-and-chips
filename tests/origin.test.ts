import test from 'node:test';
import assert from 'node:assert/strict';
import {assertSameOrigin} from '../src/lib/checkout/origin';
import {CheckoutError} from '../src/lib/checkout/errors';
const www='https://www.cookiesandchips.com/api/cart';
const apex='https://cookiesandchips.com/api/cart';
function post(url:string,headers:Record<string,string>={}){return new Request(url,{method:'POST',headers});}
function allowed(url:string,headers:Record<string,string>={}){assert.doesNotThrow(()=>assertSameOrigin(post(url,headers)));}
function rejected(url:string,headers:Record<string,string>={}){assert.throws(()=>assertSameOrigin(post(url,headers)),(error:unknown)=>error instanceof CheckoutError&&error.status===403);}
test('apex and www are the same bakery after the host redirect',()=>{allowed(www,{origin:'https://www.cookiesandchips.com'});allowed(www,{origin:'https://cookiesandchips.com'});allowed(apex,{origin:'https://www.cookiesandchips.com'});allowed(apex,{origin:'https://cookiesandchips.com'});});
test('a missing Origin is allowed only when the browser still shows same-origin or a bakery referrer',()=>{allowed(www,{'sec-fetch-site':'same-origin'});allowed(www,{referer:'https://www.cookiesandchips.com/'});allowed(www,{referer:'https://cookiesandchips.com/oatmeal','sec-fetch-site':'same-site'});rejected(www);rejected(www,{'sec-fetch-site':'cross-site',origin:'https://www.cookiesandchips.com'});rejected(www,{referer:'https://evil.example/bag'});});
test('cross-site and other hosts stay rejected',()=>{rejected(www,{origin:'https://evil.example'});rejected(www,{origin:'null'});rejected(www,{origin:'https://preview.vercel.app'});rejected('https://cookies-and-chips.vercel.app/api/cart',{origin:'https://www.cookiesandchips.com'});allowed('http://localhost:3000/api/cart',{origin:'http://localhost:3000'});rejected('http://localhost:3000/api/cart',{origin:'https://www.cookiesandchips.com'});});
