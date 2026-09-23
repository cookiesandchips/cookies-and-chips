import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
import {CheckoutError} from '../checkout/errors';
function key(value:string){
 if(!/^[a-f0-9]{64}$/i.test(value))throw new CheckoutError('Set the dedicated INTEGRATION_ENCRYPTION_KEY in Vercel before managing integration credentials.',503);
 return Buffer.from(value,'hex');
}
export function encryptCredential(value:string,encryptionKey:string){
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(encryptionKey),iv);
 const encrypted=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
 return [iv,cipher.getAuthTag(),encrypted].map(v=>v.toString('base64')).join('.');
}
export function decryptCredential(value:string,encryptionKey:string){
 try{const [iv,tag,data]=value.split('.').map(v=>Buffer.from(v,'base64'));const decipher=createDecipheriv('aes-256-gcm',key(encryptionKey),iv);decipher.setAuthTag(tag);return Buffer.concat([decipher.update(data),decipher.final()]).toString();}
 catch{throw new CheckoutError('Stored integration credentials cannot be unlocked. Check the encryption key.',503);}
}
