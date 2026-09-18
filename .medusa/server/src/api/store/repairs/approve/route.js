"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../../../../modules/repair");
const approve_repair_cost_workflow_1 = require("../../../../workflows/approve-repair-cost-workflow");
// POST /store/repairs/approve
async function POST(req, res) {
    const { token, approved } = req.body;
    if (!token) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Token is required");
    }
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: ["*", "device.*"],
        filters: { approval_token: token },
    });
    if (!tickets || tickets.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Invalid approval token");
    }
    const ticket = tickets[0];
    // Only allow approval if it's in a state that requires approval
    if (ticket.status !== "awaiting_approval") {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Ticket is not awaiting approval");
    }
    const isApproved = approved ?? true;
    if (!isApproved) {
        const { rejectRepairCostWorkflow } = await import("../../../../workflows/reject-repair-cost-workflow.js");
        const { result } = await rejectRepairCostWorkflow(req.scope).run({
            input: { repair_ticket_id: ticket.id },
        });
        res.json({ ticket: result.repairTicket, message: "Repair declined. Ticket cancelled." });
        return;
    }
    // Use workflow for approval
    const { result } = await (0, approve_repair_cost_workflow_1.approveRepairCostWorkflow)(req.scope).run({
        input: {
            repair_ticket_id: ticket.id,
        },
    });
    res.json({ ticket: result.repairTicket, message: "Repair cost approved successfully." });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvYXBwcm92ZS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVVBLG9CQXVEQztBQWhFRCxxREFHbUM7QUFDbkMsdURBQTJEO0FBRTNELHFHQUErRjtBQUUvRiw4QkFBOEI7QUFDdkIsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBd0QsRUFDeEQsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0lBRXJDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNYLE1BQU0sSUFBSSxtQkFBVyxDQUFDLG1CQUFXLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRSxNQUFNLGFBQWEsR0FBd0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBRTVFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUM7UUFDekIsT0FBTyxFQUFFLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRTtLQUNuQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDckMsTUFBTSxJQUFJLG1CQUFXLENBQ25CLG1CQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFDM0Isd0JBQXdCLENBQ3pCLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTFCLGdFQUFnRTtJQUNoRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssbUJBQW1CLEVBQUUsQ0FBQztRQUMxQyxNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUM3QixpQ0FBaUMsQ0FDbEMsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRyxRQUFRLElBQUksSUFBSSxDQUFDO0lBRXBDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoQixNQUFNLEVBQUUsd0JBQXdCLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxzREFBNkQsQ0FBQyxDQUFDO1FBQ2pILE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDL0QsS0FBSyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRTtTQUN2QyxDQUFDLENBQUM7UUFDSCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLENBQUMsQ0FBQztRQUN6RixPQUFPO0lBQ1QsQ0FBQztJQUVELDRCQUE0QjtJQUM1QixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFBLHdEQUF5QixFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDaEUsS0FBSyxFQUFFO1lBQ0wsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLEVBQUU7U0FDNUI7S0FDRixDQUFDLENBQUM7SUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLENBQUMsQ0FBQztBQUMzRixDQUFDIn0=