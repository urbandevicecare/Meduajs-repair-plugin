"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const repair_ticket_1 = __importDefault(require("./repair-ticket"));
const Device = utils_1.model.define("device", {
    id: utils_1.model.id().primaryKey(),
    serial_number: utils_1.model.text().unique(),
    model_name: utils_1.model.text(),
    brand: utils_1.model.text(),
    customer_id: utils_1.model.text().nullable(),
    imei: utils_1.model.text().nullable(),
    condition: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    repair_tickets: utils_1.model.hasMany(() => repair_ticket_1.default, {
        mappedBy: "device",
    }),
});
exports.default = Device;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvcmVwYWlyL21vZGVscy9kZXZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxREFBa0Q7QUFDbEQsb0VBQTJDO0FBRTNDLE1BQU0sTUFBTSxHQUFHLGFBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO0lBQ3BDLEVBQUUsRUFBRSxhQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxFQUFFO0lBQzNCLGFBQWEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFO0lBQ3BDLFVBQVUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ3hCLEtBQUssRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFO0lBQ25CLFdBQVcsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3BDLElBQUksRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzdCLFNBQVMsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2xDLFFBQVEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2pDLGNBQWMsRUFBRSxhQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLHVCQUFZLEVBQUU7UUFDaEQsUUFBUSxFQUFFLFFBQVE7S0FDbkIsQ0FBQztDQUNILENBQUMsQ0FBQztBQUVILGtCQUFlLE1BQU0sQ0FBQyJ9