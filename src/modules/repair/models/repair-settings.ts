import { model } from "@medusajs/framework/utils";

export const RepairSettings = model.define("repair_settings", {
  id: model.id().primaryKey(),
  email_notifications_enabled: model.boolean().default(true),
  sms_notifications_enabled: model.boolean().default(true),
  whatsapp_notifications_enabled: model.boolean().default(true),
});
