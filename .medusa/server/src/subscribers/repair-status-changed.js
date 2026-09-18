"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = repairStatusChangedHandler;
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../modules/repair");
async function repairStatusChangedHandler({ event: { data }, container, }) {
    const logger = container.resolve("logger");
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    logger.info(`Repair ticket ${data.repair_ticket_id} status changed to ${data.status}`);
    // Fetch the repair ticket details along with parts
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: [
            "*",
            "device.*",
            "product_variant.*",
            "product_variant.inventory_items.*", // Resolve inventory items
        ],
        filters: { id: data.repair_ticket_id },
    });
    if (!tickets || tickets.length === 0) {
        logger.warn(`Repair ticket ${data.repair_ticket_id} not found`);
        return;
    }
    const ticket = tickets[0];
    // Auto-deduct parts when repair is completed
    if (data.status === "completed" && data.previous_status !== "completed") {
        logger.info(`Processing part deductions for completed repair ticket ${ticket.ticket_number}`);
        try {
            const inventoryModule = container.resolve(utils_1.ModuleRegistrationName.INVENTORY, { allowUnregistered: true });
            if (inventoryModule &&
                ticket.product_variant &&
                ticket.product_variant.length > 0) {
                for (const part of ticket.product_variant) {
                    if (part.inventory_items && part.inventory_items.length > 0) {
                        for (const itemLink of part.inventory_items) {
                            // We retrieve the inventory levels for this item
                            const [levels, count] = await inventoryModule.listAndCountInventoryLevels({
                                inventory_item_id: itemLink.inventory_item_id,
                            });
                            if (levels && levels.length > 0) {
                                // Deduct from the first available location
                                const levelToAdjust = levels[0];
                                const qtyToDeduct = itemLink.required_quantity || 1;
                                await inventoryModule.updateInventoryLevels([
                                    {
                                        inventory_item_id: levelToAdjust.inventory_item_id,
                                        location_id: levelToAdjust.location_id,
                                        stocked_quantity: levelToAdjust.stocked_quantity - qtyToDeduct,
                                    },
                                ]);
                                logger.info(`Deducted ${qtyToDeduct} from inventory item ${levelToAdjust.inventory_item_id} (Variant: ${part.title})`);
                            }
                        }
                    }
                    else {
                        logger.warn(`Product variant ${part.title} (${part.id}) has no inventory items linked.`);
                    }
                    // Delete associated reservation
                    const [reservations] = await inventoryModule.listAndCountReservationItems({
                        line_item_id: `repair_${ticket.id}_${part.id}`,
                    });
                    if (reservations?.length) {
                        await inventoryModule.deleteReservationItems(reservations.map((r) => r.id));
                        logger.info(`Cleared reservation for variant ${part.title}`);
                    }
                }
            }
            else if (!inventoryModule) {
                logger.warn("Inventory module not registered, skipping auto-deduct.");
            }
            else {
                logger.info(`No parts to deduct for repair ticket ${ticket.ticket_number}.`);
            }
        }
        catch (err) {
            logger.error(`Error auto-deducting parts for repair ticket ${ticket.ticket_number}: ${err}`);
        }
    }
    // Notifications are now handled by the Omni-Notify subscriber in notifications.ts
    logger.info(`Processed event for repair ticket ${ticket.ticket_number} - Status: ${data.status}`);
}
exports.config = {
    event: "repair.status_changed",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwYWlyLXN0YXR1cy1jaGFuZ2VkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N1YnNjcmliZXJzL3JlcGFpci1zdGF0dXMtY2hhbmdlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFlQSw2Q0ErR0M7QUE3SEQscURBSW1DO0FBQ25DLDhDQUFrRDtBQVNuQyxLQUFLLFVBQVUsMEJBQTBCLENBQUMsRUFDdkQsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQ2YsU0FBUyxHQUMrQjtJQUN4QyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sYUFBYSxHQUF3QixTQUFTLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUM1RSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWpFLE1BQU0sQ0FBQyxJQUFJLENBQ1QsaUJBQWlCLElBQUksQ0FBQyxnQkFBZ0Isc0JBQXNCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FDMUUsQ0FBQztJQUVGLG1EQUFtRDtJQUNuRCxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMxQyxNQUFNLEVBQUUsZUFBZTtRQUN2QixNQUFNLEVBQUU7WUFDTixHQUFHO1lBQ0gsVUFBVTtZQUNWLG1CQUFtQjtZQUNuQixtQ0FBbUMsRUFBRSwwQkFBMEI7U0FDaEU7UUFDRCxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFO0tBQ3ZDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsZ0JBQWdCLFlBQVks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