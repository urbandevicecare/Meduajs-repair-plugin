"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = handleOrderPaid;
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../modules/repair");
const repair_2 = require("../utils/templates/repair");
async function handleOrderPaid({ event: { data }, container, }) {
    const orderModuleService = container.resolve(utils_1.Modules.ORDER);
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    const customerModuleService = container.resolve(utils_1.Modules.CUSTOMER);
    // Retrieve the order that was paid
    const order = await orderModuleService.retrieveOrder(data.id);
    // Check if it's tied to a repair ticket
    const repairTicketId = order.metadata?.repair_ticket_id;
    if (!repairTicketId) {
        return;
    }
    // Fetch the ticket
    const ticket = await repairService.retrieveRepairTicket(repairTicketId);
    // Notify technician if assigned
    if (ticket.technician_id) {
        let technicianEmail = "";
        // Try fetching technician details from customer module (since user uses customers as technicians)
        try {
            const customer = await customerModuleService.retrieveCustomer(ticket.technician_id);
            if (customer.email) {
                technicianEmail = customer.email;
            }
        }
        catch (e) {
            // If they are an admin user instead of a customer
            try {
                const userModuleService = container.resolve(utils_1.Modules.USER);
                const user = await userModuleService.retrieveUser(ticket.technician_id);
                if (user.email) {
                    technicianEmail = user.email;
                }
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
                const template = (0, repair_2.getRepairTemplate)("technician-job-paid", templateData);
                // Dispatch notification
                const notificationModuleService = container.resolve(utils_1.Modules.NOTIFICATION);
                await notificationModuleService.createNotifications({
                    to: technicianEmail,
                    channel: "email",
                    template: "technician-job-paid",
                    content: {
                        subject: `Repair Job Paid: #${ticket.ticket_number}`,
                        html: template.html,
                    },
                    data: {
                        ...templateData,
                        body: template.text,
                    },
                });
            }
        }
    }
    // Push Payment to Zoho Books if enabled
    const { syncPaymentToZoho } = await import("../utils/zoho-payment-sync.js");
    const amount = order.total || ticket.total_actual || ticket.total_estimate;
    await syncPaymentToZoho(container, ticket.id, amount, "PaymentCollection");
}
exports.config = {
    event: "order.payment_captured",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItcGFpZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdWJzY3JpYmVycy9vcmRlci1wYWlkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVNBLGtDQTJFQztBQWhGRCxxREFBb0Q7QUFDcEQsOENBQWtEO0FBRWxELHNEQUE4RDtBQUUvQyxLQUFLLFVBQVUsZUFBZSxDQUFDLEVBQzVDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUNmLFNBQVMsR0FDc0I7SUFDL0IsTUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1RCxNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDNUUsTUFBTSxxQkFBcUIsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVsRSxtQ0FBbUM7SUFDbkMsTUFBTSxLQUFLLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTlELHdDQUF3QztJQUN4QyxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLGdCQUEwQixDQUFDO0lBQ2xFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNwQixPQUFPO0lBQ1QsQ0FBQztJQUVELG1CQUFtQjtJQUNuQixNQUFNLE1BQU0sR0FBRyxNQUFNLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUV4RSxnQ0FBZ0M7SUFDaEMsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBRXpCLGtHQUFrRztRQUNsRyxJQUFJLENBQUM7WUFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxh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