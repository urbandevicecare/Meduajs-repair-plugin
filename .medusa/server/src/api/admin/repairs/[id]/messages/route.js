"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const add_repair_update_1 = require("../../../../../workflows/steps/add-repair-update");
const addRepairUpdateWorkflow = (0, workflows_sdk_1.createWorkflow)("add-repair-update-workflow", function (input) {
    const update = (0, add_repair_update_1.addRepairUpdateStep)(input);
    return new workflows_sdk_1.WorkflowResponse({ update });
});
// POST /admin/repairs/:id/messages - Add message to repair chat
async function POST(req, res) {
    const { message } = req.validatedBody;
    const userId = req.auth_context?.actor_id;
    const { result } = await addRepairUpdateWorkflow(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
            message,
            author_id: userId,
            author_type: "user",
        },
    });
    res.json({
        update: result.update,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9tZXNzYWdlcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXNCQSxvQkFxQkM7QUF6Q0QscUVBRzJDO0FBQzNDLHdGQUF1RjtBQUV2RixNQUFNLHVCQUF1QixHQUFHLElBQUEsOEJBQWMsRUFDNUMsNEJBQTRCLEVBQzVCLFVBQVUsS0FLVDtJQUNDLE1BQU0sTUFBTSxHQUFHLElBQUEsdUNBQW1CLEVBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUMsT0FBTyxJQUFJLGdDQUFnQixDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUMxQyxDQUFDLENBQ0YsQ0FBQztBQUVGLGdFQUFnRTtBQUN6RCxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUVFLEVBQ0YsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUM7SUFDdEMsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7SUFFMUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sdUJBQXVCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM5RCxLQUFLLEVBQUU7WUFDTCxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDL0IsT0FBTztZQUNQLFNBQVMsRUFBRSxNQUFNO1lBQ2pCLFdBQVcsRUFBRSxNQUFNO1NBQ3BCO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNQLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtLQUN0QixDQUFDLENBQUM7QUFDTCxDQUFDIn0=