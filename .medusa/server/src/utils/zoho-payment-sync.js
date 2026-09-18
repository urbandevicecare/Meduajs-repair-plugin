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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9oby1wYXltZW50LXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbHMvem9oby1wYXltZW50LXN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSw4Q0FpREM7QUFwREQsOENBQWtEO0FBRzNDLEtBQUssVUFBVSxpQkFBaUIsQ0FDckMsU0FBMEIsRUFDMUIsUUFBZ0IsRUFDaEIsTUFBYyxFQUNkLGNBQXNCLG1CQUFtQjtJQUV6QyxNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDNUUsTUFBTSxNQUFNLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFbEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sYUFBYSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzlELElBQUksQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDOUQsT0FBTztJQUNULENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDdkUsTUFBTSxJQUFJLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQztZQUNoQyxTQUFTLEVBQUUsUUFBUSxDQUFDLGNBQWM7WUFDbEMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxrQkFBbUI7WUFDM0MsYUFBYSxFQUFFLFFBQVEsQ0FBQyxrQkFBbUI7WUFDM0MsZUFBZSxFQUFFLFFBQVEsQ0FBQyxvQkFBcUI7U0FDaEQsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVYLElBQUksV0FBVyxHQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsTUFBTSxDQUFDLEVBQUUsY0FBYyxFQUFFLENBQUM7UUFDbkUsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkIsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2xGLElBQUksY0FBYyxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxHQUFHLE1BQU0sY0FBYyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDcEUsSUFBSSxDQUFDO29CQUFFLFdBQVcsR0FBRyxDQUFDLENBQUM7WUFDekIsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7UUFDdkMsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGVBQXlCLENBQUM7UUFDL0MsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ1gsS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNwRixNQUFNLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQztZQUN0QyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUU7WUFDYixRQUFRLEVBQUUsRUFBRSxHQUFHLFFBQVEsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUU7U0FDOUUsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQywrQkFBK0IsU0FBUyxlQUFlLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO1FBQ2hCLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN6RixDQUFDO0FBQ0gsQ0FBQyJ9