import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {keptCopy,siteCopy,siteLine} from '../src/lib/content/copy';
test('blank accent text keeps the pink and gold lines already on the site',()=>{assert.equal(siteLine('','better.'), 'better.');assert.equal(siteLine('sweeter.','better.'),'sweeter.');assert.equal(keptCopy('',siteCopy.heroAccent,siteCopy.heroAccent,40),'better.');assert.equal(keptCopy(undefined,undefined,siteCopy.storyGreeting,80),'Hi, I’m Heather.');assert.equal(keptCopy('Hello.','Hi, I’m Heather.',siteCopy.storyGreeting,80),'Hello.');assert.equal(keptCopy('',undefined,siteCopy.storyCaption,400),siteCopy.storyCaption);assert.match(siteCopy.storyCaption,/honor Ali/);});
test('the story page links to CureSearch under the cookie button',()=>{const page=readFileSync(new URL('../src/app/my-story/page.tsx',import.meta.url),'utf8');const shop=page.indexOf('Find your favorite cookie');const cure=page.indexOf('https://give.curesearch.org/give/412622#!/donation/checkout?c_src=waystogive');assert.ok(shop>=0&&cure>shop);assert.doesNotMatch(page,/_gl=|_gcl_au/);});
