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
    // Format the phone number to +254XXXXXXXXX (Paystack MPESA format)
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
        formattedPhone = "+254" + formattedPhone.substring(1);
    }
    else if (formattedPhone.length === 9 && (formattedPhone.startsWith("7") || formattedPhone.startsWith("1"))) {
        formattedPhone = "+254" + formattedPhone;
    }
    else if (formattedPhone.startsWith("254")) {
        formattedPhone = "+" + formattedPhone;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9zdGstcHVzaC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLG9CQTZGQztBQWhHRCwwREFBOEQ7QUFHdkQsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDMUIsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBeUMsQ0FBQztJQUV4RSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELG1FQUFtRTtJQUNuRSxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5QyxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNuQyxjQUFjLEdBQUcsTUFBTSxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEQsQ0FBQztTQUFNLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzdHLGNBQWMsR0FBRyxNQUFNLEdBQUcsY0FBYyxDQUFDO0lBQzNDLENBQUM7U0FBTSxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUM1QyxjQUFjLEdBQUcsR0FBRyxHQUFHLGNBQWMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsTUFBTSxhQUFhLEdBQXdCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUU1RSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxhQUFhLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDOUQsSUFBSSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQ2pFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsb0RBQW9ELEVBQUUsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDOUQsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3JDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsSUFBSSxhQUFhLEdBQUcsU0FBUyxNQUFNLENBQUMsRUFBRSxjQUFjLENBQUM7SUFFckQsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNsRixJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUNuQixNQUFNLENBQUMsR0FBRyxNQUFNLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3BFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLO29CQUFFLGFBQWEsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQzVDLENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBLENBQUM7SUFDaEIsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sU0FBUyxHQUFHLE9BQU8sTUFBTSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUU5RCxvREFBb0Q7UUFDcEQsTUFBTSxPQUFPLEdBQUc7WUFDZCxLQUFLLEVBQUUsYUFBYTtZQUNwQixNQUFNLEVBQUUsY0FBYztZQUN0QixRQUFRLEVBQUUsS0FBSztZQUNmLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLFlBQVksRUFBRTtnQkFDWixLQUFLLEVBQUUsY0FBYztnQkFDckIsUUFBUSxFQUFFLE9BQU87YUFDbEI7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsU0FBUyxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUNwQixRQUFRLEVBQUUsSUFBSTthQUNmO1NBQ0YsQ0FBQztRQUVGLE1BQU0sV0FBVyxHQUFHLE1BQU0sS0FBSyxDQUFDLGdDQUFnQyxFQUFFO1lBQ2hFLE1BQU0sRUFBRSxNQUFNO1lBQ2QsT0FBTyxFQUFFO2dCQUNQLGFBQWEsRUFBRSxVQUFVLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDdkQsY0FBYyxFQUFFLGtCQUFrQjthQUNuQztZQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztTQUM5QixDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxNQUFNLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUU5QyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM1QyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMxQixPQUFPLEVBQUUsWUFBWSxDQUFDLE9BQU8sSUFBSSx3Q0FBd0M7Z0JBQ3pFLElBQUksRUFBRSxZQUFZO2FBQ25CLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ1AsT0FBTyxFQUFFLGlDQUFpQztZQUMxQyxTQUFTO1lBQ1QsSUFBSSxFQUFFLFlBQVksQ0FBQyxJQUFJO1NBQ3hCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDakYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO0lBQzdELENBQUM7QUFDSCxDQUFDIn0=