"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const generate_repair_document_1 = require("../../../../../utils/generate-repair-document");
// GET /store/repairs/:id/document?type=invoice | quote | receipt
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const type = req.query.type || "invoice";
    const customerId = req.auth_context?.actor_id;
    if (!customerId) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, "You must be logged in to access documents");
    }
    // Fetch ticket details
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: [
            "*",
            "device.*",
            "product_variants.*",
            "product_variants.prices.*",
        ],
        filters: { id: [req.params.id], customer_id: customerId },
    });
    if (!tickets || tickets.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Repair ticket not found");
    }
    const ticket = tickets[0];
    const parts = ticket.product_variants || [];
    let customerName = "Customer";
    try {
        const customerModule = req.scope.resolve("customer", {
            allowUnregistered: true,
        });
        if (customerModule) {
            const customer = await customerModule.retrieveCustomer(ticket.customer_id);
            if (customer) {
                customerName = customer.first_name
                    ? `${customer.first_name} ${customer.last_name || ""}`
                    : customer.email || "Customer";
            }
        }
    }
    catch (e) { }
    const payloadTicket = { ...ticket, parts };
    await (0, generate_repair_document_1.generateRepairDocument)(type, payloadTicket, customerName, res, req);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvW2lkXS9kb2N1bWVudC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVdBLGtCQXdEQztBQS9ERCxxREFHbUM7QUFDbkMsNEZBQXVGO0FBRXZGLGlFQUFpRTtBQUMxRCxLQUFLLFVBQVUsR0FBRyxDQUN2QixHQUErQyxFQUMvQyxHQUFtQjtJQUVuQixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRSxNQUFNLElBQUksR0FBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQWUsSUFBSSxTQUFTLENBQUM7SUFDckQsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7SUFFOUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQzlCLDJDQUEyQyxDQUM1QyxDQUFDO0lBQ0osQ0FBQztJQUVELHVCQUF1QjtJQUN2QixNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMxQyxNQUFNLEVBQUUsZUFBZTtRQUN2QixNQUFNLEVBQUU7WUFDTixHQUFHO1lBQ0gsVUFBVTtZQUNWLG9CQUFvQjtZQUNwQiwyQkFBMkI7U0FDNUI7UUFDRCxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUU7S0FDMUQsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQzNCLHlCQUF5QixDQUMxQixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsZ0JBQWdCLElBQUksRUFBRSxDQUFDO0lBRTVDLElBQUksWUFBWSxHQUFHLFVBQVUsQ0FBQztJQUM5QixJQUFJLENBQUM7UUFDSCxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7WUFDbkQsaUJBQWlCLEVBQUUsSUFBSTtTQUN4QixDQUFDLENBQUM7UUFDSCxJQUFJLGNBQWMsRUFBRSxDQUFDO1lBQ25CLE1BQU0sUUFBUSxHQUFHLE1BQU0sY0FBYyxDQUFDLGdCQUFnQixDQUNwRCxNQUFNLENBQUMsV0FBVyxDQUNuQixDQUFDO1lBQ0YsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDYixZQUFZLEdBQUcsUUFBUSxDQUFDLFVBQVU7b0JBQ2hDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLFNBQVMsSUFBSSxFQUFFLEVBQUU7b0JBQ3RELENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLFVBQVUsQ0FBQztZQUNuQyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUEsQ0FBQztJQUVkLE1BQU0sYUFBYSxHQUFHLEVBQUUsR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDM0MsTUFBTSxJQUFBLGlEQUFzQixFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM1RSxDQUFDIn0=