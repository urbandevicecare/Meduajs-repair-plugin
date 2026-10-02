import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { REPAIR_MODULE } from "../../modules/repair";
import RepairModuleService from "../../modules/repair/service";

type UpdateTicketPaymentInput = {
  ticketId?: string;
  reference: string;
  actualPaidAmount: number;
};

export const updateTicketPaymentStep = createStep(
  "update-ticket-payment",
  async (input: UpdateTicketPaymentInput, { container }) => {
    const repairService: RepairModuleService = container.resolve(REPAIR_MODULE);
    
    let tickets;
    if (input.ticketId) {
      tickets = await repairService.listRepairTickets({ id: input.ticketId });
    } else {
      tickets = await repairService.listRepairTickets({ ticket_number: input.reference });
    }

    if (!tickets || tickets.length === 0) {
      throw new Error("Repair ticket not found");
    }

    const ticket = tickets[0];

    const parseNum = (val: any) => {
      if (!val) return 0;
      if (typeof val === "object" && "value" in val) return Number(val.value);
      return Number(val);
    };

    const totalEstimate = parseNum(ticket.total_estimate);
    const amountPaidSoFar = parseNum(ticket.amount_paid);
    const newAmountPaid = amountPaidSoFar + input.actualPaidAmount;
    
    const isFullyPaid = newAmountPaid >= totalEstimate;

    const previousData = {
      id: ticket.id,
      amount_paid: ticket.amount_paid,
      payment_status: ticket.payment_status,
      status: ticket.status
    };

    const newStatus = (ticket.status === "awaiting_approval" && isFullyPaid) ? "ready" : ticket.status;

    const updatedTicket = await repairService.updateRepairTickets({
      id: ticket.id,
      amount_paid: newAmountPaid,
      payment_status: isFullyPaid ? "captured" : "pending",
      status: newStatus
    });

    return new StepResponse(updatedTicket, previousData);
  },
  async (previousData, { container }) => {
    if (!previousData) return;
    const repairService: RepairModuleService = container.resolve(REPAIR_MODULE);
    // Note: In real life, if Paystack actually captured the funds, we shouldn't roll this back just because Zoho failed!
    // But this exists if we intentionally abort the workflow for a critical local reason.
    await repairService.updateRepairTickets({
      id: previousData.id,
      amount_paid: previousData.amount_paid,
      payment_status: previousData.payment_status,
      status: previousData.status
    });
  }
);
