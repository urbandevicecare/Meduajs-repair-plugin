import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { syncPaymentToZoho } from "../../utils/zoho-payment-sync.js";

type SyncPaymentZohoInput = {
  ticket_id: string;
  amount: number;
};

export const syncPaymentZohoStep = createStep(
  "sync-payment-zoho",
  async (input: SyncPaymentZohoInput, { container }) => {
    // We intentionally wrap this so it doesn't throw and cause a rollback.
    // If we roll back the local ticket, we lose record of a successful Paystack charge!
    await syncPaymentToZoho(container as any, input.ticket_id, input.amount, "Paystack");
    return new StepResponse(true);
  }
);
