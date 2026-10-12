import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { SectionTitle } from "../components/SectionTitle";
import { db, type ServiceCategory } from "../db/db";
import type { Service, Client, LoyaltyReward } from "../types";
import { Moon, Sun, Plus, Trash2, Gift, Star } from "lucide-react";
import { useAppState } from "../context";

export function Master({ navigate }: { navigate: (p: string) => void }) {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [dark, setDark] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [servicePrice, setServicePrice] = useState("0");
  const [message, setMessage] = useState("");
  const [clientMessage, setClientMessage] = useState("");
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [pointsPerVisit, setPointsPerVisit] = useState("1");
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [rewardName, setRewardName] = useState("");
  const [rewardPoints, setRewardPoints] = useState("10");
  const [rewardServiceId, setRewardServiceId] = useState("");
  const { client: currentClient, setClient } = useAppState();
  async function load() {
    const [ss, cc, clientsData, settings, rewardData] = await Promise.all([db.services.toArray(), db.categories.toArray(), db.clients.toArray(), db.loyaltySettings.get("loyalty"), db.loyaltyRewards.toArray()]);
    setServices(ss); setCategories(cc.sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"))); setClients(clientsData);
    setPointsPerVisit(String(settings?.pointsPerVisit ?? 1));
    setRewards(rewardData.sort((a,b)=>a.pointsRequired-b.pointsRequired));
    setRewardServiceId(current => current || ss.find(item=>item.active)?.id || "");
    setServiceCategory(current => current || cc[0]?.name || "");
  }
  useEffect(() => { void load(); }, []);
  async function change(id:string, price:number) { await db.services.update(id,{price:Math.max(0,price)}); setServices(await db.services.toArray()); }
  async function toggleActive(s:Service) { if(s.active && rewards.some(reward=>reward.serviceId===s.id)){setMessage("Esse serviço é uma recompensa cadastrada. Exclua a meta vinculada antes de desativá-lo.");return;} await db.services.update(s.id,{active:!s.active}); await load(); }
  async function addCategory() {
    const name=categoryName.trim();
    if(!name){setMessage("Informe o nome do tipo de serviço.");return;}
    if(categories.some(c=>c.name.toLocaleLowerCase("pt-BR")===name.toLocaleLowerCase("pt-BR"))){setMessage("Esse tipo já existe.");return;}
    await db.categories.add({id:crypto.randomUUID(),name}); setCategoryName(""); setServiceCategory(name); setMessage("Tipo de serviço cadastrado."); await load();
  }
  async function deleteCategory(c:ServiceCategory) {
    const related=services.filter(s=>s.category===c.name);
    if(rewards.some(reward=>related.some(service=>service.id===reward.serviceId))){setMessage("Antes de excluir esse tipo, exclua as metas de fidelidade vinculadas aos serviços dele.");return;}
    const extra=related.length?` Os ${related.length} serviço(s) desse tipo também serão removidos do catálogo. Atendimentos anteriores serão preservados.`:"";
    if(!window.confirm(`Excluir o tipo “${c.name}”?${extra}`))return;
    await db.transaction("rw",db.categories,db.services,async()=>{await db.categories.delete(c.id);await db.services.where("category").equals(c.name).delete();});
    if(serviceCategory===c.name)setServiceCategory(""); setMessage("Tipo de serviço excluído."); await load();
  }
  async function addService() {
    const name=serviceName.trim(), price=Number(servicePrice);
    if(!name||!serviceCategory){setMessage("Informe o nome e o tipo do serviço.");return;}
    if(!Number.isFinite(price)||price<0){setMessage("Informe um preço válido.");return;}
    if(services.some(s=>s.category===serviceCategory&&s.name.toLocaleLowerCase("pt-BR")===name.toLocaleLowerCase("pt-BR"))){setMessage("Já existe um serviço com esse nome nesse tipo.");return;}
    await db.services.add({id:crypto.randomUUID(),name,category:serviceCategory,price,active:true}); setServiceName("");setServicePrice("0");setMessage("Serviço cadastrado com sucesso.");await load();
  }
  async function deleteService(s:Service) {
    if(rewards.some(reward=>reward.serviceId===s.id)){setMessage("Esse serviço é uma recompensa de fidelidade. Exclua primeiro a meta vinculada.");return;}
    if(!window.confirm(`Excluir “${s.name}” do catálogo? Atendimentos anteriores serão preservados.`))return;
    await db.services.delete(s.id);setMessage("Serviço excluído.");await load();
  }
  async function savePointsConfig() {
    const value = Number(pointsPerVisit);
    if (!Number.isInteger(value) || value < 0 || value > 100) { setMessage("A quantidade de pontos por visita deve ser um número inteiro entre 0 e 100."); return; }
    await db.loyaltySettings.put({ id: "loyalty", pointsPerVisit: value });
    setMessage("Regra de pontos salva. A nova regra vale para os próximos atendimentos.");
  }
  async function addReward() {
    const name = rewardName.trim();
    const points = Number(rewardPoints);
    const service = services.find(item => item.id === rewardServiceId && item.active);
    if (!name) { setMessage("Informe o nome da meta de fidelidade."); return; }
    if (!Number.isInteger(points) || points < 1) { setMessage("A meta deve exigir pelo menos 1 ponto."); return; }
    if (!service) { setMessage("Selecione um serviço ativo para oferecer como recompensa."); return; }
    if (rewards.some(item => item.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))) { setMessage("Já existe uma meta com esse nome."); return; }
    await db.loyaltyRewards.add({ id: crypto.randomUUID(), name, pointsRequired: points, serviceId: service.id });
    setRewardName(""); setRewardPoints("10"); setMessage("Meta de fidelidade cadastrada."); await load();
  }
  async function deleteReward(reward: LoyaltyReward) {
    if (clients.some(client=>client.pendingRewardId===reward.id)) { setMessage("Há clientes com essa recompensa pendente. Aguarde o resgate antes de excluir a meta."); return; }
    if (!window.confirm(`Excluir a meta “${reward.name}”?`)) return;
    await db.loyaltyRewards.delete(reward.id); setMessage("Meta excluída."); await load();
  }
  async function togglePlan(c:Client) {
    const plan=!c.isPlan; await db.clients.put({...c,isPlan:plan,planName:plan?(c.planName||"Plano Ouro"):undefined,planTotalVisits:plan?(c.planTotalVisits||4):undefined,planVisitsThisMonth:plan?(c.planVisitsThisMonth||0):undefined});await load();
  }
  async function deleteClient(c: Client) {
    if (deletingClientId) return;
    const confirmed = window.confirm(`Excluir o cliente “${c.name}”? Essa ação também excluirá o histórico de atendimentos associado e os dados faciais armazenados deste cliente. Não pode ser desfeita.`);
    if (!confirmed) return;
    setDeletingClientId(c.id);
    setClientMessage(`Excluindo ${c.name}...`);
    try {
      // Apaga primeiro os atendimentos associados e depois o cadastro, na mesma transação.
      await db.transaction("rw", db.clients, db.appointments, async () => {
        await db.appointments.where("clientId").equals(c.id).delete();
        await db.clients.delete(c.id);
      });
      // Evita deixar uma referência para um cliente que já não existe.
      if (currentClient?.id === c.id || localStorage.getItem("arte-fios-current-client") === c.id) {
        setClient(null);
      }
      setClientMessage(`Cliente “${c.name}” excluído com sucesso.`);
      await load();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      const detail = error instanceof Error ? ` (${error.message})` : "";
      setClientMessage(`Não foi possível excluir “${c.name}”.${detail}`);
    } finally {
      setDeletingClientId(null);
    }
  }
  const input="w-full rounded-xl bg-brand-light text-brand-dark px-3 py-3";
  const action="rounded-xl bg-brand-dark text-white px-4 py-3 font-bold flex items-center justify-center gap-2";
  return <Layout navigate={navigate} dark={dark}><div className="pt-8">
    <SectionTitle eyebrow="Administração" title="Acesso do Mestre" sub="Gerencie tipos de serviço, catálogo, preços, planos e aparência do sistema."/>
    <button onClick={()=>setDark(!dark)} className="w-full rounded-2xl bg-brand-surface text-brand-dark p-4 flex justify-between items-center"><span>Tema {dark?"Dark":"Light"}</span>{dark?<Moon/>:<Sun/>}</button>
    <section className="mt-6 rounded-2xl bg-brand-surface text-brand-dark p-4">
      <div className="flex items-center gap-2"><Star className="text-brand-gold"/><h2 className="font-heading text-xl">Fidelidade: pontos por visita</h2></div>
      <p className="text-sm opacity-70 mt-1 mb-4">Defina quantos pontos o cliente ganha a cada atendimento concluído. Clientes de plano continuam fora do acúmulo de pontos.</p>
      <label className="block text-sm font-medium mb-1">Pontos por visita</label>
      <div className="flex gap-2"><input type="number" min="0" max="100" step="1" value={pointsPerVisit} onChange={e=>setPointsPerVisit(e.target.value)} className={`${input} min-w-0`}/><button onClick={()=>void savePointsConfig()} className={action}>Salvar</button></div>
      <div className="border-t border-brand-dark/10 mt-5 pt-5">
        <div className="flex items-center gap-2"><Gift className="text-brand-gold"/><h3 className="font-heading text-lg">Metas e recompensas</h3></div>
        <p className="text-sm opacity-70 mt-1 mb-4">Cada meta define quantos pontos são necessários e qual serviço o cliente poderá ganhar grátis.</p>
        <label className="block text-sm font-medium mb-1">Nome da meta</label><input value={rewardName} onChange={e=>setRewardName(e.target.value)} placeholder="Ex.: Corte grátis" className={input}/>
        <label className="block text-sm font-medium mt-3 mb-1">Pontos necessários</label><input type="number" min="1" step="1" value={rewardPoints} onChange={e=>setRewardPoints(e.target.value)} className={input}/>
        <label className="block text-sm font-medium mt-3 mb-1">Serviço gratuito</label><select value={rewardServiceId} onChange={e=>setRewardServiceId(e.target.value)} className={input}><option value="">Selecione o serviço</option>{services.filter(item=>item.active).map(item=><option key={item.id} value={item.id}>{item.name} · {item.category}</option>)}</select>
        <button onClick={()=>void addReward()} disabled={!services.some(item=>item.active)} className={`${action} w-full mt-4 disabled:opacity-40`}><Plus size={18}/> Cadastrar meta</button>
        <div className="mt-4 space-y-2">{rewards.map(reward=>{const service=services.find(item=>item.id===reward.serviceId);return <div key={reward.id} className="flex items-center justify-between gap-3 rounded-xl border border-brand-dark/10 p-3"><div className="min-w-0"><div className="font-semibold">{reward.name}</div><div className="text-sm opacity-70">{reward.pointsRequired} pontos · {service?.name || "Serviço não disponível"} grátis</div></div><button onClick={()=>void deleteReward(reward)} className="rounded-lg p-2 text-red-700" aria-label={`Excluir meta ${reward.name}`}><Trash2 size={18}/></button></div>})}{!rewards.length&&<p className="text-sm opacity-60 py-2">Nenhuma meta cadastrada. Crie uma, por exemplo: 10 pontos = Corte Tradicional grátis.</p>}</div>
      </div>
      {message&&<p role="status" className="mt-3 text-sm">{message}</p>}
    </section>
    <section className="mt-7 rounded-2xl bg-brand-surface text-brand-dark p-4"><h2 className="font-heading text-xl mb-1">Tipos de serviço</h2><p className="text-sm opacity-70 mb-4">Crie ou exclua categorias, como Cabelo, Barba, Sobrancelha ou outras.</p>
      <div className="flex gap-2"><input value={categoryName} onChange={e=>setCategoryName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void addCategory();}} placeholder="Novo tipo (ex.: Depilação)" className={`${input} min-w-0`}/><button onClick={()=>void addCategory()} className={action} aria-label="Adicionar tipo"><Plus size={18}/></button></div>
      <div className="mt-3 space-y-2">{categories.map(c=><div key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-brand-dark/10 px-3 py-3"><span>{c.name}</span><button onClick={()=>void deleteCategory(c)} className="rounded-lg p-2 text-red-700" aria-label={`Excluir tipo ${c.name}`} title="Excluir tipo"><Trash2 size={18}/></button></div>)}</div>
    </section>
    <section className="mt-6 rounded-2xl bg-brand-surface text-brand-dark p-4"><h2 className="font-heading text-xl mb-1">Adicionar serviço</h2><p className="text-sm opacity-70 mb-4">Inclua uma opção com nome e preço para os clientes selecionarem.</p>
      <label className="block text-sm font-medium mb-1">Nome do serviço</label><input value={serviceName} onChange={e=>setServiceName(e.target.value)} placeholder="Ex.: Corte infantil" className={input}/>
      <label className="block text-sm font-medium mt-3 mb-1">Tipo</label><select value={serviceCategory} onChange={e=>setServiceCategory(e.target.value)} className={input}><option value="">Selecione um tipo</option>{categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select>
      <label className="block text-sm font-medium mt-3 mb-1">Preço (R$)</label><input type="number" min="0" step="0.01" value={servicePrice} onChange={e=>setServicePrice(e.target.value)} className={input}/>
      <button onClick={()=>void addService()} disabled={!categories.length} className={`${action} w-full mt-4 disabled:opacity-40`}><Plus size={18}/> Cadastrar serviço</button>{message&&<p role="status" className="mt-3 text-sm">{message}</p>}
    </section>
    <div className="mt-7 space-y-5"><h2 className="font-heading text-2xl">Catálogo e preços</h2>{categories.map(c=><div key={c.id}><h3 className="font-heading text-xl mb-2">{c.name}</h3>{services.filter(s=>s.category===c.name).map(s=><div key={s.id} className="flex items-center justify-between bg-brand-surface text-brand-dark rounded-2xl p-3 mb-2 gap-2"><div className="text-sm flex-1 min-w-0"><div className="font-medium">{s.name}</div><button onClick={()=>void toggleActive(s)} className="text-xs mt-1 opacity-60">{s.active?"Ativo":"Inativo"} · toque para alterar</button></div><input aria-label={`Preço de ${s.name}`} type="number" min="0" step="0.01" value={s.price} onChange={e=>void change(s.id,Number(e.target.value))} className="w-24 rounded-xl bg-brand-light px-3 py-2 text-right"/><button onClick={()=>void deleteService(s)} className="rounded-lg p-2 text-red-700" aria-label={`Excluir ${s.name}`} title="Excluir serviço"><Trash2 size={18}/></button></div>)}{!services.some(s=>s.category===c.name)&&<p className="text-sm opacity-50 py-2">Nenhum serviço cadastrado nesse tipo.</p>}</div>)}</div>
    <section className="mt-8" aria-labelledby="clients-heading">
      <h2 id="clients-heading" className="font-heading text-xl mb-2">Clientes cadastrados</h2>
      <p className="text-sm opacity-60 mb-3">Os pontos ficam em uma coluna própria. Toque no status para alternar entre cliente normal e plano.</p>
      {clientMessage && <p role="status" aria-live="polite" className="mb-3 rounded-xl bg-brand-surface text-brand-dark border border-brand-dark/10 p-3 text-sm">{clientMessage}</p>}
      {clients.length ? <>
        <div className="grid grid-cols-[minmax(0,1fr)_58px_72px_40px] sm:grid-cols-[minmax(0,1fr)_88px_100px_48px] gap-2 px-3 mb-2 text-xs font-bold uppercase tracking-wide opacity-60">
          <span>Cliente</span><span className="text-center">Pontos</span><span className="text-center">Status</span><span className="text-center">Ação</span>
        </div>
        {clients.map(c => <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_58px_72px_40px] sm:grid-cols-[minmax(0,1fr)_88px_100px_48px] items-center gap-2 bg-brand-surface text-brand-dark rounded-2xl p-3 mb-2">
          <div className="min-w-0"><span className="block font-semibold truncate">{c.name}</span><span className="block text-xs opacity-60 mt-1 truncate">{c.phone || "Sem telefone"}</span></div>
          <div className="text-center font-bold tabular-nums" aria-label={`${c.points} pontos`}>{c.points ?? 0}</div>
          <button onClick={() => void togglePlan(c)} className={`rounded-lg px-1 py-2 text-[10px] sm:text-xs font-bold ${c.isPlan ? "text-brand-gold" : "opacity-60"}`} aria-label={`Alterar ${c.name} de ${c.isPlan ? "plano" : "normal"}`} title="Toque para alterar status">{c.isPlan ? "PLANO" : "NORMAL"}</button>
          <button onClick={() => void deleteClient(c)} disabled={deletingClientId !== null} className="rounded-xl p-2 text-red-700 hover:bg-red-50 disabled:opacity-40" aria-label={`Excluir cliente ${c.name}`} title={`Excluir ${c.name}`}>
            {deletingClientId === c.id ? <span className="text-xs">…</span> : <Trash2 size={20}/>}
          </button>
        </div>)}
      </> : <p className="text-sm opacity-50 py-2">Nenhum cliente cadastrado.</p>}
    </section>
    <button onClick={()=>navigate("/rosto")} className="mt-5 w-full rounded-2xl border border-brand-gold py-4 font-bold">Cadastro de rosto do Mestre</button>
  </div></Layout>;
}
