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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLXJlcGFpci10aWNrZXQtc3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9zdGVwcy91cGRhdGUtcmVwYWlyLXRpY2tldC1zdGF0dXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBQTZFO0FBQzdFLGlEQUFxRDtBQWdCeEMsUUFBQSw0QkFBNEIsR0FBRyxJQUFBLDBCQUFVLEVBQ3BELDZCQUE2QixFQUM3QixLQUFLLEVBQUUsS0FBb0MsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDNUQsTUFBTSxhQUFhLEdBQXdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBRTVFLHNDQUFzQztJQUN0QyxNQUFNLGFBQWEsR0FBRyxNQUFNLGFBQWEsQ0FBQyxvQkFBb0IsQ0FDNUQsS0FBSyxDQUFDLGdCQUFnQixDQUN2QixDQUFDO0lBRUYsTUFBTSxVQUFVLEdBQVE7UUFDdEIsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO0tBQ3JCLENBQUM7SUFFRixJQUFJLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQy9CLFVBQVUsQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUMsb0JBQW9CLENBQUM7SUFDL0QsQ0FBQztJQUVELHdFQUF3RTtJQUN4RSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssV0FBVyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2hFLFVBQVUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUVyQyw0QkFBNEI7UUFDNUIsTUFBTSxjQUFjLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNsQyxjQUFjLENBQUMsUUFBUSxDQUNyQixjQUFjLENBQUMsUUFBUSxFQUFFLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FDMUQsQ0FBQztRQUNGLFVBQVUsQ0FBQyxlQUFlLEdBQUcsY0FBYyxD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