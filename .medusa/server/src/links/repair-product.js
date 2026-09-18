"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = __importDefault(require("../modules/repair"));
const product_1 = __importDefault(require("@medusajs/medusa/product"));
// Link RepairTicket to ProductVariant (for parts selection)
// A repair ticket can have many product variants (parts)
exports.default = (0, utils_1.defineLink)(repair_1.default.linkable.repairTicket, {
    linkable: product_1.default.linkable.productVariant,
    isList: true,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwYWlyLXByb2R1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGlua3MvcmVwYWlyLXByb2R1Y3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxREFBdUQ7QUFDdkQsK0RBQTZDO0FBQzdDLHVFQUFxRDtBQUVyRCw0REFBNEQ7QUFDNUQseURBQXlEO0FBQ3pELGtCQUFlLElBQUEsa0JBQVUsRUFBQyxnQkFBWSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUU7SUFDNUQsUUFBUSxFQUFFLGlCQUFhLENBQUMsUUFBUSxDQUFDLGNBQWM7SUFDL0MsTUFBTSxFQUFFLElBQUk7Q0FDYixDQUFDLENBQUMifQ==