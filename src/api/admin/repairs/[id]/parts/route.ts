import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { addRepairPartsWorkflow } from "../../../../../workflows/add-repair-parts-workflow";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import RepairModuleService from "../../../../../modules/repair/service";
import { REPAIR_MODULE } from "../../../../../modules/repair";

// POST /admin/repairs/:id/parts - Add parts to repair ticket
export async function POST(
  req: MedusaRequest<{
    variant_ids: string[];
  }>,
  res: MedusaResponse,
) {
  const { variant_ids } = req.validatedBody;

  const { result } = await addRepairPartsWorkflow(req.scope).run({
    input: {
      repair_ticket_id: req.params.id,
      variant_ids,
    },
  });

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);

    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "prices.*"],
      filters: { id: variant_ids },
    });

    let additionalCost = 0;
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        if (variant.prices && variant.prices.length > 0) {
          additionalCost += Number(variant.prices[0].amount);
        }
      }
    }

    if (additionalCost > 0) {
      const ticket = await repairService.retrieveRepairTicket(req.params.id);
      const currentPartsEstimate =
        typeof ticket.parts_estimate === "object" && ticket.parts_estimate !== null && "value" in ticket.parts_estimate
          ? Number((ticket.parts_estimate as any).value)
          : Number(ticket.parts_estimate);
      const currentLaborEstimate =
        typeof ticket.labor_estimate === "object" &&
        ticket.labor_estimate !== null &&
        "value" in ticket.labor_estimate
          ? Number((ticket.labor_estimate as any).value)
          : Number(ticket.labor_estimate);

      const updatedPartsEstimate = currentPartsEstimate + additionalCost;

      let newTotalEstimate = updatedPartsEstimate + currentLaborEstimate;
      if ((ticket as any).apply_tax) {
        newTotalEstimate = newTotalEstimate * 1.16;
      }

      await repairService.updateRepairTickets({
        id: req.params.id,
        parts_estimate: updatedPartsEstimate,
        total_estimate: newTotalEstimate,
      });
    }
  } catch (err) {
    console.error("Failed to update estimate from inventory part addition", err);
  }

  res.json(result);
}
