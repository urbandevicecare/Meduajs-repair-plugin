"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = handleOrderCanceled;
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../modules/repair");
async function handleOrderCanceled({ event: { data }, container, }) {
    const orderModuleService = container.resolve(utils_1.Modules.ORDER);
    const repairService = container.resolve(repair_1.REPAIR_MODULE);
    // Retrieve the canceled order
    const order = await orderModuleService.retrieveOrder(data.id);
    // Check if it's tied to a repair ticket
    const repairTicketId = order.metadata?.repair_ticket_id;
    if (!repairTicketId) {
        return;
    }
    // Update the repair ticket to cancelled
    try {
        await repairService.updateRepairTickets({
            id: repairTicketId,
            status: "cancelled",
        });
    }
    catch (error) {
        console.error(`Failed to cancel repair ticket ${repairTicketId} after order ${data.id} was cancelled:`, error);
    }
}
exports.config = {
    event: "order.canceled",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItY2FuY2VsZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3Vic2NyaWJlcnMvb3JkZXItY2FuY2VsZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBUUEsc0NBeUJDO0FBN0JELHFEQUFvRDtBQUNwRCw4Q0FBa0Q7QUFHbkMsS0FBSyxVQUFVLG1CQUFtQixDQUFDLEVBQ2hELEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUNmLFNBQVMsR0FDc0I7SUFDL0IsTUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1RCxNQUFNLGFBQWEsR0FBd0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFFNUUsOEJBQThCO0lBQzlCLE1BQU0sS0FBSyxHQUFHLE1BQU0sa0JBQWtCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUU5RCx3Q0FBd0M7SUFDeEMsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxnQkFBMEIsQ0FBQztJQUNsRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDcEIsT0FBTztJQUNULENBQUM7SUFFRCx3Q0FBd0M7SUFDeEMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUM7WUFDdEMsRUFBRSxFQUFFLGNBQWM7WUFDbEIsTUFBTSxFQUFFLFdBQWtCO1NBQzNCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsY0FBYyxnQkFBZ0IsSUFBSSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDakgsQ0FBQztBQUNILENBQUM7QUFFWSxRQUFBLE1BQU0sR0FBcUI7SUFDdEMsS0FBSyxFQUFFLGdCQUFnQjtDQUN4QixDQUFDIn0=