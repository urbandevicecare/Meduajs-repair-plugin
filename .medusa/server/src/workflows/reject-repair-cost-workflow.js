"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectRepairCostWorkflow = exports.notifyTechnicianRejectedStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const update_repair_ticket_status_1 = require("./steps/update-repair-ticket-status");
const repair_1 = require("../modules/repair");
const utils_1 = require("@medusajs/framework/utils");
const repair_2 = require("../utils/templates/repair");
exports.notifyTechnicianRejectedStep = (0, workflows_sdk_1.createStep)("notify-technician-rejected", async (input, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    const ticket = await repairService.retrieveRepairTicket(input.repair_ticket_id);
    if (ticket.technician_id) {
        let technicianEmail = "";
        const customerModuleService = container.resolve(utils_1.Modules.CUSTOMER);
        try {
            const customer = await customerModuleService.retrieveCustomer(ticket.technician_id);
            if (customer.email)
                technicianEmail = customer.email;
        }
        catch (e) {
            try {
                const userModuleService = container.resolve(utils_1.Modules.USER);
                const user = await userModuleService.retrieveUser(ticket.technician_id);
                if (user.email)
                    technicianEmail = user.email;
            }
            catch (e2) { }
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
                const template = (0, repair_2.getRepairTemplate)("technician-job-rejected", templateData);
                const notificationModuleService = container.resolve(utils_1.Modules.NOTIFICATION);
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
                }
                catch (err) {
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
                client_secret: settings.zoho_client_secret,
                refresh_token: settings.zoho_refresh_token,
                organization_id: settings.zoho_organization_id,
            }, logger);
            const metadata = ticket.metadata || {};
            if (metadata.zoho_estimate_id) {
                await zoho.deleteEstimate(metadata.zoho_estimate_id);
                logger.info(`[Zoho Books] Deleted estimate ${metadata.zoho_estimate_id} for rejected ticket ${ticket.id}`);
                // clear from metadata
                const newMeta = { ...metadata };
                delete newMeta.zoho_estimate_id;
                await repairService.updateRepairTickets({ id: ticket.id, metadata: newMeta });
            }
        }
        catch (e) {
            container.resolve("logger").error(`[Zoho Books] Failed to delete estimate: ${e.message}`);
        }
    }
    return new workflows_sdk_1.StepResponse(null);
});
exports.rejectRepairCostWorkflow = (0, workflows_sdk_1.createWorkflow)("reject-repair-cost-workflow", function (input) {
    const updatedTicket = (0, update_repair_ticket_status_1.updateRepairTicketStatusStep)({
        repair_ticket_id: input.repair_ticket_id,
        status: "cancelled",
    });
    (0, exports.notifyTechnicianRejectedStep)({ repair_ticket_id: input.repair_ticket_id });
    return new workflows_sdk_1.WorkflowResponse({
        repairTicket: updatedTicket,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVqZWN0LXJlcGFpci1jb3N0LXdvcmtmbG93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9yZWplY3QtcmVwYWlyLWNvc3Qtd29ya2Zsb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBSzJDO0FBQzNDLHFGQUFtRjtBQUNuRiw4Q0FBa0Q7QUFFbEQscURBQW9EO0FBQ3BELHNEQUE4RDtBQU1qRCxRQUFBLDRCQUE0QixHQUFHLElBQUEsMEJBQVUsRUFDcEQsNEJBQTRCLEVBQzVCLEtBQUssRUFBRSxLQUFtQyxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtJQUMzRCxNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDNUUsTUFBTSxNQUFNLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFaEYsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLE1BQU0scUJBQXFCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcEYsSUFBSSxRQUFRLENBQUMsS0FBSztnQkFBRSxlQUFlLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUN2RCxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNYLElBQUksQ0FBQztnQkFDSCxNQUFNLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLElBQUksR0FBRyxNQUFNLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3hFLElBQUksSUFBSSxDQUFDLEtBQUs7b0JBQUUsZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDL0MsQ0FBQztZQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJLGVBQWUsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO2dCQUN0RCxNQUFNLFlBQVksR0FBRztvQkFDckIsYUFBYSxFQUFFLE1BQU0sQ0FBQyxhQUFhO29CQUNuQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07b0JBQ3JCLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxFQUFFO29CQUMzQixlQUFlLEVBQUUsTUFBTSxDQUFDLGVBQWU7aUJBQ3hDLENBQUM7Z0JBQ0YsTUFBTSxRQUFRLEdBQUcsSUFBQSwwQkFBaUIsRUFBQyx5QkFBeUIsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFFNUUsTUFBTSx5QkFBeUIsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUUsSUFBSSxDQUFDO29CQUNILE1BQU0seUJBQXlCLENBQUMsbUJBQW1CLENBQUM7d0JBQ2xELEVBQUUsRUFBRSxlQUFlO3dCQUNuQixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsUUFBUSxFQUFFLHlCQUF5Qjt3QkFDbkMsT0FBTyxFQUFFOzRCQUNQLE9BQU8sRUFBRSwwQkFBMEIsTUFBTSxDQUFDLGFBQWEsRUFBRTs0QkFDekQsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO3lCQUNwQjt3QkFDRCxJQUFJLEVBQUU7NEJBQ0osR0FBRyxZQUFZOzRCQUNmLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTt5QkFDcEI7cUJBQ0YsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztvQkFDbEIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMscURBQXFELEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RyxDQUFDO1lBQ0QsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBQ0MsMkNBQTJDO0lBQzNDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5RCxJQUFJLFFBQVEsRUFBRSxrQkFBa0IsSUFBSSxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDNUQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sSUFBSSxHQUFHLElBQUksZ0JBQWdCLENBQUM7Z0JBQ2hDLFNBQVMsRUFBRSxRQUFRLENBQUMsY0FBYztnQkFDbEMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxrQkFBbUI7Z0JBQzNDLGFBQWEsRUFBRSxRQUFRLENBQUMsa0JBQW1CO2dCQUMzQyxlQUFlLEVBQUUsUUFBUSxDQUFDLG9CQUFxQjthQUNoRCxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRVgsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7WUFDdkMsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxnQkFBMEIsQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxRQUFRLENBQUMsZ0JBQWdCLHdCQUF3QixNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFM0csc0JBQXNCO2dCQUN0QixNQUFNLE9BQU8sR0FBRyxFQUFFLEdBQUcsUUFBUSxFQUFFLENBQUM7Z0JBQ2hDLE9BQU8sT0FBTyxDQUFDLGdCQUFnQixDQUFDO2dCQUNoQyxNQUFNLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2hGLENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztZQUNoQixTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDNUYsQ0FBQztJQUNILENBQUM7SUFFSCxPQUFPLElBQUksNEJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxDQUFDLENBQ0YsQ0FBQztBQUVXLFFBQUEsd0JBQXdCLEdBQUcsSUFBQSw4QkFBYyxFQUNwRCw2QkFBNkIsRUFDN0IsVUFBVSxLQUFvQztJQUM1QyxNQUFNLGFBQWEsR0FBRyxJQUFBLDBEQUE0QixFQUFDO1FBQ2pELGdCQUFnQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0I7UUFDeEMsTUFBTSxFQUFFLFdBQVc7S0FDcEIsQ0FBQyxDQUFDO0lBRUgsSUFBQSxvQ0FBNEIsRUFBQyxFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFFM0UsT0FBTyxJQUFJLGdDQUFnQixDQUFDO1FBQzFCLFlBQVksRUFBRSxhQUFhO0tBQzVCLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FDRixDQUFDIn0=