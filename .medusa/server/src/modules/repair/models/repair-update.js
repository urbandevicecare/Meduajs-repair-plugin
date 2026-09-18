"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const repair_ticket_1 = __importDefault(require("./repair-ticket"));
const RepairUpdate = utils_1.model.define("repair_update", {
    id: utils_1.model.id().primaryKey(),
    // Repair ticket reference
    repair_ticket: utils_1.model.belongsTo(() => repair_ticket_1.default, {
        mappedBy: "updates",
    }),
    // Message content
    message: utils_1.model.text(),
    // Author tracking
    author_id: utils_1.model.text().nullable(),
    author_type: utils_1.model.enum(["user", "customer"]).nullable(),
    // Read status
    is_read: utils_1.model.boolean().default(false),
    // Metadata
    metadata: utils_1.model.json().nullable(),
});
exports.default = RepairUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwYWlyLXVwZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3JlcGFpci9tb2RlbHMvcmVwYWlyLXVwZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFEQUFrRDtBQUNsRCxvRUFBMkM7QUFFM0MsTUFBTSxZQUFZLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7SUFDakQsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFFM0IsMEJBQTBCO0lBQzFCLGFBQWEsRUFBRSxhQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLHVCQUFZLEVBQUU7UUFDakQsUUFBUSxFQUFFLFNBQVM7S0FDcEIsQ0FBQztJQUVGLGtCQUFrQjtJQUNsQixPQUFPLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRTtJQUVyQixrQkFBa0I7SUFDbEIsU0FBUyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDbEMsV0FBVyxFQUFFLGFBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7SUFFeEQsY0FBYztJQUNkLE9BQU8sRUFBRSxhQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUV2QyxXQUFXO0lBQ1gsUUFBUSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Q0FDbEMsQ0FBQyxDQUFDO0FBRUgsa0JBQWUsWUFBWSxDQUFDIn0=