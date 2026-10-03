"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const repair_1 = require("../../../../../modules/repair");
const zoho_payment_sync_js_1 = require("../../../../../utils/zoho-payment-sync.js");
async function POST(req, res) {
    const { id } = req.params;
    const { amount, method } = req.body;
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    const tickets = await repairService.listRepairTickets({ id });
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
        await (0, zoho_payment_sync_js_1.syncPaymentToZoho)(req.scope, id, amountToPay, method || "Cash");
    }
    catch (e) {
        req.scope.resolve("logger").error(`[Mark Paid] Zoho sync failed: ${e}`);
    }
    res.json({ repair_ticket: updatedTicket });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9tYXJrLXBhaWQvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSxvQkE0Q0M7QUFoREQsMERBQThEO0FBRTlELG9GQUE4RTtBQUV2RSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDaEUsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDMUIsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBNEMsQ0FBQztJQUM1RSxNQUFNLGFBQWEsR0FBd0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBRTVFLE1BQU0sT0FBTyxHQUFHLE1BQU0sYUFBYSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5RCxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDckMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUxQixNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQVEsRUFBRSxFQUFFO1FBQzVCLElBQUksQ0FBQyxHQUFHO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkIsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksT0FBTyxJQUFJLEdBQUc7WUFBRSxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEUsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN0RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2xELE1BQU0sV0FBVyxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO0lBRWxFLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUVqRixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFdBQVcsQ0FBQztJQUNqRSxNQUFNLFdBQVcsR0FBRyxhQUFhLElBQUksV0FBVyxDQUFDO0lBRWpELE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxtQkFBbUIsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBRW5HLE1BQU0sYUFBYSxHQUFHLE1BQU0sYUFBYSxDQUFDLG1CQUFtQixDQUFDO1FBQzVELEVBQUU7UUFDRixXQUFXLEVBQUUsYUFBYTtRQUMxQixjQUFjLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDcEQsTUFBTSxFQUFFLFNBQVM7S0FDbEIsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDO1FBQ0YsNkNBQTZDO1FBQzdDLE1BQU0sSUFBQSx3Q0FBaUIsRUFBQyxHQUFHLENBQUMsS0FBWSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFBQyxPQUFNLENBQUMsRUFBRSxDQUFDO1FBQ1QsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDN0MsQ0FBQyJ9