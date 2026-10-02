import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { updateRepairCostsStep } from "./steps/update-repair-costs";

type ToggleRepairTaxWorkflowInput = {
  repair_ticket_id: string;
  apply_tax: boolean;
};

export const toggleRepairTaxWorkflow = createWorkflow(
  "toggle-repair-tax",
  (input: ToggleRepairTaxWorkflowInput) => {
    const updatedTicket = updateRepairCostsStep({
      repair_ticket_id: input.repair_ticket_id,
      apply_tax: input.apply_tax,
    });

    return new WorkflowResponse(updatedTicket);
  },
);
