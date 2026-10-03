import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REPAIR_MODULE } from "../../../../../modules/repair";
import RepairModuleService from "../../../../../modules/repair/service";
import { syncPaymentToZoho } from "../../../../../utils/zoho-payment-sync.js";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const { amount, method } = req.body as { amount?: number, method?: string };
  const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);
  
  const tickets = await repairService.listRepairTickets({ id });
  if (!tickets || tickets.length === 0) {
    return res.status(404).json({ message: "Repair ticket not found" });
  }
  
  const ticket = tickets[0];
  
  const parseNum = (val: any) => {
    if (!val) return 0;
    if (typeof val === "object" && "value" in val) return Number(val.value);
    return Number(val);
  };

  const totalEstimate = parseNum(ticket.total_estimate);
  const totalActual = parseNum(ticket.total_actual);
  const targetTotal = totalActual > 0 ? totalActual : totalEstimate;
  
  const amountToPay = amount ? amount : targetTotal - parseNum(ticket.amount_paid);
  
  const newAmountPaid = parseNum(ticket.amount_paid) + amountToPay;
  const isFullyPaid = newAmountPaid >= targetTotal;

  const newStatus = (ticket.status === "awaiting_approval" && isFullyPaid) ? "ready" : ticket.status;

  const updatedTicket = await repairService.updateRepairTickets({
    id,
    amount_paid: newAmountPaid,
    payment_status: isFullyPaid ? "captured" : "pending",
    status: newStatus
  });
  
  try {
     // Trigger Zoho sync as a cash/manual payment
     await syncPaymentToZoho(req.scope as any, id, amountToPay, method || "Cash");
  } catch(e) {
     req.scope.resolve("logger").error(`[Mark Paid] Zoho sync failed: ${e}`);
  }
  
  res.json({ repair_ticket: updatedTicket });
}
