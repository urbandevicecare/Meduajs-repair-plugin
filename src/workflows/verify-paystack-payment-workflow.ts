import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { verifyPaystackPaymentStep } from "./steps/verify-paystack-payment";
import { updateTicketPaymentStep } from "./steps/update-ticket-payment";
import { syncPaymentZohoStep } from "./steps/sync-payment-zoho";

type VerifyPaystackPaymentWorkflowInput = {
  reference: string;
};

export const verifyPaystackPaymentWorkflow = createWorkflow(
  "verify-paystack-payment",
  (input: VerifyPaystackPaymentWorkflowInput) => {
    const verifiedData = verifyPaystackPaymentStep(input.reference);

    const updatedTicket = updateTicketPaymentStep({
      ticketId: verifiedData.ticketId,
      reference: verifiedData.reference,
      actualPaidAmount: verifiedData.actualPaidAmount,
    });

    syncPaymentZohoStep({
      ticket_id: updatedTicket.id,
      amount: verifiedData.actualPaidAmount,
    });

    return new WorkflowResponse(updatedTicket);
  },
);
