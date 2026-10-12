export function FidelityCard({points,nextGoalPoints}:{points:number;nextGoalPoints?:number}) {
 const goal = nextGoalPoints && nextGoalPoints > 0 ? Math.floor(nextGoalPoints) : 20;
 const safePoints = Math.max(0, Math.floor(points || 0));
 const filledDots = Math.min(goal, safePoints);
 const remaining = Math.max(0, goal - safePoints);
 const message = !nextGoalPoints
   ? "✂️ O mestre ainda está preparando as próximas recompensas. Fique de olho! 🎁"
   : remaining === 0
     ? "🎉 Meta alcançada! Você merece esse mimo. Confira sua recompensa com o mestre! 🥳"
     : remaining === 1
       ? "🔥 Falta só 1 pontinho! Mais uma visita e a recompensa pode ser sua! ✨"
       : `💈 Você está no caminho! Faltam ${remaining} pontinhos para liberar sua recompensa. Bora chegar lá! 🚀`;

 return <div className="rounded-3xl bg-brand-dark p-5 text-white shadow-gold">
   <div className="flex justify-between gap-3"><div><div className="text-xs uppercase tracking-widest text-brand-gold">✨ Fidelidade</div><div className="font-heading text-xl mt-1">Seu cartão de vantagens 🎁</div></div><div className="text-sm opacity-90 whitespace-nowrap">{safePoints}/{goal} pontos</div></div>
   <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mt-5" role="img" aria-label={`${filledDots} de ${goal} pontos preenchidos`}>
     {Array.from({length:goal},(_,i)=><div key={i} title={i < filledDots ? "Ponto conquistado" : "Ponto a conquistar"} className={`aspect-square rounded-full border transition-colors ${i<filledDots?"bg-brand-gold border-brand-gold":"border-white/25"}`}>{i < filledDots && <span className="flex h-full items-center justify-center text-[10px] text-brand-dark">✦</span>}</div>)}
   </div>
   <p className="mt-4 text-sm text-white/80">{message}</p>
 </div>;
}
