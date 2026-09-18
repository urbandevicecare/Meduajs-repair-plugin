"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = repairCustomerReminderHandler;
const utils_1 = require("@medusajs/framework/utils");
async function repairCustomerReminderHandler({ event: { data }, container, }) {
    const logger = container.resolve("logger");
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    // Fetch the repair ticket details
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: ["*", "device.*"],
        filters: { id: data.repair_ticket_id },
    });
    if (!tickets || tickets.length === 0) {
        logger.warn(`Repair ticket ${data.repair_ticket_id} not found`);
        return;
    }
    const ticket = tickets[0];
    // Handle Notifications (Email, SMS, WhatsApp)
    try {
        const notificationModule = container.resolve(utils_1.ModuleRegistrationName.NOTIFICATION, { allowUnregistered: true });
        if (notificationModule && ticket.customer_id) {
            const customerModule = container.resolve(utils_1.ModuleRegistrationName.CUSTOMER, { allowUnregistered: true });
            if (customerModule) {
                const customer = await customerModule.retrieveCustomer(ticket.customer_id);
                if (customer) {
                    const approvalUrl = ticket.approval_token
                        ? `${process.env.STORE_URL || "http://localhost:3000"}/store/repairs/track?token=${ticket.approval_token}`
                        : "";
                    let nudgeMessage = "Please review the status of your repair.";
                    if (ticket.status === "awaiting_approval") {
                        nudgeMessage = "We are waiting for your approval to proceed with the repair.";
                    }
                    else if (ticket.status === "completed" || ticket.status === "ready") {
                        nudgeMessage = "Your device is ready for pickup or payment.";
                    }
                    const payloadData = {
                        ticket_number: ticket.ticket_number,
                        status: ticket.status,
                        device: ticket.device?.model_name,
                        total_estimate: Number(ticket.total_estimate?.value ?? ticket.total_estimate),
                        approval_url: approvalUrl,
                        nudge_message: nudgeMessage
                    };
                    // 1. Email Notification
                    if (customer.email) {
                        await notificationModule.createNotifications({
                            to: customer.email,
                            channel: "email",
                            template: "repair-customer-reminder",
                            data: payloadData,
                        });
                        logger.info(`Reminder email sent to ${customer.email} for ticket ${ticket.ticket_number}`);
                    }
                    // 2. SMS Notification 
                    if (customer.phone) {
                        await notificationModule
                            .createNotifications({
                            to: customer.phone,
                            channel: "sms",
                            template: "repair-customer-reminder-sms",
                            data: payloadData,
                        })
                            .catch((e) => logger.debug(`SMS provider not configured or failed: ${e.message}`));
                        // WhatsApp 
                        await notificationModule
                            .createNotifications({
                            to: customer.phone,
                            channel: "whatsapp",
                            template: "repair-customer-reminder-wa",
                            data: payloadData,
                        })
                            .catch((e) => logger.debug(`WhatsApp provider not configured or failed: ${e.message}`));
                    }
                }
            }
        }
    }
    catch (err) {
        logger.warn(`Failed to send reminder for repair ticket: ${err}`);
    }
}
exports.config = {
    event: "repair.customer_reminder",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwYWlyLWN1c3RvbWVyLXJlbWluZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N1YnNjcmliZXJzL3JlcGFpci1jdXN0b21lci1yZW1pbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFVQSxnREF3R0M7QUFqSEQscURBR21DO0FBTXBCLEtBQUssVUFBVSw2QkFBNkIsQ0FBQyxFQUMxRCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFDZixTQUFTLEdBQ2tDO0lBQzNDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVqRSxrQ0FBa0M7SUFDbEMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDMUMsTUFBTSxFQUFFLGVBQWU7UUFDdkIsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQztRQUN6QixPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFO0tBQ3ZDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsZ0JBQWdCLFlBQVksQ0FBQyxDQUFDO1FBQ2hFLE9BQU87SUFDVCxDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTFCLDhDQUE4QztJQUM5QyxJQUFJLENBQUM7UUFDSCxNQUFNLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQzFDLDhCQUFzQixDQUFDLFlBQVksRUFDbkMsRUFBRSxpQkFBaUIsRUFBRSxJ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