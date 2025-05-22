export interface PromoteAdPayload {
  adId: string;
  promotionPlan: '7days' | '15days' | '30days';
  userId: string;
  paymentType: string;
  paymentCompany: string;
  transactionId: string;
  amount: number;
}
