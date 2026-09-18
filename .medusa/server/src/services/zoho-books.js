"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoBooksService = void 0;
class ZohoBooksService {
    constructor(config, logger) {
        this.access_token = null;
        this.token_expires_at = 0;
        this.config = config;
        this.logger = logger;
    }
    async getAccessToken() {
        if (this.access_token && Date.now() < this.token_expires_at) {
            return this.access_token;
        }
        this.logger.info(`[Zoho Books] Refreshing access token...`);
        const params = new URLSearchParams();
        params.append("refresh_token", this.config.refresh_token);
        params.append("client_id", this.config.client_id);
        params.append("client_secret", this.config.client_secret);
        params.append("grant_type", "refresh_token");
        const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
            method: "POST",
            body: params,
        });
        const data = await response.json();
        if (!response.ok || data.error) {
            this.logger.error(`[Zoho Books] Failed to refresh token: ${JSON.stringify(data)}`);
            throw new Error("Zoho authentication failed");
        }
        this.access_token = data.access_token;
        this.token_expires_at = Date.now() + (data.expires_in - 300) * 1000;
        return this.access_token;
    }
    async request(method, endpoint, body, isBlob = false) {
        const token = await this.getAccessToken();
        const url = `https://www.zohoapis.com/books/v3${endpoint}${endpoint.includes("?") ? "&" : "?"}organization_id=${this.config.organization_id}`;
        const headers = {
            Authorization: `Zoho-oauthtoken ${token}`,
        };
        if (body) {
            headers["Content-Type"] = "application/json";
        }
        const res = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        if (isBlob) {
            if (!res.ok)
                throw new Error(`Zoho API Error: ${res.statusText}`);
            return await res.arrayBuffer();
        }
        const data = await res.json();
        if (!res.ok || data.code !== 0) {
            this.logger.error(`[Zoho Books] API Error: ${JSON.stringify(data)}`);
            throw new Error(`Zoho API Error: ${data.message || res.statusText}`);
        }
        return data;
    }
    async syncContact(customer) {
        const email = customer.email;
        const name = customer.first_name ? `${customer.first_name} ${customer.last_name || ""}`.trim() : email;
        // Check if contact exists by email
        if (email && email.includes("@")) {
            const searchRes = await this.request("GET", `/contacts?email=${encodeURIComponent(email)}`);
            if (searchRes.contacts && searchRes.contacts.length > 0) {
                return searchRes.contacts[0].contact_id;
            }
        }
        // Fallback: Check if contact exists by name
        if (name) {
            const searchNameRes = await this.request("GET", `/contacts?contact_name=${encodeURIComponent(name)}`);
            if (searchNameRes.contacts && searchNameRes.contacts.length > 0) {
                return searchNameRes.contacts[0].contact_id;
            }
        }
        // Create new contact
        const payload = {
            contact_name: name,
            company_name: name,
            contact_type: "customer",
            contact_persons: [{
                    first_name: customer.first_name || "Customer",
                    last_name: customer.last_name || "",
                    email: email,
                    phone: customer.phone || "",
                }]
        };
        const createRes = await this.request("POST", "/contacts", payload);
        return createRes.contact.contact_id;
    }
    formatLineItems(ticket) {
        const items = [];
        const applyGlobalTax = ticket.apply_tax !== false;
        if (ticket.device?.parts_used && ticket.device.parts_used.length > 0) {
            for (const part of ticket.device.parts_used) {
                const exempt = !applyGlobalTax || part.is_taxable === false;
                items.push({
                    name: part.name || "Part",
                    description: part.sku ? `SKU: ${part.sku}` : "",
                    rate: (Number(part.price || 0)).toFixed(2),
                    quantity: 1,
                    ...(exempt ? { tax_id: "" } : {})
                });
            }
        }
        // Also push labor if present
        if (ticket.labor_estimate > 0) {
            items.push({
                name: "Labor Charge",
                rate: (Number(ticket.labor_estimate || 0)).toFixed(2),
                quantity: 1,
                ...(!applyGlobalTax ? { tax_id: "" } : {})
            });
        }
        if (ticket.custom_parts && ticket.custom_parts.length > 0) {
            for (const cp of ticket.custom_parts) {
                const exempt = !applyGlobalTax || cp.is_taxable === false;
                items.push({
                    name: cp.name || "Custom Part / Service",
                    rate: (Number(cp.price || 0)).toFixed(2),
                    quantity: 1,
                    ...(exempt ? { tax_id: "" } : {})
                });
            }
        }
        if (items.length === 0) {
            items.push({
                name: `Repair Ticket #${ticket.ticket_number}`,
                rate: (Number(ticket.total_estimate || 0)).toFixed(2),
                quantity: 1,
                ...(!applyGlobalTax ? { tax_id: "" } : {})
            });
        }
        return items;
    }
    async createEstimate(contactId, ticket) {
        const payload = {
            customer_id: contactId,
            reference_number: `TKT-${ticket.ticket_number}`,
            line_items: this.formatLineItems(ticket),
            notes: "Generated from Medusa Repair Module",
            is_inclusive_tax: false
        };
        const res = await this.request("POST", "/estimates", payload);
        return res.estimate.estimate_id;
    }
    async deleteEstimate(estimateId) {
        await this.request("DELETE", `/estimates/${estimateId}`);
    }
    async createInvoice(contactId, ticket) {
        const payload = {
            customer_id: contactId,
            reference_number: `TKT-${ticket.ticket_number}`,
            line_items: this.formatLineItems(ticket),
            notes: "Generated from Medusa Repair Module",
            is_inclusive_tax: false
        };
        const res = await this.request("POST", "/invoices", payload);
        return res.invoice.invoice_id;
    }
    async deleteInvoice(invoiceId) {
        await this.request("DELETE", `/invoices/${invoiceId}`);
    }
    async getDocumentPdf(documentId, type) {
        const endpoint = type === "estimate" ? `/estimates/${documentId}` : `/invoices/${documentId}`;
        return await this.request("GET", `${endpoint}?accept=pdf`, undefined, true);
    }
    async registerPayment(invoiceId, amount, contactId, paymentMode) {
        const payload = {
            customer_id: contactId,
            payment_mode: paymentMode || "Stripe",
            amount: (amount).toFixed(2),
            date: new Date().toISOString().split('T')[0],
            invoices: [
                {
                    invoice_id: invoiceId,
                    amount_applied: (amount).toFixed(2)
                }
            ]
        };
        const res = await this.request("POST", "/customerpayments", payload);
        return res.payment.payment_id;
    }
    async getPaymentReceiptPdf(paymentId) {
        return await this.request("GET", `/customerpayments/${paymentId}?accept=pdf`, undefined, true);
    }
}
exports.ZohoBooksService = ZohoBooksService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9oby1ib29rcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZXJ2aWNlcy96b2hvLWJvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVNBLE1BQWEsZ0JBQWdCO0lBTTNCLFlBQVksTUFBa0IsRUFBRSxNQUFjO1FBSHRDLGlCQUFZLEdBQWtCLElBQUksQ0FBQztRQUNuQyxxQkFBZ0IsR0FBVyxDQUFDLENBQUM7UUFHbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVPLEtBQUssQ0FBQyxjQUFjO1FBQzFCLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDNUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1FBQzVELE1BQU0sTUFBTSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDckMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxRCxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDMUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFN0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsMENBQTBDLEVBQUU7WUFDdkUsTUFBTSxFQUFFLE1BQU07WUFDZCxJQUFJLEVBQUUs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