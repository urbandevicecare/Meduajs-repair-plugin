import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REPAIR_MODULE } from "../../../../../../modules/repair";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
) {
  const repairService: any = req.scope.resolve(REPAIR_MODULE);
  
  const updates = await repairService.listRepairUpdates({
    repair_ticket_id: req.params.id,
    author_type: "customer",
    is_read: false
  });

  if (updates.length > 0) {
    await repairService.updateRepairUpdates(
      updates.map(u => ({ id: u.id, is_read: true }))
    );
  }

  res.json({ success: true });
}
