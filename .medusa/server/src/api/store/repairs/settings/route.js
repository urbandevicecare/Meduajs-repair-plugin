"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const repair_1 = require("../../../../modules/repair");
async function GET(req, res) {
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    const settingsList = await repairService.listRepairSettings();
    const settings = settingsList[0] || {};
    // Only return public settings!
    return res.json({
        settings: {
            paystack_enabled: settings.paystack_enabled || false,
            paystack_public_key: settings.paystack_enabled ? settings.paystack_public_key : null,
            company_name: settings.company_name,
            storefront_url: settings.storefront_url
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvc2V0dGluZ3Mvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxrQkFlQztBQWxCRCx1REFBMkQ7QUFHcEQsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sYUFBYSxHQUF3QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFFNUUsTUFBTSxZQUFZLEdBQUcsTUFBTSxhQUFhLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM5RCxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRXZDLCtCQUErQjtJQUMvQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDZCxRQUFRLEVBQUU7WUFDUixnQkFBZ0IsRUFBRSxRQUFRLENBQUMsZ0JBQWdCLElBQUksS0FBSztZQUNwRCxtQkFBbUIsRUFBRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNwRixZQUFZLEVBQUUsUUFBUSxDQUFDLFlBQVk7WUFDbkMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxjQUFjO1NBQ3hDO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyJ9