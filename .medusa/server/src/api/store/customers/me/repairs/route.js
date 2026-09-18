"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
// GET /store/customers/me/repairs - Get all repairs for logged-in customer
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const logger = req.scope.resolve("logger");
    const customerId = req.auth_context?.actor_id;
    logger.debug(`[Store/Repairs] 🔍 Fetching repairs for customer: ${customerId || "Unauthenticated"}`);
    if (!customerId) {
        logger.warn(`[Store/Repairs] ⚠️ Unauthorized access attempt to fetch customer repairs.`);
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, "You must be logged in to view your repairs");
    }
    try {
        // Find all repair tickets for this customer
        const { data: tickets } = await query.graph({
            entity: "repair_ticket",
            fields: ["*", "device.*", "media.*", "notes.*", "updates.*"],
            filters: { customer_id: customerId },
        });
        logger.debug(`[Store/Repairs] Found ${tickets.length} repair tickets for customer ${customerId}`);
        // Filter out internal notes for customer view
        const formattedTickets = tickets.map((ticket) => ({
            ...ticket,
            notes: ticket.notes?.filter((note) => !note.is_internal) || [],
        }));
        res.json({
            repair_tickets: formattedTickets,
        });
    }
    catch (error) {
        logger.error(`[Store/Repairs] ❌ Failed to fetch repairs for customer ${customerId}`, error);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL2N1c3RvbWVycy9tZS9yZXBhaXJzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBV0Esa0JBa0RDO0FBeERELHFEQUdtQztBQUVuQywyRUFBMkU7QUFDcEUsS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBK0IsRUFDL0IsR0FBbUI7SUFFbkIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakUsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7SUFFOUMsTUFBTSxDQUFDLEtBQUssQ0FDVixxREFBcUQsVUFBVSxJQUFJLGlCQUFpQixFQUFFLENBQ3ZGLENBQUM7SUFFRixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDaEIsTUFBTSxDQUFDLElBQUksQ0FDVCwyRUFBMkUsQ0FDNUUsQ0FBQztRQUNGLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQzlCLDRDQUE0QyxDQUM3QyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQztRQUNILDRDQUE0QztRQUM1QyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMxQyxNQUFNLEVBQUUsZUFBZTtZQUN2QixNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDO1lBQzVELE9BQU8sRUFBRSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUU7U0FDckMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLEtBQUssQ0FDVix5QkFBeUIsT0FBTyxDQUFDLE1BQU0sZ0NBQWdDLFVBQVUsRUFBRSxDQUNwRixDQUFDO1FBRUYsOENBQThDO1FBQzlDLE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxHQUFHLE1BQU07WUFDVCxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7U0FDcEUsQ0FBQyxDQUFDLENBQUM7UUFFSixHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ1AsY0FBYyxFQUFFLGdCQUFnQjtTQUNqQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixNQUFNLENBQUMsS0FBSyxDQUNWLDBEQUEwRCxVQUFVLEVBQUUsRUFDdEUsS0FBSyxDQUNOLENBQUM7UUFDRixNQUFNLEtBQUssQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDIn0=