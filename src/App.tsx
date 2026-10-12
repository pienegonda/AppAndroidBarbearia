import { useEffect,useState } from "react";
import { seedDB } from "./db/db";
import { AppState } from "./context";
import { Idle } from "./pages/Idle"; import { Identification } from "./pages/Identification"; import { Register } from "./pages/Register"; import { Search } from "./pages/Search"; import { Services } from "./pages/Services"; import { InService } from "./pages/InService"; import { Plan } from "./pages/Plan"; import { Finance } from "./pages/Finance"; import { Master } from "./pages/Master"; import { Face } from "./pages/Face";

function path(){return window.location.pathname}
export default function App(){
 const [route,setRoute]=useState(path());
 useEffect(()=>{seedDB(); const on=()=>setRoute(path()); window.addEventListener("popstate",on); return()=>window.removeEventListener("popstate",on)},[]);
 const navigate=(p:string)=>{history.pushState({}, "", p); setRoute(p); window.scrollTo(0,0)};
 let page;
 if(route==="/") page=<Idle go={()=>navigate("/identificacao")}/>;
 else if(route==="/identificacao") page=<Identification navigate={navigate}/>;
 else if(route==="/cadastro") page=<Register navigate={navigate}/>;
 else if(route==="/busca") page=<Search navigate={navigate}/>;
 else if(route==="/servicos") page=<Services navigate={navigate}/>;
 else if(route==="/servico") page=<InService navigate={navigate}/>;
 else if(route==="/plano") page=<Plan navigate={navigate}/>;
 else if(route==="/financeiro") page=<Finance navigate={navigate}/>;
 else if(route==="/mestre") page=<Master navigate={navigate}/>;
 else if(route==="/rosto") page=<Face navigate={navigate}/>;
 else page=<Idle go={()=>navigate("/identificacao")}/>;
 return <AppState>{page}</AppState>;
}