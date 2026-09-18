"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveRepairCostWorkflow = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const approve_repair_cost_1 = require("./steps/approve-repair-cost");
const update_repair_ticket_status_1 = require("./steps/update-repair-ticket-status");
const create_repair_payment_collection_1 = require("./steps/create-repair-payment-collection");
exports.approveRepairCostWorkflow = (0, workflows_sdk_1.createWorkflow)("approve-repair-cost-workflow", function (input) {
    const approvedTicket = (0, approve_repair_cost_1.approveRepairCostStep)(input);
    // Automatically update status to "repairing" after approval
    const updatedTicket = (0, update_repair_ticket_status_1.updateRepairTicketStatusStep)({
        repair_ticket_id: input.repair_ticket_id,
        status: "repairing",
    });
    const paymentInput = (0, workflows_sdk_1.transform)({ approvedTicket, input }, ({ approvedTicket, input }) => ({
        repair_ticket_id: input.repair_ticket_id,
        customer_id: approvedTicket.customer_id,
    }));
    const { paymentCollection } = (0, create_repair_payment_collection_1.createRepairPaymentCollectionStep)(paymentInput);
    return new workflows_sdk_1.WorkflowResponse({
        repairTicket: updatedTicket,
        paymentCollection,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwcm92ZS1yZXBhaXItY29zdC13b3JrZmxvdy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy93b3JrZmxvd3MvYXBwcm92ZS1yZXBhaXItY29zdC13b3JrZmxvdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxRUFJMkM7QUFDM0MscUVBQW9FO0FBQ3BFLHFGQUFtRjtBQUNuRiwrRkFBNkY7QUFNaEYsUUFBQSx5QkFBeUIsR0FBRyxJQUFBLDhCQUFjLEVBQ3JELDhCQUE4QixFQUM5QixVQUFVLEtBQXFDO0lBQzdDLE1BQU0sY0FBYyxHQUFHLElBQUEsMkNBQXFCLEVBQUMsS0FBSyxDQUFDLENBQUM7SUFFcEQsNERBQTREO0lBQzVELE1BQU0sYUFBYSxHQUFHLElBQUEsMERBQTRCLEVBQUM7UUFDakQsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtRQUN4QyxNQUFNLEVBQUUsV0FBVztLQUNwQixDQUFDLENBQUM7SUFFSCxNQUFNLFlBQVksR0FBRyxJQUFBLHlCQUFTLEVBQUMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4RixnQkFBZ0IsRUFBRSxLQUFLLENBQUMsZ0JBQWdCO1FBQ3hDLFdBQVcsRUFBRSxjQUFjLENBQUMsV0FBVztLQUN4QyxDQUFDLENBQUMsQ0FBQztJQUVKLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxHQUFHLElBQUEsb0VBQWlDLEVBQUMsWUFBWSxDQUFDLENBQUM7SUFFOUUsT0FBTyxJQUFJLGdDQUFnQixDQUFDO1FBQzFCLFlBQVksRUFBRSxhQUFhO1FBQzNCLGlCQUFpQjtLQUNsQixDQUFDLENBQUM7QUFDTCxDQUFDLENBQ0YsQ0FBQyJ9