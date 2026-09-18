import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REPAIR_MODULE } from "../../../../../modules/repair";
import RepairModuleService from "../../../../../modules/repair/service";
import { syncPaymentToZoho } from "../../../../../utils/zoho-payment-sync.js";

export async function POST(
  req: MedusaRequest<{ reference: string }>,
  res: MedusaResponse
) {
  const { reference } = req.body;
  if (!reference) {
    return res.status(400).json({ message: "Reference is required" });
  }

  const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);
  const [settings] = await repairService.listRepairSettings({});

  if (!settings?.paystack_enabled || !settings.paystack_secret_key) {
    return res.status(400).json({ message: "Paystack is not configured or disabled" });
  }

  // 1. Verify transaction with Paystack
  try {
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${settings.paystack_secret_key}`
      }
    });
    
    const paystackData = await paystackRes.json();
    if (!paystackData.status || paystackData.data.status !== "success") {
      return res.status(400).json({ message: "Transaction verification failed", data: paystackData });
    }

    // 2. Find Ticket
    const ticketId = paystackData.data.metadata?.ticket_id;
    let tickets;
    if (ticketId) {
      tickets = await repairService.listRepairTickets({ id: ticketId });
    } else {
      // Fallback: maybe reference is ticket_number
      tickets = await repairService.listRepairTickets({ ticket_number: reference });
    }

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: "Repair ticket not found" });
    }

    const ticket = tickets[0];
    
    // Paystack amounts are in minor units (e.g. cents/kobos). We divide by 100 to get the exact value for Medusa v2 / Zoho.
    const actualPaidAmount = paystackData.data.amount / 100;
    
    const parseNum = (val: any) => {
      if (!val) return 0;
      if (typeof val === "object" && "value" in val) return Number(val.value);
      return Number(val);
    };
    
    const totalEstimate = parseNum(ticket.total_estimate);
    const amountPaidSoFar = parseNum(ticket.amount_paid);
    const newAmountPaid = amountPaidSoFar + actualPaidAmount;
    
    const isFullyPaid = newAmountPaid >= totalEstimate;

    // 3. Mark Ticket as Paid / Partially Paid
    // We update as long as they made a payment, even if they were already fully paid (maybe overpayment / tips)
    await repairService.updateRepairTickets({
      id: ticket.id,
      amount_paid: newAmountPaid,
      payment_status: isFullyPaid ? "captured" : "pending",
      status: (ticket.status === "awaiting_approval" && isFullyPaid) ? "ready" : ticket.status
    });

    // 4. Sync Payment to Zoho Books
    await syncPaymentToZoho(req.scope as any, ticket.id, actualPaidAmount, "Paystack");

    res.json({ message: "Payment verified and synchronized successfully" });
  } catch (error: any) {
    req.scope.resolve("logger").error(`[Paystack Verify] Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
}
