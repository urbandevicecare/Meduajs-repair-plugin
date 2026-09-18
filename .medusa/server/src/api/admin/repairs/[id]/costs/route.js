"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const update_repair_costs_1 = require("../../../../../workflows/steps/update-repair-costs");
const updateRepairCostsWorkflow = (0, workflows_sdk_1.createWorkflow)("update-repair-costs-workflow", function (input) {
    const updatedTicket = (0, update_repair_costs_1.updateRepairCostsStep)(input);
    return new workflows_sdk_1.WorkflowResponse({ repairTicket: updatedTicket });
});
// POST /admin/repairs/:id/costs - Update repair costs
async function POST(req, res) {
    const { parts_estimate, labor_estimate, parts_actual, labor_actual } = req.validatedBody;
    const { result } = await updateRepairCostsWorkflow(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
            parts_estimate,
            labor_estimate,
            parts_actual,
            labor_actual,
        },
    });
    res.json({
        repair_ticket: result.repairTicket,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9jb3N0cy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXNCQSxvQkF5QkM7QUE5Q0QscUVBRzJDO0FBQzNDLDRGQUEyRjtBQUUzRixNQUFNLHlCQUF5QixHQUFHLElBQUEsOEJBQWMsRUFDOUMsOEJBQThCLEVBQzlCLFVBQVUsS0FNVDtJQUNDLE1BQU0sYUFBYSxHQUFHLElBQUEsMkNBQXFCLEVBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkQsT0FBTyxJQUFJLGdDQUFnQixDQUFDLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDL0QsQ0FBQyxDQUNGLENBQUM7QUFFRixzREFBc0Q7QUFDL0MsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FLRSxFQUNGLEdBQW1CO0lBRW5CLE1BQU0sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsR0FDbEUsR0FBRyxDQUFDLGFBQWEsQ0FBQztJQUVwQixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ2hFLEtBQUssRUFBRTtZQUNMLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMvQixjQUFjO1lBQ2QsY0FBYztZQUNkLFlBQVk7WUFDWixZQUFZO1NBQ2I7S0FDRixDQUFDLENBQUM7SUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ1AsYUFBYSxFQUFFLE1BQU0sQ0FBQyxZQUFZO0tBQ25DLENBQUMsQ0FBQztBQUNMLENBQUMifQ==