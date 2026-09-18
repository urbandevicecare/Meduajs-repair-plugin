"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const repair_1 = require("../../../../../modules/repair");
// POST /admin/repairs/:id/custom-parts - Add a custom part
async function POST(req, res) {
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    const { name, price, is_taxable } = req.body;
    if (!name || price === undefined) {
        res
            .status(400)
            .json({ message: "Name and price are required for custom parts" });
        return;
    }
    const ticket = await repairService.retrieveRepairTicket(req.params.id);
    // Initialize if null somehow, though model sets default []
    const customParts = Array.isArray(ticket.custom_parts)
        ? [...ticket.custom_parts]
        : [];
    const priceInCents = Number(price);
    customParts.push({ name, price: priceInCents, is_taxable: is_taxable !== false });
    // also update parts estimate
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
    const updatedPartsEstimate = currentPartsEstimate + priceInCents;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9jdXN0b20tcGFydHMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFNQSxvQkFzREM7QUF6REQsMERBQThEO0FBRTlELDJEQUEyRDtBQUNwRCxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUFtRCxFQUNuRCxHQUFtQjtJQUVuQixNQUFNLGFBQWEsR0FBd0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBQzVFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUE2RCxDQUFDO0lBRXRHLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ2pDLEdBQUc7YUFDQSxNQUFNLENBQUMsR0FBRyxDQUFDO2FBQ1gsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLDhDQUE4QyxFQUFFLENBQUMsQ0FBQztRQUNyRSxPQUFPO0lBQ1QsQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sYUFBYSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFdkUsMkRBQTJEO0lBQzNELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztRQUNwRCxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7UUFDMUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVQLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFVBQVUsS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBRWxGLDZCQUE2QjtJQUM3QixNQUFNLG9CQUFvQixHQUN4QixPQUFPLE1BQU0sQ0FBQyxjQUFjLEtBQUssUUFBUTtRQUN6QyxNQUFNLENBQUMsY0FBYyxLQUFLLElBQUk7UUFDOUIsT0FBTyxJQUFJLE1BQU0sQ0FBQyxjQUFjO1FBQzlCLENBQUMsQ0FBQyxNQUFNLENBQUUsTUFBTSxDQUFDLGNBQXNCLENBQUMsS0FBSyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRXBDLE1BQU0sb0JBQW9CLEdBQ3hCLE9BQU8sTUFBTSxDQUFDLGNBQWMsS0FBSyxRQUFRO1FBQ3pDLE1BQU0sQ0FBQyxjQUFjLEtBQUssSUFBSTtRQUM5QixPQUFPLElBQUksTUFBTSxDQUFDLGNBQWM7UUFDOUIsQ0FBQyxDQUFDLE1BQU0sQ0FBRSxNQUFNLENBQUMsY0FBc0IsQ0FBQyxLQUFLLENBQUM7UUFDOUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFcEMsTUFBTSxvQkFBb0IsR0FBRyxvQkFBb0IsR0FBRyxZQUFZLENBQUM7SUFFakUsSUFBSSxnQkFBZ0IsR0FBRyxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQztJQUNuRSxJQUFLLE1BQWMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM5QixnQkFBZ0IsR0FBRyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7SUFDN0MsQ0FBQztJQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sYUFBYSxDQUFDLG1CQUFtQixDQUFDO1FBQzVELEVBQUUsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDakIsWUFBWSxFQUFFLFdBQWlEO1FBQy9ELGNBQWMsRUFBRSxvQkFBb0I7UUFDcEMsY0FBYyxFQUFFLGdCQUFnQjtLQUNqQyxDQUFDLENBQUM7SUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDN0MsQ0FBQyJ9