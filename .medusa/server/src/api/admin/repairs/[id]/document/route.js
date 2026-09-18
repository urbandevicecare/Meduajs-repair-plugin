"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const generate_repair_document_1 = require("../../../../../utils/generate-repair-document");
// GET /admin/repairs/:id/document?type=job_card | receipt | invoice | quote
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const type = req.query.type || "job_card";
    // Fetch ticket details
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: [
            "*",
            "device.*",
            "product_variants.*",
            "product_variants.prices.*",
        ],
        filters: { id: [req.params.id] },
    });
    if (!tickets || tickets.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Repair ticket not found");
    }
    const ticket = tickets[0];
    // Try to map product_variants to parts for the template
    const parts = ticket.product_variants || [];
    // Try to find customer email/details
    let customerName = "Guest";
    if (ticket.customer_id) {
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
        catch (e) {
            // ignore
        }
    }
    const payloadTicket = {
        ...ticket,
        parts,
    };
    await (0, generate_repair_document_1.generateRepairDocument)(type, payloadTicket, customerName, res, req);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9kb2N1bWVudC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLGtCQTJEQztBQWxFRCxxREFHbUM7QUFDbkMsNEZBQXVGO0FBRXZGLDRFQUE0RTtBQUNyRSxLQUFLLFVBQVUsR0FBRyxDQUN2QixHQUFrQyxFQUNsQyxHQUFtQjtJQUVuQixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRSxNQUFNLElBQUksR0FBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQWUsSUFBSSxVQUFVLENBQUM7SUFFdEQsdUJBQXVCO0lBQ3ZCLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLE1BQU0sRUFBRTtZQUNOLEdBQUc7WUFDSCxVQUFVO1lBQ1Ysb0JBQW9CO1lBQ3BCLDJCQUEyQjtTQUM1QjtRQUNELE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUU7S0FDakMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQzNCLHlCQUF5QixDQUMxQixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUxQix3REFBd0Q7SUFDeEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQztJQUU1QyxxQ0FBcUM7SUFDckMsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDO0lBQzNCLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQztZQUNILE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtnQkFDbkQsaUJBQWlCLEVBQUUsSUFBSTthQUN4QixDQUFDLENBQUM7WUFDSCxJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUNuQixNQUFNLFFBQVEsR0FBRyxNQUFNLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FDcEQsTUFBTSxDQUFDLFdBQVcsQ0FDbkIsQ0FBQztnQkFDRixJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUNiLFlBQVksR0FBRyxRQUFRLENBQUMsVUFBVTt3QkFDaEMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLFVBQVUsSUFBSSxRQUFRLENBQUMsU0FBUyxJQUFJLEVBQUUsRUFBRTt3QkFDdEQsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksVUFBVSxDQUFDO2dCQUNuQyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1gsU0FBUztRQUNYLENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxhQUFhLEdBQUc7UUFDcEIsR0FBRyxNQUFNO1FBQ1QsS0FBSztLQUNOLENBQUM7SUFFRixNQUFNLElBQUEsaURBQXNCLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzVFLENBQUMifQ==