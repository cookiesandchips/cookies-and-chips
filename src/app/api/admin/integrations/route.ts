import {admin,audit} from '@/lib/management/auth';
import {body,failure} from '@/lib/checkout/server';
import {integrationSummary,saveIntegrations,testIntegration} from '@/lib/management/integrations';
import {limit} from '@/lib/management/rate-limit';
import {CheckoutError} from '@/lib/checkout/errors';
export async function GET(){try{await admin();return Response.json(await integrationSummary(),{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}}
export async function POST(r:Request){try{
 const input=await body(r),user=await admin();await limit(r,'admin-integrations',30);
 if(input.action==='test'){
  const check=await testIntegration(input);await audit(user.id,'integration-test:'+check.provider+':'+check.mode+':'+(check.ok?'passed':'failed'));
  return Response.json({summary:await integrationSummary(),check},{headers:{'Cache-Control':'no-store'}});
 }
 if(input.action!==undefined&&input.action!=='save')throw new CheckoutError('Unknown configuration action.');
 await saveIntegrations(input);await audit(user.id,'integrations-save:'+input.section+':'+(input.config?.paymentMode||input.config?.shippingMode||input.config?.taxMode||'business'));
 return Response.json(await integrationSummary(),{headers:{'Cache-Control':'no-store'}});
}catch(e){return failure(e);}}
