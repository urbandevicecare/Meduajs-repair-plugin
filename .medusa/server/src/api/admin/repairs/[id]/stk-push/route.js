"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const repair_1 = require("../../../../../modules/repair");
async function POST(req, res) {
    const { id } = req.params;
    const { phone, amount } = req.body;
    if (!phone || !amount) {
        return res.status(400).json({ message: "Phone and amount are required" });
    }
    // Format the phone number to 254XXXXXXXXX (Paystack MPESA format)
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.substring(1);
    }
    else if (formattedPhone.length === 9 && (formattedPhone.startsWith("7") || formattedPhone.startsWith("1"))) {
        formattedPhone = "254" + formattedPhone;
    }
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
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
                if (c && c.email)
                    customerEmail = c.email;
            }
        }
        catch (e) { }
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
                phone: formattedPhone,
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
    }
    catch (error) {
        req.scope.resolve("logger").error(`[Paystack STK Push] Error: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9zdGstcHVzaC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLG9CQTJGQztBQTlGRCwwREFBOEQ7QUFHdkQsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDMUIsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBeUMsQ0FBQztJQUV4RSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELGtFQUFrRTtJQUNsRSxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5QyxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNuQyxjQUFjLEdBQUcsS0FBSyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkQsQ0FBQztTQUFNLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzdHLGNBQWMsR0FBRyxLQUFLLEdBQUcsY0FBYyxDQUFDO0lBQzFDLENBQUM7SUFFRCxNQUFNLGFBQWEsR0FBd0IsR0FBRyxDQUFDLEtBQUssQ0FB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