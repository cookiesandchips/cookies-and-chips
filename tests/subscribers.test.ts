import {test} from 'node:test';
import assert from 'node:assert/strict';
import {countSubscribers,subscriberStatus} from '../src/lib/management/subscribers';
test('cookie club signups count as subscribers, not a status the signup never saves',()=>{assert.equal(subscriberStatus('subscribed'),'Subscribed');assert.equal(subscriberStatus('pending'),'Waiting to confirm');assert.deepEqual(countSubscribers([{status:'subscribed'},{status:'pending'},{status:'confirmed'}]),{subscribed:1,pending:1});});
