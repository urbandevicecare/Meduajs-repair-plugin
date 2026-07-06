import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { REPAIR_MODULE } from "../modules/repair";
import RepairModuleService from "../modules/repair/service";

export default async function handleOrderCanceled({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModuleService = container.resolve(Modules.ORDER);
  const repairService: RepairModuleService = container.resolve(REPAIR_MODULE);

  // Retrieve the canceled order
  const order = await orderModuleService.retrieveOrder(data.id);

  // Check if it's tied to a repair ticket
  const repairTicketId = order.metadata?.repair_ticket_id as string;
  if (!repairTicketId) {
    return;
  }

  // Update the repair ticket to cancelled
  try {
    await repairService.updateRepairTickets({
      id: repairTicketId,
      status: "cancelled" as any,
    });
  } catch (error) {
    console.error(`Failed to cancel repair ticket ${repairTicketId} after order ${data.id} was cancelled:`, error);
  }
}

export const config: SubscriberConfig = {
  event: "order.canceled",
};
