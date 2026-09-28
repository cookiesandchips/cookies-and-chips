export function packageName(quantity:number,packageCount:number){
 const count=Number.isInteger(quantity)&&quantity>0?quantity:0;
 if(packageCount===12)return count===1?'1 dozen':`${count} dozen`;
 return count===1?'1 package':`${count} packages`;
}
