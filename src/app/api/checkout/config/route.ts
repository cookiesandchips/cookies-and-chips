import {publicSite} from '@/lib/management/auth';
import {saleAgreement} from '@/lib/checkout/terms';
import {settings,session,db,failure} from '@/lib/checkout/server';
export const dynamic='force-dynamic';
export async function GET(){try{await session(true);const s=await settings();const {data,error}=await db().from('commerce_products').select('id,title,price_cents,package_count,product_type').eq('active',true);if(error)throw error;return Response.json({agreement:saleAgreement(await publicSite()),deliveryEnabled:true,mode:s.paymentMode,pickupEnabled:s.pickupEnabled,shippingEnabled:s.shippingEnabled,shippingMode:s.shippingMode,products:data},{headers:{'Cache-Control':'no-store'}});}catch(error){return failure(error);}}
