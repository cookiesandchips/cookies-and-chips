export function packageName(quantity:number,packageCount:number,productType?:string){
 const count=Number.isInteger(quantity)&&quantity>0?quantity:0;
 const word=(one:string,many:string)=>count===1?`1 ${one}`:`${count} ${many}`;
 if(productType==='dog-treat')return word('bag','bags');
 if(packageCount===12)return word('dozen','dozen');
 if(packageCount===6)return word('half dozen','half dozen');
 return word('package','packages');
}
