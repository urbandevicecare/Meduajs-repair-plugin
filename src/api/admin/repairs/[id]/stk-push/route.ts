import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REPAIR_MODULE } from "../../../../../modules/repair";
import RepairModuleService from "../../../../../modules/repair/service";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params;
  const { phone, amount } = req.body as { phone: string; amount: number };

  if (!phone || !amount) {
    return res.status(400).json({ message: "Phone and amount are required" });
  }

  const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);
  
  const [settings] = await repairService.listRepairSettings({});
  if (!settings?.paystack_enabled || !settings.paystack_secret_key) {
    return res.status(400).json({ message: "Paystack is not configured or disabled in settings" });
  }

  const tickets = await repairService.listRepairTickets({ id });
  if (!tickets || tickets.length === 0) {
    return res.status(404).json({ message: "Repair ticket not found" });
  }

  const ticket = tickets[0];
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
    const paystackAmount = Math.round(amount * 100);
    const reference = `STK-${ticket.ticket_number}-${Date.now()}`;

    // Paystack charge payload for mobile money (M-PESA)
    const payload = {
      email: customerEmail,
      amount: paystackAmount,
      currency: "KES",
      reference: reference,
      mobile_money: {
        phone: phone,
        provider: "mpesa"
      },
      metadata: {
        ticket_id: ticket.id,
        stk_push: true
      }
    };

    const paystackRes = await fetch(`https://api.paystack.co/charge`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.paystack_secret_key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    const paystackData = await paystackRes.json();
    
    if (!paystackRes.ok || !paystackData.status) {
      return res.status(400).json({ 
        message: paystackData.message || "Failed to push STK prompt via Paystack", 
        data: paystackData 
      });
    }

    res.json({ 
      message: "STK push initiated successfully",
      reference,
      data: paystackData.data
    });
  } catch (error: any) {
    req.scope.resolve("logger").error(`[Paystack STK Push] Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
}
