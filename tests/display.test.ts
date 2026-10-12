import test from 'node:test';
import assert from 'node:assert/strict';
import {packageName} from '../src/lib/checkout/display';
test('checkout quantities speak in dozens',()=>{assert.equal(packageName(1,12),'1 dozen');assert.equal(packageName(2,12),'2 dozen');assert.equal(packageName(1,6),'1 half dozen');assert.equal(packageName(2,6),'2 half dozen');assert.equal(packageName(1,10),'1 package');assert.equal(packageName(1,10,'dog-treat'),'1 bag');});
