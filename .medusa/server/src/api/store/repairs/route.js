"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const create_repair_ticket_workflow_1 = require("../../../workflows/create-repair-ticket-workflow");
async function POST(req, res) {
    const logger = req.scope.resolve("logger");
    const customerId = req.auth_context?.actor_id;
    logger.info(`[Store/Repairs] 🟢 Initiating repair booking for customer: ${customerId || "Unauthenticated"}`);
    if (!customerId) {
        logger.warn(`[Store/Repairs] ⚠️ Unauthorized access attempt to book repair.`);
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNAUTHORIZED, "You must be logged in to book a repair");
    }
    const { device, ticket } = req.body;
    if (!device || !ticket) {
        logger.warn(`[Store/Repairs] ⚠️ Missing device or ticket details in payload.`);
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Device and ticket details are required");
    }
    logger.debug(`[Store/Repairs] Payload received. Device: ${device.brand} ${device.model_name}`);
    logger.debug(`[Store/Repairs] Issue: ${ticket.issue_description}`);
    // Force the customer ID on both device and ticket to be the logged in user
    const inputDevice = { ...device, customer_id: customerId };
    const inputTicket = { ...ticket, customer_id: customerId };
    try {
        const { result } = await (0, create_repair_ticket_workflow_1.createRepairTicketWorkflow)(req.scope).run({
            input: {
                device: inputDevice,
                ticket: inputTicket,
            },
        });
        logger.info(`[Store/Repairs] ✅ Successfully created repair ticket: ${result.repairTicket.ticket_number}`);
        res.json({
            repair_ticket: result.repairTicket,
            device: result.device,
        });
    }
    catch (error) {
        logger.error(`[Store/Repairs] ❌ Failed to create repair ticket`, error);
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3JlcGFpcnMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFPQSxvQkE4REM7QUFqRUQscURBQXdEO0FBQ3hELG9HQUE4RjtBQUV2RixLQUFLLFVBQVUsSUFBSSxDQUN4QixHQUErQixFQUMvQixHQUFtQjtJQUVuQixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMzQyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQztJQUU5QyxNQUFNLENBQUMsSUFBSSxDQUNULDhEQUE4RCxVQUFVLElBQUksaUJBQWlCLEVBQUUsQ0FDaEcsQ0FBQztJQUVGLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoQixNQUFNLENBQUMsSUFBSSxDQUNULGdFQUFnRSxDQUNqRSxDQUFDO1FBQ0YsTUFBTSxJQUFJLG1CQUFXLENBQ25CLG1CQUFXLENBQUMsS0FBSyxDQUFDLFlBQVksRUFDOUIsd0NBQXdDLENBQ3pDLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBVyxDQUFDO0lBRTNDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN2QixNQUFNLENBQUMsSUFBSSxDQUNULGlFQUFpRSxDQUNsRSxDQUFDO1FBQ0YsTUFBTSxJQUFJLG1CQUFXLENBQ25CLG1CQUFXLENBQUMsS0FBSyxDQUFDLFlBQVksRUFDOUIsd0NBQXdDLENBQ3pDLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FDViw2Q0FBNkMsTUFBTSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQ2pGLENBQUM7SUFDRixNQUFNLENBQUMsS0FBSyxDQUFDLDBCQUEwQixNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBRW5FLDJFQUEyRTtJQUMzRSxNQUFNLFdBQVcsR0FBRyxFQUFFLEdBQUcsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsQ0FBQztJQUMzRCxNQUFNLFdBQVcsR0FBRyxFQUFFLEdBQUcsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsQ0FBQztJQUUzRCxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFBLDBEQUEwQixFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDakUsS0FBSyxFQUFFO2dCQUNMLE1BQU0sRUFBRSxXQUFXO2dCQUNuQixNQUFNLEVBQUUsV0FBVzthQUNwQjtTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxJQUFJLENBQ1QseURBQXlELE1BQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQzdGLENBQUM7UUFFRixHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ1AsYUFBYSxFQUFFLE1BQU0sQ0FBQyxZQUFZO1lBQ2xDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixNQUFNLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sS0FBSyxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUMifQ==