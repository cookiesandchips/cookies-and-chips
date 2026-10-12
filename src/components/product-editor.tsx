'use client';
import type {Ref} from 'react';
import {RecipeEditor,type RecipeEditorHandle} from '@/components/recipe-editor';
import {ProductTaxonomy} from '@/components/taxonomy-manager';
import {dogPackageLabel,halfDozenCents} from '@/lib/checkout/offers';
import {baseForSale,salePrice} from '@/lib/management/validation';

const typeLabels:Record<string,string>={'human-cookie':'Gourmet cookie','dog-treat':'Dog treat'};
function money(cents:number){return '$'+(cents/100).toFixed(2);}
function sellingCents(product:any){try{return salePrice(Number(product.base_cents),product.markup_type,Number(product.markup_value));}catch{return 0;}}

export function ProductEditor({product,terms,site,busy,recipeRef,catalogTypes=[],onField,onDetail,onTaxonomy,onUpload,onSave,onClose}:{product:any;terms:any[];site:any;busy:boolean;recipeRef:Ref<RecipeEditorHandle>;catalogTypes?:string[];onField:(key:string,value:any)=>void;onDetail:(key:string,value:any)=>void;onTaxonomy:(patch:any)=>void;onUpload:(file?:File)=>void;onSave:()=>void;onClose:()=>void}){
 const cents=sellingCents(product),cookie=product.product_type==='human-cookie',treat=product.product_type==='dog-treat';
 const types=Array.from(new Set<string>(['human-cookie','dog-treat',...catalogTypes,product.product_type].filter(Boolean)));
 const half=cookie&&cents?halfDozenCents({price_cents:cents,package_count:12,product_type:'human-cookie',details:product.details}):0;
 const bag=treat?dogPackageLabel({price_cents:cents||1,package_count:10,product_type:'dog-treat',details:product.details}):'';
 const summary=!cents?'Enter a price to preview what customers pay.':cookie?`Customers pay ${money(cents)} a dozen and ${money(half)} a half dozen.`:treat?`Customers pay ${money(cents)} for a ${bag}.`:`Customers pay ${money(cents)}.`;
 function setSale(raw:string){if(raw===''||!Number.isFinite(Number(raw)))return;try{onField('base_cents',baseForSale(Math.round(Number(raw)*100),product.markup_type,Number(product.markup_value)));}catch{/* keep the current base when this selling price cannot be reached */}}
 return <form className="product-editor" onSubmit={e=>{e.preventDefault();onSave();}}>
  <div className="product-editor-scroll">
   <section>
    <h3>What customers pay</h3>
    <div className="product-grid-2">
     <label className="field">{cookie?'Full dozen ($)':'Price ($)'}<input type="number" min="0.01" step="0.01" value={cents?cents/100:''} onChange={e=>setSale(e.target.value)}/></label>
     {cookie&&<label className="field">Half dozen ($)<input type="number" min="0.01" step="0.01" placeholder="Half of the dozen price" value={product.details.halfDozenCents?product.details.halfDozenCents/100:''} onChange={e=>onDetail('halfDozenCents',e.target.value===''?undefined:Math.round(Number(e.target.value)*100))}/><span className="product-hint">Leave blank to charge half the dozen price.</span></label>}
     {treat&&<label className="field">Package label<input value={product.details.packageLabel||'7 oz. Bag'} onChange={e=>onDetail('packageLabel',e.target.value)}/></label>}
     {!cookie&&!treat&&<label className="field">Items per package<input type="number" min="1" max="100" value={product.package_count||12} onChange={e=>onField('package_count',Number(e.target.value))}/></label>}
    </div>
    <p className="product-pay-line">{summary}</p>
    <details className="product-cost"><summary>Cost &amp; markup</summary><div className="product-grid-3"><label className="field">Base price ($)<input type="number" min="0.01" step="0.01" value={product.base_cents/100} onChange={e=>onField('base_cents',Math.round(Number(e.target.value)*100))}/></label><label className="field">Markup type<select value={product.markup_type} onChange={e=>onField('markup_type',e.target.value)}><option value="percent">Percent</option><option value="fixed">Dollars</option></select></label><label className="field">Markup<input type="number" min="0" step="0.01" value={product.markup_value} onChange={e=>onField('markup_value',Number(e.target.value))}/></label></div></details>
   </section>
   <section>
    <h3>Name</h3>
    <label className="field">Title<input value={product.title} onChange={e=>onField('title',e.target.value)}/></label>
    <div className="product-grid-2">
     <label className="field">Slug<input value={product.slug} onChange={e=>onField('slug',e.target.value)}/></label>
     <label className="field">Product type<select value={product.product_type} onChange={e=>onField('product_type',e.target.value)}>{types.map(t=><option key={t} value={t}>{typeLabels[t]||t}</option>)}</select></label>
    </div>
   </section>
   <section>
    <h3>Where it appears</h3>
    <ProductTaxonomy terms={terms} details={product.details} onChange={onTaxonomy}/>
   </section>
   <section>
    <h3>Story &amp; photo</h3>
    <div className="product-story">
     <div>
      <img className="product-photo" width="180" height="180" src={product.details.image||product.details.defaultImage||'/brand/logo.png'} alt="Product preview"/>
      <label className="field">Replace image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>onUpload(e.target.files?.[0])}/></label>
      <button type="button" className="secondary" onClick={()=>onDetail('image','')}>Use default image</button>
      <p className="product-hint">Current default is retained when you upload a replacement.</p>
     </div>
     <div className="product-story-copy">
      <label className="field">Description<textarea value={product.details.description||''} onChange={e=>onDetail('description',e.target.value)}/></label>
      <label className="field">Flavor<input value={product.details.flavor||''} onChange={e=>onDetail('flavor',e.target.value)}/></label>
     </div>
    </div>
    <div className="product-checks">
     <label className="checkbox-label"><input type="checkbox" checked={product.active} onChange={e=>onField('active',e.target.checked)}/>Available for purchase</label>
     <label className="checkbox-label"><input type="checkbox" checked={product.details.featured} onChange={e=>onDetail('featured',e.target.checked)}/>Featured on homepage</label>
     {[['showNutrition','Nutrition Facts & ingredient names'],['showAllergens','Potential allergens'],['showFreshness','Freshness information']].map(([key,label])=><label className="checkbox-label" key={key}><input type="checkbox" disabled={site[key]===false} checked={site[key]!==false&&product.details[key]!==false} onChange={e=>onDetail(key,e.target.checked)}/>{label}{site[key]===false?' — disabled in Website Content':''}</label>)}
    </div>
    {site.showFreshness!==false&&<label className="field">Freshness &amp; storage guidance<textarea rows={4} value={product.details.freshness||''} onChange={e=>onDetail('freshness',e.target.value)}/></label>}
    {product.id&&<details className="product-recipe"><summary>Recipe</summary><RecipeEditor ref={recipeRef} key={product.id} productId={product.id}/></details>}
   </section>
  </div>
  <div className="product-editor-bar"><button type="submit" disabled={busy}>Save product</button><button type="button" className="secondary" onClick={onClose}>Cancel</button></div>
 </form>;
}
