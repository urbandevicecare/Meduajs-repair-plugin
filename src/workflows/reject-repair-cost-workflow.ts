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
import { getRepairTemplate } from "../utils/templates/repair";

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
        const [settings] = await repairService.listRepairSettings({});
        if (!settings || settings.email_notifications_enabled) {
          const templateData = {
          ticket_number: ticket.ticket_number,
          status: ticket.status,
          repair_ticket_id: ticket.id,
          technician_name: ticket.technician_name,
        };
        const template = getRepairTemplate("technician-job-rejected", templateData);
        
        const notificationModuleService = container.resolve(Modules.NOTIFICATION);
        try {
          await notificationModuleService.createNotifications({
            to: technicianEmail,
            channel: "email",
            template: "technician-job-rejected",
            content: {
              subject: `Repair Job Cancelled: #${ticket.ticket_number}`,
              html: template.html,
            },
            data: {
              ...templateData,
              body: template.text,
            },
          });
        } catch (err: any) {
          container.resolve("logger").warn(`Failed to send technician rejection notification: ${err.message}`);
        }
        }
      }
    }
      // 3. Delete Zoho Books Estimate if enabled
      const [settings] = await repairService.listRepairSettings({});
      if (settings?.zoho_books_enabled && settings.zoho_client_id) {
        try {
          const logger = container.resolve("logger");
          const { ZohoBooksService } = await import("../services/zoho-books.js");
          const zoho = new ZohoBooksService({
            client_id: settings.zoho_client_id,
            client_secret: settings.zoho_client_secret!,
            refresh_token: settings.zoho_refresh_token!,
            organization_id: settings.zoho_organization_id!,
          }, logger);
          
          const metadata = ticket.metadata || {};
          if (metadata.zoho_estimate_id) {
            await zoho.deleteEstimate(metadata.zoho_estimate_id as string);
            logger.info(`[Zoho Books] Deleted estimate ${metadata.zoho_estimate_id} for rejected ticket ${ticket.id}`);
            
            // clear from metadata
            const newMeta = { ...metadata };
            delete newMeta.zoho_estimate_id;
            await repairService.updateRepairTickets({ id: ticket.id, metadata: newMeta });
          }
        } catch (e: any) {
          container.resolve("logger").error(`[Zoho Books] Failed to delete estimate: ${e.message}`);
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
