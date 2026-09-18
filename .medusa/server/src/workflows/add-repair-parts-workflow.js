"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRepairPartsWorkflow = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const add_repair_parts_1 = require("./steps/add-repair-parts");
exports.addRepairPartsWorkflow = (0, workflows_sdk_1.createWorkflow)("add-repair-parts-workflow", function (input) {
    const result = (0, add_repair_parts_1.addRepairPartsStep)(input);
    return new workflows_sdk_1.WorkflowResponse(result);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLXJlcGFpci1wYXJ0cy13b3JrZmxvdy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy93b3JrZmxvd3MvYWRkLXJlcGFpci1wYXJ0cy13b3JrZmxvdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFHMkM7QUFDM0MsK0RBQThEO0FBT2pELFFBQUEsc0JBQXNCLEdBQUcsSUFBQSw4QkFBYyxFQUNsRCwyQkFBMkIsRUFDM0IsVUFBVSxLQUFrQztJQUMxQyxNQUFNLE1BQU0sR0FBRyxJQUFBLHFDQUFrQixFQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXpDLE9BQU8sSUFBSSxnQ0FBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN0QyxDQUFDLENBQ0YsQ0FBQyJ9