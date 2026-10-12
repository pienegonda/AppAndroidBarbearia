import { useEffect, useState } from "react";
import { Logo } from "../components/Logo";
export function Idle({go}:{go:()=>void}) {
 const [time,setTime]=useState(new Date());
 useEffect(()=>{const i=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(i)},[]);
 return <button onClick={go} className="min-h-screen w-full bg-brand-dark text-white flex flex-col items-center justify-center text-center p-8">
   <Logo light/><div className="mt-24 font-heading text-7xl font-bold text-brand-gold tracking-tight">{time.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>
   <div className="mt-2 opacity-50">{time.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"})}</div>
   <div className="mt-28 rounded-full border border-brand-gold/40 px-6 py-3 text-sm text-brand-gold">Toque para começar</div>
 </button>
}