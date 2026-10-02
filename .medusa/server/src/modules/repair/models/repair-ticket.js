"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const device_1 = __importDefault(require("./device"));
const repair_media_1 = __importDefault(require("./repair-media"));
const repair_note_1 = __importDefault(require("./repair-note"));
const repair_update_1 = __importDefault(require("./repair-update"));
const RepairTicket = utils_1.model.define("repair_ticket", {
    id: utils_1.model.id().primaryKey(),
    ticket_number: utils_1.model.text().unique(),
    // Device reference
    device: utils_1.model.belongsTo(() => device_1.default, {
        mappedBy: "repair_tickets",
    }),
    // Customer reference
    customer_id: utils_1.model.text().nullable(),
    // Technician assignment
    technician_id: utils_1.model.text().nullable(),
    technician_name: utils_1.model.text().nullable(),
    // Status tracking
    status: utils_1.model
        .enum([
        "pending_dropoff",
        "received",
        "diagnosing",
        "awaiting_approval",
        "repairing",
        "ready",
        "completed",
        "collected",
        "cancelled",
        "refunded",
    ])
        .default("pending_dropoff"),
    // Repair details
    issue_description: utils_1.model.text(),
    accessories: utils_1.model.text().nullable(), // JSON string or comma-separated list
    // Cost breakdown
    parts_estimate: utils_1.model.bigNumber().default(0),
    labor_estimate: utils_1.model.bigNumber().default(0),
    total_estimate: utils_1.model.bigNumber().default(0),
    parts_actual: utils_1.model.bigNumber().default(0),
    labor_actual: utils_1.model.bigNumber().default(0),
    total_actual: utils_1.model.bigNumber().default(0),
    // Approval
    is_approved: utils_1.model.boolean().default(false),
    approved_at: utils_1.model.dateTime().nullable(),
    approval_token: utils_1.model.text().nullable(),
    // Warranty
    warranty_months: utils_1.model.number().default(3),
    warranty_expiry: utils_1.model.dateTime().nullable(),
    // ETC (Estimated Time of Completion)
    estimated_completion: utils_1.model.dateTime().nullable(),
    // Completion
    completed_at: utils_1.model.dateTime().nullable(),
    collected_at: utils_1.model.dateTime().nullable(),
    // Payment Tracking
    amount_paid: utils_1.model.bigNumber().default(0),
    payment_status: utils_1.model
        .enum(["pending", "authorized", "captured", "refunded"])
        .default("pending"),
    payment_collection_id: utils_1.model.text().nullable(),
    // Tax handling
    apply_tax: utils_1.model.boolean().default(false),
    // Relationships
    media: utils_1.model.hasMany(() => repair_media_1.default, {
        mappedBy: "repair_ticket",
    }),
    // Legal & Compliance
    terms_accepted: utils_1.model.boolean().default(false), // Customer accepted T&Cs
    data_wiped_consent: utils_1.model.boolean().default(false), // Customer consented to data wipe if necessary
    // Custom parts
    custom_parts: utils_1.model.json().nullable(),
    notes: utils_1.model.hasMany(() => repair_note_1.default, {
        mappedBy: "repair_ticket",
    }),
    updates: utils_1.model.hasMany(() => repair_update_1.default, {
        mappedBy: "repair_ticket",
    }),
    // Metadata for extensibility
    metadata: utils_1.model.json().nullable(),
});
exports.default = RepairTicket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwYWlyLXRpY2tldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3JlcGFpci9tb2RlbHMvcmVwYWlyLXRpY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFEQUFrRDtBQUNsRCxzREFBOEI7QUFDOUIsa0VBQXlDO0FBQ3pDLGdFQUF1QztBQUN2QyxvRUFBMkM7QUFFM0MsTUFBTSxZQUFZLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7SUFDakQsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDM0IsYUFBYSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUU7SUFFcEMsbUJBQW1CO0lBQ25CLE1BQU0sRUFBRSxhQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLGdCQUFNLEVBQUU7UUFDcEMsUUFBUSxFQUFFLGdCQUFnQjtLQUMzQixDQUFDO0lBRUYscUJBQXFCO0lBQ3JCLFdBQVcsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBRXBDLHdCQUF3QjtJQUN4QixhQUFhLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUN0QyxlQUFlLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUV4QyxrQkFBa0I7SUFDbEIsTUFBTSxFQUFFLGFBQUs7U0FDVixJQUFJLENBQUM7UUFDSixpQkFBaUI7UUFDakIsVUFBVTtRQUNWLFlBQVk7UUFDWixtQkFBbUI7UUFDbkIsV0FBVztRQUNYLE9BQU87UUFDUCxXQUFXO1FBQ1gsV0FBVztRQUNYLFdBQVc7UUFDWCxVQUFVO0tBQ1gsQ0FBQztTQUNELE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztJQUU3QixpQkFBaUI7SUFDakIsaUJBQWlCLEVBQUUsYUFBSyxDQUFDLElBQUks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