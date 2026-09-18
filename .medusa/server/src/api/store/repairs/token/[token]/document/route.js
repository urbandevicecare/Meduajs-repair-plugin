"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const generate_repair_document_1 = require("../../../../../../utils/generate-repair-document");
// GET /store/repairs/token/:token/document?type=invoice | quote | receipt
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const type = req.query.type || "invoice";
    // Fetch ticket details
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: [
            "*",
            "device.*",
            "product_variants.*",
            "product_variants.prices.*",
        ],
        filters: { approval_token: req.params.token },
    });
    if (!tickets || tickets.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Repair ticket not found or invalid token");
    }
    const ticket = tickets[0];
    const parts = ticket.product_variants || [];
    let customerName = "Customer";
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
        catch (e) { }
    }
    const payloadTicket = { ...ticket, parts };
    await (0, generate_repair_document_1.generateRepairDocument)(type, payloadTicket, customerName, res, req);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvdG9rZW4vW3Rva2VuXS9kb2N1bWVudC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLGtCQWtEQztBQXpERCxxREFHbUM7QUFDbkMsK0ZBQTBGO0FBRTFGLDBFQUEwRTtBQUNuRSxLQUFLLFVBQVUsR0FBRyxDQUN2QixHQUFxQyxFQUNyQyxHQUFtQjtJQUVuQixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRSxNQUFNLElBQUksR0FBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQWUsSUFBSSxTQUFTLENBQUM7SUFFckQsdUJBQXVCO0lBQ3ZCLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLE1BQU0sRUFBRTtZQUNOLEdBQUc7WUFDSCxVQUFVO1lBQ1Ysb0JBQW9CO1lBQ3BCLDJCQUEyQjtTQUM1QjtRQUNELE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtLQUM5QyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDckMsTUFBTSxJQUFJLG1CQUFXLENBQ25CLG1CQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFDM0IsMENBQTBDLENBQzNDLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFLENBQUM7SUFFNUMsSUFBSSxZQUFZLEdBQUcsVUFBVSxDQUFDO0lBQzlCLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQztZQUNILE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtnQkFDbkQsaUJBQWlCLEVBQUUsSUFBSTthQUN4QixDQUFDLENBQUM7WUFDSCxJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUNuQixNQUFNLFFBQVEsR0FBRyxNQUFNLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FDcEQsTUFBTSxDQUFDLFdBQVcsQ0FDbkIsQ0FBQztnQkFDRixJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUNiLFlBQVksR0FBRyxRQUFRLENBQUMsVUFBVTt3QkFDaEMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLFVBQVUsSUFBSSxRQUFRLENBQUMsU0FBUyxJQUFJLEVBQUUsRUFBRTt3QkFDdEQsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksVUFBVSxDQUFDO2dCQUNuQyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUEsQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxhQUFhLEdBQUcsRUFBRSxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUMzQyxNQUFNLElBQUEsaURBQXNCLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzVFLENBQUMifQ==