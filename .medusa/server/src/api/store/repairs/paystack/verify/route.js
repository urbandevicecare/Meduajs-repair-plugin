"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const repair_1 = require("../../../../../modules/repair");
const zoho_payment_sync_js_1 = require("../../../../../utils/zoho-payment-sync.js");
async function POST(req, res) {
    const { reference } = req.body;
    if (!reference) {
        return res.status(400).json({ message: "Reference is required" });
    }
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
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
        }
        else {
            // Fallback: maybe reference is ticket_number
            tickets = await repairService.listRepairTickets({ ticket_number: reference });
        }
        if (!tickets || tickets.length === 0) {
            return res.status(404).json({ message: "Repair ticket not found" });
        }
        const ticket = tickets[0];
        // Paystack amounts are in minor units (e.g. cents/kobos). We divide by 100 to get the exact value for Medusa v2 / Zoho.
        const actualPaidAmount = paystackData.data.amount / 100;
        const parseNum = (val) => {
            if (!val)
                return 0;
            if (typeof val === "object" && "value" in val)
                return Number(val.value);
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
        await (0, zoho_payment_sync_js_1.syncPaymentToZoho)(req.scope, ticket.id, actualPaidAmount, "Paystack");
        res.json({ message: "Payment verified and synchronized successfully" });
    }
    catch (error) {
        req.scope.resolve("logger").error(`[Paystack Verify] Error: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvcGF5c3RhY2svdmVyaWZ5L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0Esb0JBNkVDO0FBakZELDBEQUE4RDtBQUU5RCxvRkFBOEU7QUFFdkUsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBeUMsRUFDekMsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDL0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2YsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVELE1BQU0sYUFBYSxHQUF3QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDNUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sYUFBYSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTlELElBQUksQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNqRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHdDQUF3QyxFQUFFLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQsc0NBQXNDO0lBQ3RDLElBQUksQ0FBQztRQUNILE1BQU0sV0FBVyxHQUFHLE1BQU0sS0FBSyxDQUFDLDhDQUE4QyxTQUFTLEVBQUUsRUFBRTtZQUN6RixPQUFPLEVBQUU7Z0JBQ1AsYUFBYSxFQUFFLFVBQVUsUUFBUSxDQUFDLG1CQUFtQixFQUFFO2FBQ3hEO1NBQ0YsQ0FBQyxD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