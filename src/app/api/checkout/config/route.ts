import {paymentCredentials} from '@/lib/management/integrations';
import {publicSite} from '@/lib/management/auth';
import {saleAgreement} from '@/lib/checkout/terms';
import {settings,session,db,failure,supportSchemaReady} from '@/lib/checkout/server';
export const dynamic='force-dynamic';
export async function checkoutConfig(){await session(true);const s=await settings(),site=await publicSite();const {data,error}=await db().from('commerce_products').select('id,title,price_cents,package_count,product_type,details').eq('active',true);if(error)throw error;const products=(data||[]).map(p=>({id:p.id,title:p.title,price_cents:p.price_cents,package_count:p.package_count,product_type:p.product_type,image:p.details?.image||p.details?.defaultImage||'/brand/logo.png'}));return {supportAvailable:await supportSchemaReady(),paypalClientId:(await paymentCredentials(s.paymentMode)).id,agreement:saleAgreement(site),deliveryEnabled:site.deliveryGeocodingEnabled===true,mode:s.paymentMode,pickupEnabled:s.pickupEnabled,shippingEnabled:s.shippingEnabled,shippingMode:s.shippingMode,products};}
export async function GET(){try{return Response.json(await checkoutConfig(),{headers:{'Cache-Control':'no-store'}});}catch(error){return failure(error);}}
