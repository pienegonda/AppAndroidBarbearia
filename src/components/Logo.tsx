export function Logo({light=false}:{light?:boolean}) {
  return <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-xl border border-brand-gold/60 flex items-center justify-center text-brand-gold font-heading font-bold text-lg">AF</div>
    <div><div className={`font-heading text-lg font-bold ${light?"text-white":"text-brand-dark"}`}>Arte e Fios</div>
    <div className={`text-[10px] tracking-[.22em] uppercase ${light?"text-white/60":"text-brand-dark/50"}`}>Barbearia</div></div>
  </div>
}