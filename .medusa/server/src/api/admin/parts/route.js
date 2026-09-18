"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data, metadata } = await query.graph({
        entity: "product_variant",
        fields: ["id", "title", "sku", "product.title", "prices.*"],
        filters: req.filterableFields,
        pagination: req.queryConfig?.pagination,
    });
    // Format nicely as parts with B2B pricing
    const formattedParts = data.map((variant) => {
        // Find a specific price list or default to calculated
        let price = 0;
        if (variant.prices && variant.prices.length > 0) {
            price = variant.prices[0].amount;
        }
        return {
            id: variant.id,
            title: variant.title,
            product_title: variant.product?.title,
            sku: variant.sku,
            price: price,
            is_b2b_price: true,
        };
    });
    res.json({
        parts: formattedParts,
        ...metadata,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3BhcnRzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esa0JBZ0NDO0FBbENELHFEQUFzRTtBQUUvRCxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDM0MsTUFBTSxFQUFFLGlCQUFpQjtRQUN6QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsVUFBVSxDQUFDO1FBQzNELE9BQU8sRUFBRSxHQUFHLENBQUMsZ0JBQWdCO1FBQzdCLFVBQVUsRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLFVBQVU7S0FDeEMsQ0FBQyxDQUFDO0lBRUgsMENBQTBDO0lBQzFDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFZLEVBQUUsRUFBRTtRQUMvQyxzREFBc0Q7UUFDdEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ2hELEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNuQyxDQUFDO1FBRUQsT0FBTztZQUNMLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRTtZQUNkLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztZQUNwQixhQUFhLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxLQUFLO1lBQ3JDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztZQUNoQixLQUFLLEVBQUUsS0FBSztZQUNaLFlBQVksRUFBRSxJQUFJO1NBQ25CLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDUCxLQUFLLEVBQUUsY0FBYztRQUNyQixHQUFHLFFBQVE7S0FDWixDQUFDLENBQUM7QUFDTCxDQUFDIn0=