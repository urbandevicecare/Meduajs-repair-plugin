"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const add_repair_update_1 = require("../../../../../workflows/steps/add-repair-update");
const addRepairUpdateWorkflow = (0, workflows_sdk_1.createWorkflow)("add-repair-update-workflow-store", function (input) {
    const update = (0, add_repair_update_1.addRepairUpdateStep)(input);
    return new workflows_sdk_1.WorkflowResponse({ update });
});
// GET /store/repairs/:id/messages - Get messages for repair
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const customerId = req.auth_context?.actor_id;
    // Fetch the ticket to verify ownership
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: ["id", "customer_id"],
        filters: { id: req.params.id },
    });
    if (!tickets || tickets.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Repair ticket not found");
    }
    const ticket = tickets[0];
    // Restrict to customer who owns the ticket (if customer_id is set)
    if (ticket.customer_id && ticket.customer_id !== customerId) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, "Unauthorized to view these messages");
    }
    const { data } = await query.graph({
        entity: "repair_update",
        fields: ["*"],
        filters: { repair_ticket_id: req.params.id },
    });
    res.json({
        messages: data || [],
    });
}
// POST /store/repairs/:id/messages - Send message to repair chat
async function POST(req, res) {
    const { message, token } = req.validatedBody;
    const customerId = req.auth_context?.actor_id;
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    // Fetch the ticket to verify ownership or token validity
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: ["id", "customer_id", "approval_token"],
        filters: { id: req.params.id },
    });
    if (!tickets || tickets.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Repair ticket not found");
    }
    const ticket = tickets[0];
    let isAuthorized = false;
    // Check if authenticated as the correct customer
    if (customerId && ticket.customer_id === customerId) {
        isAuthorized = true;
    }
    // Check if token matches
    if (!isAuthorized && token && ticket.approval_token === token) {
        isAuthorized = true;
    }
    // If ticket has no customer AND no token was provided, it might be an anonymous ticket.
    // We'll allow it if customer_id is null, but ideally all tickets belong to a customer.
    if (!isAuthorized && !ticket.customer_id && !token) {
        isAuthorized = true;
    }
    if (!isAuthorized) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, "Unauthorized to post messages");
    }
    const { result } = await addRepairUpdateWorkflow(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
            message,
            author_id: customerId,
            author_type: "customer",
        },
    });
    res.json({
        update: result.update,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvW2lkXS9tZXNzYWdlcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTBCQSxrQkF3Q0M7QUFHRCxvQkErREM7QUFsSUQscURBR21DO0FBQ25DLHFFQUcyQztBQUMzQyx3RkFBdUY7QUFFdkYsTUFBTSx1QkFBdUIsR0FBRyxJQUFBLDhCQUFjLEVBQzVDLGtDQUFrQyxFQUNsQyxVQUFVLEtBS1Q7SUFDQyxNQUFNLE1BQU0sR0FBRyxJQUFBLHVDQUFtQixFQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLE9BQU8sSUFBSSxnQ0FBZ0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQyxDQUNGLENBQUM7QUFFRiw0REFBNEQ7QUFDckQsS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBK0MsRUFDL0MsR0FBbUI7SUFFbkIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakUsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7SUFFOUMsdUNBQXVDO0lBQ3ZDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUM7UUFDN0IsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFO0tBQy9CLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQyxNQUFNLElBQUksbUJBQVcsQ0FDbkIs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