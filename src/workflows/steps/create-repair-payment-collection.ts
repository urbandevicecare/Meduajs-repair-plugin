import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { REPAIR_MODULE } from "../../modules/repair";
import RepairModuleService from "../../modules/repair/service";

export const createRepairPaymentCollectionStep = createStep(
  "create-repair-payment-collection",
  async (
    input: { repair_ticket_id: string; customer_id?: string | null },
    { container },
  ) => {
    const repairService: RepairModuleService = container.resolve(REPAIR_MODULE);
    const paymentModuleService = container.resolve(Modules.PAYMENT);
    
    // Fetch the ticket details
    const ticket = await repairService.retrieveRepairTicket(input.repair_ticket_id);

    // Determine region and currency
    let currencyCode = "usd";
    let regionId: string | undefined = undefined;

    try {
      const regionModuleService = container.resolve(Modules.REGION);
      const regions = await regionModuleService.listRegions({}, { take: 1 });
      if (regions && regions.length > 0) {
        currencyCode = regions[0].currency_code;
        regionId = regions[0].id;
      }
    } catch (e) {
      // Ignore if region module is not available or has no regions
    }

    // Create the payment collection
    const paymentCollection = await paymentModuleService.createPaymentCollections({
      currency_code: currencyCode,
      amount: Number(ticket.total_estimate),
      metadata: {
        repair_ticket_id: ticket.id,
      },
    });

    // Update the repair ticket with the newly created payment collection ID
    await repairService.updateRepairTickets({
      id: ticket.id,
      payment_collection_id: paymentCollection.id,
    });

    return new StepResponse({ paymentCollection }, paymentCollection.id);
  },
  async (paymentCollectionId, { container }) => {
    if (!paymentCollectionId) return;
    const paymentModuleService = container.resolve(Modules.PAYMENT);
    await paymentModuleService.deletePaymentCollections([paymentCollectionId]);
    // Also clear it from the ticket? The database transaction might rollback, so this might not be needed.
  },
);
