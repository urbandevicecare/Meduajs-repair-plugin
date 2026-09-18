"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const repair_1 = require("../../../../../modules/repair");
async function POST(req, res) {
    const { ticket_id, amount } = req.body;
    if (!ticket_id || amount === undefined || amount === null) {
        return res.status(400).json({ message: "Ticket ID and amount are required" });
    }
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    const [settings] = await repairService.listRepairSettings({});
    if (!settings?.paystack_enabled || !settings.paystack_secret_key) {
        return res.status(400).json({ message: "Paystack is not configured or disabled" });
    }
    const tickets = await repairService.listRepairTickets({ id: ticket_id });
    if (!tickets || tickets.length === 0) {
        return res.status(404).json({ message: "Repair ticket not found" });
    }
    const ticket = tickets[0];
    const parseNum = (val) => {
        if (!val)
            return 0;
        if (typeof val === "object" && "value" in val)
            return Number(val.value);
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
                if (c && c.email)
                    customerEmail = c.email;
            }
        }
        catch (e) { }
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
    }
    catch (error) {
        req.scope.resolve("logger").error(`[Paystack Initialize] Error: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvcGF5c3RhY2svaW5pdGlhbGl6ZS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLG9CQTBGQztBQTdGRCwwREFBOEQ7QUFHdkQsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBeUQsRUFDekQsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxTQUFTLElBQUksTUFBTSxLQUFLLFNBQVMsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDMUQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxtQ0FBbUMsRUFBRSxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVELE1BQU0sYUFBYSxHQUF3QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDNUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sYUFBYSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTlELElBQUksQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNqRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHdDQUF3QyxFQUFFLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUN6RSxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxN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