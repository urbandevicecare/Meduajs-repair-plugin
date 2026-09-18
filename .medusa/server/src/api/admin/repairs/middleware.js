"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repairMiddlewares = void 0;
const framework_1 = require("@medusajs/framework");
const zod_1 = require("@medusajs/framework/zod");
const validators_1 = require("@medusajs/medusa/api/utils/validators");
const GetRepairsSchema = (0, validators_1.createFindParams)().extend({
    customer_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
});
const CreateRepairTicketSchema = zod_1.z.object({
    device: zod_1.z.object({
        serial_number: zod_1.z.string(),
        model_name: zod_1.z.string(),
        brand: zod_1.z.string(),
        customer_id: zod_1.z.string().optional(),
        imei: zod_1.z.string().optional(),
        condition: zod_1.z.string().optional(),
    }),
    ticket: zod_1.z.object({
        customer_id: zod_1.z.string().optional(),
        issue_description: zod_1.z.string(),
        accessories: zod_1.z.string().optional(),
        terms_accepted: zod_1.z.boolean().optional(),
        data_wiped_consent: zod_1.z.boolean().optional(),
    }),
});
const UpdateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "received",
        "diagnosing",
        "awaiting_approval",
        "repairing",
        "ready",
        "completed",
        "cancelled",
        "refunded",
    ]),
    estimated_completion: zod_1.z.string().optional(),
    previous_status: zod_1.z.string().optional(),
});
const AddPartsSchema = zod_1.z.object({
    variant_ids: zod_1.z.array(zod_1.z.string()),
});
const UpdateCostsSchema = zod_1.z.object({
    parts_estimate: zod_1.z.number().optional(),
    labor_estimate: zod_1.z.number().optional(),
    parts_actual: zod_1.z.number().optional(),
    labor_actual: zod_1.z.number().optional(),
});
const AddMediaSchema = zod_1.z.object({
    file_url: zod_1.z.string(),
    file_name: zod_1.z.string(),
    file_type: zod_1.z.enum(["image", "video"]),
    mime_type: zod_1.z.string().optional(),
    file_size: zod_1.z.number().optional(),
    description: zod_1.z.string().optional(),
});
const AddNoteSchema = zod_1.z.object({
    content: zod_1.z.string(),
    is_internal: zod_1.z.boolean(),
});
const AddMessageSchema = zod_1.z.object({
    message: zod_1.z.string(),
});
const AddDetailsSchema = zod_1.z.object({
    estimated_completion: zod_1.z.string().nullable().optional(),
    technician_name: zod_1.z.string().nullable().optional(),
    technician_id: zod_1.z.string().nullable().optional(),
});
exports.repairMiddlewares = [
    {
        method: ["GET"],
        matcher: "/admin/repairs",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(GetRepairsSchema, {
                defaults: ["id", "ticket_number", "status", "created_at"],
                isList: true,
            }),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/repairs",
        middlewares: [(0, framework_1.validateAndTransformBody)(CreateRepairTicketSchema)],
    },
    {
        method: ["POST"],
        matcher: "/admin/repairs/:id/status",
        middlewares: [(0, framework_1.validateAndTransformBody)(UpdateStatusSchema)],
    },
    {
        method: ["POST"],
        matcher: "/admin/repairs/:id/parts",
        middlewares: [(0, framework_1.validateAndTransformBody)(AddPartsSchema)],
    },
    {
        method: ["POST"],
        matcher: "/admin/repairs/:id/costs",
        middlewares: [(0, framework_1.validateAndTransformBody)(UpdateCostsSchema)],
    },
    {
        method: ["POST"],
        matcher: "/admin/repairs/:id/media",
        middlewares: [(0, framework_1.validateAndTransformBody)(AddMediaSchema)],
    },
    {
        method: ["POST"],
        matcher: "/admin/repairs/:id/notes",
        middlewares: [(0, framework_1.validateAndTransformBody)(AddNoteSchema)],
    },
    {
        method: ["POST"],
        matcher: "/admin/repairs/:id/messages",
        middlewares: [(0, framework_1.validateAndTransformBody)(AddMessageSchema)],
    },
    {
        method: ["POST"],
        matcher: "/admin/repairs/:id/details",
        middlewares: [(0, framework_1.validateAndTransformBody)(AddDetailsSchema)],
    },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9hcGkvYWRtaW4vcmVwYWlycy9taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1EQUk2QjtBQUM3QixpREFBNEM7QUFDNUMsc0VBQXlFO0FBRXpFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSw2QkFBZ0IsR0FBRSxDQUFDLE1BQU0sQ0FBQztJQUNqRCxXQUFXLEVBQUUsT0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxPQUFDLENBQUMsS0FBSyxDQUFDLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7Q0FDbkUsQ0FBQyxDQUFDO0FBRUgsTUFBTSx3QkFBd0IsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hDLE1BQU0sRUFBRSxPQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2YsYUFBYSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUU7UUFDekIsVUFBVSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUU7UUFDdEIsS0FBSyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUU7UUFDakIsV0FBVyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDbEMsSUFBSSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDM0IsU0FBUyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7S0FDakMsQ0FBQztJQUNGLE1BQU0sRUFBRSxPQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2YsV0FBVyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDbEMsaUJBQWlCLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtRQUM3QixXQUFXLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtRQUNsQyxjQUFjLEVBQUUsT0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRTtRQUN0QyxrQkFBa0IsRUFBRSxPQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFO0tBQzNDLENBQUM7Q0FDSCxDQUFDLENBQUM7QUFFSCxNQUFNLGtCQUFrQixHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDbEMsTUFBTSxFQUFFLE9BQUMsQ0FBQyxJQUFJLENBQUM7UUFDYixVQUFVO1FBQ1YsWUFBWTtRQUNaLG1CQUFtQjtRQUNuQixXQUFXO1FBQ1gsT0FBTztRQUNQLFdBQVc7UUFDWCxXQUFXO1FBQ1gsVUFBVTtLQUNYLENBQUM7SUFDRixvQkFBb0IsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzNDLGVBQWUsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0NBQ3ZDLENBQUMsQ0FBQztBQUVILE1BQU0sY0FBYyxHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDOUIsV0FBVyxFQUFFLE9BQUMsQ0FBQyxLQUFLLENBQUMsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQ2pDLENBQUMsQ0FBQztBQUVILE1BQU0saUJBQWlCLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNqQyxjQUFjLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNyQyxjQUFjLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNyQyxZQUFZLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNuQyxZQUFZLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUNwQyxDQUFDLENBQUM7QUFFSCxNQUFNLGNBQWMsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQzlCLFFBQVEsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFO0lBQ3BCLFNBQVMsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFO0lBQ3JCLFNBQVMsRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JDLFNBQVMsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2hDLFNBQVMsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2hDLFdBQVcsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0NBQ25DLENBQUMsQ0FBQztBQUVILE1BQU0sYUFBYSxHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDN0IsT0FBTyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUU7SUFDbkIsV0FBVyxFQUFFLE9BQUMsQ0FBQyxPQUFPLEVBQUU7Q0FDekIsQ0FBQyxDQUFDO0FBRUgsTUFBTSxnQkFBZ0IsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQ2hDLE9BQU8sRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFO0NBQ3BCLENBQUMsQ0FBQztBQUVILE1BQU0sZ0JBQWdCLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNoQyxvQkFBb0IsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3RELGVBQWUsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2pELGFBQWEsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFO0NBQ2hELENBQUMsQ0FBQztBQUVVLFFBQUEsaUJBQWlCLEdBQXNCO0lBQ2xEO1FBQ0UsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2YsT0FBTyxFQUFFLGdCQUFnQjtRQUN6QixXQUFXLEVBQUU7WUFDWCxJQUFBLHFDQUF5QixFQUFDLGdCQUFnQixFQUFFO2dCQUMxQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUM7Z0JBQ3pELE1BQU0sRUFBRSxJQUFJO2FBQ2IsQ0FBQztTQUNIO0tBQ0Y7SUFDRDtRQUNFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNoQixPQUFPLEVBQUUsZ0JBQWdCO1FBQ3pCLFdBQVcsRUFBRSxDQUFDLElBQUEsb0NBQXdCLEVBQUMsd0JBQXdCLENBQUMsQ0FBQztLQUNsRTtJQUNEO1FBQ0UsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ2hCLE9BQU8sRUFBRSwyQkFBMkI7UUFDcEMsV0FBVyxFQUFFLENBQUMsSUFBQSxvQ0FBd0IsRUFBQyxrQkFBa0IsQ0FBQyxDQUFDO0tBQzVEO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDaEIsT0FBTyxFQUFFLDBCQUEwQjtRQUNuQyxXQUFXLEVBQUUsQ0FBQyxJQUFBLG9DQUF3QixFQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3hEO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDaEIsT0FBTyxFQUFFLDBCQUEwQjtRQUNuQyxXQUFXLEVBQUUsQ0FBQyxJQUFBLG9DQUF3QixFQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDM0Q7SUFDRDtRQUNFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNoQixPQUFPLEVBQUUsMEJBQTBCO1FBQ25DLFdBQVcsRUFBRSxDQUFDLElBQUEsb0NBQXdCLEVBQUMsY0FBYyxDQUFDLENBQUM7S0FDeEQ7SUFDRDtRQUNFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNoQixPQUFPLEVBQUUsMEJBQTBCO1FBQ25DLFdBQVcsRUFBRSxDQUFDLElBQUEsb0NBQXdCLEVBQUMsYUFBYSxDQUFDLENBQUM7S0FDdkQ7SUFDRDtRQUNFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNoQixPQUFPLEVBQUUsNkJBQTZCO1FBQ3RDLFdBQVcsRUFBRSxDQUFDLElBQUEsb0NBQXdCLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUMxRDtJQUNEO1FBQ0UsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ2hCLE9BQU8sRUFBRSw0QkFBNEI7UUFDckMsV0FBVyxFQUFFLENBQUMsSUFBQSxvQ0FBd0IsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQzFEO0NBQ0YsQ0FBQyJ9