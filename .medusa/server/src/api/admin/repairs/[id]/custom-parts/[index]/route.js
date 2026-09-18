"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = DELETE;
const repair_1 = require("../../../../../../modules/repair");
// DELETE /admin/repairs/:id/custom-parts/:index - Remove a custom part
async function DELETE(req, res) {
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    const ticket = await repairService.retrieveRepairTicket(req.params.id);
    const index = parseInt(req.params.index, 10);
    if (isNaN(index) ||
        !Array.isArray(ticket.custom_parts) ||
        index < 0 ||
        index >= ticket.custom_parts.length) {
        res.status(400).json({ message: "Invalid custom part index" });
        return;
    }
    const customParts = [...ticket.custom_parts];
    const removedPart = customParts.splice(index, 1)[0];
    const priceToDeduct = removedPart.price || 0;
    const currentPartsEstimate = typeof ticket.parts_estimate === "object" &&
        ticket.parts_estimate !== null &&
        "value" in ticket.parts_estimate
        ? Number(ticket.parts_estimate.value)
        : Number(ticket.parts_estimate);
    const currentLaborEstimate = typeof ticket.labor_estimate === "object" &&
        ticket.labor_estimate !== null &&
        "value" in ticket.labor_estimate
        ? Number(ticket.labor_estimate.value)
        : Number(ticket.labor_estimate);
    const updatedPartsEstimate = Math.max(0, currentPartsEstimate - priceToDeduct);
    let newTotalEstimate = updatedPartsEstimate + currentLaborEstimate;
    if (ticket.apply_tax) {
        newTotalEstimate = newTotalEstimate * 1.16;
    }
    const updatedTicket = await repairService.updateRepairTickets({
        id: req.params.id,
        custom_parts: customParts,
        parts_estimate: updatedPartsEstimate,
        total_estimate: newTotalEstimate,
    });
    res.json({ repair_ticket: updatedTicket });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9jdXN0b20tcGFydHMvW2luZGV4XS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLHdCQWtEQztBQXJERCw2REFBaUU7QUFFakUsdUVBQXVFO0FBQ2hFLEtBQUssVUFBVSxNQUFNLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNsRSxNQUFNLGFBQWEsR0FBd0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBRTVFLE1BQU0sTUFBTSxHQUFHLE1BQU0sYUFBYSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdkUsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTdDLElBQ0UsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUNaLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQ25DLEtBQUssR0FBRyxDQUFDO1FBQ1QsS0FBSyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUNuQyxDQUFDO1FBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELE9BQU87SUFDVCxDQUFDO0lBRUQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQVUsQ0FBQztJQUN0RCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVwRCxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUU3QyxNQUFNLG9CQUFvQixHQUN4QixPQUFPLE1BQU0sQ0FBQyxjQUFjLEtBQUssUUFBUTtRQUN6QyxNQUFNLENBQUMsY0FBYyxLQUFLLElBQUk7UUFDOUIsT0FBTyxJQUFJLE1BQU0sQ0FBQyxjQUFjO1FBQzlCLENBQUMsQ0FBQyxNQUFNLENBQUUsTUFBTSxDQUFDLGNBQXNCLENBQUMsS0FBSyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRXBDLE1BQU0sb0JBQW9CLEdBQ3hCLE9BQU8sTUFBTSxDQUFDLGNBQWMsS0FBSyxRQUFRO1FBQ3pDLE1BQU0sQ0FBQyxjQUFjLEtBQUssSUFBSTtRQUM5QixPQUFPLElBQUksTUFBTSxDQUFDLGNBQWM7UUFDOUIsQ0FBQyxDQUFDLE1BQU0sQ0FBRSxNQUFNLENBQUMsY0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFDOUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFcEMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxvQkFBb0IsR0FBRyxhQUFhLENBQUMsQ0FBQztJQUUvRSxJQUFJLGdCQUFnQixHQUFHLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDO0lBQ25FLElBQUssTUFBYyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzlCLGdCQUFnQixHQUFHLGdCQUFnQixHQUFHLElBQUksQ0FBQztJQUM3QyxDQUFDO0lBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUM7UUFDNUQsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNqQixZQUFZLEVBQUUsV0FBaUQ7UUFDL0QsY0FBYyxFQUFFLG9CQUFvQjtRQUNwQyxjQUFjLEVBQUUsZ0JBQWdCO0tBQ2pDLENBQUMsQ0FBQztJQUVILEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztBQUM3QyxDQUFDIn0=