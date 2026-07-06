import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { updateRepairTicketStatusStep } from "./steps/update-repair-ticket-status";
import { REPAIR_MODULE } from "../modules/repair";
import RepairModuleService from "../modules/repair/service";
import { Modules } from "@medusajs/framework/utils";

type RejectRepairCostWorkflowInput = {
  repair_ticket_id: string;
};

export const notifyTechnicianRejectedStep = createStep(
  "notify-technician-rejected",
  async (input: { repair_ticket_id: string }, { container }) => {
    const repairService: RepairModuleService = container.resolve(REPAIR_MODULE);
    const ticket = await repairService.retrieveRepairTicket(input.repair_ticket_id);

    if (ticket.technician_id) {
      let technicianEmail = "";
      const customerModuleService = container.resolve(Modules.CUSTOMER);
      try {
        const customer = await customerModuleService.retrieveCustomer(ticket.technician_id);
        if (customer.email) technicianEmail = customer.email;
      } catch (e) {
        try {
          const userModuleService = container.resolve(Modules.USER);
          const user = await userModuleService.retrieveUser(ticket.technician_id);
          if (user.email) technicianEmail = user.email;
        } catch (e2) {}
      }

      if (technicianEmail) {
        const notificationModuleService = container.resolve(Modules.NOTIFICATION);
        await notificationModuleService.createNotifications({
          to: technicianEmail,
          channel: "email",
          template: "technician-job-rejected",
          data: {
            ticket_number: ticket.ticket_number,
            status: ticket.status,
            repair_ticket_id: ticket.id,
            technician_name: ticket.technician_name,
          },
        });
      }
    }
    return new StepResponse(null);
  }
);

export const rejectRepairCostWorkflow = createWorkflow(
  "reject-repair-cost-workflow",
  function (input: RejectRepairCostWorkflowInput) {
    const updatedTicket = updateRepairTicketStatusStep({
      repair_ticket_id: input.repair_ticket_id,
      status: "cancelled",
    });

    notifyTechnicianRejectedStep({ repair_ticket_id: input.repair_ticket_id });

    return new WorkflowResponse({
      repairTicket: updatedTicket,
    });
  },
);
