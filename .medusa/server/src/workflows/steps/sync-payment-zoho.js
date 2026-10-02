"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncPaymentZohoStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const zoho_payment_sync_js_1 = require("../../utils/zoho-payment-sync.js");
exports.syncPaymentZohoStep = (0, workflows_sdk_1.createStep)("sync-payment-zoho", async (input, { container }) => {
    // We intentionally wrap this so it doesn't throw and cause a rollback.
    // If we roll back the local ticket, we lose record of a successful Paystack charge!
    await (0, zoho_payment_sync_js_1.syncPaymentToZoho)(container, input.ticket_id, input.amount, "Paystack");
    return new workflows_sdk_1.StepResponse(true);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1wYXltZW50LXpvaG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvd29ya2Zsb3dzL3N0ZXBzL3N5bmMtcGF5bWVudC16b2hvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUE2RTtBQUM3RSwyRUFBcUU7QUFPeEQsUUFBQSxtQkFBbUIsR0FBRyxJQUFBLDBCQUFVLEVBQzNDLG1CQUFtQixFQUNuQixLQUFLLEVBQUUsS0FBMkIsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDbkQsdUVBQXVFO0lBQ3ZFLG9GQUFvRjtJQUNwRixNQUFNLElBQUEsd0NBQWlCLEVBQUMsU0FBZ0IsRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDckYsT0FBTyxJQUFJLDRCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsQ0FBQyxDQUNGLENBQUMifQ==