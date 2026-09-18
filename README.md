# Medusa Repair Module

[![NPM Version](https://img.shields.io/npm/v/medusajs-repairshop-plugin.svg)](https://www.npmjs.com/package/medusajs-repairshop-plugin)
[![Medusa Plugin](https://img.shields.io/badge/Medusa-Plugin-violet.svg)](https://docs.medusajs.com)

A complete Repair Management System for Medusa, ideal for device repair shops. Features include customer tracking, parts management, granular omni-channel notifications, cost approval flows, and in-depth reporting.

## Features

### 🛠️ Backend / Admin Features
- **Ticket Management:** Track devices by standard serial numbers or IMEI. Manage repair life-cycles across statuses (`received`, `diagnosing`, `awaiting_approval`, `repairing`, `ready`, `completed`, `cancelled`, `refunded`).
- **Inventory Integration:** Add both standard Medusa product variants (reserves inventory) and custom ad-hoc parts. Completed tickets auto-deduct standard inventory.
- **Granular Settings Tab:** Toggle Email, SMS, and WhatsApp notifications directly from the plugin's Admin UI settings tab.
- **Embedded Templates:** Beautiful, responsive email templates are bundled directly inside the plugin—no global workspace configuration required.
- **Unified Timeline:** A single timeline view tracking internal notes, customer chat, and automated notifications.
- **Dynamic Invoicing & Zoho Books Sync:** Built-in PDF generation utilizing `pdfkit` OR seamless external synchronization with **Zoho Books**. Automatically pushes Contacts, Estimates, and Invoices to Zoho Books and streams official Zoho PDFs directly to your customers.
- **Payment Link Decoupling:** Secure integration with Medusa's `PaymentCollection` for standalone repair payments without forcing draft orders.

### 🏪 Frontend / Storefront Features
- **Storefront Dashboard:** A dedicated `/repairs/dashboard` page where logged-in customers can review historical and active repairs.
- **Self-Service Booking:** Customers can initiate repairs via `/repairs/book`.
- **Secure Approvals:** Token-based secure approval flow (`/store/repairs/track?token=...`) allowing users to review diagnostic costs or parts and click "Approve" or "Reject".
- **Real-Time Tracking & Compliance:** Surfaced estimate breakdowns, combined with native 'Data Wipe' and 'T&C' acceptance checkboxes.

## Installation & Integration

1. **Install the package:**
```bash
npm install medusajs-repairshop-plugin
# or
yarn add medusajs-repairshop-plugin
```

2. **Register the Plugin:**
Add it to your `medusa-config.ts` inside the `plugins` array:
```typescript
module.exports = defineConfig({
  plugins: [
    { resolve: "medusajs-repairshop-plugin" }
  ]
})
```

3. **Apply Database Migrations:**
```bash
npx medusa db:migrate
```

4. **Access the Interface:**
- Backend: Navigate to `/app/repairs` in your admin panel.
- Storefront: Link to `/repairs/dashboard` and `/repairs/book` in your frontend application (e.g. Next.js or Fresh.js).

### 📓 Zoho Books Integration
To completely offload Invoice and Estimate generation to Zoho Books:
1. Go to the [Zoho API Console](https://api-console.zoho.com/) and register a Server-based Application.
2. Obtain your **Client ID** and **Client Secret**.
3. Generate a **Refresh Token** with the `ZohoBooks.fullaccess.all` scope.
4. Locate your **Organization ID** in your Zoho Books dashboard url (e.g., `organization_id=12345678`).
5. Open your Medusa Admin, go to **Repairs -> Settings**, and toggle **Enable Zoho Books Sync**.
6. Paste your credentials. All future Quotes and Invoices will now be pushed automatically to Zoho Books and formatted using your official Zoho templates!

### 💳 Paystack Integration (Storefront Popup)
You can accept payments instantly from your customers using the Paystack inline popup directly on your storefront, bypassing the need for a complex checkout flow!

1. Open your Medusa Admin, go to **Repairs -> Settings**, and toggle **Enable Paystack Checkout**.
2. Paste your Paystack Public and Secret keys.
3. In your Storefront application (e.g. Next.js), use the Paystack inline script to trigger the popup when the customer clicks "Pay Now" on their repair dashboard:

```javascript
import PaystackPop from '@paystack/inline-js';

const payWithPaystack = () => {
  const paystack = new PaystackPop();
  paystack.newTransaction({
    key: 'YOUR_PUBLIC_KEY', // Can be fetched from your storefront backend
    email: customer.email,
    amount: ticket.total_actual, // amount in kobo
    reference: `REP-${ticket.ticket_number}-${Date.now()}`,
    metadata: {
      ticket_id: ticket.id // IMPORTANT: Pass the Medusa Ticket ID here
    },
    onSuccess: async (transaction) => {
      // 1. Send the reference to the plugin to verify and capture the payment
      await fetch(`http://localhost:9000/store/repairs/paystack/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: transaction.reference })
      });
      alert('Payment successful and receipt generated!');
    }
  });
};
```
*Note: Because you verify the payment directly from your storefront `onSuccess` callback via the `/store/repairs/paystack/verify` endpoint, you don't need to configure an overriding Paystack webhook! The plugin will automatically verify the payment securely from the backend and sync it to Zoho Books.*

### 🧪 Mock Test Endpoints
To verify the system's integrations (such as price formatting, Zoho Books tax handling, Notifications, and Paystack initializer) without having to manually trigger everything, you can use the built-in mock test suites:

- **Admin Testing Suite**: `GET /admin/repairs/test-suite`
  - *Validates Zoho VAT logic, exact decimal pricing (no `/ 100` bugs), and mock notification payloads.*
- **Storefront Testing Suite**: `GET /store/repairs/test-suite`
  - *Validates public tracking token logic and the strict secure server-side Paystack initializer payload handling.*

*Note: You must have created at least one repair ticket in the database for the test suites to run.*

---

## Changelog

### v0.1.40 (Current)
- **Global VAT Toggle**: Added a centralized "Add 16% VAT to Total" checkbox directly below the Cost Breakdown in the Admin UI. This replaces the old, per-item legacy checkboxes and calculates a seamless 16% markup on Parts + Labor.
- **Zoho Books Native Tax Sync**: Perfected the Zoho synchronization. When VAT is checked, the plugin sets `is_inclusive_tax: false` and lets Zoho accurately add its default organizational tax rate. When unchecked, it aggressively sends `tax_id: ""` to bypass Zoho's default taxes, ensuring your totals remain flat.
- **Medusa v2 BigNumber JSONB Fixes**: Introduced critical database migrations to add the implicit `raw_amount_paid` JSONB columns required by Medusa v2. This permanently stops silent backend rejection errors during partial updates.
- **Seamless UI Background Polling**: Rewrote the `loadTicket()` refresh mechanism to perform background polling without throwing the global `<Loading />` screen overlay. The UI now updates without visually unmounting.
- **GitHub Actions Release Assets**: Repaired the `ci.yml` pipeline to automatically build, pack, and attach the `.tgz` plugin bundle natively to the GitHub Releases page on every push.

### v1.12.0
- **Strict Server-Side Paystack Initializer**: `amount_paid` tracking is now natively enforced. The frontend is restricted to a secure server-initialized `access_code` generated by `POST /store/repairs/paystack/initialize`. This safeguards partial payment entries from being modified client-side.
- **Zoho Books Tax Precision**: Added explicit `tax_id: ""` overrides to `line_items` to stop Zoho from randomly injecting its default VAT rules on custom parts, avoiding backwards tax splitting.
- **Per-Item VAT Toggle**: Introduced a 'VAT?' toggle in the custom parts UI, letting you explicitly opt in/out of VAT.
- **Price Bug Fixes**: Removed legacy `/ 100` division operations universally in the plugin and Storefront, resolving `1012.65` layout bugs.
- **Enhanced UI**: Eliminated the 'View' button in the repair ticket list to free up table space; rows are now fully clickable and interactively styled.
- **Testing Suite**: Added `GET /admin/repairs/test-suite` and `GET /store/repairs/test-suite` mock endpoints.
- **Paystack Storefront Integration**: Introduced an inline storefront popup flow via `POST /store/repairs/paystack/verify`. This gracefully handles customer checkouts without interfering with the main Medusa Paystack plugin webhooks.
- **Zoho Books Native Syncing**: Fully synchronized Medusa parts to Zoho Books `Estimates` and `Invoices`. Payments captured locally are instantly logged into Zoho Books as payments. PDF Quotes and Receipts are securely pulled from Zoho on the fly.
- **Admin UI Polish**: Replaced default pills with modern underline tabs in the admin UI, converted standard variant dropdowns into auto-suggest lookup boxes, and ensured ticket lists default to sorting by newest (`created_at` DESC).
- **Omni-Channel Enhancements**: Notification templates now intelligently include PDF download links, the customer's name, the device name, and real-time total estimates where applicable.

### v1.10.0
- **Plugin Settings UI**: Added a dedicated `Settings` tab inside the Repairs admin page to granularly toggle Email, SMS, and WhatsApp notifications on the fly without server restarts.
- **Bundled Templates**: Completely decoupled email notification HTML templates from the global workspace and bundled them natively inside the plugin.
- **Payment Decoupling**: Replaced legacy Draft Order generation with Medusa's standard `PaymentCollection` API for frictionless, standalone repair checkouts.
- **Omni-Channel Granularity**: Modified the global subscriber (`notifications.ts`) and background workflows to dynamically check database settings before pushing payload events to providers.

### v1.9.0
- **Storefront Approvals**: Customers can natively approve or reject repair estimates directly from the tracking page.
- **Order Synchronization**: Added automated background subscribers to sync order statuses. An `order.canceled` event sets the ticket to `cancelled`, and a `refund.created` event correctly marks the ticket as `refunded`.
- **Workflow Automation**: Rejections now automatically trigger the `rejectRepairCostWorkflow` to release inventory and notify assigned technicians.

### v1.8.0
- **Bug Fix**: Fixed tracking backend returning 500 logic errors when invalid relational mappings were queried.
- **Bug Fix**: Secured the `/store/customers/me/repairs` dashboard endpoint using Medusa's standard `authenticate` middleware.
- **Stability Improvement**: Bolstered `GraphQuery` error handling to gracefully degrade instead of crashing the endpoint.

### v1.7.0
- **FreshJS Partials & View Transitions**: Overhauled the Storefront (`/repairs/*`) applications incorporating the `@fresh/runtime` `Partial` boundaries.
- **CSP Nonces Architecture**: Integrated baseline for Content Security Policy nonces targeting script behaviors in the frontend views.

### v1.6.0
- **Universal PDF Document Generation**: Added robust dynamic PDF rendering utilizing `pdfkit` and `qrcode` across both the Admin Dashboard and the Frontend Customer portals (Invoice, Quote, Receipt, Job Card).

### v1.5.0
- **Omni-Channel Notifications**: Designed a centralized subscriber module (`globalNotificationHandler`) that dispatches contextual Email, SMS, and WhatsApp alerts.
- **My Repairs Dashboard (Storefront)**: Added a `/repairs/dashboard` page where logged-in customers can review all repairs natively.

### v1.4.0
- **Self-Service Booking**: Customers can initiate and book repairs directly from the storefront (`/repairs/book`) when logged in.
- **Compliance Integration**: Standardized the Legal & Data Consent compliance directly into the book repair flow.

### v1.3.1
- **Currency Formatting**: Created `useStoreCurrency` custom React hook to fetch the configured `default_currency_code` dynamically instead of hardcoded USD/KES formats.

### v1.3.0
- **Unified Timeline & Nudges**: Merged notes and chats into a single timeline. The new "Send Reminder" button emits events to message customers across channels.

### v1.2.0
- **Parts Management & Inventory Sync**: Added removal UI for inventory parts. Stock is now automatically reserved when a part is added, and permanently deducted upon repair completion.

### v1.1.0
- **Usability Enhancements**: Added navigation submenu, accessories pill UI, tokenized customer approvals, and intelligent inventory deduction.

### v1.0.0
- Initial Release mapping core REST endpoints, data models, and baseline Admin SDK widgets.
