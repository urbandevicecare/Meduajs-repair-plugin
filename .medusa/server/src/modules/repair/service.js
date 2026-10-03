"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const device_1 = __importDefault(require("./models/device"));
const repair_ticket_1 = __importDefault(require("./models/repair-ticket"));
const repair_media_1 = __importDefault(require("./models/repair-media"));
const repair_note_1 = __importDefault(require("./models/repair-note"));
const repair_update_1 = __importDefault(require("./models/repair-update"));
const repair_settings_1 = require("./models/repair-settings");
const repair_link_1 = require("./models/repair-link");
class RepairModuleService extends (0, utils_1.MedusaService)({
    Device: device_1.default,
    RepairTicket: repair_ticket_1.default,
    RepairMedia: repair_media_1.default,
    RepairNote: repair_note_1.default,
    RepairUpdate: repair_update_1.default,
    RepairSettings: repair_settings_1.RepairSettings,
    RepairLink: repair_link_1.RepairLink,
}) {
}
exports.default = RepairModuleService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3JlcGFpci9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscURBQTBEO0FBQzFELDZEQUFxQztBQUNyQywyRUFBa0Q7QUFDbEQseUVBQWdEO0FBQ2hELHVFQUE4QztBQUM5QywyRUFBa0Q7QUFDbEQsOERBQTBEO0FBQzFELHNEQUFrRDtBQUVsRCxNQUFNLG1CQUFvQixTQUFRLElBQUEscUJBQWEsRUFBQztJQUM5QyxNQUFNLEVBQU4sZ0JBQU07SUFDTixZQUFZLEVBQVosdUJBQVk7SUFDWixXQUFXLEVBQVgsc0JBQVc7SUFDWCxVQUFVLEVBQVYscUJBQVU7SUFDVixZQUFZLEVBQVosdUJBQVk7SUFDWixjQUFjLEVBQWQsZ0NBQWM7SUFDZCxVQUFVLEVBQVYsd0JBQVU7Q0FDWCxDQUFDO0NBQUc7QUFFTCxrQkFBZSxtQkFBbUIsQ0FBQyJ9