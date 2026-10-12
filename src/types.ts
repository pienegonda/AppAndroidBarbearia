export type PendingBenefit = "25%" | "free" | null;
export type Category = string;
export type PaymentMethod = "Pix" | "Cartão" | "Dinheiro";
export type Period = 7 | 15 | 30 | 60;

export interface Client {
  id: string;
  name: string;
  phone?: string;
  visits: number;
  points: number;
  totalSaved: number;
  pendingBenefit: PendingBenefit;
  /** Recompensa personalizada de fidelidade disponível para resgate. */
  pendingRewardId?: string;
  isPlan: boolean;
  firstVisit?: string;
  lastVisit?: string;
  planName?: string;
  planVisitsThisMonth?: number;
  planTotalVisits?: number;
  faceDescriptor?: number[];
  /** Consentimento explícito para processamento/comparação biométrica. */
  faceBiometricConsentAt?: string;
  /** Foto de referência opcional, salva localmente após consentimento biométrico. */
  facePhotoDataUrl?: string;
  facePhotoConsentAt?: string;
}

export interface Service {
  id: string; name: string; category: Category; price: number; active: boolean;
}

export interface Appointment {
  id: string;
  clientId: string;
  date: string;
  services: Service[];
  paymentMethod: PaymentMethod;
  totalPrice: number;
  originalPrice: number;
  savings: number;
  pointsEarned: number;
  benefitUsed: PendingBenefit;
  returnPeriodDays: Period;
  isPlan: boolean;
  redeemedRewardId?: string;
}
export interface LoyaltySettings { id: "loyalty"; pointsPerVisit: number; }

export interface LoyaltyReward {
  id: string;
  name: string;
  pointsRequired: number;
  serviceId: string;
}
