"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const repair_ticket_1 = __importDefault(require("./repair-ticket"));
const RepairMedia = utils_1.model.define("repair_media", {
    id: utils_1.model.id().primaryKey(),
    // Repair ticket reference
    repair_ticket: utils_1.model.belongsTo(() => repair_ticket_1.default, {
        mappedBy: "media",
    }),
    // File details
    file_url: utils_1.model.text(),
    file_name: utils_1.model.text(),
    file_type: utils_1.model.enum(["image", "video"]).default("image"),
    mime_type: utils_1.model.text().nullable(),
    file_size: utils_1.model.number().nullable(),
    // Description
    description: utils_1.model.text().nullable(),
    // Metadata
    metadata: utils_1.model.json().nullable(),
});
exports.default = RepairMedia;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwYWlyLW1lZGlhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvcmVwYWlyL21vZGVscy9yZXBhaXItbWVkaWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxREFBa0Q7QUFDbEQsb0VBQTJDO0FBRTNDLE1BQU0sV0FBVyxHQUFHLGFBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO0lBQy9DLEVBQUUsRUFBRSxhQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxFQUFFO0lBRTNCLDBCQUEwQjtJQUMxQixhQUFhLEVBQUUsYUFBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyx1QkFBWSxFQUFFO1FBQ2pELFFBQVEsRUFBRSxPQUFPO0tBQ2xCLENBQUM7SUFFRixlQUFlO0lBQ2YsUUFBUSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDdEIsU0FBUyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUU7SUFDdkIsU0FBUyxFQUFFLGFBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQzFELFNBQVMsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2xDLFNBQVMsRUFBRSxhQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBRXBDLGNBQWM7SUFDZCxXQUFXLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUVwQyxXQUFXO0lBQ1gsUUFBUSxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Q0FDbEMsQ0FBQyxDQUFDO0FBRUgsa0JBQWUsV0FBVyxDQUFDIn0=