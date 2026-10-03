"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
// GET /admin/repairs/:id - Get single repair ticket
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
        entity: "repair_ticket",
        fields: ["*", "device.*", "media.*", "notes.*", "updates.*"],
        filters: { id: [req.params.id] },
    });
    if (!data || data.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Repair ticket with id ${req.params.id} not found`);
    }
    // Fetch linked product variants (parts)
    let parts = [];
    try {
        const linkQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
        // First try with plural name which is standard for isList: true
        const { data: ticketWithParts } = await linkQuery.graph({
            entity: "repair_ticket",
            fields: ["id", "product_variants.*", "product_variants.product.*", "product_variants.prices.*"],
            filters: { id: [req.params.id] },
        });
        parts = ticketWithParts?.[0]?.product_variants || [];
    }
    catch (err) {
        try {
            const linkQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
            const { data: ticketWithParts } = await linkQuery.graph({
                entity: "repair_ticket",
                fields: ["id", "product_variant.*", "product_variant.product.*", "product_variant.prices.*"],
                filters: { id: [req.params.id] },
            });
            parts = ticketWithParts?.[0]?.product_variant || [];
        }
        catch (err2) {
            // both failed, which means the link isn't established properly in query graph graph, return empty parts.
        }
    }
    let customerInfo = null;
    if (data[0].customer_id) {
        try {
            const { data: customers } = await query.graph({
                entity: "customer",
                fields: ["first_name", "last_name", "phone"],
                filters: { id: [data[0].customer_id] },
            });
            if (customers && customers.length > 0) {
                customerInfo = customers[0];
            }
        }
        catch (err) {
            // ignore
        }
    }
    res.json({
        repair_ticket: {
            ...data[0],
            customer: customerInfo,
            customer_phone: customerInfo?.phone || "",
            parts,
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU9BLGtCQXFFQztBQTNFRCxxREFHbUM7QUFFbkMsb0RBQW9EO0FBQzdDLEtBQUssVUFBVSxHQUFHLENBQ3ZCLEdBQWtDLEVBQ2xDLEdBQW1CO0lBRW5CLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWpFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDakMsTUFBTSxFQUFFLGVBQWU7UUFDdkIsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQztRQUM1RCxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0tBQ2pDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMvQixNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUMzQix5QkFBeUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFlBQVksQ0FDbkQsQ0FBQztJQUNKLENBQUM7SUFFRCx3Q0FBd0M7SUFDeEMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2YsSUFBSSxDQUFDO1FBQ0gsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFckUsZ0VBQWdFO1FBQ2hFLE1BQU0sRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEdBQUcsTUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQ3RELE1BQU0sRUFBRSxlQUFlO1lBQ3ZCLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSw0QkFBNEIsRUFBRSwyQkFBMkIsQ0FBQztZQUMvRixPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1NBQ2pDLENBQUMsQ0FBQztRQUNILEtBQUssR0FBRyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsSUFBSSxFQUFFLENBQUM7SUFDdkQsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUM7WUFDSCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxHQUFHLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQztnQkFDdEQsTUFBTSxFQUFFLGVBQWU7Z0JBQ3ZCLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSwyQkFBMkIsRUFBRSwwQkFBMEIsQ0FBQztnQkFDNUYsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRTthQUNqQyxDQUFDLENBQUM7WUFDSCxLQUFLLEdBQUcsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsZUFBZSxJQUFJLEVBQUUsQ0FBQztRQUN0RCxDQUFDO1FBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztZQUNkLHlHQUF5RztRQUMzRyxDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksWUFBWSxHQUFRLElBQUksQ0FBQztJQUM3QixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUM7WUFDSCxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFDNUMsTUFBTSxFQUFFLFVBQVU7Z0JBQ2xCLE1BQU0sRUFBRSxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDO2dCQUM1QyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUU7YUFDdkMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDdEMsWUFBWSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixDQUFDO1FBQ0gsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDYixTQUFTO1FBQ1gsQ0FBQztJQUNILENBQUM7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ1AsYUFBYSxFQUFFO1lBQ2IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1YsUUFBUSxFQUFFLFlBQVk7WUFDdEIsY0FBYyxFQUFFLFlBQVksRUFBRSxLQUFLLElBQUksRUFBRTtZQUN6QyxLQUFLO1NBQ047S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDIn0=