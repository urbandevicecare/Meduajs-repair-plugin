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
    // Format the phone number to 07XXXXXXXX or 01XXXXXXXX (Paystack MPESA format)
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("254")) {
        formattedPhone = "0" + formattedPhone.substring(3);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9zdGstcHVzaC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLG9CQXlGQztBQTVGRCwwREFBOEQ7QUFHdkQsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDMUIsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBeUMsQ0FBQztJQUV4RSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELDhFQUE4RTtJQUM5RSxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5QyxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQyxjQUFjLEdBQUcsR0FBRyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELE1BQU0sYUFBYSxHQUF3QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFFNUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sYUFBYSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzlELElBQUksQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztR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