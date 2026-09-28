import Checkout from './checkout-client';
import {checkoutConfig} from '@/app/api/checkout/config/route';
import {readCart} from '@/app/api/cart/route';
import {accountPayload} from '@/app/api/account/route';
export const dynamic='force-dynamic';
export default async function Page(){
 const [config,cart,account]=await Promise.all([checkoutConfig().catch(()=>null),readCart().catch(()=>({items:[] as {id:string;quantity:number}[]})),accountPayload().catch(()=>null)]);
 const bag=Object.fromEntries((cart.items||[]).map((item:{id:string;quantity:number})=>[item.id,item.quantity]));
 return <Checkout initialConfig={config} initialBag={bag} initialAccount={account}/>;
}
