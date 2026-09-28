export type HeaderSession={name:string;email:string;isAdmin:boolean};

export function customerName(source:{user_metadata?:{full_name?:unknown;name?:unknown}|null},addressName?:unknown,orderName?:unknown){
 const meta=source.user_metadata||{};
 return String(meta.full_name||meta.name||addressName||orderName||'').trim();
}

export function accountNames(name:string,email:string){
 const full=name.trim()||email.trim();
 const short=full.includes('@')?full.split('@')[0]:(full.split(/\s+/).find(Boolean)||full);
 return {full,short};
}

export function readAccountCookieValue(raw:string|null|undefined):HeaderSession|null{
 if(!raw)return null;
 try{
  const parsed=JSON.parse(decodeURIComponent(raw));
  if(!parsed||typeof parsed.email!=='string'||!parsed.email)return null;
  return {name:typeof parsed.name==='string'?parsed.name:'',email:parsed.email,isAdmin:!!parsed.isAdmin};
 }catch{return null;}
}
