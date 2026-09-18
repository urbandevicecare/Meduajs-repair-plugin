"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitComplianceRequestedEventStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.emitComplianceRequestedEventStep = (0, workflows_sdk_1.createStep)("emit-compliance-requested-event", async (input, { container }) => {
    if (!input.terms_accepted) {
        const eventBus = container.resolve(utils_1.Modules.EVENT_BUS);
        await eventBus.emit({
            name: "repair.ticket.compliance_requested",
            data: { id: input.ticket_id },
        });
        return new workflows_sdk_1.StepResponse({ emitted: true });
    }
    return new workflows_sdk_1.StepResponse({ emitted: false });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1pdC1jb21wbGlhbmNlLXJlcXVlc3RlZC1ldmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy93b3JrZmxvd3Mvc3RlcHMvZW1pdC1jb21wbGlhbmNlLXJlcXVlc3RlZC1ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFBNkU7QUFDN0UscURBQW9EO0FBT3ZDLFFBQUEsZ0NBQWdDLEdBQUcsSUFBQSwwQkFBVSxFQUN4RCxpQ0FBaUMsRUFDakMsS0FBSyxFQUFFLEtBQW1DLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO0lBQzNELElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDMUIsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEQsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ2xCLElBQUksRUFBRSxvQ0FBb0M7WUFDMUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUU7U0FDOUIsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLDRCQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ0QsT0FBTyxJQUFJLDRCQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUM5QyxDQUFDLENBQ0YsQ0FBQyJ9