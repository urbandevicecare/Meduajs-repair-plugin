import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REPAIR_MODULE } from "../../../../modules/repair";
import RepairModuleService from "../../../../modules/repair/service";

// GET /admin/repairs/settings
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);
  let [settings] = await repairService.listRepairSettings({});
  
  if (!settings) {
    settings = await repairService.createRepairSettings({
      email_notifications_enabled: true,
      sms_notifications_enabled: true,
      whatsapp_notifications_enabled: true,
    });
  }

  res.json({ settings });
}

// POST /admin/repairs/settings
export async function POST(
  req: MedusaRequest<{
    email_notifications_enabled?: boolean;
    sms_notifications_enabled?: boolean;
    whatsapp_notifications_enabled?: boolean;
  }>,
  res: MedusaResponse
) {
  const repairService: RepairModuleService = req.scope.resolve(REPAIR_MODULE);
  let [settings] = await repairService.listRepairSettings({});
  
  if (!settings) {
    settings = await repairService.createRepairSettings({
      email_notifications_enabled: req.body.email_notifications_enabled ?? true,
      sms_notifications_enabled: req.body.sms_notifications_enabled ?? true,
      whatsapp_notifications_enabled: req.body.whatsapp_notifications_enabled ?? true,
    });
  } else {
    settings = await repairService.updateRepairSettings({
      id: settings.id,
      ...req.body,
    });
  }

  res.json({ settings });
}
