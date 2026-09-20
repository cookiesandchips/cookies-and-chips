import assert from 'node:assert/strict';
const origin='http://127.0.0.1:3000';
for (const path of ['/', '/account', '/auth/error']) {
 const response=await fetch(origin+path);assert.equal(response.status,200,path);
 assert.match(await response.text(),/Cookies/);
}
for (const path of ['/auth/callback?next=https://evil.test','/auth/confirm?type=admin&token_hash=invalid']) {
 const response=await fetch(origin+path,{redirect:'manual'});assert.equal(response.status,307);
 assert.equal(new URL(response.headers.get('location')).pathname,'/auth/error');
 assert.equal(response.headers.get('referrer-policy'),'no-referrer');
 assert.match(response.headers.get('cache-control'),/no-store/);
}
console.log('HTTP smoke checks passed: pages render, invalid callbacks stay local, auth responses prevent caching and referrer leakage.');
