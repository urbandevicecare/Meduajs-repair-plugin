"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = globalNotificationHandler;
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../utils/templates/repair");
const repair_2 = require("../modules/repair");
async function shortenUrl(url) {
    if (!url)
        return url;
    try {
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        if (res.ok) {
            const shortUrl = await res.text();
            return shortUrl.trim();
        }
    }
    catch (e) {
        // Silently fail and return original
    }
    return url;
}
async function globalNotificationHandler({ event, container, }) {
    const logger = container.resolve("logger");
    const eventName = event.name;
    const data = event.data;
    logger.info(`[Omni-Notify] 🟢 Triggered '${eventName}' subscriber.`);
    try {
        const notificationModuleService = container.resolve(utils_1.ModuleRegistrationName.NOTIFICATION, { allowUnregistered: true });
        if (!notificationModuleService) {
            logger.warn(`[Omni-Notify] ⚠️ Notification module not installed. Aborting.`);
            return;
        }
        const repairService = container.resolve(repair_2.REPAIR_MODULE);
        const [settings] = await repairService.listRepairSettings({});
        const ACTIVE_CHANNELS = [];
        if (!settings || settings.email_notifications_enabled)
            ACTIVE_CHANNELS.push("email");
        if (!settings || settings.sms_notifications_enabled)
            ACTIVE_CHANNELS.push("sms");
        if (!settings || settings.whatsapp_notifications_enabled)
            ACTIVE_CHANNELS.push("whatsapp");
        if (ACTIVE_CHANNELS.length === 0) {
            logger.info(`[Omni-Notify] All notification channels disabled in settings. Aborting.`);
            return;
        }
        let targetEmail = null;
        let targetPhone = null;
        let baseTemplateName = "";
        let notificationSubject = "";
        let emailHtmlContent = "";
        let textContent = "";
        let notificationData = {};
        const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
        let customerName = "Customer";
        // ---------------------------------------------------------
        // REPAIR EVENT FLOW
        // ---------------------------------------------------------
        if (eventName.startsWith("repair.")) {
            const ticketId = data.id || data.repair_ticket_id;
            if (!ticketId) {
                logger.warn(`[Omni-Notify] ⚠️ No ticket ID found in event data. Aborting.`);
                return;
            }
            logger.debug(`[Omni-Notify] Retrieving ticket data for ID: ${ticketId}...`);
            const { data: tickets } = await query.graph({
                entity: "repair_ticket",
                fields: ["*", "device.*"],
                filters: { id: ticketId },
            });
            if (!tickets || tickets.length === 0) {
                logger.warn(`[Omni-Notify] ⚠️ Repair ticket ${ticketId} not found`);
                return;
            }
            const ticket = tickets[0];
            const deviceModel = ticket.device?.model_name || "Device";
            let storeUrl = process.env.STORE_URL || "http://localhost:3000";
            let companyName = "Repair Shop";
            try {
                const repairModule = container.resolve("repair");
                const [settings] = await repairModule.listRepairSettings({});
                if (settings) {
                    if (settings.storefront_url)
                        storeUrl = settings.storefront_url;
                    if (settings.company_name)
                        companyName = settings.company_name;
                }
            }
            catch (e) { }
            // Strip trailing slash if present
            storeUrl = storeUrl.replace(/\/$/, "");
            const approvalUrl = ticket.approval_token
                ? `${storeUrl}/repairs/track?token=${ticket.approval_token}`
                : "";
            // Attempt to load customer details
            if (ticket.customer_id) {
                const customerModule = container.resolve(utils_1.ModuleRegistrationName.CUSTOMER, { allowUnregistered: true });
                if (customerModule) {
                    const customer = await customerModule.retrieveCustomer(ticket.customer_id);
                    if (customer) {
                        targetEmail = customer.email || null;
                        targetPhone = customer.phone || null;
                        customerName = customer.first_name || "Customer";
                        notificationData.customer = customer;
                    }
                }
            }
            let currencyCode = "usd";
            try {
                const regionModule = container.resolve(utils_1.Modules.REGION, { allowUnregistered: true });
                if (regionModule) {
                    const regions = await regionModule.listRegions({}, { take: 1 });
                    if (regions && regions.length > 0) {
                        currencyCode = regions[0].currency_code;
                    }
                }
            }
            catch (e) {
                // Fallback
            }
            let pdfUrl = "";
            if (ticket.approval_token) {
                if (ticket.status === "awaiting_approval")
                    pdfUrl = `${storeUrl}/api/repairs/token/${ticket.approval_token}/document?type=quote`;
                else if (ticket.payment_status === "captured" || ticket.payment_status === "paid")
                    pdfUrl = `${storeUrl}/api/repairs/token/${ticket.approval_token}/document?type=receipt`;
                else
                    pdfUrl = `${storeUrl}/api/repairs/token/${ticket.approval_token}/document?type=invoice`;
            }
            // Populate base data
            notificationData = {
                ...notificationData,
                ticket_number: ticket.ticket_number,
                device: deviceModel,
                status: data.status || ticket.status,
                approval_url: approvalUrl,
                short_approval_url: await shortenUrl(approvalUrl),
                pdf_url: pdfUrl,
                short_pdf_url: await shortenUrl(pdfUrl),
                currency_code: currencyCode.toUpperCase(),
                company_name: companyName,
                total_estimate: Number(ticket.total_estimate?.value ?? ticket.total_estimate),
            };
            if (eventName === "repair.status_changed") {
                baseTemplateName = "repair-status";
                notificationSubject = `Repair Status Update: ${deviceModel} (#${ticket.ticket_number})`;
                // Fire admin notification too
                if (notificationModuleService) {
                    const adminTemplate = (0, repair_1.getRepairTemplate)("admin-repair-status", {
                        ...notificationData,
                        customer_name: customerName,
                    });
                    logger.debug(`[Omni-Notify] 🛡️ Queuing internal Admin Notification`);
                    notificationModuleService
                        .createNotifications({
                        to: "admin",
                        channel: "admin",
                        template: "admin-repair-status",
                        content: {
                            subject: `[Admin Alert] Status Changed: Ticket ${ticket.ticket_number}`,
                            html: adminTemplate.html,
                        },
                        data: { ...notificationData, body: adminTemplate.text },
                    })
                        .catch((e) => logger.warn(`[Omni-Notify] Admin notification failed: ${e.message}`));
                }
            }
            else if (eventName === "repair.ticket.compliance_requested") {
                baseTemplateName = "repair-compliance";
                notificationSubject = `Action Required: Repair Ticket #${ticket.ticket_number}`;
                notificationData.compliance_url = approvalUrl;
            }
            else if (eventName === "repair.customer_reminder") {
                baseTemplateName = "repair-reminder";
                notificationSubject = `Reminder: Repair Ticket #${ticket.ticket_number}`;
                let nudgeMessage = "Please review the status of your repair.";
                if (ticket.status === "awaiting_approval") {
                    nudgeMessage =
                        "We are waiting for your approval to proceed with the repair.";
                }
                else if (ticket.status === "completed" || ticket.status === "ready") {
                    nudgeMessage = "Your device is ready for pickup or payment.";
                }
                notificationData.nudge_message = nudgeMessage;
            }
            const template = (0, repair_1.getRepairTemplate)(baseTemplateName, notificationData);
            emailHtmlContent = template.html;
            textContent = template.text;
        }
        else {
            logger.warn(`[Omni-Notify] ⚠️ Unmapped event '${eventName}'. Aborting.`);
            return;
        }
        // ---------------------------------------------------------
        // MULTI-CHANNEL DISPATCH PREPARATION
        // ---------------------------------------------------------
        if (!targetEmail && !targetPhone) {
            logger.warn(`[Omni-Notify] ⚠️ No contact methods (email/phone) found for event ${eventName}. Aborting.`);
            return;
        }
        logger.debug(`[Omni-Notify] Preparing omni-channel dispatch for '${baseTemplateName}'...`);
        const dispatches = [];
        // 1. Queue Email
        if (ACTIVE_CHANNELS.includes("email") && targetEmail) {
            logger.debug(`[Omni-Notify] 📧 Queuing Email to ${targetEmail}`);
            dispatches.push(notificationModuleService.createNotifications({
                to: targetEmail,
                channel: "email",
                template: `${baseTemplateName}-email`,
                content: {
                    subject: notificationSubject,
                    html: emailHtmlContent,
                },
                data: notificationData,
            }));
        }
        // 2. Queue SMS
        if (ACTIVE_CHANNELS.includes("sms") && targetPhone) {
            logger.debug(`[Omni-Notify] 📱 Queuing SMS to ${targetPhone}`);
            dispatches.push(notificationModuleService.createNotifications({
                to: targetPhone,
                channel: "sms",
                template: `${baseTemplateName}-sms`,
                data: {
                    ...notificationData,
                    body: textContent,
                    text: textContent,
                },
            }));
        }
        // 3. Queue WhatsApp
        if (ACTIVE_CHANNELS.includes("whatsapp") && targetPhone) {
            logger.debug(`[Omni-Notify] 💬 Queuing WhatsApp to ${targetPhone}`);
            dispatches.push(notificationModuleService.createNotifications({
                to: targetPhone,
                channel: "whatsapp",
                template: `${baseTemplateName}-whatsapp`,
                data: {
                    ...notificationData,
                    body: textContent,
                    text: textContent,
                },
            }));
        }
        await Promise.allSettled(dispatches);
        logger.info(`[Omni-Notify] ✅ Successfully executed ${dispatches.length} notification(s) for '${eventName}'.`);
    }
    catch (error) {
        logger.error(`[Omni-Notify] ❌ Failed to process '${eventName}'`, error);
    }
}
exports.config = {
    event: [
        "repair.status_changed",
        "repair.ticket.compliance_requested",
        "repair.customer_reminder",
    ],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdWJzY3JpYmVycy9ub3RpZmljYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXdCQSw0Q0FxUkM7QUE1U0QscURBSW1DO0FBQ25DLHNEQUE4RDtBQUM5RCw4Q0FBa0Q7QUFHbEQsS0FBSyxVQUFVLFVBQVUsQ0FBQyxHQUFXO0lBQ25DLElBQUksQ0FBQyxHQUFHO1FBQUUsT0FBTyxHQUFHLENBQUM7SUFDckIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsMENBQTBDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RixJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNYLE1BQU0sUUFBUSxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xDLE9BQU8sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pCLENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNYLG9DQUFvQztJQUN0QyxDQUFDO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRWMsS0FBSyxVQUFVLHlCQUF5QixDQUFDLEVBQ3RELEtBQUssRUFDTCxTQUFTLEdBQ1c7SUFDcEIsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMzQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQzdCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFFeEIsTUFBTSxDQUFDLElBQUksQ0FBQywrQkFBK0IsU0FBUyxlQUFlLENBQUMsQ0FBQztJQUVyRSxJQUFJLENBQUM7UUFDSCxNQUFNLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQ2pELDhCQUFzQixDQUFDLFlBQVks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