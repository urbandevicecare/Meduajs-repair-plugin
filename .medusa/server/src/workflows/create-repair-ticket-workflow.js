"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepairTicketWorkflow = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const create_device_1 = require("./steps/create-device");
const create_repair_ticket_1 = require("./steps/create-repair-ticket");
const emit_compliance_requested_event_1 = require("./steps/emit-compliance-requested-event");
exports.createRepairTicketWorkflow = (0, workflows_sdk_1.createWorkflow)("create-repair-ticket-workflow", function (input) {
    const device = (0, create_device_1.createDeviceStep)(input.device);
    const repairTicket = (0, create_repair_ticket_1.createRepairTicketStep)({
        device_id: device.id,
        customer_id: input.ticket.customer_id,
        issue_description: input.ticket.issue_description,
        technician_name: input.ticket.technician_name,
        accessories: input.ticket.accessories,
        terms_accepted: input.ticket.terms_accepted,
        data_wiped_consent: input.ticket.data_wiped_consent,
    });
    (0, emit_compliance_requested_event_1.emitComplianceRequestedEventStep)({
        ticket_id: repairTicket.id,
        terms_accepted: input.ticket.terms_accepted ?? false,
    });
    return new workflows_sdk_1.WorkflowResponse({
        device,
        repairTicket,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXJlcGFpci10aWNrZXQtd29ya2Zsb3cuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvd29ya2Zsb3dzL2NyZWF0ZS1yZXBhaXItdGlja2V0LXdvcmtmbG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUcyQztBQUMzQyx5REFBeUQ7QUFDekQsdUVBQXNFO0FBQ3RFLDZGQUEyRjtBQXFCOUUsUUFBQSwwQkFBMEIsR0FBRyxJQUFBLDhCQUFjLEVBQ3RELCtCQUErQixFQUMvQixVQUFVLEtBQXNDO0lBQzlDLE1BQU0sTUFBTSxHQUFHLElBQUEsZ0NBQWdCLEVBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTlDLE1BQU0sWUFBWSxHQUFHLElBQUEsNkNBQXNCLEVBQUM7UUFDMUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ3BCLFdBQVcsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVc7UUFDckMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUI7UUFDakQsZUFBZSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsZUFBZTtRQUM3QyxXQUFXLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXO1FBQ3JDLGNBQWMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWM7UUFDM0Msa0JBQWtCLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0I7S0FDcEQsQ0FBQyxDQUFDO0lBRUgsSUFBQSxrRUFBZ0MsRUFBQztRQUMvQixTQUFTLEVBQUUsWUFBWSxDQUFDLEVBQUU7UUFDMUIsY0FBYyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxJQUFJLEtBQUs7S0FDckQsQ0FBQyxDQUFDO0lBRUgsT0FBTyxJQUFJLGdDQUFnQixDQUFDO1FBQzFCLE1BQU07UUFDTixZQUFZO0tBQ2IsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUNGLENBQUMifQ==