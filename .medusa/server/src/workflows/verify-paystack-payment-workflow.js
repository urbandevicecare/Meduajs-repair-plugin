"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPaystackPaymentWorkflow = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const verify_paystack_payment_1 = require("./steps/verify-paystack-payment");
const update_ticket_payment_1 = require("./steps/update-ticket-payment");
const sync_payment_zoho_1 = require("./steps/sync-payment-zoho");
exports.verifyPaystackPaymentWorkflow = (0, workflows_sdk_1.createWorkflow)("verify-paystack-payment", (input) => {
    const verifiedData = (0, verify_paystack_payment_1.verifyPaystackPaymentStep)(input.reference);
    const updatedTicket = (0, update_ticket_payment_1.updateTicketPaymentStep)({
        ticketId: verifiedData.ticketId,
        reference: verifiedData.reference,
        actualPaidAmount: verifiedData.actualPaidAmount,
    });
    (0, sync_payment_zoho_1.syncPaymentZohoStep)({
        ticket_id: updatedTicket.id,
        amount: verifiedData.actualPaidAmount,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedTicket);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LXBheXN0YWNrLXBheW1lbnQtd29ya2Zsb3cuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvd29ya2Zsb3dzL3ZlcmlmeS1wYXlzdGFjay1wYXltZW50LXdvcmtmbG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUcyQztBQUMzQyw2RUFBNEU7QUFDNUUseUVBQXdFO0FBQ3hFLGlFQUFnRTtBQU1uRCxRQUFBLDZCQUE2QixHQUFHLElBQUEsOEJBQWMsRUFDekQseUJBQXlCLEVBQ3pCLENBQUMsS0FBeUMsRUFBRSxFQUFFO0lBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUEsbURBQXlCLEVBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRWhFLE1BQU0sYUFBYSxHQUFHLElBQUEsK0NBQXVCLEVBQUM7UUFDNUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxRQUFRO1FBQy9CLFNBQVMsRUFBRSxZQUFZLENBQUMsU0FBUztRQUNqQyxnQkFBZ0IsRUFBRSxZQUFZLENBQUMsZ0JBQWdCO0tBQ2hELENBQUMsQ0FBQztJQUVILElBQUEsdUNBQW1CLEVBQUM7UUFDbEIsU0FBUyxFQUFFLGFBQWEsQ0FBQyxFQUFFO1FBQzNCLE1BQU0sRUFBRSxZQUFZLENBQUMsZ0JBQWdCO0tBQ3RDLENBQUMsQ0FBQztJQUVILE9BQU8sSUFBSSxnQ0FBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM3QyxDQUFDLENBQ0YsQ0FBQyJ9