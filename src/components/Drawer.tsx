import { X, LayoutDashboard, Settings, ScanFace } from "lucide-react";
import { Logo } from "./Logo";
export function Drawer({open,onClose,navigate}:{open:boolean;onClose:()=>void;navigate:(p:string)=>void}) {
 if(!open) return null;
 return <div className="fixed inset-0 z-50">
   <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
   <aside className="absolute right-0 top-0 h-full w-[min(88vw,360px)] bg-brand-dark text-white p-6 shadow-2xl">
     <div className="flex justify-between items-start"><Logo light/><button onClick={onClose} className="p-2"><X/></button></div>
     <nav className="mt-12 space-y-3">
       {[
        ["/financeiro","Painel Financeiro",LayoutDashboard],
        ["/mestre","Acesso do Mestre",Settings],
        ["/rosto","Página Inicial",ScanFace]
       ].map(([path,label,Icon]:any)=><button key={path} onClick={()=>{navigate(path);onClose()}} className="w-full flex items-center gap-4 rounded-2xl bg-white/5 p-4 text-left hover:bg-white/10"><Icon className="text-brand-gold"/><span>{label}</span></button>)}
     </nav>
   </aside>
 </div>
}