import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { approveRepairCostWorkflow } from "../../../../../workflows/approve-repair-cost-workflow";

// POST /admin/repairs/:id/approve - Manually approve repair cost and consent
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
) {
  const { result } = await approveRepairCostWorkflow(req.scope).run({
    input: {
      repair_ticket_id: req.params.id,
    },
  });

  res.json({
    repair_ticket: result.repairTicket,
    order: result.order,
  });
}
