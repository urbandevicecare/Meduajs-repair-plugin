"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
// GET /store/repairs/:serial_number - Track repair by ticket number or serial number
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const logger = req.scope.resolve("logger");
    const encodedIdentifier = req.params.serial_number || req.params.id || req.params[0] || (req.url.split('/').pop());
    const identifier = decodeURIComponent(encodedIdentifier || "").trim();
    logger.info(`[Store/Repairs] Tracking search initiated. Identifier: "${identifier}", Encoded: "${encodedIdentifier}"`);
    if (!identifier) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Identifier is missing");
    }
    let ticketsByNumber = [];
    try {
        const result = await query.graph({
            entity: "repair_ticket",
            fields: ["*", "device.*", "media.*", "notes.*", "updates.*"],
            filters: { ticket_number: identifier },
        });
        ticketsByNumber = result.data || [];
    }
    catch (error) {
        logger.warn(`[Store/Repairs] Error querying ticket_number: ${error.message}`);
    }
    if (ticketsByNumber.length > 0) {
        const ticket = ticketsByNumber[0];
        let parts = [];
        try {
            const { data: ticketWithParts } = await query.graph({
                entity: "repair_ticket",
                fields: ["id", "product_variants.*", "product_variants.product.*"],
                filters: { id: ticket.id },
            });
            parts = ticketWithParts?.[0]?.product_variants || [];
        }
        catch (e) {
            try {
                const { data: ticketWithParts } = await query.graph({
                    entity: "repair_ticket",
                    fields: ["id", "product_variant.*", "product_variant.product.*"],
                    filters: { id: ticket.id },
                });
                parts = ticketWithParts?.[0]?.product_variant || [];
            }
            catch (err2) { }
        }
        const fullPayload = {
            ...ticket,
            parts,
            notes: ticket.notes?.filter((note) => !note.is_internal) || [],
        };
        return res.json({ repair_ticket: fullPayload });
    }
    let devices = [];
    try {
        const result = await query.graph({
            entity: "device",
            fields: ["*", "repair_tickets.*"],
            filters: { serial_number: identifier },
        });
        devices = result.data || [];
    }
    catch (error) {
        logger.warn(`[Store/Repairs] Error querying serial_number: ${error.message}`);
    }
    if (devices.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Trackable item with identifier ${identifier} not found`);
    }
    const device = devices[0];
    let tickets = [];
    try {
        const result = await query.graph({
            entity: "repair_ticket",
            fields: ["*", "device.*", "media.*", "notes.*", "updates.*"],
            filters: { device_id: device.id },
        });
        tickets = result.data || [];
    }
    catch (error) {
        logger.warn(`[Store/Repairs] Error querying tickets for device: ${error.message}`);
    }
    if (tickets.length === 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `No repair tickets found for device ${identifier}`);
    }
    // Get most recent ticket
    const latestTicket = tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    let parts = [];
    try {
        const { data: ticketWithParts } = await query.graph({
            entity: "repair_ticket",
            fields: ["id", "product_variants.*", "product_variants.product.*"],
            filters: { id: latestTicket.id },
        });
        parts = ticketWithParts?.[0]?.product_variants || [];
    }
    catch (e) {
        try {
            const { data: ticketWithParts } = await query.graph({
                entity: "repair_ticket",
                fields: ["id", "product_variant.*", "product_variant.product.*"],
                filters: { id: latestTicket.id },
            });
            parts = ticketWithParts?.[0]?.product_variant || [];
        }
        catch (err2) { }
    }
    const fullPayload = {
        ...latestTicket,
        parts,
        notes: latestTicket.notes?.filter((note) => !note.is_internal) || [],
    };
    // Filter out internal notes in array
    const ticketsWithFilteredNotes = tickets.map((ticket) => ({
        ...ticket,
        notes: ticket.notes?.filter((note) => !note.is_internal) || [],
    }));
    res.json({
        device,
        repair_ticket: fullPayload,
        repair_tickets: ticketsWithFilteredNotes,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvW3NlcmlhbF9udW1iZXJdL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBT0Esa0JBMElDO0FBaEpELHFEQUdtQztBQUVuQyxxRkFBcUY7QUFDOUUsS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBNkMsRUFDN0MsR0FBbUI7SUFFbkIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakUsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNuSCxNQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUV0RSxNQUFNLENBQUMsSUFBSSxDQUFDLDJEQUEyRCxVQUFVLGdCQUFnQixpQkFBaUIsR0FBRyxDQUFDLENBQUM7SUFFdkgsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sSUFBSSxtQkFBVyxDQUFDLG1CQUFXLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxJQUFJLGVBQWUsR0FBVSxFQUFFLENBQUM7SUFDaEMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxL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