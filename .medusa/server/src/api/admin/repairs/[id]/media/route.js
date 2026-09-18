"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const add_repair_media_1 = require("../../../../../workflows/steps/add-repair-media");
const addRepairMediaWorkflow = (0, workflows_sdk_1.createWorkflow)("add-repair-media-workflow", function (input) {
    const media = (0, add_repair_media_1.addRepairMediaStep)(input);
    return new workflows_sdk_1.WorkflowResponse({ media });
});
// POST /admin/repairs/:id/media - Add media to repair ticket
async function POST(req, res) {
    const { file_url, file_name, file_type, mime_type, file_size, description } = req.validatedBody;
    const { result } = await addRepairMediaWorkflow(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
            file_url,
            file_name,
            file_type,
            mime_type,
            file_size,
            description,
        },
    });
    res.json({
        media: result.media,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9tZWRpYS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXdCQSxvQkE2QkM7QUFwREQscUVBRzJDO0FBQzNDLHNGQUFxRjtBQUVyRixNQUFNLHNCQUFzQixHQUFHLElBQUEsOEJBQWMsRUFDM0MsMkJBQTJCLEVBQzNCLFVBQVUsS0FRVDtJQUNDLE1BQU0sS0FBSyxHQUFHLElBQUEscUNBQWtCLEVBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEMsT0FBTyxJQUFJLGdDQUFnQixDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUN6QyxDQUFDLENBQ0YsQ0FBQztBQUVGLDZEQUE2RDtBQUN0RCxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQU9FLEVBQ0YsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLEdBQ3pFLEdBQUcsQ0FBQyxhQUFhLENBQUM7SUFFcEIsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sc0JBQXNCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM3RCxLQUFLLEVBQUU7WUFDTCxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDL0IsUUFBUTtZQUNSLFNBQVM7WUFDVCxTQUFTO1lBQ1QsU0FBUztZQUNULFNBQVM7WUFDVCxXQUFXO1NBQ1o7S0FDRixDQUFDLENBQUM7SUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ1AsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO0tBQ3BCLENBQUMsQ0FBQztBQUNMLENBQUMifQ==