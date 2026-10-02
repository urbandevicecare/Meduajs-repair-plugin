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
    const hasTax = input.apply_tax !== undefined ? input.apply_tax : currentTicket.apply_tax;
    if (input.apply_tax !== undefined) {
        updateData.apply_tax = input.apply_tax;
        // If we are JUST updating tax, we must recalculate total based on current parts/labor
        let newTotalEst = (input.parts_estimate ?? Number(currentTicket.parts_estimate || 0)) + (input.labor_estimate ?? Number(currentTicket.labor_estimate || 0));
        if (hasTax)
            newTotalEst = newTotalEst * 1.16;
        updateData.total_estimate = newTotalEst;
        let newTotalAct = (input.parts_actual ?? Number(currentTicket.parts_actual || 0)) + (input.labor_actual ?? Number(currentTicket.labor_actual || 0));
        if (hasTax)
            newTotalAct = newTotalAct * 1.16;
        updateData.total_actual = newTotalAct;
    }
    if (input.parts_estimate !== undefined || input.labor_estimate !== undefined) {
        if (input.parts_estimate !== undefined)
            updateData.parts_estimate = input.parts_estimate;
        if (input.labor_estimate !== undefined)
            updateData.labor_estimate = input.labor_estimate;
        let newTotal = (input.parts_estimate ?? Number(currentTicket.parts_estimate || 0)) + (input.labor_estimate ?? Number(currentTicket.labor_estimate || 0));
        if (hasTax) {
            newTotal = newTotal * 1.16;
        }
        updateData.total_estimate = newTotal;
    }
    if (input.parts_actual !== undefined || input.labor_actual !== undefined) {
        if (input.parts_actual !== undefined)
            updateData.parts_actual = input.parts_actual;
        if (input.labor_actual !== undefined)
            updateData.labor_actual = input.labor_actual;
        let newTotal = (input.parts_actual ?? Number(currentTicket.parts_actual || 0)) + (input.labor_actual ?? Number(currentTicket.labor_actual || 0));
        if (hasTax) {
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
        previous_apply_tax: currentTicket.apply_tax,
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
        apply_tax: compensateInput.previous_apply_tax,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLXJlcGFpci1jb3N0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy93b3JrZmxvd3Mvc3RlcHMvdXBkYXRlLXJlcGFpci1jb3N0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFBNkU7QUFDN0UsaURBQXFEO0FBWXhDLFFBQUEscUJBQXFCLEdBQUcsSUFBQSwwQkFBVSxFQUM3QyxxQkFBcUIsRUFDckIsS0FBSyxFQUFFLEtBQTZCLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFO0lBQ3JELE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUU1RSxzQ0FBc0M7SUFDdEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQzVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FDdkIsQ0FBQztJQUVGLE1BQU0sVUFBVSxHQUFRLEVBQUUsQ0FBQztJQUMzQixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQztJQUV6RixJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDbEMsVUFBVSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLHNGQUFzRjtRQUN0RixJQUFJLFdBQVcsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1SixJQUFJLE1BQU07WUFBRSxXQUFXLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQztR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