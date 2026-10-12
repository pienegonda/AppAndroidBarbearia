import { Camera, Search } from "lucide-react";
import { Layout } from "../components/Layout"; import { SectionTitle } from "../components/SectionTitle";
export function Identification({navigate}:{navigate:(p:string)=>void}) {
 return <Layout navigate={navigate} dark><div className="pt-8"><SectionTitle eyebrow="Bem-vindo" title="Vamos encontrar você." sub="Escolha uma opção para iniciar seu atendimento."/>
 <div className="rounded-3xl border border-brand-gold/30 bg-white/5 p-7 text-center mb-5"><div className="mx-auto mb-4 h-20 w-20 rounded-full bg-brand-gold/10 flex items-center justify-center"><Camera className="text-brand-gold" size={34}/></div><div className="font-heading text-xl">Reconhecimento facial</div><p className="text-sm opacity-50 mt-2">Clientes que fizeram cadastro com foto e autorizaram o reconhecimento podem ser identificados pela câmera.</p><button onClick={()=>navigate("/rosto")} className="mt-5 w-full rounded-2xl bg-brand-gold text-brand-dark py-4 font-bold">Abrir identificação facial</button></div>
 <div className="grid gap-3"><button onClick={()=>navigate("/cadastro")} className="rounded-2xl bg-brand-gold py-4 font-bold">Primeira Vez</button><button onClick={()=>navigate("/busca")} className="rounded-2xl border border-white/15 py-4 flex justify-center gap-2"><Search size={18}/> Busca Manual</button></div>
 </div></Layout>
}