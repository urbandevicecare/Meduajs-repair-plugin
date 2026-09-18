"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const create_repair_ticket_workflow_1 = require("../../../workflows/create-repair-ticket-workflow");
const utils_1 = require("@medusajs/framework/utils");
// GET /admin/repairs - List all repair tickets
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const filters = req.filterableFields || {};
    if (req.query.customer_id) {
        filters.customer_id = req.query.customer_id;
    }
    const { data, metadata } = await query.graph({
        entity: "repair_ticket",
        fields: ["*", "device.*", "media.*", "notes.*", "updates.*"],
        filters: filters,
        pagination: { ...req.queryConfig?.pagination, order: { created_at: "DESC" } },
    });
    res.json({
        repair_tickets: data,
        ...metadata,
    });
}
// POST /admin/repairs - Create a new repair ticket
async function POST(req, res) {
    const { device, ticket } = req.validatedBody;
    const { result } = await (0, create_repair_ticket_workflow_1.createRepairTicketWorkflow)(req.scope).run({
        input: {
            device,
            ticket,
        },
    });
    res.json({
        repair_ticket: result.repairTicket,
        device: result.device,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSxrQkFtQkM7QUFHRCxvQkFvQkM7QUE5Q0Qsb0dBQThGO0FBQzlGLHFEQUFzRTtBQUV0RSwrQ0FBK0M7QUFDeEMsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWpFLE1BQU0sT0FBTyxHQUFRLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFLENBQUM7SUFDaEQsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFDOUMsQ0FBQztJQUVELE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzNDLE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUM7UUFDNUQsT0FBTyxFQUFFLE9BQU87UUFDaEIsVUFBVSxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUU7S0FDOUUsQ0FBQyxDQUFDO0lBRUgsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNQLGNBQWMsRUFBRSxJQUFJO1FBQ3BCLEdBQUcsUUFBUTtLQUNaLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxtREFBbUQ7QUFDNUMsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FHRSxFQUNGLEdBQW1CO0lBRW5CLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQztJQUU3QyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFBLDBEQUEwQixFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDakUsS0FBSyxFQUFFO1lBQ0wsTUFBTTtZQUNOLE1BQU07U0FDUDtLQUNGLENBQUMsQ0FBQztJQUVILEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDUCxhQUFhLEVBQUUsTUFBTSxDQUFDLFlBQVk7UUFDbEMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNO0tBQ3RCLENBQUMsQ0FBQztBQUNMLENBQUMifQ==