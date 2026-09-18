"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const repair_1 = require("../../../../../modules/repair");
const utils_1 = require("@medusajs/framework/utils");
const repair_2 = require("../../../../../utils/templates/repair");
async function POST(req, res) {
    const { estimated_completion, technician_name, technician_id } = req.validatedBody;
    const repairService = req.scope.resolve(repair_1.REPAIR_MODULE);
    // Get current ticket to check if technician changed
    const currentTicket = await repairService.retrieveRepairTicket(req.params.id);
    const isNewAssignment = technician_id && technician_id !== currentTicket.technician_id;
    const updatedTicket = await repairService.updateRepairTickets({
        id: req.params.id,
        estimated_completion: estimated_completion
            ? new Date(estimated_completion)
            : null,
        technician_name: technician_name || null,
        technician_id: technician_id || null,
    });
    if (isNewAssignment) {
        // Notify technician
        let technicianEmail = "";
        const customerModuleService = req.scope.resolve(utils_1.Modules.CUSTOMER);
        try {
            const customer = await customerModuleService.retrieveCustomer(technician_id);
            if (customer.email)
                technicianEmail = customer.email;
        }
        catch (e) {
            try {
                const userModuleService = req.scope.resolve(utils_1.Modules.USER);
                const user = await userModuleService.retrieveUser(technician_id);
                if (user.email)
                    technicianEmail = user.email;
            }
            catch (e2) { }
        }
        if (technicianEmail) {
            const [settings] = await repairService.listRepairSettings({});
            if (!settings || settings.email_notifications_enabled) {
                const templateData = {
                    ticket_number: updatedTicket.ticket_number,
                    status: updatedTicket.status,
                    repair_ticket_id: updatedTicket.id,
                    technician_name: updatedTicket.technician_name,
                };
                const template = (0, repair_2.getRepairTemplate)("technician-assigned", templateData);
                const notificationModuleService = req.scope.resolve(utils_1.Modules.NOTIFICATION);
                try {
                    await notificationModuleService.createNotifications({
                        to: technicianEmail,
                        channel: "email",
                        template: "technician-assigned",
                        content: {
                            subject: `New Repair Job Assigned: #${updatedTicket.ticket_number}`,
                            html: template.html,
                        },
                        data: {
                            ...templateData,
                            body: template.text,
                        },
                    });
                }
                catch (err) {
                    req.scope.resolve("logger").error(`Failed to send technician notification: ${err.message}`);
                }
            }
        }
    }
    res.json({
        repair_ticket: updatedTicket,
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3JlcGFpcnMvW2lkXS9kZXRhaWxzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsb0JBMkVDO0FBaEZELDBEQUE4RDtBQUU5RCxxREFBb0Q7QUFDcEQsa0VBQTBFO0FBRW5FLEtBQUssVUFBVSxJQUFJLENBQ3hCLEdBSUUsRUFDRixHQUFtQjtJQUVuQixNQUFNLEVBQUUsb0JBQW9CLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUM7SUFDbkYsTUFBTSxhQUFhLEdBQXdCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHNCQUFhLENBQUMsQ0FBQztJQUU1RSxvREFBb0Q7SUFDcEQsTUFBTSxhQUFhLEdBQUcsTUFBTSxhQUFhLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5RSxNQUFNLGVBQWUsR0FBRyxhQUFhLElBQUksYUFBYSxLQUFLLGFBQWEsQ0FBQyxhQUFhLENBQUM7SUFFdkYsTUFBTSxhQUFhLEdBQUcsTUFBTSxhQUFhLENBQUMsbUJBQW1CLENBQUM7UUFDNUQsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNqQixvQkFBb0IsRUFBRSxvQkFBb0I7WUFDeEMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDO1lBQ2hDLENBQUMsQ0FBQyxJQUFJO1FBQ1IsZUFBZSxFQUFFLGVBQWUsSUFBSSxJQUFJO1FBQ3hDLGFBQWEsRUFBRSxhQUFhLElBQUksSUFBSTtLQUNyQyxDQUFDLENBQUM7SUFFSCxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQ3BCLG9CQUFvQjtRQUNwQixJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDekIsTUFBTSxxQkFBcUIsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM3RSxJQUFJLFFBQVEsQ0FBQyxLQUFLO2dCQUFFLGVBQWUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ3ZELENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1gsSUFBSSxDQUFDO2dCQUNILE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLElBQUksR0FBRyxNQUFNLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDakUsSUFBSSxJQUFJLENBQUMsS0FBSztvQkFBRSxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUMvQyxDQUFDO1lBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFBLENBQUM7UUFDakIsQ0FBQztRQUVELElBQUksZUFBZSxFQUFFLENBQUM7WUFDcEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sYUFBYSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLDJCQUEyQixFQUFFLENBQUM7Z0JBQ3RELE1BQU0sWUFBWSxHQUFHO29CQUNyQixhQUFhLEVBQUUsYUFBYSxDQUFDLGFBQWE7b0JBQzFDLE1BQU0sRUFBRSxhQUFhLENBQUMsTUFBTTtvQkFDNUIsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLEVBQUU7b0JBQ2xDLGVBQWUsRUFBRSxhQUFhLENBQUMsZUFBZTtpQkFDL0MsQ0FBQztnQkFDRixNQUFNLFFBQVEsR0FBRyxJQUFBLDBCQUFpQixFQUFDLHFCQUFxQixFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUV4RSxNQUFNLHlCQUF5QixHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUUsSUFBSSxDQUFDO29CQUNILE1BQU0seUJBQXlCLENBQUMsbUJBQW1CLENBQUM7d0JBQ2xELEVBQUUsRUFBRSxlQUFlO3dCQUNuQixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsUUFBUSxFQUFFLHFCQUFxQjt3QkFDL0IsT0FBTyxFQUFFOzRCQUNQLE9BQU8sRUFBRSw2QkFBNkIsYUFBYSxDQUFDLGFBQWEsRUFBRTs0QkFDbkUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO3lCQUNwQjt3QkFDRCxJQUFJLEVBQUU7NEJBQ0osR0FBRyxZQUFZOzRCQUNmLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTt5QkFDcEI7cUJBQ0YsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztvQkFDbEIsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLDJDQUEyQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDOUYsQ0FBQztZQUNELENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDUCxhQUFhLEVBQUUsYUFBYTtLQUM3QixDQUFDLENBQUM7QUFDTCxDQUFDIn0=