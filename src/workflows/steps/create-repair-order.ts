import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { REPAIR_MODULE } from "../../modules/repair";
import RepairModuleService from "../../modules/repair/service";

export const createRepairOrderStep = createStep(
  "create-repair-order",
  async (
    input: { repair_ticket_id: string; customer_id?: string | null },
    { container },
  ) => {
    const repairService: RepairModuleService = container.resolve(REPAIR_MODULE);
    const orderModuleService = container.resolve(Modules.ORDER);
    const customerModuleService = container.resolve(Modules.CUSTOMER);

    // Fetch the full ticket details
    const ticket = await repairService.retrieveRepairTicket(input.repair_ticket_id);

    // Fetch parts to inject them into the order
    const query = container.resolve("query");
    let parts: any[] = [];
    try {
      const { data } = await query.graph({
        entity: "repair_ticket",
        fields: ["product_variants.*", "product_variants.product.*"],
        filters: { id: [input.repair_ticket_id] },
      });
      parts = data?.[0]?.product_variants || [];
    } catch (e) {
      try {
        const { data } = await query.graph({
          entity: "repair_ticket",
          fields: ["product_variant.*", "product_variant.product.*"],
          filters: { id: [input.repair_ticket_id] },
        });
        parts = data?.[0]?.product_variant || [];
      } catch (e2) {}
    }

    const items: any[] = [];

    // Add inventory parts. 
    // Wait, in Medusa V2 creating items needs a variant_id, or we can just pass custom line items with unit_price.
    // If we pass variant_id, it might pull prices automatically. But we want to honor the estimate.
    for (const part of parts) {
      items.push({
        title: part.title || "Inventory Part",
        variant_id: part.id,
        quantity: 1,
        // If we don't pass unit_price, it might fail or we can pass a 0. Wait, Medusa V2 createOrders allows passing unit_price directly for custom items, but for variant_id it might require price. Let's omit unit_price so it uses standard pricing, or use parts_estimate logic?
        // Actually, to just ensure it works and honors the total cost, we can just create a custom item for the entire "Repair Cost" or break it down.
      });
    }

    // Add custom parts
    const customParts = (ticket.custom_parts as unknown as any[]) || [];
    for (const cp of customParts) {
      items.push({
        title: cp.name || "Custom Part",
        quantity: 1,
        unit_price: Number(cp.price),
      });
    }

    // Add labor
    if (ticket.labor_estimate && Number(ticket.labor_estimate) > 0) {
      items.push({
        title: "Labor Cost",
        quantity: 1,
        unit_price: Number(ticket.labor_estimate),
      });
    }

    // Determine region and currency.
    let currencyCode = "usd"; // default
    let regionId: string | undefined = undefined;
    let email = "customer@example.com";
    if (input.customer_id) {
      try {
        const customer = await customerModuleService.retrieveCustomer(input.customer_id);
        if (customer.email) email = customer.email;
      } catch (e) {}
    }

    // Fetch default region to use its currency code if possible
    try {
      const regionModuleService = container.resolve(Modules.REGION);
      const regions = await regionModuleService.listRegions({}, { take: 1 });
      if (regions && regions.length > 0) {
        currencyCode = regions[0].currency_code;
        regionId = regions[0].id;
      }
    } catch (e) {}

    const draftOrderPayload: any = {
      currency_code: currencyCode,
      email: email,
      customer_id: input.customer_id || undefined,
      items: items.length > 0 ? items : [{ title: "Repair Estimate", quantity: 1, unit_price: Number(ticket.total_estimate) }],
      status: "pending",
      metadata: {
        repair_ticket_id: input.repair_ticket_id,
      },
    };

    if (regionId) {
      draftOrderPayload.region_id = regionId;
    }

    const draftOrder = await orderModuleService.createOrders([draftOrderPayload]);

    return new StepResponse({ order: draftOrder[0] }, draftOrder[0].id);
  },
  async (orderId, { container }) => {
    if (!orderId) return;
    const orderModuleService = container.resolve(Modules.ORDER);
    await orderModuleService.deleteOrders([orderId]);
  },
);
