"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const approve_repair_cost_workflow_1 = require("../../../../../workflows/approve-repair-cost-workflow");
// POST /store/repairs/:id/approve - Approve repair cost
async function POST(req, res) {
    const { approved } = req.body;
    const isApproved = approved ?? true;
    const customerId = req.auth_context?.actor_id;
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    // Fetch the ticket to verify ownership
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: ["id", "customer_id", "status"],
        filters: { id: req.params.id },
    });
    if (!tickets || tickets.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Repair ticket not found");
    }
    const ticket = tickets[0];
    // Restrict to customer who owns the ticket
    if (ticket.customer_id && ticket.customer_id !== customerId) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, "Unauthorized to approve this repair");
    }
    else if (!ticket.customer_id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Cannot approve an anonymous ticket without a token");
    }
    // Only allow approval if it's in a state that requires approval
    if (ticket.status !== "awaiting_approval") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Ticket is not awaiting approval");
    }
    if (!isApproved) {
        const { rejectRepairCostWorkflow } = await import("../../../../../workflows/reject-repair-cost-workflow.js");
        const { result } = await rejectRepairCostWorkflow(req.scope).run({
            input: { repair_ticket_id: req.params.id },
        });
        res.json({
            repair_ticket: result.repairTicket,
            message: "Repair declined. Ticket cancelled.",
        });
        return;
    }
    // Use workflow for approval
    const { result } = await (0, approve_repair_cost_workflow_1.approveRepairCostWorkflow)(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
        },
    });
    res.json({
        repair_ticket: result.repairTicket,
        message: "Repair cost approved successfully. Work will begin shortly.",
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvW2lkXS9hcHByb3ZlL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBY0Esb0JBc0VDO0FBL0VELHFEQUdtQztBQUduQyx3R0FBa0c7QUFFbEcsd0RBQXdEO0FBQ2pELEtBQUssVUFBVSxJQUFJLENBQ3hCLEdBQStDLEVBQy9DLEdBQW1CO0lBRW5CLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBOEIsQ0FBQztJQUN4RCxNQUFNLFVBQVUsR0FBRyxRQUFRLElBQUksSUFBSSxDQUFDO0lBQ3BDLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDO0lBRTlDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWpFLHVDQUF1QztJQUN2QyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMxQyxNQUFNLEVBQUUsZUFBZTtRQUN2QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQztRQUN2QyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7S0FDL0IsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQzNCLHlCQUF5QixDQUMxQixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUxQiwyQ0FBMkM7SUFDM0MsSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDNUQsTUFBTSxJQUFJLG1CQUFXLENBQ25CLG1CQUFXLENBQUMsS0FBSyxDQUFDLFlBQVksRUFDOUIscUNBQXFDLENBQ3RDLENBQUM7SUFDSixDQUFDO1NBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUM3QixvREFBb0QsQ0FDckQsQ0FBQztJQUNKLENBQUM7SUFFRCxnRUFBZ0U7SUFDaEUsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLG1CQUFtQixFQUFFLENBQUM7UUFDMUMsTUFBTSxJQUFJLG1CQUFXLENBQ25CLG1CQUFXLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFDN0IsaUNBQWlDLENBQ2xDLENBQUM7SUFDSixDQUFDO0lBRUQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sRUFBRSx3QkFBd0IsRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLHlEQUFnRSxDQUFDLENBQUM7UUFDcEgsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sd0JBQXdCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUMvRCxLQUFLLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtTQUMzQyxDQUFDLENBQUM7UUFDSCxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ1AsYUFBYSxFQUFFLE1BQU0sQ0FBQyxZQUFZO1lBQ2xDLE9BQU8sRUFBRSxvQ0FBb0M7U0FDOUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTztJQUNULENBQUM7SUFFRCw0QkFBNEI7SUFDNUIsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBQSx3REFBeUIsRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ2hFLEtBQUssRUFBRTtZQUNMLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtTQUNoQztLQUNGLENBQUMsQ0FBQztJQUVILEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDUCxhQUFhLEVBQUUsTUFBTSxDQUFDLFlBQVk7UUFDbEMsT0FBTyxFQUFFLDZEQUE2RDtLQUN2RSxDQUFDLENBQUM7QUFDTCxDQUFDIn0=