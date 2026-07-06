import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { generateRepairDocument } from "../../../../../utils/generate-repair-document";

// GET /admin/repairs/:id/document?type=job_card | receipt | invoice | quote
export async function GET(
  req: MedusaRequest<{ id: string }>,
  res: MedusaResponse,
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const type = (req.query.type as string) || "job_card";

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
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Repair ticket not found",
    );
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
        const customer = await customerModule.retrieveCustomer(
          ticket.customer_id,
        );
        if (customer) {
          customerName = customer.first_name
            ? `${customer.first_name} ${customer.last_name || ""}`
            : customer.email || "Customer";
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const payloadTicket = {
    ...ticket,
    parts,
  };

  await generateRepairDocument(type, payloadTicket, customerName, res);
}
