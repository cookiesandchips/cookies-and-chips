import {createHash} from 'node:crypto';
import {CheckoutError} from './core';
export const defaultSaleTerms=`Terms & Conditions of Sale

By checking the agreement box and continuing to payment, you agree to these terms for your Cookies & Chips order.

Food products and ingredients
Review the product description, ingredient information and allergen notices before ordering. Cookies are sold by the package shown in your order. Sandie’s Treats are intended for dogs. Contact us before purchasing if you have a dietary restriction or need ingredient information that is not displayed.

Potential allergens
Products may contain milk, eggs, wheat, soy, peanuts, tree nuts, sesame or other allergens. Shared equipment and the baking environment can cause cross-contact. An ingredient list or absence of an allergen notice does not guarantee an allergen-free product. USDA nutrition values are estimates and can vary with ingredients and baking.

Freshness and care
Our products are perishable. Follow any storage instructions supplied with your order, keep products sealed and away from heat, and promptly receive your pickup or delivery. Contact us if a product arrives damaged, incorrect or unsuitable to eat; do not consume food you suspect is unsafe. We will review the issue and arrange an appropriate resolution. These terms do not remove rights you have under applicable law.

Payment and fulfillment
Review the items, quantity, fulfillment address, discount, tax and total before paying. An order is paid only after payment confirmation. Pickup and local delivery are arranged by appointment. Free local delivery is available to addresses verified within approximately 10 miles of our bakery, measured as a straight-line radius. Shipping rates, when available, are calculated for the supplied address; carrier delivery dates are estimates. Please provide accurate contact and address information.

Cancellations and questions
The cancellation policy displayed below applies to this sale. Contact Cookies & Chips using the contact email below with your order number for cancellation requests or problems with an order.

Acknowledgment
I have read the sale terms and the ingredient, potential-allergen and freshness information made available for my order. I understand that I should contact Cookies & Chips before purchasing if I need additional information.`;
export function saleAgreement(site:any){const text=String(site.saleTerms||defaultSaleTerms)+'\n\nCancellation policy\n'+String(site.cancellationPolicy||'Contact us before canceling an order.')+'\n\nContact: '+String(site.contactEmail||'admin@cookiesandchips.com');return {text,version:createHash('sha256').update(text).digest('hex')};}
export function requireAgreement(accepted:unknown,version:unknown,current:{version:string}){if(accepted!==true)throw new CheckoutError('Read and accept the Terms & Conditions of Sale before continuing to payment.');if(version!==current.version)throw new CheckoutError('The sale terms have changed. Reload checkout and review the current agreement.',409);}
