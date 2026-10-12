import Dexie, { type Table } from "dexie";
import type { Client, Service, Appointment, LoyaltySettings, LoyaltyReward } from "../types";
export interface ServiceCategory { id: string; name: string; }
export class ArteFiosDB extends Dexie {
  clients!: Table<Client, string>; services!: Table<Service, string>; appointments!: Table<Appointment, string>; categories!: Table<ServiceCategory, string>; loyaltySettings!: Table<LoyaltySettings, string>; loyaltyRewards!: Table<LoyaltyReward, string>;
  constructor() {
    super("ArteEFiosDB");
    this.version(2).stores({ clients: "id,name,phone,isPlan", services: "id,category,active", appointments: "id,clientId,date,paymentMethod,isPlan" });
    this.version(3).stores({ clients: "id,name,phone,isPlan", services: "id,category,active", appointments: "id,clientId,date,paymentMethod,isPlan" });
    this.version(4).stores({ clients: "id,name,phone,isPlan", services: "id,category,active", appointments: "id,clientId,date,paymentMethod,isPlan", categories: "id,name" }).upgrade(async tx => {
      const existing = await tx.table("services").toArray() as Service[];
      const names = [...new Set(existing.map(s => s.category).filter(Boolean))];
      await tx.table("categories").bulkPut(names.map(name => ({ id: name.toLocaleLowerCase("pt-BR"), name })));
    });
    this.version(5).stores({ clients: "id,name,phone,isPlan,pendingRewardId", services: "id,category,active", appointments: "id,clientId,date,paymentMethod,isPlan,redeemedRewardId", categories: "id,name", loyaltySettings: "id", loyaltyRewards: "id,pointsRequired,serviceId" });
  }
}
export const db = new ArteFiosDB();
export const defaultServices: Service[] = [
  { id:"c1", name:"Corte Tradicional", category:"Cabelo", price:35, active:true },
  { id:"c2", name:"Corte + Degradê", category:"Cabelo", price:45, active:true },
  { id:"b1", name:"Barba Completa", category:"Barba", price:30, active:true },
  { id:"b2", name:"Barba Premium", category:"Barba", price:40, active:true },
  { id:"s1", name:"Sobrancelha", category:"Sobrancelha", price:15, active:true }
];
const defaultCategories: ServiceCategory[] = [{ id:"cabelo",name:"Cabelo" },{ id:"barba",name:"Barba" },{ id:"sobrancelha",name:"Sobrancelha" }];
export async function seedDB() {
  if (!(await db.loyaltySettings.get("loyalty"))) await db.loyaltySettings.put({ id: "loyalty", pointsPerVisit: 1 });
  if ((await db.services.count()) === 0) await db.services.bulkAdd(defaultServices);
  if ((await db.categories.count()) === 0) {
    const names = [...new Set((await db.services.toArray()).map(s => s.category).filter(Boolean))];
    if (names.length) await db.categories.bulkPut(names.map(name => ({ id: name.toLocaleLowerCase("pt-BR"), name })));
    else await db.categories.bulkAdd(defaultCategories);
  }
}
