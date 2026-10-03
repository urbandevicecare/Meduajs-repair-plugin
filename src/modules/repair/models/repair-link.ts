import { model } from "@medusajs/framework/utils";

export const RepairLink = model.define("repair_link", {
  id: model.id().primaryKey(),
  shortcode: model.text().unique(),
  url: model.text(),
});
