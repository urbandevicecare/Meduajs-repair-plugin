"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairSettings = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.RepairSettings = utils_1.model.define("repair_settings", {
    id: utils_1.model.id().primaryKey(),
    email_notifications_enabled: utils_1.model.boolean().default(true),
    sms_notifications_enabled: utils_1.model.boolean().default(true),
    whatsapp_notifications_enabled: utils_1.model.boolean().default(true),
    zoho_books_enabled: utils_1.model.boolean().default(false),
    zoho_client_id: utils_1.model.text().nullable(),
    zoho_client_secret: utils_1.model.text().nullable(),
    zoho_refresh_token: utils_1.model.text().nullable(),
    zoho_organization_id: utils_1.model.text().nullable(),
    zoho_domain: utils_1.model.text().default("com"),
    paystack_enabled: utils_1.model.boolean().default(false),
    paystack_public_key: utils_1.model.text().nullable(),
    paystack_secret_key: utils_1.model.text().nullable(),
    company_name: utils_1.model.text().default("Repair Shop"),
    storefront_url: utils_1.model.text().nullable(),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwYWlyLXNldHRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvcmVwYWlyL21vZGVscy9yZXBhaXItc2V0dGluZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscURBQWtEO0FBRXJDLFFBQUEsY0FBYyxHQUFHLGFBQUssQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUU7SUFDNUQsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDM0IsMkJBQTJCLEVBQUUsYUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDMUQseUJBQXlCLEVBQUUsYUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDeEQsOEJBQThCLEVBQUUsYUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDN0Qsa0JBQWtCLEVBQUUsYUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDbEQsY0FBYyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDdkMsa0JBQWtCLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUMzQyxrQkFBa0IsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzNDLG9CQUFvQixFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDN0MsV0FBVyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3hDLGdCQUFnQixFQUFFLGFBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ2hELG1CQUFtQixFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDNUMsbUJBQW1CLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUU1QyxZQUFZLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7SUFDakQsY0FBYyxFQUFFLGFBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Q0FDeEMsQ0FBQyxDQUFDIn0=