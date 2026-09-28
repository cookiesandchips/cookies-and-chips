'use client';
import {useState} from 'react';
import {IntegrationSettings} from './integration-settings';
import {EmailPanel} from './admin-workspace-panels';
const integrations=[['Payment processing','PayPal','Checkout payments'],['Sales tax','TaxJar','Sales tax calculation'],['Shipping','Shippo','Shipping rates'],['Email','Email','Order receipts and account mail']] as const;
export function IntegrationsHub(){const [active,setActive]=useState<(typeof integrations)[number][0]>('Payment processing');const current=integrations.find(([id])=>id===active);return <><p>PayPal, TaxJar, Shippo, and email live here.</p><div className="tabs" role="tablist" aria-label="Integrations">{integrations.map(([id,label])=><button key={id} type="button" aria-pressed={active===id} onClick={()=>setActive(id)}>{label}</button>)}</div><p>{current?.[2]}</p>{active==='Email'?<EmailPanel/>:<IntegrationSettings key={active} section={active}/>}</>;}
