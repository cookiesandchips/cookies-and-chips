import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fundingButtonStyle} from '../src/components/payment-methods';
test('Venmo does not inherit the PayPal pay label or gold color',()=>{const venmo=fundingButtonStyle('venmo');const paypal=fundingButtonStyle('paypal');assert.equal(venmo.color,'blue');assert.equal('label' in venmo,false);assert.equal(paypal.label,'pay');assert.equal(paypal.color,'gold');});
