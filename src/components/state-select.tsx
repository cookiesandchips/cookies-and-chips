import type {SelectHTMLAttributes} from "react";
import {US_STATES,normalizeState} from "@/lib/us-states";
export default function StateSelect(props:SelectHTMLAttributes<HTMLSelectElement>){return <select autoComplete="address-level1" {...props} {...(props.value!==undefined?{value:normalizeState(props.value)}:{})}><option value="">Select state or territory</option>{US_STATES.map(s=><option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}</select>;}
