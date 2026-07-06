import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk";
import { approveRepairCostStep } from "./steps/approve-repair-cost";
import { updateRepairTicketStatusStep } from "./steps/update-repair-ticket-status";
import { createRepairOrderStep } from "./steps/create-repair-order";

type ApproveRepairCostWorkflowInput = {
  repair_ticket_id: string;
};

export const approveRepairCostWorkflow = createWorkflow(
  "approve-repair-cost-workflow",
  function (input: ApproveRepairCostWorkflowInput) {
    const approvedTicket = approveRepairCostStep(input);

    // Automatically update status to "repairing" after approval
    const updatedTicket = updateRepairTicketStatusStep({
      repair_ticket_id: input.repair_ticket_id,
      status: "repairing",
    });

    const orderInput = transform({ approvedTicket, input }, ({ approvedTicket, input }) => ({
      repair_ticket_id: input.repair_ticket_id,
      customer_id: approvedTicket.customer_id,
    }));

    const { order } = createRepairOrderStep(orderInput);

    return new WorkflowResponse({
      repairTicket: updatedTicket,
      order,
    });
  },
);
