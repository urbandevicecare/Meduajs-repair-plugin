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
- **Dynamic Invoicing:** One-click PDF generation (Invoice, Quote, Receipt, Job Card) leveraging `pdfkit` and `qrcode`.
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

---

## Changelog

### v1.10.0 (Current)
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
