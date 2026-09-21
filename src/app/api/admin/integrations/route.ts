import {admin,audit} from '@/lib/management/auth';
import {body,failure} from '@/lib/checkout/server';
import {integrationSummary,saveIntegrations} from '@/lib/management/integrations';
export async function GET(){try{await admin();return Response.json(await integrationSummary(),{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}}
export async function POST(r:Request){try{const input=await body(r),user=await admin();await saveIntegrations(input);await audit(user.id,'integrations-save');return Response.json(await integrationSummary(),{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}}
