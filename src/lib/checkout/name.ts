import {CheckoutError} from './errors';
export function personName(value:unknown){if(typeof value!=='string')throw new CheckoutError('Enter your name.');const name=value.trim();if(name.length<1||name.length>100||!/[A-Za-z]/.test(name)||/\[[^\]]*\]|\{[^}]*\}/.test(name)||/customer name/i.test(name))throw new CheckoutError('Enter your name.');return name;}
