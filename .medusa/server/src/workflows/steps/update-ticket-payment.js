"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketPaymentStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const repair_1 = require("../../modules/repair");
exports.updateTicketPaymentStep = (0, workflows_sdk_1.createStep)("update-ticket-payment", async (input, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    let tickets;
    if (input.ticketId) {
        tickets = await repairService.listRepairTickets({ id: input.ticketId });
    }
    else {
        tickets = await repairService.listRepairTickets({ ticket_number: input.reference });
    }
    if (!tickets || tickets.length === 0) {
        throw new Error("Repair ticket not found");
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
    const newAmountPaid = amountPaidSoFar + input.actualPaidAmount;
    const isFullyPaid = newAmountPaid >= totalEstimate;
    const previousData = {
        id: ticket.id,
        amount_paid: ticket.amount_paid,
        payment_status: ticket.payment_status,
        status: ticket.status
    };
    const newStatus = (ticket.status === "awaiting_approval" && isFullyPaid) ? "ready" : ticket.status;
    const updatedTicket = await repairService.updateRepairTickets({
        id: ticket.id,
        amount_paid: newAmountPaid,
        payment_status: isFullyPaid ? "captured" : "pending",
        status: newStatus
    });
    return new workflows_sdk_1.StepResponse(updatedTicket, previousData);
}, async (previousData, { container }) => {
    if (!previousData)
        return;
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    // Note: In real life, if Paystack actually captured the funds, we shouldn't roll this back just because Zoho failed!
    // But this exists if we intentionally abort the workflow for a critical local reason.
    await repairService.updateRepairTickets({
        id: previousData.id,
        amount_paid: previousData.amount_paid,
        payment_status: previousData.payment_status,
        status: previousData.status
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLXRpY2tldC1wYXltZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9zdGVwcy91cGRhdGUtdGlja2V0LXBheW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBQTZFO0FBQzdFLGlEQUFxRDtBQVN4QyxRQUFBLHVCQUF1QixHQUFHLElBQUEsMEJBQVUsRUFDL0MsdUJBQXVCLEVBQ3ZCLEtBQUssRUFBRSxLQUErQixFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtJQUN2RCxNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFFNUUsSUFBSSxPQUFPLENBQUM7SUFDWixJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQixPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQztTQUFNLENBQUM7UUFDTixPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUMsaUJBQWlCLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUVELElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUxQixNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQVEsRUFBRSxFQUFFO1FBQzVCLElBQUksQ0FBQyxHQUFHO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkIsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksT0FBTyxJQUFJLEdBQUc7WUFBRSxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEUsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN0RCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3JELE1BQU0sYUFBYSxHQUFHLGVBQWUsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7SUFFL0QsTUFBTSxXQUFXLEdBQUcsYUFBYSxJQUFJLGFBQWEsQ0FBQztJQUVuRCxNQUFNLFlBQVksR0FBRztRQUNuQixFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDYixXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVc7UUFDL0IsY0FBYyxFQUFFLE1BQU0sQ0FBQyxjQUFjO1FBQ3JDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtLQUN0QixDQUFDO0lBRUYsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLG1CQUFtQixJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFFbkcsTUFBTSxhQUFhLEdBQUcsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUM7UUFDNUQsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ2IsV0FBVyxFQUFFLGFBQWE7UUFDMUIsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQ3BELE1BQU0sRUFBRSxTQUFTO0tBQ2xCLENBQUMsQ0FBQztJQUVILE9BQU8sSUFBSSw0QkFBWSxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN2RCxDQUFDLEVBQ0QsS0FBSyxFQUFFLFlBQVksRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDcEMsSUFBSSxDQUFDLFlBQVk7UUFBRSxPQUFPO0lBQzFCLE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUM1RSxxSEFBcUg7SUFDckgsc0ZBQXNGO0lBQ3RGLE1BQU0sYUFBYSxDQUFDLG1CQUFtQixDQUFDO1FBQ3RDLEVBQUUsRUFBRSxZQUFZLENBQUMsRUFBRTtRQUNuQixXQUFXLEVBQUUsWUFBWSxDQUFDLFdBQVc7UUFDckMsY0FBYyxFQUFFLFlBQVksQ0FBQyxjQUFjO1FBQzNDLE1BQU0sRUFBRSxZQUFZLENBQUMsTUFBTTtLQUM1QixDQUFDLENBQUM7QUFDTCxDQUFDLENBQ0YsQ0FBQyJ9