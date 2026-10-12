import { useEffect,useMemo,useState } from "react"; import { Layout } from "../components/Layout"; import { SectionTitle } from "../components/SectionTitle"; import { CalendarDays, Check, CreditCard, ArrowLeft, Pencil } from "lucide-react"; import { db } from "../db/db"; import type { Client, PaymentMethod, Period, Service, LoyaltyReward } from "../types"; import { calculatePriceWithReward, completeConfigurableLoyalty } from "../lib/business"; import { useAppState } from "../context";
export function InService({navigate}:{navigate:(p:string)=>void}) {
 const {client,setClient}=useAppState();
 const [services,setServices]=useState<Service[]>([]); const [rewards,setRewards]=useState<LoyaltyReward[]>([]); const [pointsPerVisit,setPointsPerVisit]=useState(1);
 const [period,setPeriod]=useState<Period>(30); const [payment,setPayment]=useState<PaymentMethod>("Pix"); const [confirm,setConfirm]=useState(false); const [saving,setSaving]=useState(false);
 useEffect(()=>{try{setServices(JSON.parse(sessionStorage.getItem("arte-fios-services")||"[]"))}catch{setServices([])}; Promise.all([db.loyaltyRewards.toArray(),db.loyaltySettings.get("loyalty")]).then(([r,settings])=>{setRewards(r);setPointsPerVisit(settings?.pointsPerVisit??1);});},[]);
 const benefit=client?.isPlan?null:(client?.pendingBenefit??null);
 const pendingReward=rewards.find(item=>item.id===client?.pendingRewardId); const rewardApplied=!!pendingReward&&services.some(item=>item.id===pendingReward.serviceId); const calc=useMemo(()=>calculatePriceWithReward(services,benefit,rewardApplied?pendingReward?.serviceId:undefined),[services,benefit,rewardApplied,pendingReward]);
 if(!client)return <Layout navigate={navigate}><div className="pt-8"><SectionTitle eyebrow="Atendimento" title="Cliente não selecionado" sub="Volte e escolha um cliente."/><button onClick={()=>navigate("/identificacao")} className="w-full rounded-2xl bg-brand-dark text-white py-4 font-bold">Voltar</button></div></Layout>;
 if(!services.length)return <Layout navigate={navigate}><div className="pt-8"><SectionTitle eyebrow="Atendimento" title="Escolha os serviços" sub="Não há itens selecionados para finalizar."/><button onClick={()=>navigate("/servicos")} className="w-full rounded-2xl bg-brand-dark text-white py-4 font-bold">Escolher serviços</button></div></Layout>;
 const currentClient = client;

 async function finish(){
   if(saving)return; setSaving(true);
   const now=new Date().toISOString();
   const loyalty=currentClient.isPlan?{visits:currentClient.visits+1,points:currentClient.points,pendingBenefit:currentClient.pendingBenefit,pendingRewardId:currentClient.pendingRewardId}:completeConfigurableLoyalty(currentClient,pointsPerVisit,rewards);
   // O benefício existente é consumido somente nesta visita. Um novo benefício gerado
   // pelo ponto da visita é preservado.
   const newPendingBenefit=currentClient.isPlan?currentClient.pendingBenefit:(benefit?null:loyalty.pendingBenefit);
   const updated:Client={...currentClient,...loyalty,pendingBenefit:newPendingBenefit,pendingRewardId:rewardApplied?undefined:loyalty.pendingRewardId,totalSaved:Number((currentClient.totalSaved+calc.savings).toFixed(2)),lastVisit:now};
   const appointment={
     id:crypto.randomUUID(),clientId:currentClient.id,date:now,services,paymentMethod:payment,
     totalPrice:calc.totalPrice,originalPrice:calc.originalPrice,savings:calc.savings,
     pointsEarned:currentClient.isPlan?0:pointsPerVisit,benefitUsed:benefit,returnPeriodDays:period,isPlan:currentClient.isPlan,redeemedRewardId:rewardApplied?pendingReward?.id:undefined
   };
   try {
     if(currentClient.isPlan){
       const month=now.slice(0,7);
       const count=await db.appointments.where("clientId").equals(currentClient.id).filter(a=>a.isPlan&&a.date.startsWith(month)).count();
       const limit=currentClient.planTotalVisits??4;
       if(count>=limit){window.alert(`Este plano já atingiu o limite de ${limit} visitas neste mês.`);return;}
       updated.planVisitsThisMonth=count+1;
     }
     await db.transaction("rw",[db.clients,db.appointments],async()=>{await db.appointments.add(appointment);await db.clients.put(updated)});
     setClient(updated); sessionStorage.removeItem("arte-fios-services"); setConfirm(false);
     navigate("/"); // Após concluir o atendimento, retorna à tela inicial; o financeiro segue acessível pelo menu do mestre.
   } catch (error) {
     console.error("Falha ao salvar atendimento", error);
     window.alert("Não foi possível salvar o atendimento. Confira o armazenamento do dispositivo e tente novamente.");
   } finally { setSaving(false); }
 }

 return <Layout navigate={navigate}><div className="pt-8"><SectionTitle eyebrow="Atendimento" title="Revise e finalize." sub="Confira o que será realizado, pagamento e retorno."/>
 <div className="rounded-3xl bg-brand-surface p-5 border border-brand-dark/5">
   <div className="flex justify-between items-center"><div><div className="text-xs uppercase tracking-widest text-brand-gold">Cliente</div><strong>{client.name}</strong></div><button onClick={()=>navigate("/servicos")} className="rounded-xl border p-2" aria-label="Alterar serviços"><Pencil size={17}/></button></div>
   <div className="mt-5 border-t border-brand-dark/5 pt-3">
     {calc.ordered.map((item,i)=><div key={item.id} className="flex justify-between py-2 text-sm"><span>{item.name}<small className="block opacity-50">{rewardApplied&&item.id===pendingReward?.serviceId?"Recompensa grátis":i===0?"Preço integral":"50% de desconto"}</small></span><strong>{rewardApplied&&item.id===pendingReward?.serviceId?"Grátis":`R$ ${(item.price*(i===0?1:.5)).toFixed(2).replace(".",",")}`}</strong></div>)}
   </div>
   <div className="mt-3 border-t border-brand-dark/5 pt-3 text-sm space-y-1"><div className="flex justify-between"><span>Preço original</span><span>R$ {calc.originalPrice.toFixed(2).replace(".",",")}</span></div><div className="flex justify-between text-brand-success"><span>Economia</span><span>- R$ {calc.savings.toFixed(2).replace(".",",")}</span></div>{benefit&&<div className="flex justify-between text-brand-gold"><span>Benefício aplicado</span><span>{benefit==="25%"?"25%":"Grátis"}</span></div>}{rewardApplied&&<div className="flex justify-between text-brand-gold"><span>{pendingReward?.name}</span><span>Serviço grátis</span></div>}<div className="flex justify-between text-lg font-bold pt-2"><span>Total</span><span>R$ {calc.totalPrice.toFixed(2).replace(".",",")}</span></div></div>
 </div>
 <div className="mt-7"><div className="font-semibold mb-3 flex gap-2 items-center"><CreditCard size={18}/> Forma de pagamento</div><div className="grid grid-cols-3 gap-2">{(["Pix","Cartão","Dinheiro"] as PaymentMethod[]).map(x=><button key={x} onClick={()=>setPayment(x)} className={`rounded-2xl py-4 border ${payment===x?"bg-brand-dark text-white border-brand-dark":"bg-brand-surface border-brand-dark/10"}`}>{x}</button>)}</div></div>
 <div className="mt-7"><div className="font-semibold mb-3 flex gap-2 items-center"><CalendarDays size={18}/> Quando voltar?</div><div className="grid grid-cols-4 gap-2">{([7,15,30,60] as const).map(x=><button key={x} onClick={()=>setPeriod(x)} className={`rounded-2xl py-4 border ${period===x?"bg-brand-dark text-white":"bg-brand-surface border-brand-dark/10"}`}>{x}d</button>)}</div></div>
 <div className="mt-7 rounded-2xl bg-brand-gold/10 p-4 text-sm"><strong>Resumo final:</strong> {services.length} serviço(s) · {payment} · retorno em {period} dias.</div>
 <button onClick={()=>setConfirm(true)} className="mt-5 w-full rounded-2xl bg-brand-dark text-white py-4 font-bold flex items-center justify-center gap-2"><Check size={18}/> Finalizar atendimento</button>
 <button onClick={()=>navigate("/servicos")} className="mt-2 w-full rounded-2xl border border-brand-dark/10 py-3 flex items-center justify-center gap-2"><ArrowLeft size={17}/> Voltar para serviços</button>
 {confirm&&<div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4"><div className="w-full max-w-[480px] rounded-3xl bg-brand-surface p-6 text-brand-dark shadow-2xl"><div className="text-xs uppercase tracking-widest text-brand-gold">Confirmação</div><div className="font-heading text-2xl mt-1">Finalizar atendimento?</div><p className="text-sm opacity-60 mt-2">O atendimento será salvo no dispositivo e atualizará fidelidade e financeiro.{" "}{!currentClient.isPlan&&`Você acumulará ${pointsPerVisit} ponto(s).`}{rewardApplied?` A recompensa ${pendingReward?.name} será resgatada.`:""}</p><div className="grid grid-cols-2 gap-3 mt-5"><button onClick={()=>setConfirm(false)} className="rounded-2xl border py-4 font-bold">Voltar</button><button disabled={saving} onClick={finish} className="rounded-2xl bg-brand-dark text-white py-4 font-bold disabled:opacity-40">{saving?"Salvando...":"Confirmar"}</button></div></div></div>}
 </div></Layout>
}