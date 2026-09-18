"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRepairInventoryStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.syncRepairInventoryStep = (0, workflows_sdk_1.createStep)("sync-repair-inventory", async (input, { container }) => {
    const inventoryModule = container.resolve(utils_1.ModuleRegistrationName.INVENTORY, { allowUnregistered: true });
    if (!inventoryModule) {
        return new workflows_sdk_1.StepResponse({ success: false }, { status: "", reservations: [] });
    }
    if (input.status !== "completed" &&
        input.status !== "cancelled" &&
        input.status !== "refunded") {
        return new workflows_sdk_1.StepResponse({ success: true, skipped: true }, { status: "", reservations: [] });
    }
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    let variantIds = [];
    try {
        const { data: ticketWithParts } = await query.graph({
            entity: "repair_ticket",
            fields: ["product_variants.*"],
            filters: { id: [input.repair_ticket_id] },
        });
        const variants = ticketWithParts?.[0]?.product_variants || [];
        variantIds = variants.map((v) => v.id);
    }
    catch (e) {
        try {
            const { data: ticketWithParts } = await query.graph({
                entity: "repair_ticket",
                fields: ["product_variant.*"],
                filters: { id: [input.repair_ticket_id] },
            });
            const variants = ticketWithParts?.[0]?.product_variant || [];
            variantIds = variants.map((v) => v.id);
        }
        catch (e2) { }
    }
    if (!variantIds.length) {
        return new workflows_sdk_1.StepResponse({ success: true, skipped: true }, { status: "", reservations: [] });
    }
    const lineItemIds = variantIds.map(vId => `repair_${input.repair_ticket_id}_${vId}`);
    let reservations = [];
    try {
        const [res] = await inventoryModule.listAndCountReservationItems({
            line_item_id: lineItemIds,
        });
        reservations = res || [];
    }
    catch (e) { }
    if (!reservations.length) {
        return new workflows_sdk_1.StepResponse({ success: true, skipped: true }, { status: "", reservations: [] });
    }
    const reservationIdsToDelete = reservations.map(r => r.id);
    if (input.status === "completed") {
        for (const res of reservations) {
            await inventoryModule.adjustInventory(res.inventory_item_id, res.location_id, -res.quantity);
        }
    }
    await inventoryModule.deleteReservationItems(reservationIdsToDelete);
    return new workflows_sdk_1.StepResponse({ success: true, processed: true }, {
        status: input.status,
        reservations,
    });
}, async (compensationData, { container }) => {
    if (!compensationData)
        return;
    const inventoryModule = container.resolve(utils_1.ModuleRegistrationName.INVENTORY, { allowUnregistered: true });
    if (!inventoryModule || !compensationData.reservations?.length)
        return;
    if (compensationData.status === "completed") {
        for (const res of compensationData.reservations) {
            await inventoryModule.adjustInventory(res.inventory_item_id, res.location_id, res.quantity);
        }
    }
    const reservationsToCreate = compensationData.reservations.map((r) => ({
        line_item_id: r.line_item_id,
        inventory_item_id: r.inventory_item_id,
        location_id: r.location_id,
        quantity: r.quantity,
        metadata: r.metadata,
    }));
    await inventoryModule.createReservationItems(reservationsToCreate);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1yZXBhaXItaW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9zdGVwcy9zeW5jLXJlcGFpci1pbnZlbnRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBQTZFO0FBQzdFLHFEQUdtQztBQU90QixRQUFBLHVCQUF1QixHQUFHLElBQUEsMEJBQVUsRUFDL0MsdUJBQXVCLEVBQ3ZCLEtBQUssRUFBRSxLQUErQixFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtJQUN2RCxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUN2Qyw4QkFBc0IsQ0FBQyxTQUFTLEVBQ2hDLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQ3JCLENBQUM7SUFFVCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDckIsT0FBTyxJQUFJLDRCQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFRCxJQUNFLEtBQUssQ0FBQyxNQUFNLEtBQUssV0FBVztRQUM1QixLQUFLLENBQUMsTUFBTSxLQUFLLFdBQVc7UUFDNUIsS0FBSyxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQzNCLENBQUM7UUFDRCxPQUFPLElBQUksNEJBQVksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBVyxFQUFFLENBQUMsQ0FBQztJQUN2RyxDQUFDO0lBRUQsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVqRSxJQUFJLFVBQVUsR0FBYSxFQUFFLENBQUM7SUFDOUIsSUFB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