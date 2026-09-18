"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = handleRefundCreated;
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../modules/repair");
async function handleRefundCreated({ event: { data }, container, }) {
    const orderModuleService = container.resolve(utils_1.Modules.ORDER);
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    // Since the event payload might be an order refund or a payment refund,
    // we first need to get the order ID. In V2, `order.refund_created` might give { id: order_id } or { id: refund_id }
    // Let's assume it gives { order_id: string } or { id: string } as refund ID
    // Wait, if it's refund.created, data.id is the refund id.
    try {
        let orderId;
        if (data.order_id) {
            orderId = data.order_id;
        }
        else {
            // If it's a refund ID, we need to fetch the order. 
            // Medusa's order module has `retrieveRefund` but it might be tied to payment module.
            // Let's try to fetch the order directly if data.id is the order ID.
            try {
                const order = await orderModuleService.retrieveOrder(data.id);
                orderId = order.id;
            }
            catch {
                // Not an order ID, maybe it's a refund or payment ID
                // Skip for now if we can't get the order ID directly from the payload.
            }
        }
        if (!orderId) {
            // For safety, assume data.id might be the order ID in `order.refund_created`
            orderId = data.id;
        }
        const order = await orderModuleService.retrieveOrder(orderId);
        // Check if it's tied to a repair ticket
        const repairTicketId = order.metadata?.repair_ticket_id;
        if (!repairTicketId) {
            return;
        }
        // Update the repair ticket to refunded
        await repairService.updateRepairTickets({
            id: repairTicketId,
            status: "refunded",
        });
    }
    catch (error) {
        console.error(`Failed to sync refund status for repair ticket:`, error);
    }
}
exports.config = {
    // Common Medusa V2 refund events
    event: ["order.refund_created", "refund.created"],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItcmVmdW5kZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3Vic2NyaWJlcnMvb3JkZXItcmVmdW5kZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBUUEsc0NBbURDO0FBdkRELHFEQUFvRDtBQUNwRCw4Q0FBa0Q7QUFHbkMsS0FBSyxVQUFVLG1CQUFtQixDQUFDLEVBQ2hELEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUNmLFNBQVMsR0FDc0I7SUFDL0IsTUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1RCxNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFFNUUsd0VBQXdFO0lBQ3hFLG9IQUFvSDtJQUNwSCw0RUFBNEU7SUFDNUUsMERBQTBEO0lBRTFELElBQUksQ0FBQztRQUNILElBQUksT0FBMkIsQ0FBQztRQUVoQyxJQUFLLElBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMzQixPQUFPLEdBQUksSUFBWSxDQUFDLFFBQVEsQ0FBQztRQUNuQyxDQUFDO2FBQU0sQ0FBQztZQUNOLG9EQUFvRDtZQUNwRCxxRkFBcUY7WUFDckYsb0VBQW9FO1lBQ3BFLElBQUksQ0FBQztnQkFDSCxNQUFNLEtBQUssR0FBRyxNQUFNLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzlELE9BQU8sR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3JCLENBQUM7WUFBQyxNQUFNLENBQUM7Z0JBQ1AscURBQXFEO2dCQUNyRCx1RUFBdUU7WUFDekUsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDYiw2RUFBNkU7WUFDN0UsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEIsQ0FBQztRQUVELE1BQU0sS0FBSyxHQUFHLE1BQU0sa0JBQWtCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTlELHdDQUF3QztRQUN4QyxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLGdCQUEwQixDQUFDO1FBQ2xFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNwQixPQUFPO1FBQ1QsQ0FBQztRQUVELHVDQUF1QztRQUN2QyxNQUFNLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQztZQUN0QyxFQUFFLEVBQUUsY0FBYztZQUNsQixNQUFNLEVBQUUsVUFBaUI7U0FDMUIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLGlEQUFpRCxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFFLENBQUM7QUFDSCxDQUFDO0FBRVksUUFBQSxNQUFNLEdBQXFCO0lBQ3RDLGlDQUFpQztJQUNqQyxLQUFLLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxnQkFBZ0IsQ0FBUTtDQUN6RCxDQUFDIn0=