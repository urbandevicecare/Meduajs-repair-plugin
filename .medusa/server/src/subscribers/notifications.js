"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = globalNotificationHandler;
const utils_1 = require("@medusajs/framework/utils");
const repair_1 = require("../utils/templates/repair");
const repair_2 = require("../modules/repair");
async function shortenUrl(url, container) {
    if (!url)
        return url;
    try {
        const repairModule = container.resolve("repair");
        let storeUrl = process.env.STORE_URL || "http://localhost:3000";
        try {
            const [settings] = await repairModule.listRepairSettings({});
            if (settings && settings.storefront_url) {
                storeUrl = settings.storefront_url;
            }
        }
        catch (e) { }
        storeUrl = storeUrl.replace(/\/$/, "");
        const shortcode = Math.random().toString(36).substring(2, 8);
        await repairModule.createRepairLinks({
            shortcode,
            url,
        });
        return `${storeUrl}/r/${shortcode}`;
    }
    catch (e) {
        // Silently fail and return original
        return url;
    }
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
                short_approval_url: await shortenUrl(approvalUrl, container),
                pdf_url: pdfUrl,
                short_pdf_url: await shortenUrl(pdfUrl, container),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdWJzY3JpYmVycy9ub3RpZmljYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXFDQSw0Q0FxUkM7QUF6VEQscURBSW1DO0FBQ25DLHNEQUE4RDtBQUM5RCw4Q0FBa0Q7QUFHbEQsS0FBSyxVQUFVLFVBQVUsQ0FBQyxHQUFXLEVBQUUsU0FBYztJQUNuRCxJQUFJLENBQUMsR0FBRztRQUFFLE9BQU8sR0FBRyxDQUFDO0lBQ3JCLElBQUksQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFRLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdEQsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksdUJBQXVCLENBQUM7UUFDaEUsSUFBSSxDQUFDO1lBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sWUFBWSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzdELElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDeEMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUM7WUFDckMsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUEsQ0FBQztRQUNkLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0QsTUFBTSxZQUFZLENBQUMsaUJBQWlCLENBQUM7WUFDbkMsU0FBUztZQUNULEdBQUc7U0FDSixDQUFDLENBQUM7UUFFSCxPQUFPLEdBQUcsUUFBUSxNQUFNLFNBQVMs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