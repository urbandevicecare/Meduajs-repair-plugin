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
        "received",
        "diagnosing",
        "awaiting_approval",
        "repairing",
        "ready",
        "completed",
        "cancelled",
        "refunded",
    ])
        .default("received"),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwYWlyLXRpY2tldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3JlcGFpci9tb2RlbHMvcmVwYWlyLXRpY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFEQUFrRDtBQUNsRCxzREFBOEI7QUFDOUIsa0VBQXlDO0FBQ3pDLGdFQUF1QztBQUN2QyxvRUFBMkM7QUFFM0MsTUFBTSxZQUFZLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7SUFDakQsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDM0IsYUFBYSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUU7SUFFcEMsbUJBQW1CO0lBQ25CLE1BQU0sRUFBRSxhQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLGdCQUFNLEVBQUU7UUFDcEMsUUFBUSxFQUFFLGdCQUFnQjtLQUMzQixDQUFDO0lBRUYscUJBQXFCO0lBQ3JCLFdBQVcsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBRXBDLHdCQUF3QjtJQUN4QixhQUFhLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUN0QyxlQUFlLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUV4QyxrQkFBa0I7SUFDbEIsTUFBTSxFQUFFLGFBQUs7U0FDVixJQUFJLENBQUM7UUFDSixVQUFVO1FBQ1YsWUFBWTtRQUNaLG1CQUFtQjtRQUNuQixXQUFXO1FBQ1gsT0FBTztRQUNQLFdBQVc7UUFDWCxXQUFXO1FBQ1gsVUFBVTtLQUNYLENBQUM7U0FDRCxPQUFPLENBQUMsVUFBVSxDQUFDO0lBRXRCLGlCQUFpQjtJQUNqQixpQkFBaUIsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQy9CLFdBQVcsRUFBRSxhQUFL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