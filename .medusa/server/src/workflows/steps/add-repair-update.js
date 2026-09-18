"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRepairUpdateStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const repair_1 = require("../../modules/repair");
exports.addRepairUpdateStep = (0, workflows_sdk_1.createStep)("add-repair-update", async (input, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    const update = await repairService.createRepairUpdates(input);
    return new workflows_sdk_1.StepResponse(update, update.id);
}, async (updateId, { container }) => {
    if (!updateId)
        return;
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    await repairService.deleteRepairUpdates(updateId);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLXJlcGFpci11cGRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvd29ya2Zsb3dzL3N0ZXBzL2FkZC1yZXBhaXItdXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUE2RTtBQUM3RSxpREFBcUQ7QUFVeEMsUUFBQSxtQkFBbUIsR0FBRyxJQUFBLDBCQUFVLEVBQzNDLG1CQUFtQixFQUNuQixLQUFLLEVBQUUsS0FBMkIsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDbkQsTUFBTSxhQUFhLEdBQXdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBRTVFLE1BQU0sTUFBTSxHQUFHLE1BQU0sYUFBYSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRTlELE9BQU8sSUFBSSw0QkFBWSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0MsQ0FBQyxFQUNELEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO0lBQ2hDLElBQUksQ0FBQyxRQUFRO1FBQUUsT0FBTztJQUN0QixNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDNUUsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEQsQ0FBQyxDQUNGLENBQUMifQ==