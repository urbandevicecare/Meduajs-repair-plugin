"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRepairMediaStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const repair_1 = require("../../modules/repair");
exports.addRepairMediaStep = (0, workflows_sdk_1.createStep)("add-repair-media", async (input, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    const media = await repairService.createRepairMedias(input);
    return new workflows_sdk_1.StepResponse(media, media.id);
}, async (mediaId, { container }) => {
    if (!mediaId)
        return;
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    await repairService.deleteRepairMedias(mediaId);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLXJlcGFpci1tZWRpYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy93b3JrZmxvd3Mvc3RlcHMvYWRkLXJlcGFpci1tZWRpYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFBNkU7QUFDN0UsaURBQXFEO0FBYXhDLFFBQUEsa0JBQWtCLEdBQUcsSUFBQSwwQkFBVSxFQUMxQyxrQkFBa0IsRUFDbEIsS0FBSyxFQUFFLEtBQTBCLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO0lBQ2xELE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUU1RSxNQUFNLEtBQUssR0FBRyxNQUFNLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUU1RCxPQUFPLElBQUksNEJBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzNDLENBQUMsRUFDRCxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtJQUMvQixJQUFJLENBQUMsT0FBTztRQUFFLE9BQU87SUFDckIsTUFBTSxhQUFhLEdBQXdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBQzVFLE1BQU0sYUFBYSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xELENBQUMsQ0FDRixDQUFDIn0=