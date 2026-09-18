"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const reject_repair_cost_workflow_1 = require("../../../../../workflows/reject-repair-cost-workflow");
const repair_1 = require("../../../../../modules/repair");
// POST /store/repairs/:id/reject
async function POST(req, res) {
    // We can do validation here, like checking if it's already approved or cancelled
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    const ticket = await repairService.retrieveRepairTicket(req.params.id);
    if (ticket.status === "cancelled") {
        return res.status(400).json({ message: "Ticket is already cancelled" });
    }
    const { result } = await (0, reject_repair_cost_workflow_1.rejectRepairCostWorkflow)(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
        },
    });
    res.json({
        repair_ticket: result.repairTicket,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvW2lkXS9yZWplY3Qvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFNQSxvQkFxQkM7QUExQkQsc0dBQWdHO0FBQ2hHLDBEQUE4RDtBQUc5RCxpQ0FBaUM7QUFDMUIsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsaUZBQWlGO0lBQ2pGLE1BQU0sYUFBYSxHQUF3QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDNUUsTUFBTSxNQUFNLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUV2RSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssV0FBVyxFQUFFLENBQUM7UUFDbEMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUEsc0RBQXdCLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUMvRCxLQUFLLEVBQUU7WUFDTCxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7U0FDaEM7S0FDRixDQUFDLENBQUM7SUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ1AsYUFBYSxFQUFFLE1BQU0sQ0FBQyxZQUFZO0tBQ25DLENBQUMsQ0FBQztBQUNMLENBQUMifQ==