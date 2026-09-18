"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepairTemplate = getRepairTemplate;
function getRepairTemplate(templateName, data) {
    try {
        switch (templateName) {
            case "repair-status":
                return getRepairStatusTemplate(data);
            case "repair-compliance":
                return getRepairComplianceTemplate(data);
            case "repair-reminder":
                return getRepairReminderTemplate(data);
            case "admin-repair-status":
                return getAdminRepairStatusTemplate(data);
            case "technician-assigned":
                return getTechnicianAssignedTemplate(data);
            case "technician-job-rejected":
                return getTechnicianJobRejectedTemplate(data);
            case "technician-job-paid":
                return getTechnicianJobPaidTemplate(data);
            default:
                console.warn(`[Template-Debug] ⚠️ Repair template '${templateName}' not found.`);
                return {
                    html: `<p>Repair notification update.</p>`,
                    text: `Repair notification update.`,
                };
        }
    }
    catch (error) {
        console.error(`[Template-Debug] ❌ Error generating repair template '${templateName}'`, error);
        throw error;
    }
}
function getRepairStatusTemplate(data) {
    const { ticket_number, status, device, total_estimate, approval_url } = data;
    const customerName = data.customer?.first_name || "Valued Customer";
    let text = `[${data.company_name || "Repair Shop"}] Hi ${customerName}, your repair #${ticket_number} (${device || "device"}) is: ${status.replace("_", " ")}.`;
    let html = `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-w-lg: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Repair Status Update</h2>
    <p>Dear ${customerName},</p>
    <p>The status of your repair ticket <strong>#${ticket_number}</strong> for your <strong>${device || "device"}</strong> has been updated to: <strong style="text-transform: capitalize;">${status.replace("_", " ")}</strong>.</p>`;
    if (total_estimate && Number(total_estimate) > 0) {
        const currency = data.currency_code || "USD";
        const formattedEstimate = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(Number(total_estimate));
        text += ` Cost: ${formattedEstimate}.`;
        html += `<div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
      <p style="margin: 0; font-size: 16px;"><strong>Estimated Total Cost:</strong> ${formattedEstimate}</p>
    </div>`;
    }
    if (data.pdf_url) {
        text += ` Doc: ${data.short_pdf_url || data.pdf_url}`;
        html += `<p style="margin-top: 15px;"><a href="${data.pdf_url}" style="color: #2563eb; font-weight: bold; text-decoration: underline;">📄 Download PDF Document</a></p>`;
    }
    if (approval_url && status === "awaiting_approval") {
        const textApprovalUrl = data.short_approval_url || approval_url;
        const approveLink = textApprovalUrl.includes("?") ? `${textApprovalUrl}&action=approve` : `${textApprovalUrl}?action=approve`;
        const rejectLink = textApprovalUrl.includes("?") ? `${textApprovalUrl}&action=reject` : `${textApprovalUrl}?action=reject`;
        text += ` Approve: ${approveLink} or Reject: ${rejectLink}`;
        // HTML uses original long links
        const htmlApproveLink = approval_url.includes("?") ? `${approval_url}&action=approve` : `${approval_url}?action=approve`;
        const htmlRejectLink = approval_url.includes("?") ? `${approval_url}&action=reject` : `${approval_url}?action=reject`;
        html += `<p>Kindly review and approve or reject the repair costs so we can proceed:</p>
      <div style="margin-top: 25px; display: flex; gap: 10px;">
        <a href="${htmlApproveLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Approve Repair</a>
        <a href="${htmlRejectLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reject</a>
      </div>`;
    }
    else if (approval_url) {
        text += ` Track: ${data.short_approval_url || approval_url}`;
        html += `<p style="margin-top: 25px;"><a href="${approval_url}" style="color: #2563eb; text-decoration: underline; font-weight: 500;">Track your repair progress here</a>.</p>`;
    }
    html += `<p style="margin-top: 30px;">Thank you for choosing us.</p>
    <p>Best Regards,<br/><strong>${data.company_name || "Repair Shop"}</strong></p>
  </div>`;
    return { html, text };
}
function getRepairComplianceTemplate(data) {
    const { ticket_number, device, compliance_url } = data;
    const customerName = data.customer?.first_name || "Valued Customer";
    const text = `[${data.company_name || "Repair Shop"}] Hi ${customerName}, please accept terms for repair #${ticket_number} (${device}) here: ${data.short_approval_url || compliance_url}`;
    const html = `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-w-lg: 600px; margin: 0 auto;">
    <h2 style="color: #d97706;">Action Required: Repair Ticket #${ticket_number}</h2>
    <p>Dear ${customerName},</p>
    <p>We require your consent to our Repair Terms & Conditions before we can proceed with diagnosing or repairing your <strong>${device}</strong>.</p>
    <p>Kindly review and accept the terms by clicking the secure link below:</p>
    <p style="margin-top: 25px;"><a href="${compliance_url}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Review & Accept Terms</a></p>
    <p style="margin-top: 30px;">Thank you for your prompt action.</p>
    <p>Best Regards,<br/><strong>${data.company_name || "Repair Shop"}</strong></p>
  </div>`;
    return { html, text };
}
function getRepairReminderTemplate(data) {
    const { ticket_number, status, device, nudge_message, approval_url } = data;
    const customerName = data.customer?.first_name || "Valued Customer";
    const text = `[${data.company_name || "Repair Shop"}] Hi ${customerName}, Reminder for repair #${ticket_number} (${device}): ${nudge_message}. Track/Action: ${data.short_approval_url || approval_url}`;
    const html = `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-w-lg: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Repair Reminder: Ticket #${ticket_number}</h2>
    <p>Dear ${customerName},</p>
    <p>${nudge_message}</p>
    <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #64748b; margin: 20px 0;">
      <p style="margin: 0;"><strong>Device:</strong> ${device}</p>
      <p style="margin: 8px 0 0 0;"><strong>Status:</strong> <span style="text-transform: capitalize;">${status.replace("_", " ")}</span></p>
    </div>
    <p style="margin-top: 25px;"><a href="${approval_url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Ticket</a></p>
    <p style="margin-top: 30px;">Thank you.</p>
    <p>Best Regards,<br/><strong>${data.company_name || "Repair Shop"}</strong></p>
  </div>`;
    return { html, text };
}
function getAdminRepairStatusTemplate(data) {
    const { ticket_number, status, customer_name, device } = data;
    const text = `[ADMIN ALERT] Repair Ticket #${ticket_number}\nCustomer: ${customer_name}\nDevice: ${device}\nNew Status: ${status.replace("_", " ")}`;
    const html = `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h3 style="color: #dc2626; margin-bottom: 15px;">[ADMIN ALERT] Repair Status Changed</h3>
    <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; border: 1px solid #fecaca;">
      <ul style="list-style-type: none; padding: 0; margin: 0;">
        <li style="margin-bottom: 8px;"><strong>Ticket #:</strong> ${ticket_number}</li>
        <li style="margin-bottom: 8px;"><strong>Customer:</strong> ${customer_name}</li>
        <li style="margin-bottom: 8px;"><strong>Device:</strong> ${device}</li>
        <li><strong>New Status:</strong> <span style="text-transform: capitalize; color: #dc2626; font-weight: bold;">${status.replace("_", " ")}</span></li>
      </ul>
    </div>
  </div>`;
    return { html, text };
}
function getTechnicianAssignedTemplate(data) {
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">New Repair Job Assigned</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hello ${data.technician_name || "Technician"},</p>
        <p>A new repair job <strong>#${data.ticket_number}</strong> has been assigned to you.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Job Details</h3>
          <p><strong>Ticket ID:</strong> ${data.repair_ticket_id}</p>
          <p><strong>Status:</strong> ${data.status}</p>
        </div>
        <p>Please log in to your dashboard to review the details and proceed with the diagnosis/repair.</p>
      </div>
    </div>
  `;
    const text = `Hello ${data.technician_name || "Technician"},\n\nA new repair job #${data.ticket_number} has been assigned to you.\n\nTicket ID: ${data.repair_ticket_id}\nStatus: ${data.status}\n\nPlease log in to your dashboard to review the details.`;
    return { html, text };
}
function getTechnicianJobRejectedTemplate(data) {
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Repair Job Cancelled</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hello ${data.technician_name || "Technician"},</p>
        <p>The cost estimate for repair job <strong>#${data.ticket_number}</strong> was rejected by the customer.</p>
        <p>This job has now been <strong>cancelled</strong> and requires no further action.</p>
      </div>
    </div>
  `;
    const text = `Hello ${data.technician_name || "Technician"},\n\nThe cost estimate for repair job #${data.ticket_number} was rejected by the customer. This job has now been cancelled and requires no further action.`;
    return { html, text };
}
function getTechnicianJobPaidTemplate(data) {
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Repair Job Paid</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hello ${data.technician_name || "Technician"},</p>
        <p>The repair job <strong>#${data.ticket_number}</strong> has been successfully paid for by the customer.</p>
        <p>You may now proceed to finalize the repair if it is not already completed.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Job Details</h3>
          <p><strong>Ticket ID:</strong> ${data.repair_ticket_id}</p>
          <p><strong>Status:</strong> ${data.status}</p>
        </div>
      </div>
    </div>
  `;
    const text = `Hello ${data.technician_name || "Technician"},\n\nThe repair job #${data.ticket_number} has been successfully paid for by the customer.\nYou may now proceed to finalize the repair.\n\nTicket ID: ${data.repair_ticket_id}\nStatus: ${data.status}`;
    return { html, text };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwYWlyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3V0aWxzL3RlbXBsYXRlcy9yZXBhaXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSw4Q0FvQ0M7QUFwQ0QsU0FBZ0IsaUJBQWlCLENBQy9CLFlBQW9CLEVBQ3BCLElBQVM7SUFFVCxJQUFJLENBQUM7UUFDSCxRQUFRLFlBQVksRUFBRSxDQUFDO1lBQ3JCLEtBQUssZUFBZTtnQkFDbEIsT0FBTyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxLQUFLLG1CQUFtQjtnQkFDdEIsT0FBTywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxLQUFLLGlCQUFpQjtnQkFDcEIsT0FBTyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QyxLQUFLLHFCQUFxQjtnQkFDeEIsT0FBTyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxLQUFLLHFCQUFxQjtnQkFDeEIsT0FBTyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxLQUFLLHlCQUF5QjtnQkFDNUIsT0FBTyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoRCxLQUFLLHFCQUFxQjtnQkFDeEIsT0FBTyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QztnQkFDRSxPQUFPLENBQUMsSUFBSSxDQUNWLHdDQUF3QyxZQUFZLGNBQWMsQ0FDbkUsQ0FBQztnQkFDRixPQUFPO29CQUNMLElBQUksRUFBRSxvQ0FBb0M7b0JBQzFDLElBQUksRUFBRSw2QkFBNkI7aUJBQ3BDLENBQUM7UUFDTixDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUNYLHdEQUF3RCxZQUFZLEdBQUcsRUFDdkUsS0FBSyxDQUNOLENBQUM7UUFDRixNQUFNLEtBQUssQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFD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