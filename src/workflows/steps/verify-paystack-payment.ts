import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { REPAIR_MODULE } from "../../modules/repair";
import RepairModuleService from "../../modules/repair/service";

export const verifyPaystackPaymentStep = createStep(
  "verify-paystack-payment",
  async (reference: string, { container }) => {
    const repairService: RepairModuleService = container.resolve(REPAIR_MODULE);
    const [settings] = await repairService.listRepairSettings({});

    if (!settings?.paystack_enabled || !settings.paystack_secret_key) {
      throw new Error("Paystack is not configured or disabled");
    }

    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${settings.paystack_secret_key}`
      }
    });
    
    const paystackData = await paystackRes.json();
    if (!paystackData.status || paystackData.data.status !== "success") {
      throw new Error("Transaction verification failed");
    }

    return new StepResponse({
      ticketId: paystackData.data.metadata?.ticket_id,
      reference,
      actualPaidAmount: paystackData.data.amount / 100, // minor units to standard
    });
  }
);
