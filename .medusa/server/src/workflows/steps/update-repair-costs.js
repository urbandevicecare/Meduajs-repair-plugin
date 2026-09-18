"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRepairCostsStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const repair_1 = require("../../modules/repair");
exports.updateRepairCostsStep = (0, workflows_sdk_1.createStep)("update-repair-costs", async (input, { container }) => {
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    // Get current ticket for compensation
    const currentTicket = await repairService.retrieveRepairTicket(input.repair_ticket_id);
    const updateData = {};
    if (input.parts_estimate !== undefined) {
        updateData.parts_estimate = input.parts_estimate;
        let newTotal = input.parts_estimate + (input.labor_estimate ?? currentTicket.labor_estimate);
        if (currentTicket.apply_tax) {
            newTotal = newTotal * 1.16;
        }
        updateData.total_estimate = newTotal;
    }
    if (input.labor_estimate !== undefined) {
        updateData.labor_estimate = input.labor_estimate;
        let newTotal = (input.parts_estimate ?? currentTicket.parts_estimate) + input.labor_estimate;
        if (currentTicket.apply_tax) {
            newTotal = newTotal * 1.16;
        }
        updateData.total_estimate = newTotal;
    }
    if (input.parts_actual !== undefined) {
        updateData.parts_actual = input.parts_actual;
        let newTotal = input.parts_actual + (input.labor_actual ?? currentTicket.labor_actual);
        if (currentTicket.apply_tax) {
            newTotal = newTotal * 1.16;
        }
        updateData.total_actual = newTotal;
    }
    if (input.labor_actual !== undefined) {
        updateData.labor_actual = input.labor_actual;
        let newTotal = (input.parts_actual ?? currentTicket.parts_actual) + input.labor_actual;
        if (currentTicket.apply_tax) {
            newTotal = newTotal * 1.16;
        }
        updateData.total_actual = newTotal;
    }
    const updatedTicket = await repairService.updateRepairTickets({
        id: input.repair_ticket_id,
        ...updateData,
    });
    return new workflows_sdk_1.StepResponse(updatedTicket, {
        repair_ticket_id: currentTicket.id,
        previous_parts_estimate: currentTicket.parts_estimate,
        previous_labor_estimate: currentTicket.labor_estimate,
        previous_total_estimate: currentTicket.total_estimate,
        previous_parts_actual: currentTicket.parts_actual,
        previous_labor_actual: currentTicket.labor_actual,
        previous_total_actual: currentTicket.total_actual,
    });
}, async (compensateInput, { container }) => {
    if (!compensateInput)
        return;
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    await repairService.updateRepairTickets({
        id: compensateInput.repair_ticket_id,
        parts_estimate: compensateInput.previous_parts_estimate,
        labor_estimate: compensateInput.previous_labor_estimate,
        total_estimate: compensateInput.previous_total_estimate,
        parts_actual: compensateInput.previous_parts_actual,
        labor_actual: compensateInput.previous_labor_actual,
        total_actual: compensateInput.previous_total_actual,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLXJlcGFpci1jb3N0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy93b3JrZmxvd3Mvc3RlcHMvdXBkYXRlLXJlcGFpci1jb3N0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFBNkU7QUFDN0UsaURBQXFEO0FBV3hDLFFBQUEscUJBQXFCLEdBQUcsSUFBQSwwQkFBVSxFQUM3QyxxQkFBcUIsRUFDckIsS0FBSyxFQUFFLEtBQTZCLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO0lBQ3JELE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUU1RSxzQ0FBc0M7SUFDdEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQzVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FDdkIsQ0FBQztJQUVGLE1BQU0sVUFBVSxHQUFRLEVBQUUsQ0FBQztJQUUzQixJQUFJLEtBQUssQ0FBQyxjQUFjLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDdkMsVUFBVSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO1FBQ2pELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxjQUFjLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM3RixJQUFJLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM1QixRQUFRLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQztRQUM3QixDQUFDO1FBQ0QsVUFBVSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUN2QyxVQUFVLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUM7UUFDakQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLGFBQWEsQ0FBQyxjQUFjLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO1FBQzdGLElBQUksYUFBYSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzVCLFFBQVEsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQzdCLENBQUM7UUFDRCxVQUFVLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztJQUN2QyxDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3JDLFVBQVUsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztRQUM3QyxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsWUFBWSxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksSUFBSSxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdkYsSUFBSSxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDNUIsUUFBUSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDN0IsQ0FBQztRQUNELFVBQVUsQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxJQUFJLEtBQUssQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDckMsVUFBVSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDO1FBQzdDLElBQUksUUFBUSxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksSUFBSSxhQUFhLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztRQUN2RixJQUFJLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM1QixRQUFRLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQztRQUM3QixDQUFDO1FBQ0QsVUFBVSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7SUFDckMsQ0FBQztJQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sYUFBYSxDQUFDLG1CQUFtQixDQUFDO1FBQzVELEVBQUUsRUFBRSxLQUFLLENBQUMsZ0JBQWdCO1FBQzFCLEdBQUcsVUFBVTtLQUNkLENBQUMsQ0FBQztJQUVILE9BQU8sSUFBSSw0QkFBWSxDQUFDLGFBQWEsRUFBRTtRQUNyQyxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsRUFBRTtRQUNsQyx1QkFBdUIsRUFBRSxhQUFhLENBQUMsY0FBYztRQUNyRCx1QkFBdUIsRUFBRSxhQUFhLENBQUMsY0FBYztRQUNyRCx1QkFBdUIsRUFBRSxhQUFhLENBQUMsY0FBYztRQUNyRCxxQkFBcUIsRUFBRSxhQUFhLENBQUMsWUFBWTtRQUNqRCxxQkFBcUIsRUFBRSxhQUFhLENBQUMsWUFBWTtRQUNqRCxxQkFBcUIsRUFBRSxhQUFhLENBQUMsWUFBWTtLQUNsRCxDQUFDLENBQUM7QUFDTCxDQUFDLEVBQ0QsS0FBSyxFQUFFLGVBQWUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDdkMsSUFBSSxDQUFDLGVBQWU7UUFBRSxPQUFPO0lBQzdCLE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUU1RSxNQUFNLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQztRQUN0QyxFQUFFLEVBQUUsZUFBZSxDQUFDLGdCQUFnQjtRQUNwQyxjQUFjLEVBQUUsZUFBZSxDQUFDLHVCQUF1QjtRQUN2RCxjQUFjLEVBQUUsZUFBZSxDQUFDLHVCQUF1QjtRQUN2RCxjQUFjLEVBQUUsZUFBZSxDQUFDLHVCQUF1QjtRQUN2RCxZQUFZLEVBQUUsZUFBZSxDQUFDLHFCQUFxQjtRQUNuRCxZQUFZLEVBQUUsZUFBZSxDQUFDLHFCQUFxQjtRQUNuRCxZQUFZLEVBQUUsZUFBZSxDQUFDLHFCQUFxQjtLQUNwRCxDQUFDLENBQUM7QUFDTCxDQUFDLENBQ0YsQ0FBQyJ9