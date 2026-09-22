// Only structured ingredient names may reach the storefront. Never fall back to
// legacy product text, recipe instructions, or a previous recipe revision.
export function publicRecipe(value:any,details:any,site:any){
 const showNutrition=site.showNutrition!==false&&details.showNutrition!==false;
 const showAllergens=site.showAllergens!==false&&details.showAllergens!==false;
 const rows=Array.isArray(value?.recipe?.rows)?value.recipe.rows:[];
 const names=rows.filter((r:any)=>Number.isSafeInteger(r.fdcId)&&r.fdcId>0&&typeof r.name==='string').map((r:any)=>r.name.trim()).filter(Boolean);
 const current=value?.published===true&&value?.recipe?.reviewed===true?value.nutrition:null;
 const ingredients=showNutrition?names.join(', '):'';
 const allergens=showAllergens&&current?String(current.allergens||''):'';
 const nutrition=showNutrition&&current?{servingGrams:current.servingGrams,servingsPerContainer:current.servingsPerContainer,values:current.values,missing:current.missing,estimated:true,calculatedAt:current.calculatedAt}:null;
 return {showNutrition,showAllergens,showFreshness:site.showFreshness!==false&&details.showFreshness!==false,ingredients,allergens,nutrition,crossContact:showAllergens?String(value?.recipe?.crossContact||''):''};
}
