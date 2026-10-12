export function SectionTitle({eyebrow,title,sub}:{eyebrow?:string;title:string;sub?:string}) {
 return <div className="mb-6"><div className="text-xs uppercase tracking-[.2em] text-brand-gold font-bold">{eyebrow}</div><h1 className="font-heading text-3xl font-bold mt-1">{title}</h1>{sub&&<p className="mt-2 text-sm opacity-65">{sub}</p>}</div>
}