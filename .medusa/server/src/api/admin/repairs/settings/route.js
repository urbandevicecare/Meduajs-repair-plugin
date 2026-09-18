"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const repair_1 = require("../../../../modules/repair");
// GET /admin/repairs/settings
async function GET(req, res) {
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    let [settings] = await repairService.listRepairSettings({});
    if (!settings) {
        settings = await repairService.createRepairSettings({
            email_notifications_enabled: true,
            sms_notifications_enabled: true,
            whatsapp_notifications_enabled: true,
        });
    }
    res.json({ settings });
}
// POST /admin/repairs/settings
async function POST(req, res) {
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    let [settings] = await repairService.listRepairSettings({});
    if (!settings) {
        settings = await repairService.createRepairSettings({
            email_notifications_enabled: req.body.email_notifications_enabled ?? true,
            sms_notifications_enabled: req.body.sms_notifications_enabled ?? true,
            whatsapp_notifications_enabled: req.body.whatsapp_notifications_enabled ?? true,
        });
    }
    else {
        settings = await repairService.updateRepairSettings({
            id: settings.id,
            ...req.body,
        });
    }
    res.json({ settings });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvc2V0dGluZ3Mvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSxrQkFhQztBQUdELG9CQW1DQztBQXZERCx1REFBMkQ7QUFHM0QsOEJBQThCO0FBQ3ZCLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxNQUFNLGFBQWEsR0FBd0IsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsc0JBQWEsQ0FBQyxDQUFDO0lBQzVFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUU1RCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDZCxRQUFRLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQUM7WUFDbEQsMkJBQTJCLEVBQUUsSUFBSTtZQUNqQyx5QkFBeUIsRUFBRSxJQUFJO1lBQy9CLDhCQUE4QixFQUFFLElBQUk7U0FDckMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUFFRCwrQkFBK0I7QUFDeEIsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FjRSxFQUNGLEdBQW1CO0lBRW5CLE1BQU0sYUFBYSxHQUF3QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDNUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sYUFBYSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTVELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNkLFFBQVEsR0FBRyxNQUFNLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQztZQUNsRCwyQkFBMkIsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixJQUFJLElBQUk7WUFDekUseUJBQXlCLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsSUFBSSxJQUFJO1lBQ3JFLDhCQUE4QixFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLElBQUksSUFBSTtTQUNoRixDQUFDLENBQUM7SUFDTCxDQUFDO1NBQU0sQ0FBQztRQUNOLFFBQVEsR0FBRyxNQUFNLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQztZQUNsRCxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDZixHQUFHLEdBQUcsQ0FBQyxJQUFJO1NBQ1osQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3pCLENBQUMifQ==