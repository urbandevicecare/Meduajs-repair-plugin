import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { REPAIR_MODULE } from "../modules/repair";
import RepairModuleService from "../modules/repair/service";

export default async function handleRefundCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModuleService = container.resolve(Modules.ORDER);
  const repairService: RepairModuleService = container.resolve(REPAIR_MODULE);

  // Since the event payload might be an order refund or a payment refund,
  // we first need to get the order ID. In V2, `order.refund_created` might give { id: order_id } or { id: refund_id }
  // Let's assume it gives { order_id: string } or { id: string } as refund ID
  // Wait, if it's refund.created, data.id is the refund id.
  
  try {
    let orderId: string | undefined;

    if ((data as any).order_id) {
      orderId = (data as any).order_id;
    } else {
      // If it's a refund ID, we need to fetch the order. 
      // Medusa's order module has `retrieveRefund` but it might be tied to payment module.
      // Let's try to fetch the order directly if data.id is the order ID.
      try {
        const order = await orderModuleService.retrieveOrder(data.id);
        orderId = order.id;
      } catch {
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
    const repairTicketId = order.metadata?.repair_ticket_id as string;
    if (!repairTicketId) {
      return;
    }

    // Update the repair ticket to refunded
    await repairService.updateRepairTickets({
      id: repairTicketId,
      status: "refunded" as any,
    });
  } catch (error) {
    console.error(`Failed to sync refund status for repair ticket:`, error);
  }
}

export const config: SubscriberConfig = {
  // Common Medusa V2 refund events
  event: ["order.refund_created", "refund.created"] as any,
};
