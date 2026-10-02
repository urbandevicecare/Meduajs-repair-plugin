"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const verify_paystack_payment_workflow_1 = require("../../../../../workflows/verify-paystack-payment-workflow");
async function POST(req, res) {
    const { reference } = req.body;
    if (!reference) {
        return res.status(400).json({ message: "Reference is required" });
    }
    try {
        const { result } = await (0, verify_paystack_payment_workflow_1.verifyPaystackPaymentWorkflow)(req.scope).run({
            input: { reference },
        });
        res.json({ message: "Payment verified and synchronized successfully", repair_ticket: result });
    }
    catch (error) {
        req.scope.resolve("logger").error(`[Paystack Verify Workflow] Error: ${error.message}`);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvcGF5c3RhY2svdmVyaWZ5L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esb0JBbUJDO0FBckJELGdIQUEwRztBQUVuRyxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUF5QyxFQUN6QyxHQUFtQjtJQUVuQixNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztJQUMvQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDZixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0gsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBQSxnRUFBNkIsRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ3BFLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRTtTQUNyQixDQUFDLENBQUM7UUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGdEQUFnRCxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDeEYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sSUFBSSx1QkFBdUIsRUFBRSxDQUFDLENBQUM7SUFDOUUsQ0FBQztBQUNILENBQUMifQ==