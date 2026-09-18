"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepairTicketStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const repair_1 = require("../../modules/repair");
exports.createRepairTicketStep = (0, workflows_sdk_1.createStep)("create-repair-ticket", async (input, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    // Generate unique ticket number
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticket_number = `RT-${timestamp}-${randomPart}`;
    const approval_token = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15); // Generate simple random token
    const repairTicket = await repairService.createRepairTickets({
        ...input,
        ticket_number,
        approval_token,
    });
    return new workflows_sdk_1.StepResponse(repairTicket, repairTicket.id);
}, async (ticketId, { container }) => {
    if (!ticketId)
        return;
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    await repairService.deleteRepairTickets(ticketId);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXJlcGFpci10aWNrZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvd29ya2Zsb3dzL3N0ZXBzL2NyZWF0ZS1yZXBhaXItdGlja2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUE2RTtBQUM3RSxpREFBcUQ7QUFleEMsUUFBQSxzQkFBc0IsR0FBRyxJQUFBLDBCQUFVLEVBQzlDLHNCQUFzQixFQUN0QixLQUFLLEVBQUUsS0FBOEIsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDdEQsTUFBTSxhQUFhLEdBQXdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBRTVFLGdDQUFnQztJQUNoQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDN0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzVFLE1BQU0sYUFBYSxHQUFHLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRSxDQUFDO0lBQ3RELE1BQU0sY0FBYyxHQUNsQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLCtCQUErQjtJQUU5RSxNQUFNLFlBQVksR0FBRyxNQUFNLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQztRQUMzRCxHQUFHLEtBQUs7UUFDUixhQUFhO1FBQ2IsY0FBYztLQUNmLENBQUMsQ0FBQztJQUVILE9BQU8sSUFBSSw0QkFBWSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekQsQ0FBQyxFQUNELEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO0lBQ2hDLElBQUksQ0FBQyxRQUFRO1FBQUUsT0FBTztJQUN0QixNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDNUUsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEQsQ0FBQyxDQUNGLENBQUMifQ==