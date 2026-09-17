import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
} from "@medusajs/framework/utils";

type SyncRepairInventoryInput = {
  repair_ticket_id: string;
  status: string;
};

export const syncRepairInventoryStep = createStep(
  "sync-repair-inventory",
  async (input: SyncRepairInventoryInput, { container }) => {
    const inventoryModule = container.resolve(
      ModuleRegistrationName.INVENTORY,
      { allowUnregistered: true },
    ) as any;

    if (!inventoryModule) {
      return new StepResponse({ success: false }, { status: "", reservations: [] as any[] });
    }

    if (
      input.status !== "completed" &&
      input.status !== "cancelled" &&
      input.status !== "refunded"
    ) {
      return new StepResponse({ success: true, skipped: true }, { status: "", reservations: [] as any[] });
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    
    let variantIds: string[] = [];
    try {
      const { data: ticketWithParts } = await query.graph({
        entity: "repair_ticket",
        fields: ["product_variants.*"],
        filters: { id: [input.repair_ticket_id] },
      });
      const variants = ticketWithParts?.[0]?.product_variants || [];
      variantIds = variants.map((v: any) => v.id);
    } catch (e) {
      try {
        const { data: ticketWithParts } = await query.graph({
          entity: "repair_ticket",
          fields: ["product_variant.*"],
          filters: { id: [input.repair_ticket_id] },
        });
        const variants = ticketWithParts?.[0]?.product_variant || [];
        variantIds = variants.map((v: any) => v.id);
      } catch (e2) {}
    }

    if (!variantIds.length) {
      return new StepResponse({ success: true, skipped: true }, { status: "", reservations: [] as any[] });
    }

    const lineItemIds = variantIds.map(vId => `repair_${input.repair_ticket_id}_${vId}`);

    let reservations: any[] = [];
    try {
      const [res] = await inventoryModule.listAndCountReservationItems({
        line_item_id: lineItemIds,
      });
      reservations = res || [];
    } catch (e) {}

    if (!reservations.length) {
      return new StepResponse({ success: true, skipped: true }, { status: "", reservations: [] as any[] });
    }

    const reservationIdsToDelete = reservations.map(r => r.id);

    if (input.status === "completed") {
      for (const res of reservations) {
        await inventoryModule.adjustInventory(
          res.inventory_item_id,
          res.location_id,
          -res.quantity
        );
      }
    }

    await inventoryModule.deleteReservationItems(reservationIdsToDelete);

    return new StepResponse({ success: true, processed: true }, {
      status: input.status,
      reservations,
    });
  },
  async (compensationData, { container }) => {
    if (!compensationData) return;
    
    const inventoryModule = container.resolve(
      ModuleRegistrationName.INVENTORY,
      { allowUnregistered: true },
    ) as any;

    if (!inventoryModule || !compensationData.reservations?.length) return;

    if (compensationData.status === "completed") {
      for (const res of compensationData.reservations) {
        await inventoryModule.adjustInventory(
          res.inventory_item_id,
          res.location_id,
          res.quantity 
        );
      }
    }

    const reservationsToCreate = compensationData.reservations.map((r: any) => ({
      line_item_id: r.line_item_id,
      inventory_item_id: r.inventory_item_id,
      location_id: r.location_id,
      quantity: r.quantity,
      metadata: r.metadata,
    }));

    await inventoryModule.createReservationItems(reservationsToCreate);
  },
);
