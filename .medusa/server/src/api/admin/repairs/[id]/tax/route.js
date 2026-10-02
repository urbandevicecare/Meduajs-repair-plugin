"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const toggle_repair_tax_workflow_1 = require("../../../../../workflows/toggle-repair-tax-workflow");
async function POST(req, res) {
    const { apply_tax } = req.body;
    const { result } = await (0, toggle_repair_tax_workflow_1.toggleRepairTaxWorkflow)(req.scope).run({
        input: {
            repair_ticket_id: req.params.id,
            apply_tax,
        },
    });
    res.json({ repair_ticket: result });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS90YXgvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxvQkFjQztBQWhCRCxvR0FBOEY7QUFFdkYsS0FBSyxVQUFVLElBQUksQ0FDeEIsR0FBMEMsRUFDMUMsR0FBbUI7SUFFbkIsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFFL0IsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBQSxvREFBdUIsRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzlELEtBQUssRUFBRTtZQUNMLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMvQixTQUFTO1NBQ1Y7S0FDRixDQUFDLENBQUM7SUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDdEMsQ0FBQyJ9