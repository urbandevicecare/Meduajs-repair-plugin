"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleRepairTaxWorkflow = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const update_repair_costs_1 = require("./steps/update-repair-costs");
exports.toggleRepairTaxWorkflow = (0, workflows_sdk_1.createWorkflow)("toggle-repair-tax", (input) => {
    const updatedTicket = (0, update_repair_costs_1.updateRepairCostsStep)({
        repair_ticket_id: input.repair_ticket_id,
        apply_tax: input.apply_tax,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedTicket);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlLXJlcGFpci10YXgtd29ya2Zsb3cuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvd29ya2Zsb3dzL3RvZ2dsZS1yZXBhaXItdGF4LXdvcmtmbG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUcyQztBQUMzQyxxRUFBb0U7QUFPdkQsUUFBQSx1QkFBdUIsR0FBRyxJQUFBLDhCQUFjLEVBQ25ELG1CQUFtQixFQUNuQixDQUFDLEtBQW1DLEVBQUUsRUFBRTtJQUN0QyxNQUFNLGFBQWEsR0FBRyxJQUFBLDJDQUFxQixFQUFDO1FBQzFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0I7UUFDeEMsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTO0tBQzNCLENBQUMsQ0FBQztJQUVILE9BQU8sSUFBSSxnQ0FBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM3QyxDQUFDLENBQ0YsQ0FBQyJ9