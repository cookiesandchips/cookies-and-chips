import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('Venmo is requested once, inside the PayPal stack',()=>{const source=readFileSync(new URL('../src/components/payment-methods.tsx',import.meta.url),'utf8');assert.match(source,/enable-funding':'venmo/);assert.equal(source.includes('FUNDING.VENMO'),false);});
