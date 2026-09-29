import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cookieClubConfirmation} from '../src/lib/management/newsletter-mail';
test('cookie club confirmation is a branded email whose link is the only way in',()=>{
 const url='https://www.cookiesandchips.com/newsletter?token='+'ab'.repeat(32);
 const mail=cookieClubConfirmation(url);
 assert.match(mail.subject,/Cookie Club/);
 assert.match(mail.text,/not subscribed until you confirm/);
 assert.match(mail.text,new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 assert.match(mail.html,/cookies-and-chips-logo\.png/);
 assert.match(mail.html,/#e87863/);
 assert.match(mail.html,/#e5b56b/);
 assert.match(mail.html,/Confirm my email/);
 assert.match(mail.html,/not subscribed until you confirm/);
 assert.match(mail.html,/href="https:\/\/www\.cookiesandchips\.com\/newsletter\?token=/);
});
