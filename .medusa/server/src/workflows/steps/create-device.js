"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeviceStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const repair_1 = require("../../modules/repair");
exports.createDeviceStep = (0, workflows_sdk_1.createStep)("create-device", async (input, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    const device = await repairService.createDevices(input);
    return new workflows_sdk_1.StepResponse(device, device.id);
}, async (deviceId, { container }) => {
    if (!deviceId)
        return;
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    await repairService.deleteDevices(deviceId);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWRldmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy93b3JrZmxvd3Mvc3RlcHMvY3JlYXRlLWRldmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFBNkU7QUFDN0UsaURBQXFEO0FBYXhDLFFBQUEsZ0JBQWdCLEdBQUcsSUFBQSwwQkFBVSxFQUN4QyxlQUFlLEVBQ2YsS0FBSyxFQUFFLEtBQXdCLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO0lBQ2hELE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUU1RSxNQUFNLE1BQU0sR0FBRyxNQUFNLGFBQWEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFeEQsT0FBTyxJQUFJLDRCQUFZLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3QyxDQUFDLEVBQ0QsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDaEMsSUFBSSxDQUFDLFFBQVE7UUFBRSxPQUFPO0lBQ3RCLE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUM1RSxNQUFNLGFBQWEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUMsQ0FBQyxDQUNGLENBQUMifQ==