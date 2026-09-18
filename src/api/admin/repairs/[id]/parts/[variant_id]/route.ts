import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { removeRepairPartWorkflow } from "../../../../../../workflows/remove-repair-part-workflow";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import RepairModuleService from "../../../../../../modules/repair/service";
import { REPAIR_MODULE } from "../../../../../../modules/repair";

// DELETE /admin/repairs/:id/parts/:variant_id
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  // We need to fetch the price before we remove it, or just fetch it independently since removing the link doesn't delete the variant
  let deductCost = 0;
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "prices.*"],
      filters: { id: [req.params.variant_id] },
    });
    
    if (variants && variants.length > 0 && variants[0].prices && variants[0].prices.length > 0) {
      deductCost = Number(variants[0].prices[0].amount);
    }
  } catch (err) {
    console.error("Failed to fetch variant price for deduction", err);
  }

  const { result } = await removeRepairPartWorkflow(req.scope).run({
    input: {
      repair_ticket_id: req.params.id,
      variant_id: req.params.variant_id,
    },
  });

  if (deductCost > 0) {
    try {
      const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);
      const ticket = await repairService.retrieveRepairTicket(req.params.id);
      
      const currentPartsEstimate =
        typeof ticket.parts_estimate === "object" && ticket.parts_estimate !== null && "value" in ticket.parts_estimate
          ? Number((ticket.parts_estimate as any).value)
          : Number(ticket.parts_estimate);
      const currentLaborEstimate =
        typeof ticket.labor_estimate === "object" && ticket.labor_estimate !== null && "value" in ticket.labor_estimate
          ? Number((ticket.labor_estimate as any).value)
          : Number(ticket.labor_estimate);

      const updatedPartsEstimate = Math.max(0, currentPartsEstimate - deductCost);
      
      let newTotalEstimate = updatedPartsEstimate + currentLaborEstimate;
      if ((ticket as any).apply_tax) {
        newTotalEstimate = newTotalEstimate * 1.16;
      }

      await repairService.updateRepairTickets({
        id: req.params.id,
        parts_estimate: updatedPartsEstimate,
        total_estimate: newTotalEstimate,
      });
    } catch (err) {
      console.error("Failed to update estimate from inventory part removal", err);
    }
  }

  res.json(result);
}
