import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const code = req.params.code;
  const repairModule: any = req.scope.resolve("repair");
  
  const [links] = await repairModule.listRepairLinks({ shortcode: code });
  
  if (links && links.length > 0) {
    return res.redirect(302, links[0].url);
  }
  
  return res.status(404).send("Link not found");
}
