import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { verifyPaystackPaymentWorkflow } from "../../../../../workflows/verify-paystack-payment-workflow";

export async function POST(
  req: MedusaRequest<{ reference: string }>,
  res: MedusaResponse
) {
  const { reference } = req.body;
  if (!reference) {
    return res.status(400).json({ message: "Reference is required" });
  }

  try {
    const { result } = await verifyPaystackPaymentWorkflow(req.scope).run({
      input: { reference },
    });

    res.json({ message: "Payment verified and synchronized successfully", repair_ticket: result });
  } catch (error: any) {
    req.scope.resolve("logger").error(`[Paystack Verify Workflow] Error: ${error.message}`);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}
