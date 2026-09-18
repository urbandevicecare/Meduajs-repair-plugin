"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const add_repair_parts_workflow_1 = require("../../../../../workflows/add-repair-parts-workflow");
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../../../../../modules/repair");
// POST /admin/repairs/:id/parts - Add parts to repair ticket
async function POST(req, res) {
    const { variant_ids } = req.validatedBody;
    const { result } = await (0, add_repair_parts_workflow_1.addRepairPartsWorkflow)(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
            variant_ids,
        },
    });
    try {
        const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
        const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
        const { data: variants } = await query.graph({
            entity: "product_variant",
            fields: ["id", "prices.*"],
            filters: { id: variant_ids },
        });
        let additionalCost = 0;
        if (variants && variants.length > 0) {
            for (const variant of variants) {
                if (variant.prices && variant.prices.length > 0) {
                    additionalCost += Number(variant.prices[0].amount);
                }
            }
        }
        if (additionalCost > 0) {
            const ticket = await repairService.retrieveRepairTicket(req.params.id);
            const currentPartsEstimate = typeof ticket.parts_estimate === "object" && ticket.parts_estimate !== null && "value" in ticket.parts_estimate
                ? Number(ticket.parts_estimate.value)
                : Number(ticket.parts_estimate);
            const currentLaborEstimate = typeof ticket.labor_estimate === "object" &&
                ticket.labor_estimate !== null &&
                "value" in ticket.labor_estimate
                ? Number(ticket.labor_estimate.value)
                : Number(ticket.labor_estimate);
            const updatedPartsEstimate = currentPartsEstimate + additionalCost;
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
    }
    catch (err) {
        console.error("Failed to update estimate from inventory part addition", err);
    }
    res.json(result);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9wYXJ0cy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU9BLG9CQWlFQztBQXZFRCxrR0FBNEY7QUFDNUYscURBQXNFO0FBRXRFLDBEQUE4RDtBQUU5RCw2REFBNkQ7QUFDdEQsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FFRSxFQUNGLEdBQW1CO0lBRW5CLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDO0lBRTFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUEsa0RBQXNCLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM3RCxLQUFLLEVBQUU7WUFDTCxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDL0IsV0FBVztTQUNaO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDO1FBQ0gsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakUsTUFBTSxhQUFhLEdBQXdCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztRQUU1RSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMzQyxNQUFNLEVBQUUsaUJBQWlCO1lBQ3pCLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUM7WUFDMUIsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRTtTQUM3QixDQUFDLENBQUM7UUFFSCxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNwQyxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUMvQixJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ2hELGNBQWMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDckQsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxjQUFjLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDdkIsTUFBTSxNQUFNLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2RSxNQUFNLG9CQUFvQixHQUN4QixPQUFPLE1BQU0sQ0FBQyxjQUFjLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxjQUFjLEtBQUssSUFBSSxJQUFJLE9BQU8sSUFBSSxNQUFNLENBQUMsY0FBYztnQkFDN0csQ0FBQyxDQUFDLE1BQU0sQ0FBRSxNQUFNLENBQUMsY0FBc0IsQ0FBQyxLQUFLLENBQUM7Z0JBQzlDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sb0JBQW9CLEdBQ3hCLE9BQU8sTUFBTSxDQUFDLGNBQWMsS0FBSyxRQUFRO2dCQUN6QyxNQUFNLENBQUMsY0FBYyxLQUFLLElBQUk7Z0JBQzlCLE9BQU8sSUFBSSxNQUFNLENBQUMsY0FBYztnQkFDOUIsQ0FBQyxDQUFDLE1BQU0sQ0FBRSxNQUFNLENBQUMsY0FBc0IsQ0FBQyxLQUFLLENBQUM7Z0JBQzlDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRXBDLE1BQU0sb0JBQW9CLEdBQUcsb0JBQW9CLEdBQUcsY0FBYyxDQUFDO1lBRW5FLElBQUksZ0JBQWdCLEdBQUcsb0JBQW9CLEdBQUcsb0JBQW9CLENBQUM7WUFDbkUsSUFBSyxNQUFjLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzlCLGdCQUFnQixHQUFHLGdCQUFnQixHQUFHLElBQUksQ0FBQztZQUM3QyxDQUFDO1lBRUQsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUM7Z0JBQ3RDLEVBQUUsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2pCLGNBQWMsRUFBRSxvQkFBb0I7Z0JBQ3BDLGNBQWMsRUFBRSxnQkFBZ0I7YUFDakMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyx3REFBd0QsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQixDQUFDIn0=