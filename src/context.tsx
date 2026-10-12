import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { db } from "./db/db";
import type { Client } from "./types";

interface Ctx {
  client: Client | null;
  setClient: (client: Client | null) => void;
  refreshClient: () => Promise<void>;
}
const Context = createContext<Ctx | null>(null);

export function AppState({children}:{children:ReactNode}) {
  const [client,setClientState]=useState<Client|null>(null);
  useEffect(()=>{
    const id=localStorage.getItem("arte-fios-current-client");
    if(id) db.clients.get(id).then(c=>c&&setClientState(c));
  },[]);
  function setClient(c:Client|null) {
    setClientState(c);
    if(c) localStorage.setItem("arte-fios-current-client",c.id);
    else localStorage.removeItem("arte-fios-current-client");
  }
  async function refreshClient(){
    const id=localStorage.getItem("arte-fios-current-client");
    if(!id) return;
    setClientState((await db.clients.get(id))??null);
  }
  return <Context.Provider value={{client,setClient,refreshClient}}>{children}</Context.Provider>;
}
export function useAppState(){const c=useContext(Context);if(!c)throw new Error("AppState ausente");return c;}