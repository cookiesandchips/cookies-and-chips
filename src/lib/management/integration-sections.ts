import {CheckoutError} from '../checkout/core';
export const integrationSections={
 'Payment processing':['paymentProvider','paymentEnabled','paymentMode'],
 'Sales tax':['taxEnabled','taxMode'],
 'Shipping':['shippingEnabled','shippingMode','parcel','parcelProfiles'],
 'Business Details':['origin'],
} as const;
export type IntegrationSection=keyof typeof integrationSections;
export function sectionConfig(section:IntegrationSection,config:Record<string,unknown>){return Object.fromEntries(integrationSections[section].map(key=>[key,config[key]]));}
export function mergeIntegrationSection(current:Record<string,unknown>,input:{section?:unknown;config?:any}){
 if(typeof input.section!=='string'||!Object.hasOwn(integrationSections,input.section))throw new CheckoutError('Reload configuration before saving.');
 const section=input.section as IntegrationSection;
 if(!input.config||typeof input.config!=='object')throw new CheckoutError('Choose valid configuration settings.');
 return {...current,...sectionConfig(section,input.config)} as any;
}
