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
        "collected",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9hcGkvYWRtaW4vcmVwYWlycy9taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1EQUk2QjtBQUM3QixpREFBNEM7QUFDNUMsc0VBQXlFO0FBRXpFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSw2QkFBZ0IsR0FBRSxDQUFDLE1BQU0sQ0FBQztJQUNqRCxXQUFXLEVBQUUsT0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxPQUFDLENBQUMsS0FBSyxDQUFDLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7Q0FDbkUsQ0FBQyxDQUFDO0FBRUgsTUFBTSx3QkFBd0IsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hDLE1BQU0sRUFBRSxPQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2YsYUFBYSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUU7UUFDekIsVUFBVSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUU7UUFDdEIsS0FBSyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUU7UUFDakIsV0FBVyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDbEMsSUFBSSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDM0IsU0FBUyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7S0FDakMsQ0FBQztJQUNGLE1BQU0sRUFBRSxPQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2YsV0FBVyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDbEMsaUJBQWlCLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtRQUM3QixXQUFXLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxD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