import {text} from '@/lib/checkout/core';
export const siteCopy={
 heroPrefix:'Chocolate makes\nlife',
 heroAccent:'better.',
 heroEyebrow:'Even if it’s only for a minute.',
 storyGreeting:'Hi, I’m Heather.',
 closingAccent:'Made with love,',
 closingTitle:'meant to be shared.',
};
export const siteCopyKeys=Object.keys(siteCopy) as (keyof typeof siteCopy)[];
export function siteLine(value:unknown,fallback:string){return typeof value==='string'&&value.trim()?value.trim():fallback;}
export function keptCopy(value:unknown,previous:unknown,fallback:string,max:number){const source=typeof value==='string'?value:typeof previous==='string'?previous:fallback;return text(source.trim()||fallback,1,max);}
