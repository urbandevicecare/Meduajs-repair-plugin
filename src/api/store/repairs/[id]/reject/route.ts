import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { rejectRepairCostWorkflow } from "../../../../../workflows/reject-repair-cost-workflow";
import { REPAIR_MODULE } from "../../../../../modules/repair";
import RepairModuleService from "../../../../../modules/repair/service";

// POST /store/repairs/:id/reject
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
) {
  // We can do validation here, like checking if it's already approved or cancelled
  const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);
  const ticket = await repairService.retrieveRepairTicket(req.params.id);

  if (ticket.status === "cancelled") {
    return res.status(400).json({ message: "Ticket is already cancelled" });
  }

  const { result } = await rejectRepairCostWorkflow(req.scope).run({
    input: {
      repair_ticket_id: req.params.id,
    },
  });

  res.json({
    repair_ticket: result.repairTicket,
  });
}
