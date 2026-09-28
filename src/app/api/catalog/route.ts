import {failure} from '@/lib/checkout/server';
import {publicCatalog} from '@/lib/catalog/storefront';
export async function GET(){try{return Response.json(await publicCatalog(),{headers:{'Cache-Control':'public, max-age=0, s-maxage=30, stale-while-revalidate=120'}});}catch(e){return failure(e);}}
