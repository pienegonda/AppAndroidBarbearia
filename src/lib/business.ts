import type { Client, Service, PendingBenefit, LoyaltyReward } from "../types";

export function calculateOrder(services: Service[]) {
  const ordered = [...services].sort((a,b) => b.price - a.price);
  const originalPrice = ordered.reduce((s,x) => s+x.price, 0);
  const totalPrice = ordered.reduce((s,x,i) => s + x.price * (i === 0 ? 1 : 0.5), 0);
  return { ordered, originalPrice, totalPrice, savings: originalPrice - totalPrice };
}

export function calculateFinalPrice(services: Service[], benefit: PendingBenefit) {
  const base = calculateOrder(services);
  let total = base.totalPrice;
  let benefitSavings = 0;
  if (benefit === "25%") {
    benefitSavings = total * 0.25;
    total *= 0.75;
  } else if (benefit === "free") {
    benefitSavings = total;
    total = 0;
  }
  return {
    ...base,
    benefitSavings,
    totalPrice: Number(total.toFixed(2)),
    savings: Number((base.savings + benefitSavings).toFixed(2))
  };
}


export function calculatePriceWithReward(services: Service[], benefit: PendingBenefit, rewardServiceId?: string) {
  if (!rewardServiceId) return { ...calculateFinalPrice(services, benefit), rewardSavings: 0 };
  const base = calculateOrder(services);
  const reward = base.ordered.find((service) => service.id === rewardServiceId);
  if (!reward) return { ...calculateFinalPrice(services, benefit), rewardSavings: 0 };
  const index = base.ordered.findIndex((service) => service.id === rewardServiceId);
  const rewardSavings = reward.price * (index === 0 ? 1 : 0.5);
  let total = Math.max(0, base.totalPrice - rewardSavings);
  if (benefit === "25%") total *= 0.75;
  else if (benefit === "free") total = 0;
  total = Number(total.toFixed(2));
  return { ...base, benefitSavings: base.originalPrice - base.totalPrice, totalPrice: total, savings: Number((base.originalPrice - total).toFixed(2)), rewardSavings };
}

export function completeConfigurableLoyalty(client: Client, pointsPerVisit: number, rewards: LoyaltyReward[]) {
  const visits = client.visits + 1;
  let points = client.points + Math.max(0, Math.floor(pointsPerVisit));
  let pendingRewardId = client.pendingRewardId;
  // Uma recompensa pendente por vez. O saldo continua acumulando enquanto ela não é resgatada.
  if (!pendingRewardId && !client.pendingBenefit && rewards.length) {
    const available = [...rewards].sort((a, b) => a.pointsRequired - b.pointsRequired).find((reward) => points >= reward.pointsRequired);
    if (available) { points -= available.pointsRequired; pendingRewardId = available.id; }
  }
  return { visits, points, pendingBenefit: client.pendingBenefit, pendingRewardId };
}
