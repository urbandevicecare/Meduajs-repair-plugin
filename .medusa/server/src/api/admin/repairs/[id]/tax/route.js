"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const repair_1 = require("../../../../../modules/repair");
async function POST(req, res) {
    const { apply_tax } = req.body;
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    const ticket = await repairService.retrieveRepairTicket(req.params.id);
    const partsEstimate = Number(ticket.parts_estimate || 0);
    const laborEstimate = Number(ticket.labor_estimate || 0);
    let newTotal = partsEstimate + laborEstimate;
    if (apply_tax) {
        newTotal = newTotal * 1.16;
    }
    const updatedTicket = await repairService.updateRepairTickets({
        id: req.params.id,
        apply_tax,
        total_estimate: newTotal
    });
    res.json({ repair_ticket: updatedTicket });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS90YXgvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxvQkF3QkM7QUEzQkQsMERBQThEO0FBR3ZELEtBQUssVUFBVSxJQUFJLENBQ3hCLEdBQTBDLEVBQzFDLEdBQW1CO0lBRW5CLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0lBQy9CLE1BQU0sYUFBYSxHQUF3QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFFNUUsTUFBTSxNQUFNLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUV2RSxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN6RCxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUV6RCxJQUFJLFFBQVEsR0FBRyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQzdDLElBQUksU0FBUyxFQUFFLENBQUM7UUFDZCxRQUFRLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUM7UUFDNUQsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNqQixTQUFTO1FBQ1QsY0FBYyxFQUFFLFFBQVE7S0FDekIsQ0FBQyxDQUFDO0lBRUgsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLENBQUMifQ==