"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const update_repair_status_workflow_1 = require("../../../../../workflows/update-repair-status-workflow");
// POST /admin/repairs/:id/status - Update repair status
async function POST(req, res) {
    const { status, estimated_completion, previous_status } = req.validatedBody;
    const { result } = await (0, update_repair_status_workflow_1.updateRepairStatusWorkflow)(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
            status,
            estimated_completion: estimated_completion
                ? new Date(estimated_completion)
                : undefined,
            previous_status,
        },
    });
    res.json({
        repair_ticket: result.repairTicket,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9zdGF0dXMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxvQkErQkM7QUFsQ0QsMEdBQW9HO0FBRXBHLHdEQUF3RDtBQUNqRCxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQVdFLEVBQ0YsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxlQUFlLEVBQUUsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDO0lBRTVFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUEsMERBQTBCLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNqRSxLQUFLLEVBQUU7WUFDTCxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDL0IsTUFBTTtZQUNOLG9CQUFvQixFQUFFLG9CQUFvQjtnQkFDeEMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDO2dCQUNoQyxDQUFDLENBQUMsU0FBUztZQUNiLGVBQWU7U0FDaEI7S0FDRixDQUFDLENBQUM7SUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ1AsYUFBYSxFQUFFLE1BQU0sQ0FBQyxZQUFZO0tBQ25DLENBQUMsQ0FBQztBQUNMLENBQUMifQ==