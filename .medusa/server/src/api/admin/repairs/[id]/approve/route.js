"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const approve_repair_cost_workflow_1 = require("../../../../../workflows/approve-repair-cost-workflow");
// POST /admin/repairs/:id/approve - Manually approve repair cost and consent
async function POST(req, res) {
    const { result } = await (0, approve_repair_cost_workflow_1.approveRepairCostWorkflow)(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
        },
    });
    res.json({
        repair_ticket: result.repairTicket,
        payment_collection: result.paymentCollection,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9hcHByb3ZlL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsb0JBY0M7QUFqQkQsd0dBQWtHO0FBRWxHLDZFQUE2RTtBQUN0RSxLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUFrQixFQUNsQixHQUFtQjtJQUVuQixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFBLHdEQUF5QixFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDaEUsS0FBSyxFQUFFO1lBQ0wsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1NBQ2hDO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNQLGFBQWEsRUFBRSxNQUFNLENBQUMsWUFBWTtRQUNsQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsaUJBQWlCO0tBQzdDLENBQUMsQ0FBQztBQUNMLENBQUMifQ==