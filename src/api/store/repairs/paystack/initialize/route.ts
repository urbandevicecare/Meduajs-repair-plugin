import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REPAIR_MODULE } from "../../../../../modules/repair";
import RepairModuleService from "../../../../../modules/repair/service";

export async function POST(
  req: MedusaRequest<{ ticket_id: string; amount: number }>,
  res: MedusaResponse
) {
  const { ticket_id, amount } = req.body;
  if (!ticket_id || amount === undefined || amount === null) {
    return res.status(400).json({ message: "Ticket ID and amount are required" });
  }

  const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);
  const [settings] = await repairService.listRepairSettings({});

  if (!settings?.paystack_enabled || !settings.paystack_secret_key) {
    return res.status(400).json({ message: "Paystack is not configured or disabled" });
  }

  const tickets = await repairService.listRepairTickets({ id: ticket_id });
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
  const amountPaidSoFar = parseNum(ticket.amount_paid);
  const remainingBalance = totalEstimate - amountPaidSoFar;
  
  if (amount > remainingBalance) {
    return res.status(400).json({ 
      message: `Amount exceeds the remaining balance. Maximum allowed is ${remainingBalance}`,
      remaining_balance: remainingBalance
    });
  }
  
  if (amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  let customerEmail = `guest-${ticket.id}@example.com`;
  if (ticket.customer_id) {
    try {
      const customerModule = req.scope.resolve("customer", { allowUnregistered: true });
      if (customerModule) {
        const c = await customerModule.retrieveCustomer(ticket.customer_id);
        if (c && c.email) customerEmail = c.email;
      }
    } catch (e) {}
  }

  try {
    // We send amount in minor units (e.g. kobo/cents) to Paystack
    const paystackAmount = Math.round(amount * 100);
    const reference = `REP-${ticket.ticket_number}-${Date.now()}`;

    const paystackRes = await fetch(`https://api.paystack.co/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.paystack_secret_key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: paystackAmount,
        reference: reference,
        metadata: {
          ticket_id: ticket.id
        }
      })
    });
    
    const paystackData = await paystackRes.json();
    if (!paystackData.status) {
      return res.status(400).json({ message: "Failed to initialize transaction", data: paystackData });
    }

    res.json({ 
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference
    });
  } catch (error: any) {
    req.scope.resolve("logger").error(`[Paystack Initialize] Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
}
