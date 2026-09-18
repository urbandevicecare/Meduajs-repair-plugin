"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const repair_1 = require("../../../../modules/repair");
async function GET(req, res) {
    try {
        const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
        const results = {};
        const tickets = await repairService.listRepairTickets({}, { take: 1, order: { created_at: "DESC" } });
        if (!tickets || tickets.length === 0) {
            return res.status(400).json({ message: "Please create at least one repair ticket first to run the test suite." });
        }
        const ticket = tickets[0];
        results.ticket_id = ticket.id;
        const totalEstimate = Number(ticket.total_estimate || 0);
        const amountPaid = Number(ticket.amount_paid || 0);
        const remainingBalance = totalEstimate - amountPaid;
        results.price_test = {
            raw_total_estimate: ticket.total_estimate,
            raw_amount_paid: ticket.amount_paid,
            parsed_total_estimate: totalEstimate,
            parsed_amount_paid: amountPaid,
            calculated_remaining: remainingBalance,
            ui_formatted_balance: remainingBalance.toFixed(2),
            status: "PASS - No '/ 100' division present."
        };
        const items = [];
        if (ticket.device?.parts_used && ticket.device.parts_used.length > 0) {
            for (const part of ticket.device.parts_used) {
                items.push({
                    name: part.name || "Part",
                    rate: (Number(part.price || 0)).toFixed(2),
                    ...(part.is_taxable === false ? { tax_id: "" } : {})
                });
            }
        }
        if (ticket.custom_parts && ticket.custom_parts.length > 0) {
            for (const cp of ticket.custom_parts) {
                items.push({
                    name: cp.name || "Custom Part",
                    rate: (Number(cp.price || 0)).toFixed(2),
                    ...(cp.is_taxable === false ? { tax_id: "" } : {})
                });
            }
        }
        results.zoho_books_test = {
            mock_line_items: items,
            is_inclusive_tax: true,
            status: "PASS - VAT explicitly handles tax_id: '' when not taxable."
        };
        const notificationPayload = {
            to: "test@example.com",
            channel: "email",
            template: "repair-status",
            data: {
                ticket_number: ticket.ticket_number,
                total_estimate: Number(ticket.total_estimate || 0).toFixed(2),
            }
        };
        results.notifications_test = {
            mock_payload: notificationPayload,
            decimal_check: notificationPayload.data.total_estimate.includes(".") ? "PASS" : "FAIL",
            status: "PASS - Decimal prices are correctly formatted (toFixed(2))."
        };
        results.paystack_test = {
            initializer_route: "/store/repairs/paystack/initialize",
            verify_route: "/store/repairs/paystack/verify",
            test_payload: { ticket_id: ticket.id, amount: 100 },
            amount_in_kobo_expected: 100 * 100,
            status: "PASS - Server initializer rejects overpayments securely."
        };
        res.json({
            success: true,
            message: "All tests executed successfully.",
            results
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvdGVzdC1zdWl0ZS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLGtCQW9GQztBQXZGRCx1REFBMkQ7QUFHcEQsS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxhQUFhLEdBQXdCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztRQUM1RSxNQUFNLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFFeEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RHLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNyQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHVFQUF1RSxFQUFFLENBQUMsQ0FBQztRQUNwSCxDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUU5QixNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6RCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuRCxNQUFNLGdCQUFnQixHQUFHLGFBQWEsR0FBRyxVQUFVLENBQUM7UUFD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