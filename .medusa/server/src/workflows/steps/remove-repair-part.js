"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRepairPartStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.removeRepairPartStep = (0, workflows_sdk_1.createStep)("remove-repair-part", async (input, { container }) => {
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const inventoryModule = container.resolve(utils_1.ModuleRegistrationName.INVENTORY, { allowUnregistered: true });
    // We dismiss the specific link
    const linkData = {
        repair: { repair_ticket_id: input.repair_ticket_id },
        product: { product_variant_id: input.variant_id },
    };
    await link.dismiss(linkData);
    let deletedReservationIds = [];
    // Free the reservation for this part/ticket combination
    if (inventoryModule) {
        // List reservations matching the line_item_id or metadata
        const [reservations, count] = await inventoryModule.listAndCountReservationItems({
            line_item_id: `repair_${input.repair_ticket_id}_${input.variant_id}`,
        });
        if (reservations?.length) {
            deletedReservationIds = reservations.map((r) => r.id);
            await inventoryModule.deleteReservationItems(deletedReservationIds);
        }
    }
    return new workflows_sdk_1.StepResponse({ success: true }, { linkData, deletedReservationIds });
}, async (compensationData, { container }) => {
    if (!compensationData)
        return;
    const { linkData, deletedReservationIds } = compensationData;
    // Re-create the link
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    if (linkData) {
        await link.create(linkData);
    }
    // Un-deleting reservations isn't natively supported, we'd have to recreate them.
    // For simplicity, we assume compensation recreates them entirely if needed, but since we don't have the original properties here, it's a gap.
    // A more robust implementation would save the full reservation details to restore them.
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLXJlcGFpci1wYXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9zdGVwcy9yZW1vdmUtcmVwYWlyLXBhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBQTZFO0FBQzdFLHFEQUdtQztBQU90QixRQUFBLG9CQUFvQixHQUFHLElBQUEsMEJBQVUsRUFDNUMsb0JBQW9CLEVBQ3BCLEtBQUssRUFBRSxLQUE0QixFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtJQUNwRCxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9ELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakUsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FDdkMsOEJBQXNCLENBQUMsU0FBUyxFQUNoQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUNyQixDQUFDO0lBRVQsK0JBQStCO0lBQy9CLE1BQU0sUUFBUSxHQUFHO1FBQ2YsTUFBTSxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixFQUFFO1FBQ3BELE9BQU8sRUFBRSxFQUFFLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxVQUFVLEVBQUU7S0FDbEQsQ0FBQztJQUVGLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUU3QixJQUFJLHFCQUFxQixHQUFhLEVBQUUsQ0FBQztJQUV6Qyx3REFBd0Q7SUFDeEQsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUNwQiwwREFBMEQ7UUFDMUQsTUFBTSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsR0FDekIsTUFBTSxlQUFlLENBQUMsNEJBQTRCLENBQUM7WUFDakQsWUFBWSxFQUFFLFVBQVUsS0FBSyxDQUFDLGdCQUFnQixJQUFJLEtBQUssQ0FBQyxVQUFVLEVBQUU7U0FDckUsQ0FBQyxDQUFDO1FBRUwsSUFBSSxZQUFZLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDekIscUJBQXFCLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzNELE1BQU0sZUFBZSxDQUFDLHNCQUFzQixDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDdEUsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLElBQUksNEJBQVksQ0FDckIsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQ2pCLEVBQUUsUUFBUSxFQUFFLHFCQUFxQixFQUFFLENBQ3BDLENBQUM7QUFDSixDQUFDLEVBQ0QsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTtJQUN4QyxJQUFJLENBQUMsZ0JBQWdCO1FBQUUsT0FBTztJQUM5QixNQUFNLEVBQUUsUUFBUSxFQUFFLHFCQUFxQixFQUFFLEdBQUcsZ0JBQWdCLENBQUM7SUFFN0QscUJBQXFCO0lBQ3JCLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0QsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNiLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsaUZBQWlGO0lBQ2pGLDhJQUE4STtJQUM5SSx3RkFBd0Y7QUFDMUYsQ0FBQyxDQUNGLENBQUMifQ==