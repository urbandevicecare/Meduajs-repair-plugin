"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../../../../../modules/repair");
async function POST(req, res) {
    const { terms_accepted, data_wiped_consent } = req.body;
    const customerId = req.auth_context?.actor_id;
    if (!terms_accepted) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Terms must be accepted");
    }
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    // Fetch the ticket to verify ownership
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: ["id", "customer_id", "status"],
        filters: { id: req.params.id },
    });
    if (!tickets || tickets.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Repair ticket not found");
    }
    const ticket = tickets[0];
    if (ticket.customer_id && ticket.customer_id !== customerId) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, "Unauthorized to accept compliance for this ticket");
    }
    else if (!ticket.customer_id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Cannot accept an anonymous ticket without a token");
    }
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    const updatedTicket = await repairService.updateRepairTickets({
        id: req.params.id,
        terms_accepted: !!terms_accepted,
        data_wiped_consent: !!data_wiped_consent,
    });
    res.json({ ticket: updatedTicket });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvW2lkXS9jb21wbGlhbmNlL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBV0Esb0JBb0RDO0FBM0RELHFEQUdtQztBQUNuQywwREFBOEQ7QUFHdkQsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBK0IsRUFDL0IsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFXLENBQUM7SUFDL0QsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7SUFFOUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQzlCLHdCQUF3QixDQUN6QixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWpFLHVDQUF1QztJQUN2QyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMxQyxNQUFNLEVBQUUsZUFBZTtRQUN2QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQztRQUN2QyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7S0FDL0IsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQzNCLHlCQUF5QixDQUMxQixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUxQixJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUM1RCxNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUM5QixtREFBbUQsQ0FDcEQsQ0FBQztJQUNKLENBQUM7U0FBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQzdCLG1EQUFtRCxDQUNwRCxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sYUFBYSxHQUF3QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDNUUsTUFBTSxhQUFhLEdBQUcsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUM7UUFDNUQsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNqQixjQUFjLEVBQUUsQ0FBQyxDQUFDLGNBQWM7UUFDaEMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQjtLQUN6QyxDQUFDLENBQUM7SUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDdEMsQ0FBQyJ9