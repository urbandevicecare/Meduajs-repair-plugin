"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: ["*", "device.*"],
    });
    const totalRepairs = tickets.length;
    const statusCounts = tickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
    }, {});
    const totalExpectedRevenue = tickets.reduce((total, ticket) => {
        if (ticket.status !== "cancelled") {
            const val = typeof ticket.total_estimate === "object" &&
                ticket.total_estimate !== null &&
                "value" in ticket.total_estimate
                ? Number(ticket.total_estimate.value)
                : Number(ticket.total_estimate || 0);
            return total + val;
        }
        return total;
    }, 0);
    // Wait, let's also send back recent completed ones to calculate average repair time.
    const completedTickets = tickets.filter((t) => t.status === "completed" && t.completed_at && t.created_at);
    let avgRepairTimeMs = 0;
    if (completedTickets.length > 0) {
        const totalTime = completedTickets.reduce((sum, t) => sum +
            (new Date(t.completed_at).getTime() - new Date(t.created_at).getTime()), 0);
        avgRepairTimeMs = totalTime / completedTickets.length;
    }
    const monthlyRevenue = tickets.reduce((acc, ticket) => {
        if (ticket.status !== "cancelled") {
            const date = new Date(ticket.created_at);
            const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
            const tParts = typeof ticket.parts_estimate === "object" &&
                ticket.parts_estimate !== null &&
                "value" in ticket.parts_estimate
                ? Number(ticket.parts_estimate.value)
                : Number(ticket.parts_estimate || 0);
            const tLabor = typeof ticket.labor_estimate === "object" &&
                ticket.labor_estimate !== null &&
                "value" in ticket.labor_estimate
                ? Number(ticket.labor_estimate.value)
                : Number(ticket.labor_estimate || 0);
            const tTotal = typeof ticket.total_estimate === "object" &&
                ticket.total_estimate !== null &&
                "value" in ticket.total_estimate
                ? Number(ticket.total_estimate.value)
                : Number(ticket.total_estimate || 0);
            let partsAmount = tParts;
            let laborAmount = tLabor;
            if (partsAmount === 0 && laborAmount === 0 && tTotal > 0) {
                partsAmount = tTotal; // Fallback for old tickets
            }
            if (!acc[monthYear]) {
                acc[monthYear] = {
                    month: monthYear,
                    partsRevenue: 0,
                    laborRevenue: 0,
                    totalRevenue: 0,
                    timestamp: date.getTime(),
                };
            }
            acc[monthYear].partsRevenue += Number((partsAmount).toFixed(2));
            acc[monthYear].laborRevenue += Number((laborAmount).toFixed(2));
            acc[monthYear].totalRevenue += Number((tTotal).toFixed(2));
        }
        return acc;
    }, {});
    const monthlyRevenueArray = Object.values(monthlyRevenue).sort((a, b) => a.timestamp - b.timestamp);
    res.json({
        analytics: {
            total_repairs: totalRepairs,
            status_counts: statusCounts,
            total_expected_revenue: totalExpectedRevenue,
            avg_repair_time_days: avgRepairTimeMs / (1000 * 60 * 60 * 24),
            completed_count: completedTickets.length,
            monthly_revenue: monthlyRevenueArray,
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvYW5hbHl0aWNzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0Esa0JBNEdDO0FBaEhELHFEQUFzRTtBQUkvRCxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDMUMsTUFBTSxFQUFFLGVBQWU7UUFDdkIsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQztLQUMxQixDQUFDLENBQUM7SUFFSCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBRXBDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDdkQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRVAsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBYSxFQUFFLE1BQVcsRUFBRSxFQUFFO1FBQ3pFLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUNsQyxNQUFNLEdBQUcsR0FDUCxPQUFPLE1BQU0sQ0FBQyxjQUFjLEtBQUssUUFBUTtnQkFDekMsTUFBTSxDQUFDLGNBQWMsS0FB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