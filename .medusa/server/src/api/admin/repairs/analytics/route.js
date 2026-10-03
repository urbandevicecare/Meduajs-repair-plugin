"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
async function GET(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const timeframe = req.query.timeframe; // 'day', 'week', 'month', 'year', 'all'
    let filters = {};
    if (timeframe && timeframe !== 'all') {
        const now = new Date();
        let startDate = new Date();
        if (timeframe === 'day') {
            startDate.setHours(0, 0, 0, 0);
        }
        else if (timeframe === 'week') {
            startDate.setDate(now.getDate() - 7);
        }
        else if (timeframe === 'month') {
            startDate.setMonth(now.getMonth() - 1);
        }
        else if (timeframe === 'year') {
            startDate.setFullYear(now.getFullYear() - 1);
        }
        filters = {
            created_at: {
                $gte: startDate.toISOString()
            }
        };
    }
    const { data: tickets } = await query.graph({
        entity: "repair_ticket",
        fields: ["*", "device.*"],
        filters
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
        raw_tickets: tickets,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvYW5hbHl0aWNzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBS0Esa0JBc0lDO0FBMUlELHFEQUFzRTtBQUkvRCxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakUsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFtQixDQUFDLENBQUMsd0NBQXdDO0lBQ3pGLElBQUksT0FBTyxHQUFRLEVBQUUsQ0FBQztJQUV0QixJQUFJLFNBQVMsSUFBSSxTQUFTLEtBQUssS0FBSyxFQUFFLENBQUM7UUFDckMsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBRTNCLElBQUksU0FBUyxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQ3hCLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakMsQ0FBQzthQUFNLElBQUksU0FBUyxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ2hDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7YUFBTSxJQUFJLFNBQVMsS0FBSyxPQUFPLEVBQUUsQ0FBQztZQUNqQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6QyxDQUFDO2FBQU0sSUFBSSxTQUFTLEtBQUssTUFBTSxFQUFFLENBQUM7WUFDaEMs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