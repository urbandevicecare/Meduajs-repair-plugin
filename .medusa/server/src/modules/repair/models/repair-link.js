"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairLink = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.RepairLink = utils_1.model.define("repair_link", {
    id: utils_1.model.id().primaryKey(),
    shortcode: utils_1.model.text().unique(),
    url: utils_1.model.text(),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwYWlyLWxpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9yZXBhaXIvbW9kZWxzL3JlcGFpci1saW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUFrRDtBQUVyQyxRQUFBLFVBQVUsR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRTtJQUNwRCxFQUFFLEVBQUUsYUFBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsRUFBRTtJQUMzQixTQUFTLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRTtJQUNoQyxHQUFHLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRTtDQUNsQixDQUFDLENBQUMifQ==