"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRepairStatusWorkflow = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const update_repair_ticket_status_1 = require("./steps/update-repair-ticket-status");
const emit_repair_status_changed_event_1 = require("./steps/emit-repair-status-changed-event");
const sync_repair_inventory_1 = require("./steps/sync-repair-inventory");
exports.updateRepairStatusWorkflow = (0, workflows_sdk_1.createWorkflow)("update-repair-status-workflow", function (input) {
    const updatedTicket = (0, update_repair_ticket_status_1.updateRepairTicketStatusStep)({
        repair_ticket_id: input.repair_ticket_id,
        status: input.status,
        estimated_completion: input.estimated_completion,
    });
    (0, sync_repair_inventory_1.syncRepairInventoryStep)({
        repair_ticket_id: input.repair_ticket_id,
        status: input.status,
    });
    // Emit event for subscribers
    (0, emit_repair_status_changed_event_1.emitRepairStatusChangedEventStep)({
        repair_ticket_id: input.repair_ticket_id,
        status: input.status,
        previous_status: input.previous_status,
    });
    return new workflows_sdk_1.WorkflowResponse({
        repairTicket: updatedTicket,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLXJlcGFpci1zdGF0dXMtd29ya2Zsb3cuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvd29ya2Zsb3dzL3VwZGF0ZS1yZXBhaXItc3RhdHVzLXdvcmtmbG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUcyQztBQUMzQyxxRkFBbUY7QUFDbkYsK0ZBQTRGO0FBQzVGLHlFQUF3RTtBQWlCM0QsUUFBQSwwQkFBMEIsR0FBRyxJQUFBLDhCQUFjLEVBQ3RELCtCQUErQixFQUMvQixVQUFVLEtBQXNDO0lBQzlDLE1BQU0sYUFBYSxHQUFHLElBQUEsMERBQTRCLEVBQUM7UUFDakQsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtRQUN4QyxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQWE7UUFDM0Isb0JBQW9CLEVBQUUsS0FBSyxDQUFDLG9CQUFvQjtLQUNqRCxDQUFDLENBQUM7SUFFSCxJQUFBLCtDQUF1QixFQUFDO1FBQ3RCLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0I7UUFDeEMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO0tBQ3JCLENBQUMsQ0FBQztJQUVILDZCQUE2QjtJQUM3QixJQUFBLG1FQUFnQyxFQUFDO1FBQy9CLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0I7UUFDeEMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO1FBQ3BCLGVBQWUsRUFBRSxLQUFLLENBQUMsZUFBZTtLQUN2QyxDQUFDLENBQUM7SUFFSCxPQUFPLElBQUksZ0NBQWdCLENBQUM7UUFDMUIsWUFBWSxFQUFFLGFBQWE7S0FDNUIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUNGLENBQUMifQ==