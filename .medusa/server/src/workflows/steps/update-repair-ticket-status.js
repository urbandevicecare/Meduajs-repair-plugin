"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRepairTicketStatusStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const repair_1 = require("../../modules/repair");
exports.updateRepairTicketStatusStep = (0, workflows_sdk_1.createStep)("update-repair-ticket-status", async (input, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    // Get current ticket for compensation
    const currentTicket = await repairService.retrieveRepairTicket(input.repair_ticket_id);
    const updateData = {
        status: input.status,
    };
    if (input.estimated_completion) {
        updateData.estimated_completion = input.estimated_completion;
    }
    // Set warranty expiry and completed_at when status changes to completed
    if (input.status === "completed" && !currentTicket.completed_at) {
        updateData.completed_at = new Date();
        // Calculate warranty expiry
        const warrantyExpiry = new Date();
        warrantyExpiry.setMonth(warrantyExpiry.getMonth() + currentTicket.warranty_months);
        updateData.warranty_expiry = warrantyExpiry;
    }
    const updatedTicket = await repairService.updateRepairTickets({
        id: input.repair_ticket_id,
        ...updateData,
    });
    if (input.status === "completed" && !(currentTicket.metadata?.zoho_payment_id)) {
        const { syncPaymentToZoho } = await import("../../utils/zoho-payment-sync.js");
        try {
            await syncPaymentToZoho(container, currentTicket.id, currentTicket.total_estimate, "Cash");
        }
        catch (e) {
            container.resolve("logger").error(`[Zoho Books] Failed to sync payment on completion: ${e.message}`);
        }
    }
    if (input.status === "cancelled") {
        const [settings] = await repairService.listRepairSettings({});
        if (settings?.zoho_books_enabled && settings.zoho_client_id) {
            try {
                const logger = container.resolve("logger");
                const { ZohoBooksService } = await import("../../services/zoho-books.js");
                const zoho = new ZohoBooksService({
                    client_id: settings.zoho_client_id,
                    client_secret: settings.zoho_client_secret,
                    refresh_token: settings.zoho_refresh_token,
                    organization_id: settings.zoho_organization_id,
                    domain: settings.zoho_domain || "com",
                }, logger);
                const metadata = currentTicket.metadata || {};
                if (metadata.zoho_estimate_id)
                    await zoho.deleteEstimate(metadata.zoho_estimate_id);
                if (metadata.zoho_invoice_id)
                    await zoho.deleteInvoice(metadata.zoho_invoice_id);
                // clear from metadata
                const newMeta = { ...metadata };
                delete newMeta.zoho_estimate_id;
                delete newMeta.zoho_invoice_id;
                await repairService.updateRepairTickets({ id: input.repair_ticket_id, metadata: newMeta });
            }
            catch (e) {
                container.resolve("logger").error(`[Zoho Books] Failed to delete records: ${e.message}`);
            }
        }
    }
    return new workflows_sdk_1.StepResponse(updatedTicket, {
        repair_ticket_id: currentTicket.id,
        previous_status: currentTicket.status,
        previous_estimated_completion: currentTicket.estimated_completion,
        previous_completed_at: currentTicket.completed_at,
        previous_warranty_expiry: currentTicket.warranty_expiry,
    });
}, async (compensateInput, { container }) => {
    if (!compensateInput)
        return;
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    await repairService.updateRepairTickets({
        id: compensateInput.repair_ticket_id,
        status: compensateInput.previous_status,
        estimated_completion: compensateInput.previous_estimated_completion,
        completed_at: compensateInput.previous_completed_at,
        warranty_expiry: compensateInput.previous_warranty_expiry,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLXJlcGFpci10aWNrZXQtc3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9zdGVwcy91cGRhdGUtcmVwYWlyLXRpY2tldC1zdGF0dXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBQTZFO0FBQzdFLGlEQUFxRDtBQWlCeEMsUUFBQSw0QkFBNEIsR0FBRyxJQUFBLDBCQUFVLEVBQ3BELDZCQUE2QixFQUM3QixLQUFLLEVBQUUsS0FBb0MsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDNUQsTUFBTSxhQUFhLEdBQXdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBRTVFLHNDQUFzQztJQUN0QyxNQUFNLGFBQWEsR0FBRyxNQUFNLGFBQWEsQ0FBQyxvQkFBb0IsQ0FDNUQsS0FBSyxDQUFDLGdCQUFnQixDQUN2QixDQUFDO0lBRUYsTUFBTSxVQUFVLEdBQVE7UUFDdEIsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO0tBQ3JCLENBQUM7SUFFRixJQUFJLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQy9CLFVBQVUsQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUMsb0JBQW9CLENBQUM7SUFDL0QsQ0FBQztJQUVELHdFQUF3RTtJQUN4RSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssV0FBVyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2hFLFVBQVUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUVyQyw0QkFBNEI7UUFDNUIsTUFBTSxjQUFjLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNsQyxjQUFjLENBQUMsUUFBUSxDQUNyQixjQUFjLENBQUMsUUFBUSxFQUFFLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FDMUQsQ0FBQztRQUNGLFVBQVUsQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0lBQzlDLENBQUM7SUFFRCxNQUFNLGFBQWEsR0FBRyxNQUFNLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQztRQUM1RCxFQUFFLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtRQUMxQixHQUFHLFVBQVU7S0FDZCxDQUFDLENBQUM7SUFFSCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssV0FBVyxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUM7UUFDL0UsTUFBTSxFQUFFLGlCQUFpQixFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUM7WUFDSCxNQUFNLGlCQUFpQixDQUFDLFNBQWdCLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRSxhQUFhLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BHLENBQUM7UUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO1lBQ2hCLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN2RyxDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUUsQ0FBQztRQUNqQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxhQUFhLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUQsSUFBSSxRQUFRLEVBQUUsa0JBQWtCLElBQUksUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzVELElBQUksQ0FBQztnQkFDSCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2dCQUMxRSxNQUFNLElBQUksR0FBRyxJQUFJLGdCQUFnQixDQUFDO29CQUNoQyxTQUFTLEVBQUUsUUFBUSxDQUFDLGNBQWM7b0JBQ2xDLGFBQWEsRUFBRSxRQUFRLENBQUMsa0JBQW1CO29CQUMzQyxhQUFhLEVBQUUsUUFBUSxDQUFDLGtCQUFtQjtvQkFDM0MsZUFBZSxFQUFFLFFBQVEsQ0FBQyxvQkFBcUI7b0JBQy9DLE1BQU0sRUFBRSxRQUFRLENBQUMsV0FBVyxJQUFJLEtBQUs7aUJBQ3RDLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBRVgsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7Z0JBQzlDLElBQUksUUFBUSxDQUFDLGdCQUFnQjtvQkFBRSxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLGdCQUEwQixDQUFDLENBQUM7Z0JBQzlGLElBQUksUUFBUSxDQUFDLGVBQWU7b0JBQUUsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxlQUF5QixDQUFDLENBQUM7Z0JBRTNGLHNCQUFzQjtnQkFDdEIsTUFBTSxPQUFPLEdBQUcsRUFBRSxHQUFHLFFBQVEsRUFBRSxDQUFDO2dCQUNoQyxPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDaEMsT0FBTyxPQUFPLENBQUMsZUFBZSxDQUFDO2dCQUMvQixNQUFNLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDN0YsQ0FBQztZQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7Z0JBQ2hCLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUMzRixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLElBQUksNEJBQVksQ0FBQyxhQUFhLEVBQUU7UUFDckMsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLEVBQUU7UUFDbEMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxNQUFNO1FBQ3JDLDZCQUE2QixFQUFFLGFBQWEsQ0FBQyxvQkFBb0I7UUFDakUscUJBQXFCLEVBQUUsYUFBYSxDQUFDLFlBQVk7UUFDakQsd0JBQXdCLEVBQUUsYUFBYSxDQUFDLGVBQWU7S0FDeEQsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxFQUNELEtBQUssRUFBRSxlQUFlLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO0lBQ3ZDLElBQUksQ0FBQyxlQUFlO1FBQUUsT0FBTztJQUM3QixNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFFNUUsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUM7UUFDdEMsRUFBRSxFQUFFLGVBQWUsQ0FBQyxnQkFBZ0I7UUFDcEMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxlQUFlO1FBQ3ZDLG9CQUFvQixFQUFFLGVBQWUsQ0FBQyw2QkFBNkI7UUFDbkUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxxQkFBcUI7UUFDbkQsZUFBZSxFQUFFLGVBQWUsQ0FBQyx3QkFBd0I7S0FDMUQsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUNGLENBQUMifQ==