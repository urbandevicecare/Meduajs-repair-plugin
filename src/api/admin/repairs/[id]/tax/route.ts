import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REPAIR_MODULE } from "../../../../../modules/repair";
import RepairModuleService from "../../../../../modules/repair/service";

export async function POST(
  req: MedusaRequest<{ apply_tax: boolean }>,
  res: MedusaResponse
) {
  const { apply_tax } = req.body;
  const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);

  const ticket = await repairService.retrieveRepairTicket(req.params.id);

  const partsEstimate = Number(ticket.parts_estimate || 0);
  const laborEstimate = Number(ticket.labor_estimate || 0);
  
  let newTotal = partsEstimate + laborEstimate;
  if (apply_tax) {
    newTotal = newTotal * 1.16;
  }

  const updatedTicket = await repairService.updateRepairTickets({
    id: req.params.id,
    apply_tax,
    total_estimate: newTotal
  });

  res.json({ repair_ticket: updatedTicket });
}
