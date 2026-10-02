"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPaystackPaymentStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const repair_1 = require("../../modules/repair");
exports.verifyPaystackPaymentStep = (0, workflows_sdk_1.createStep)("verify-paystack-payment", async (reference, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    const [settings] = await repairService.listRepairSettings({});
    if (!settings?.paystack_enabled || !settings.paystack_secret_key) {
        throw new Error("Paystack is not configured or disabled");
    }
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            Authorization: `Bearer ${settings.paystack_secret_key}`
        }
    });
    const paystackData = await paystackRes.json();
    if (!paystackData.status || paystackData.data.status !== "success") {
        throw new Error("Transaction verification failed");
    }
    return new workflows_sdk_1.StepResponse({
        ticketId: paystackData.data.metadata?.ticket_id,
        reference,
        actualPaidAmount: paystackData.data.amount / 100, // minor units to standard
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LXBheXN0YWNrLXBheW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvd29ya2Zsb3dzL3N0ZXBzL3ZlcmlmeS1wYXlzdGFjay1wYXltZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUE2RTtBQUM3RSxpREFBcUQ7QUFHeEMsUUFBQSx5QkFBeUIsR0FBRyxJQUFBLDBCQUFVLEVBQ2pELHlCQUF5QixFQUN6QixLQUFLLEVBQUUsU0FBaUIsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDekMsTUFBTSxhQUFhLEdBQXdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBQzVFLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUU5RCxJQUFJLENBQUMsUUFBUSxFQUFFLGdCQUFnQixJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDakUsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLEtBQUssQ0FBQyw4Q0FBOEMsU0FBUyxFQUFFLEVBQUU7UUFDekYsT0FBTyxFQUFFO1lBQ1AsYUFBYSxFQUFFLFVBQVUsUUFBUSxDQUFDLG1CQUFtQixFQUFFO1NBQ3hEO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxZQUFZLEdBQUcsTUFBTSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDbkUsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxPQUFPLElBQUksNEJBQVksQ0FBQztRQUN0QixRQUFRLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUztRQUMvQyxTQUFTO1FBQ1QsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFLDBCQUEwQjtLQUM3RSxDQUFDLENBQUM7QUFDTCxDQUFDLENBQ0YsQ0FBQyJ9