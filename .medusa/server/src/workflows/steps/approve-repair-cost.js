"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveRepairCostStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const repair_1 = require("../../modules/repair");
exports.approveRepairCostStep = (0, workflows_sdk_1.createStep)("approve-repair-cost", async (input, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    // Get current ticket for compensation
    const currentTicket = await repairService.retrieveRepairTicket(input.repair_ticket_id);
    const updatedTicket = await repairService.updateRepairTickets({
        id: input.repair_ticket_id,
        is_approved: true,
        approved_at: new Date(),
    });
    return new workflows_sdk_1.StepResponse(updatedTicket, {
        repair_ticket_id: currentTicket.id,
        previous_is_approved: currentTicket.is_approved,
        previous_approved_at: currentTicket.approved_at,
    });
}, async (compensateInput, { container }) => {
    if (!compensateInput)
        return;
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    await repairService.updateRepairTickets({
        id: compensateInput.repair_ticket_id,
        is_approved: compensateInput.previous_is_approved,
        approved_at: compensateInput.previous_approved_at,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwcm92ZS1yZXBhaXItY29zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy93b3JrZmxvd3Mvc3RlcHMvYXBwcm92ZS1yZXBhaXItY29zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFBNkU7QUFDN0UsaURBQXFEO0FBT3hDLFFBQUEscUJBQXFCLEdBQUcsSUFBQSwwQkFBVSxFQUM3QyxxQkFBcUIsRUFDckIsS0FBSyxFQUFFLEtBQTZCLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO0lBQ3JELE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUU1RSxzQ0FBc0M7SUFDdEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQzVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FDdkIsQ0FBQztJQUVGLE1BQU0sYUFBYSxHQUFHLE1BQU0sYUFBYSxDQUFDLG1CQUFtQixDQUFDO1FBQzVELEVBQUUsRUFBRSxLQUFLLENBQUMsZ0JBQWdCO1FBQzFCLFdBQVcsRUFBRSxJQUFJO1FBQ2pCLFdBQVcsRUFBRSxJQUFJLElBQUksRUFBRTtLQUN4QixDQUFDLENBQUM7SUFFSCxPQUFPLElBQUksNEJBQVksQ0FBQyxhQUFhLEVBQUU7UUFDckMsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLEVBQUU7UUFDbEMsb0JBQW9CLEVBQUUsYUFBYSxDQUFDLFdBQVc7UUFDL0Msb0JBQW9CLEVBQUUsYUFBYSxDQUFDLFdBQVc7S0FDaEQsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxFQUNELEtBQUssRUFBRSxlQUFlLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO0lBQ3ZDLElBQUksQ0FBQyxlQUFlO1FBQUUsT0FBTztJQUM3QixNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFFNUUsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUM7UUFDdEMsRUFBRSxFQUFFLGVBQWUsQ0FBQyxnQkFBZ0I7UUFDcEMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxvQkFBb0I7UUFDakQsV0FBVyxFQUFFLGVBQWUsQ0FBQyxvQkFBb0I7S0FDbEQsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUNGLENBQUMifQ==