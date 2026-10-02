"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncPaymentToZoho = syncPaymentToZoho;
const repair_1 = require("../modules/repair");
async function syncPaymentToZoho(container, ticketId, amount, paymentMode = "PaymentCollection") {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    const ticket = await repairService.retrieveRepairTicket(ticketId);
    const [settings] = await repairService.listRepairSettings({});
    if (!settings?.zoho_books_enabled || !settings.zoho_client_id) {
        return;
    }
    try {
        const logger = container.resolve("logger");
        const { ZohoBooksService } = await import("../services/zoho-books.js");
        const zoho = new ZohoBooksService({
            client_id: settings.zoho_client_id,
            client_secret: settings.zoho_client_secret,
            refresh_token: settings.zoho_refresh_token,
            organization_id: settings.zoho_organization_id,
            domain: settings.zoho_domain || "com",
        }, logger);
        let customerObj = { email: `guest-${ticket.id}@example.com` };
        if (ticket.customer_id) {
            const customerModule = container.resolve("customer", { allowUnregistered: true });
            if (customerModule) {
                const c = await customerModule.retrieveCustomer(ticket.customer_id);
                if (c)
                    customerObj = c;
            }
        }
        const contactId = await zoho.syncContact(customerObj);
        const metadata = ticket.metadata || {};
        let invId = metadata.zoho_invoice_id;
        if (!invId) {
            invId = await zoho.createInvoice(contactId, ticket);
        }
        const paymentId = await zoho.registerPayment(invId, amount, contactId, paymentMode);
        await repairService.updateRepairTickets({
            id: ticket.id,
            metadata: { ...metadata, zoho_invoice_id: invId, zoho_payment_id: paymentId }
        });
        logger.info(`[Zoho Books] Synced payment ${paymentId} for ticket ${ticket.id}`);
    }
    catch (e) {
        container.resolve("logger").error(`[Zoho Books] Failed to sync payment: ${e.message}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9oby1wYXltZW50LXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbHMvem9oby1wYXltZW50LXN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSw4Q0FrREM7QUFyREQsOENBQWtEO0FBRzNDLEtBQUssVUFBVSxpQkFBaUIsQ0FDckMsU0FBMEIsRUFDMUIsUUFBZ0IsRUFDaEIsTUFBYyxFQUNkLGNBQXNCLG1CQUFtQjtJQUV6QyxNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDNUUsTUFBTSxNQUFNLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFbEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sYUFBYSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzlELElBQUksQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDOUQsT0FBTztJQUNULENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDdkUsTUFBTSxJQUFJLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQztZQUNoQyxTQUFTLEVBQUUsUUFBUSxDQUFDLGNBQWM7WUFDbEMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxrQkFBbUI7WUFDM0MsYUFBYSxFQUFFLFFBQVEsQ0FBQyxrQkFBbUI7WUFDM0MsZUFBZSxFQUFFLFFBQVEsQ0FBQyxvQkFBcUI7WUFDekMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxXQUFXLElBQUksS0FBSztTQUM1QyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRVgsSUFBSSxXQUFXLEdBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxNQUFNLENBQUMsRUFBRSxjQUFjLEVBQUUsQ0FBQztRQUNuRSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QixNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbEYsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLEdBQUcsTUFBTSxjQUFjLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLENBQUM7b0JBQUUsV0FBVyxHQUFHLENBQUMsQ0FBQztZQUN6QixDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV0RCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUN2QyxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsZUFBeUIsQ0FBQztRQUMvQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDWCxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3BGLE1BQU0sYUFBYSxDQUFDLG1CQUFtQixDQUFDO1lBQ3RDLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRTtZQUNiLFFBQVEsRUFBRSxFQUFFLEdBQUcsUUFBUSxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRTtTQUM5RSxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLCtCQUErQixTQUFTLGVBQWUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7UUFDaEIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7QUFDSCxDQUFDIn0=