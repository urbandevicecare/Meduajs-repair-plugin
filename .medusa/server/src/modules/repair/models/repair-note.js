"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const repair_ticket_1 = __importDefault(require("./repair-ticket"));
const RepairNote = utils_1.model.define("repair_note", {
    id: utils_1.model.id().primaryKey(),
    // Repair ticket reference
    repair_ticket: utils_1.model.belongsTo(() => repair_ticket_1.default, {
        mappedBy: "notes",
    }),
    // Note content
    content: utils_1.model.text(),
    // Visibility control
    is_internal: utils_1.model.boolean().default(false),
    // Author tracking
    author_id: utils_1.model.text().nullable(),
    author_type: utils_1.model.enum(["user", "customer"]).nullable(),
    // Metadata
    metadata: utils_1.model.json().nullable(),
});
exports.default = RepairNote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwYWlyLW5vdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbW9kZWxzL3JlcGFpci1ub3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscURBQWtEO0FBQ2xELG9FQUEyQztBQUUzQyxNQUFNLFVBQVUsR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRTtJQUM3QyxFQUFFLEVBQUUsYUFBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsRUFBRTtJQUUzQiwwQkFBMEI7SUFDMUIsYUFBYSxFQUFFLGFBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsdUJBQVksRUFBRTtRQUNqRCxRQUFRLEVBQUUsT0FBTztLQUNsQixDQUFDO0lBRUYsZUFBZTtJQUNmLE9BQU8sRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBRXJCLHFCQUFxQjtJQUNyQixXQUFXLEVBQUUsYUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFFM0Msa0JBQWtCO0lBQ2xCLFNBQVMsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2xDLFdBQVcsRUFBRSxhQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0lBRXhELFdBQVc7SUFDWCxRQUFRLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUNsQyxDQUFDLENBQUM7QUFFSCxrQkFBZSxVQUFVLENBQUMifQ==