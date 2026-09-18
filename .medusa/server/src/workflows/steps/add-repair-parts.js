"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRepairPartsStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../../modules/repair");
exports.addRepairPartsStep = (0, workflows_sdk_1.createStep)("add-repair-parts", async (input, { container }) => {
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const inventoryModule = container.resolve(utils_1.ModuleRegistrationName.INVENTORY, { allowUnregistered: true });
    // Create links between repair ticket and product variants
    const linkData = input.variant_ids.map((variantId) => ({
        [repair_1.REPAIR_MODULE]: { repair_ticket_id: input.repair_ticket_id },
        [utils_1.ModuleRegistrationName.PRODUCT]: { product_variant_id: variantId },
    }));
    await link.create(linkData);
    const createdReservationIds = [];
    // Attempt to reserve stock if the inventory module is available
    if (inventoryModule) {
        const { data: variantsWithInventory } = await query.graph({
            entity: "product_variant",
            fields: [
                "id",
                "inventory_items.*",
                "inventory_items.inventory_item_id",
            ],
            filters: { id: input.variant_ids },
        });
        if (variantsWithInventory?.length) {
            for (const variant of variantsWithInventory) {
                if (variant.inventory_items?.length) {
                    for (const itemLink of variant.inventory_items) {
                        const [levels, count] = await inventoryModule.listAndCountInventoryLevels({
                            inventory_item_id: itemLink.inventory_item_id,
                        });
                        if (levels?.length) {
                            // Determine a location to deduct from (for simplicity we pick the first one with stock, or just the first one if none have stock but we assume first)
                            const levelToAdjust = levels.find((l) => l.stocked_quantity > 0) || levels[0];
                            const qtyToReserve = itemLink.required_quantity || 1;
                            const [reservation] = await inventoryModule.createReservationItems([
                                {
                                    line_item_id: `repair_${input.repair_ticket_id}_${variant.id}`, // We supply a placeholder for reservations identifying
                                    inventory_item_id: levelToAdjust.inventory_item_id,
                                    location_id: levelToAdjust.location_id,
                                    quantity: qtyToReserve,
                                    metadata: {
                                        repair_ticket_id: input.repair_ticket_id,
                                        variant_id: variant.id,
                                    },
                                },
                            ]);
                            createdReservationIds.push(reservation.id);
                        }
                    }
                }
            }
        }
    }
    let priceMetadata = {};
    // Fetch prices for the variants respecting customer price groups
    if (input.customer_id && input.region_id) {
        const { data: variantsWithPrices } = await query.graph({
            entity: "product_variant",
            fields: ["id", "calculated_price.*", "calculated_price.price_list.*"],
            filters: {
                id: input.variant_ids,
            },
            context: {
                region_id: input.region_id,
                customer_id: input.customer_id,
            },
        });
        // Store price data for display
        priceMetadata = variantsWithPrices?.reduce((acc, variant) => {
            acc[variant.id] = {
                calculated_price: variant.calculated_price?.calculated_amount,
                price_list_id: variant.calculated_price?.price_list?.id,
                price_list_name: variant.calculated_price?.price_list?.name,
            };
            return acc;
        }, {});
    }
    return new workflows_sdk_1.StepResponse({
        repair_ticket_id: input.repair_ticket_id,
        variant_ids: input.variant_ids,
        price_metadata: priceMetadata,
        created_reservations: createdReservationIds,
    }, { linkData, createdReservationIds });
}, async (compensationData, { container }) => {
    if (!compensationData)
        return;
    const { linkData, createdReservationIds } = compensationData;
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    if (linkData) {
        await link.dismiss(linkData);
    }
    // Rollback reservations
    const inventoryModule = container.resolve(utils_1.ModuleRegistrationName.INVENTORY, { allowUnregistered: true });
    if (inventoryModule && createdReservationIds?.length) {
        await inventoryModule.deleteReservationItems(createdReservationIds);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLXJlcGFpci1wYXJ0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy93b3JrZmxvd3Mvc3RlcHMvYWRkLXJlcGFpci1wYXJ0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFBNkU7QUFDN0UscURBR21DO0FBQ25DLGlEQUFxRDtBQVV4QyxRQUFBLGtCQUFrQixHQUFHLElBQUEsMEJBQVUsRUFDMUMsa0JBQWtCLEVBQ2xCLEtBQUssRUFBRSxLQUEwQixFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtJQUNsRCxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9ELE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUM1RSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQ3ZDLDhCQUFzQixDQUFDLFNBQVMsRUFDaEMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FDckIsQ0FBQztJQUVULDBEQUEwRDtJQUMxRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyRCxDQUFDLHNCQUFhLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtRQUM3RCxDQUFDLDhCQUFzQixDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFO0tBQ3BFLENBQUMsQ0FBQyxDQUFDO0lBRUosTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTVCLE1BQU0scUJBQXFCLEdBQWEs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