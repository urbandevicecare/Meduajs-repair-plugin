"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const add_repair_note_1 = require("../../../../../workflows/steps/add-repair-note");
const addRepairNoteWorkflow = (0, workflows_sdk_1.createWorkflow)("add-repair-note-workflow", function (input) {
    const note = (0, add_repair_note_1.addRepairNoteStep)(input);
    return new workflows_sdk_1.WorkflowResponse({ note });
});
// POST /admin/repairs/:id/notes - Add note to repair ticket
async function POST(req, res) {
    const { content, is_internal } = req.validatedBody;
    const userId = req.auth_context?.actor_id;
    const { result } = await addRepairNoteWorkflow(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
            content,
            is_internal,
            author_id: userId,
            author_type: "user",
        },
    });
    res.json({
        note: result.note,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9ub3Rlcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXVCQSxvQkF1QkM7QUE1Q0QscUVBRzJDO0FBQzNDLG9GQUFtRjtBQUVuRixNQUFNLHFCQUFxQixHQUFHLElBQUEsOEJBQWMsRUFDMUMsMEJBQTBCLEVBQzFCLFVBQVUsS0FNVDtJQUNDLE1BQU0sSUFBSSxHQUFHLElBQUEsbUNBQWlCLEVBQUMsS0FBSyxDQUFDLENBQUM7SUFDdEMsT0FBTyxJQUFJLGdDQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQ0YsQ0FBQztBQUVGLDREQUE0RDtBQUNyRCxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUdFLEVBQ0YsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDO0lBQ25ELE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDO0lBRTFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDNUQsS0FBSyxFQUFFO1lBQ0wsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQy9CLE9BQU87WUFDUCxXQUFXO1lBQ1gsU0FBUyxFQUFFLE1BQU07WUFDakIsV0FBVyxFQUFFLE1BQU07U0FDcEI7S0FDRixDQUFDLENBQUM7SUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ1AsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO0tBQ2xCLENBQUMsQ0FBQztBQUNMLENBQUMifQ==