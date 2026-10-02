import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REPAIR_MODULE } from "../../../../modules/repair";
import RepairModuleService from "../../../../modules/repair/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);
  
  const settingsList = await repairService.listRepairSettings();
  const settings = settingsList[0] || {};
  
  // Only return public settings!
  return res.json({
    settings: {
      paystack_enabled: settings.paystack_enabled || false,
      paystack_public_key: settings.paystack_enabled ? settings.paystack_public_key : null,
      company_name: settings.company_name,
      storefront_url: settings.storefront_url
    }
  });
}
