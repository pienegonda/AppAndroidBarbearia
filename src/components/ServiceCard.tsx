import { Check } from "lucide-react"; import type { Service } from "../types";
export function ServiceCard({service,selected,onClick}:{service:Service;selected:boolean;onClick:()=>void}) {
 return <button onClick={onClick} aria-pressed={selected} className={`w-full rounded-2xl border p-4 text-left transition ${selected?"border-brand-gold bg-brand-gold/10 shadow-gold":"border-brand-dark/10 bg-brand-surface"}`}>
   <div className="flex justify-between items-center gap-3"><div><div className="font-semibold">{service.name}</div><div className="text-xs opacity-50 mt-1">{service.category}</div></div><div className="flex items-center gap-3"><div className="font-bold">R$ {service.price.toFixed(2).replace(".",",")}</div><div className={`h-7 w-7 rounded-full border flex items-center justify-center ${selected?"bg-brand-gold border-brand-gold text-brand-dark":"border-brand-dark/20"}`}>{selected&&<Check size={16}/>}</div></div></div>
 </button>
}