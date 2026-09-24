export const DEFAULT_DELIVERY_EXPECTATIONS='Local deliveries are made between 10 a.m. and 6 p.m. Arizona time. Please allow at least four hours after order confirmation so we can prepare your order fresh. We will contact you to confirm your delivery day and window.';
export function deliveryExpectations(value:unknown){return typeof value==='string'&&value.trim()?value.trim():DEFAULT_DELIVERY_EXPECTATIONS;}
export function fulfillmentMessage(fulfillment:{method:string;expectations?:string}){
 if(fulfillment.method==='delivery')return fulfillment.expectations||'We will contact you to confirm your local delivery day and window.';
 if(fulfillment.method==='pickup')return 'Pickup is by appointment. We will contact you when your order is ready.';
 return 'We will send shipping details when your order is dispatched.';
}
