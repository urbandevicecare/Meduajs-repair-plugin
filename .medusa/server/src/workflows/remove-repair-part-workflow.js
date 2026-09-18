"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRepairPartWorkflow = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const remove_repair_part_1 = require("./steps/remove-repair-part");
exports.removeRepairPartWorkflow = (0, workflows_sdk_1.createWorkflow)("remove-repair-part-workflow", function (input) {
    const result = (0, remove_repair_part_1.removeRepairPartStep)(input);
    return new workflows_sdk_1.WorkflowResponse(result);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLXJlcGFpci1wYXJ0LXdvcmtmbG93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9yZW1vdmUtcmVwYWlyLXBhcnQtd29ya2Zsb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBRzJDO0FBQzNDLG1FQUFrRTtBQU9yRCxRQUFBLHdCQUF3QixHQUFHLElBQUEsOEJBQWMsRUFDcEQsNkJBQTZCLEVBQzdCLFVBQVUsS0FBb0M7SUFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBQSx5Q0FBb0IsRUFBQyxLQUFLLENBQUMsQ0FBQztJQUUzQyxPQUFPLElBQUksZ0NBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEMsQ0FBQyxDQUNGLENBQUMifQ==