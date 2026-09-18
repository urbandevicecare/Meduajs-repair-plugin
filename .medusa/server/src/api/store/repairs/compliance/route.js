"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../../../../modules/repair");
async function POST(req, res) {
    const { token, terms_accepted, data_wiped_consent } = req.body;
    if (!token) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Token is required");
    }
    if (!terms_accepted) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Terms must be accepted");
    }
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: ["*", "device.*"],
        filters: { approval_token: token },
    });
    if (!tickets || tickets.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Invalid token");
    }
    const ticket = tickets[0];
    const updatedTicket = await repairService.updateRepairTickets({
        id: ticket.id,
        terms_accepted: !!terms_accepted,
        data_wiped_consent: !!data_wiped_consent,
    });
    res.json({ ticket: updatedTicket });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvY29tcGxpYW5jZS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLG9CQTJDQztBQWxERCxxREFHbUM7QUFDbkMsdURBQTJEO0FBR3BELEtBQUssVUFBVSxJQUFJLENBQ3hCLEdBSUUsRUFDRixHQUFtQjtJQUVuQixNQUFNLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFFL0QsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ1gsTUFBTSxJQUFJLG1CQUFXLENBQUMsbUJBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNwQixNQUFNLElBQUksbUJBQVcsQ0FDbkIsbUJBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUM5Qix3QkFBd0IsQ0FDekIsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRSxNQUFNLGFBQWEsR0FBd0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBRTVFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUM7UUFDekIsT0FBTyxFQUFFLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRTtLQUNuQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDckMsTUFBTSxJQUFJLG1CQUFXLENBQUMsbUJBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFMUIsTUFBTSxhQUFhLEdBQUcsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUM7UUFDNUQsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ2IsY0FBYyxFQUFFLENBQUMsQ0FBQyxjQUFjO1FBQ2hDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxrQkFBa0I7S0FDekMsQ0FBQyxDQUFDO0lBRUgsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLENBQUMifQ==