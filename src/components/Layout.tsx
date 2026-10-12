import { Menu } from "lucide-react";
import { Logo } from "./Logo";
import { Drawer } from "./Drawer";
import { useState } from "react";
export function Layout({children,navigate,dark=false}:{children:React.ReactNode;navigate:(p:string)=>void;dark?:boolean}) {
 const [open,setOpen]=useState(false);
 return <div className={`app-shell ${dark?"bg-brand-dark text-white":"bg-brand-light text-brand-dark"}`}>
   <header className="mx-auto flex w-full max-w-[480px] items-center justify-between px-5 py-4">
    <Logo light={dark}/><button onClick={()=>setOpen(true)} className={`rounded-xl p-2 ${dark?"bg-white/10":"bg-brand-dark/5"}`}><Menu/></button>
   </header>
   <main className="mx-auto w-full max-w-[480px] px-5 pb-8">{children}</main>
   <Drawer open={open} onClose={()=>setOpen(false)} navigate={navigate}/>
 </div>
}