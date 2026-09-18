"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitRepairStatusChangedEventStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.emitRepairStatusChangedEventStep = (0, workflows_sdk_1.createStep)("emit-repair-status-changed-event", async (input, { container }) => {
    const eventBus = container.resolve(utils_1.Modules.EVENT_BUS);
    await eventBus.emit({
        name: "repair.status_changed",
        data: input,
    });
    return new workflows_sdk_1.StepResponse({ emitted: true });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1pdC1yZXBhaXItc3RhdHVzLWNoYW5nZWQtZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvd29ya2Zsb3dzL3N0ZXBzL2VtaXQtcmVwYWlyLXN0YXR1cy1jaGFuZ2VkLWV2ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUE2RTtBQUM3RSxxREFBb0Q7QUFRdkMsUUFBQSxnQ0FBZ0MsR0FBRyxJQUFBLDBCQUFVLEVBQ3hELGtDQUFrQyxFQUNsQyxLQUFLLEVBQUUsS0FBbUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDM0QsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFdEQsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ2xCLElBQUksRUFBRSx1QkFBdUI7UUFDN0IsSUFBSSxFQUFFLEtBQUs7S0FDWixDQUFDLENBQUM7SUFFSCxPQUFPLElBQUksNEJBQVksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLENBQUMsQ0FDRixDQUFDIn0=