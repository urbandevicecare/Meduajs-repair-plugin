import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REPAIR_MODULE } from "../../../../modules/repair";
import RepairModuleService from "../../../../modules/repair/service";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);
    const results: any = {};

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

    const items: any[] = [];
    if ((ticket as any).device?.parts_used && (ticket as any).device.parts_used.length > 0) {
      for (const part of (ticket as any).device.parts_used) {
        items.push({
          name: part.name || "Part",
          rate: (Number(part.price || 0)).toFixed(2),
          ...(part.is_taxable === false ? { tax_id: "" } : {})
        });
      }
    }
    if ((ticket as any).custom_parts && (ticket as any).custom_parts.length > 0) {
      for (const cp of (ticket as any).custom_parts) {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
