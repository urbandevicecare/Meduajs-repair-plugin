import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { REPAIR_MODULE } from "../modules/repair";
import RepairModuleService from "../modules/repair/service";

export default async function handleOrderPaid({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModuleService = container.resolve(Modules.ORDER);
  const repairService: RepairModuleService = container.resolve(REPAIR_MODULE);
  const customerModuleService = container.resolve(Modules.CUSTOMER);

  // Retrieve the order that was paid
  const order = await orderModuleService.retrieveOrder(data.id);

  // Check if it's tied to a repair ticket
  const repairTicketId = order.metadata?.repair_ticket_id as string;
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
    } catch (e) {
      // If they are an admin user instead of a customer
      try {
        const userModuleService = container.resolve(Modules.USER);
        const user = await userModuleService.retrieveUser(ticket.technician_id);
        if (user.email) {
          technicianEmail = user.email;
        }
      } catch (e2) {}
    }

    if (technicianEmail) {
      // Dispatch notification
      const notificationModuleService = container.resolve(Modules.NOTIFICATION);
      await notificationModuleService.createNotifications({
        to: technicianEmail,
        channel: "email",
        template: "technician-job-paid",
        data: {
          ticket_number: ticket.ticket_number,
          status: ticket.status,
          repair_ticket_id: ticket.id,
          technician_name: ticket.technician_name,
        },
      });
    }
  }

  // Optionally auto-update ticket status to "ready" or "completed"
  // await repairService.updateRepairTickets({ id: repairTicketId, status: "completed" });
}

export const config: SubscriberConfig = {
  event: "order.payment_captured",
};
