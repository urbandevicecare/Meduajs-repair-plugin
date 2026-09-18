"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
// GET /store/repairs/:ticket_number - Track repair by ticket number
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const ticketNumber = req.params.ticket_number;
    // Find the repair ticket by ticket_number
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: ["*", "device.*", "media.*", "notes.*", "updates.*"],
        filters: { ticket_number: ticketNumber },
    });
    if (!tickets || tickets.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Repair ticket with ticket number ${ticketNumber} not found`);
    }
    const ticket = tickets[0];
    const customerId = req.auth_context?.actor_id;
    const isOwner = customerId && ticket.customer_id === customerId;
    if (isOwner) {
        // Authenticated owner gets the full payload, but we still filter out strictly internal notes
        const fullPayload = {
            ...ticket,
            notes: ticket.notes?.filter((note) => !note.is_internal) || [],
        };
        return res.json({ repair_ticket: fullPayload });
    }
    // Unauthenticated or not the owner - return a restricted public payload
    const publicPayload = {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        status: ticket.status,
        issue_description: ticket.issue_description,
        estimated_completion: ticket.estimated_completion,
        completed_at: ticket.completed_at,
        collected_at: ticket.collected_at,
        warranty_months: ticket.warranty_months,
        warranty_expiry: ticket.warranty_expiry,
        device: ticket.device ? {
            id: ticket.device.id,
            brand: ticket.device.brand,
            model_name: ticket.device.model_name,
        } : null,
        // Only return non-internal notes (public updates)
        notes: ticket.notes?.filter((note) => !note.is_internal) || [],
        // Do not return custom_parts, total_estimate, internal notes, technician_id, customer_id, etc.
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
    };
    res.json({
        repair_ticket: publicPayload,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvW3RpY2tldF9udW1iZXJdL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBT0Esa0JBNkRDO0FBbkVELHFEQUdtQztBQUVuQyxvRUFBb0U7QUFDN0QsS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBMEQsRUFDMUQsR0FBbUI7SUFFbkIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakUsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7SUFFOUMsMENBQTBDO0lBQzFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUM7UUFDNUQsT0FBTyxFQUFFLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRTtLQUN6QyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDckMsTUFBTSxJQUFJLG1CQUFXLENBQ25CLG1CQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFDM0Isb0NBQW9DLFlBQVksWUFBWSxDQUM3RCxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQztJQUU5QyxNQUFNLE9BQU8sR0FBRyxVQUFVLElBQUksTUFBTSxDQUFDLFdBQVcsS0FBSyxVQUFVLENBQUM7SUFFaEUsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNaLDZGQUE2RjtRQUM3RixNQUFNLFdBQVcsR0FBRztZQUNsQixHQUFHLE1BQU07WUFDVCxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7U0FDcEUsQ0FBQztRQUNGLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCx3RUFBd0U7SUFDeEUsTUFBTSxhQUFhLEdBQUc7UUFDcEIsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ2IsYUFBYSxFQUFFLE1BQU0sQ0FBQyxhQUFhO1FBQ25DLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtRQUNyQixpQkFBaUIsRUFBRSxNQUFNLENBQUMsaUJBQWlCO1FBQzNDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7UUFDakQsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZO1FBQ2pDLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWTtRQUNqQyxlQUFlLEVBQUUsTUFBTSxDQUFDLGVBQWU7UUFDdkMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxlQUFlO1FBQ3ZDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0QixFQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3BCLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDMUIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVTtTQUNyQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1FBQ1Isa0RBQWtEO1FBQ2xELEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtRQUNuRSwrRkFBK0Y7UUFDL0YsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVO1FBQzdCLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVTtLQUM5QixDQUFDO0lBRUYsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNQLGFBQWEsRUFBRSxhQUFhO0tBQzdCLENBQUMsQ0FBQztBQUNMLENBQUMifQ==