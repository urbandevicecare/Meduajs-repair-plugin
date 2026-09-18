"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = DELETE;
const remove_repair_part_workflow_1 = require("../../../../../../workflows/remove-repair-part-workflow");
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../../../../../../modules/repair");
// DELETE /admin/repairs/:id/parts/:variant_id
async function DELETE(req, res) {
    // We need to fetch the price before we remove it, or just fetch it independently since removing the link doesn't delete the variant
    let deductCost = 0;
    try {
        const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
        const { data: variants } = await query.graph({
            entity: "product_variant",
            fields: ["id", "prices.*"],
            filters: { id: [req.params.variant_id] },
        });
        if (variants && variants.length > 0 && variants[0].prices && variants[0].prices.length > 0) {
            deductCost = Number(variants[0].prices[0].amount);
        }
    }
    catch (err) {
        console.error("Failed to fetch variant price for deduction", err);
    }
    const { result } = await (0, remove_repair_part_workflow_1.removeRepairPartWorkflow)(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
            variant_id: req.params.variant_id,
        },
    });
    if (deductCost > 0) {
        try {
            const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
            const ticket = await repairService.retrieveRepairTicket(req.params.id);
            const currentPartsEstimate = typeof ticket.parts_estimate === "object" && ticket.parts_estimate !== null && "value" in ticket.parts_estimate
                ? Number(ticket.parts_estimate.value)
                : Number(ticket.parts_estimate);
            const currentLaborEstimate = typeof ticket.labor_estimate === "object" && ticket.labor_estimate !== null && "value" in ticket.labor_estimate
                ? Number(ticket.labor_estimate.value)
                : Number(ticket.labor_estimate);
            const updatedPartsEstimate = Math.max(0, currentPartsEstimate - deductCost);
            let newTotalEstimate = updatedPartsEstimate + currentLaborEstimate;
            if (ticket.apply_tax) {
                newTotalEstimate = newTotalEstimate * 1.16;
            }
            await repairService.updateRepairTickets({
                id: req.params.id,
                parts_estimate: updatedPartsEstimate,
                total_estimate: newTotalEstimate,
            });
        }
        catch (err) {
            console.error("Failed to update estimate from inventory part removal", err);
        }
    }
    res.json(result);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9wYXJ0cy9bdmFyaWFudF9pZF0vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFPQSx3QkF5REM7QUEvREQseUdBQW1HO0FBQ25HLHFEQUFzRTtBQUV0RSw2REFBaUU7QUFFakUsOENBQThDO0FBQ3ZDLEtBQUssVUFBVSxNQUFNLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNsRSxvSUFBb0k7SUFDcEksSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLElBQUksQ0FBQztRQUNILE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQzNDLE1BQU0sRUFBRSxpQkFBaUI7WUFDekIsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQztZQUMxQixPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1NBQ3pDLENBQUMsQ0FBQztRQUVILElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDM0YsVUFBVSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkNBQTZDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUEsc0RBQXdCLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUMvRCxLQUFLLEVBQUU7WUFDTCxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDL0IsVUFBVSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVTtTQUNsQztLQUNGLENBQUMsQ0FBQztJQUVILElBQUksVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQztZQUNILE1BQU0sYUFBYSxHQUF3QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7WUFDNUUsTUFBTSxNQUFNLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUV2RSxNQUFNLG9CQUFvQixHQUN4QixPQUFPLE1BQU0sQ0FBQyxjQUFjLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxjQUFjLEtBQUssSUFBSSxJQUFJLE9BQU8sSUFBSSxNQUFNLENBQUMsY0FBYztnQkFDN0csQ0FBQyxDQUFDLE1BQU0sQ0FBRSxNQUFNLENBQUMsY0FBc0IsQ0FBQyxLQUFLLENBQUM7Z0JBQzlDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sb0JBQW9CLEdBQ3hCLE9BQU8sTUFBTSxDQUFDLGNBQWMsS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLGNBQWMsS0FBSyxJQUFJLElBQUksT0FBTyxJQUFJLE1BQU0sQ0FBQyxjQUFjO2dCQUM3RyxDQUFDLENBQUMsTUFBTSxDQUFFLE1BQU0sQ0FBQyxjQUFzQixDQUFDLEtBQUssQ0FBQztnQkFDOUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFcEMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxvQkFBb0IsR0FBRyxVQUFVLENBQUMsQ0FBQztZQUU1RSxJQUFJLGdCQUFnQixHQUFHLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDO1lBQ25FLElBQUssTUFBYyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM5QixnQkFBZ0IsR0FBRyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDN0MsQ0FBQztZQUVELE1BQU0sYUFBYSxDQUFDLG1CQUFtQixDQUFDO2dCQUN0QyxFQUFFLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNqQixjQUFjLEVBQUUsb0JBQW9CO2dCQUNwQyxjQUFjLEVBQUUsZ0JBQWdCO2FBQ2pDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyx1REFBdUQsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM5RSxDQUFDO0lBQ0gsQ0FBQztJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkIsQ0FBQyJ9