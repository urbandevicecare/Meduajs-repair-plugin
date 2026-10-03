"use strict";
const jsxRuntime = require("react/jsx-runtime");
const adminSdk = require("@medusajs/admin-sdk");
const ui = require("@medusajs/ui");
const react = require("react");
const icons = require("@medusajs/icons");
const reactRouterDom = require("react-router-dom");
const recharts = require("recharts");
const useStoreCurrency = () => {
  const [currencyCode, setCurrencyCode] = react.useState("KES");
  react.useEffect(() => {
    fetch("/admin/stores", { credentials: "include" }).then((res) => res.json()).then((data) => {
      var _a;
      const store = data.store || data.stores && data.stores[0];
      if (store) {
        if (store.default_currency_code) {
          setCurrencyCode(store.default_currency_code.toUpperCase());
        } else if (((_a = store.supported_currencies) == null ? void 0 : _a.length) > 0) {
          const defaultCurrency = store.supported_currencies.find((c) => c.is_default) || store.supported_currencies[0];
          if (defaultCurrency == null ? void 0 : defaultCurrency.currency_code) {
            setCurrencyCode(defaultCurrency.currency_code.toUpperCase());
          }
        }
      }
    }).catch((err) => {
      console.error("Failed to load store currency", err);
    });
  }, []);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(window.navigator.language || "en-US", {
      style: "currency",
      currency: currencyCode
    }).format(amount);
  };
  return { currencyCode, formatCurrency };
};
const RepairTicketWidget = ({ data }) => {
  const [tickets, setTickets] = react.useState([]);
  const [loading, setLoading] = react.useState(true);
  const { formatCurrency } = useStoreCurrency();
  react.useEffect(() => {
    fetch(`/admin/repairs?customer_id=${data.id}`, {
      credentials: "include"
    }).then((res) => res.json()).then((data2) => {
      setTickets(data2.repair_tickets || []);
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to load repair tickets:", err);
      setLoading(false);
    });
  }, []);
  const getStatusColor = (status) => {
    const colors = {
      received: "grey",
      diagnosing: "blue",
      awaiting_approval: "orange",
      repairing: "blue",
      ready: "green",
      completed: "green",
      cancelled: "red",
      refunded: "red"
    };
    return colors[status] || "grey";
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsx(ui.Container, { className: "divide-y p-0", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "Loading repairs..." }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "divide-y p-0", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-between px-6 py-4", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: "Active Repair Tickets" }) }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-ui-fg-subtle px-6 py-4", children: tickets.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "No active repair tickets" }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-3", children: tickets.slice(0, 5).map((ticket) => /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "flex items-start justify-between border-b pb-3 last:border-b-0",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "font-medium", children: ticket.ticket_number }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { color: getStatusColor(ticket.status), size: "small", children: ticket.status.replace("_", " ") }),
              ticket.technician_name && /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { color: "purple", size: "small", children: ticket.technician_name })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "small", className: "text-ui-fg-subtle mt-1", children: [
              ticket.issue_description.substring(0, 60),
              ticket.issue_description.length > 60 ? "..." : ""
            ] }),
            ticket.estimated_completion && /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "xsmall", className: "text-ui-fg-muted mt-1", children: [
              "ETC:",
              " ",
              new Date(
                ticket.estimated_completion
              ).toLocaleDateString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "font-medium", children: formatCurrency(ticket.total_estimate) }) })
        ]
      },
      ticket.id
    )) }) })
  ] });
};
adminSdk.defineWidgetConfig({
  zone: "customer.details.before"
});
const RepairsPage = () => {
  const navigate = reactRouterDom.useNavigate();
  const [tickets, setTickets] = react.useState([]);
  const [loading, setLoading] = react.useState(true);
  const [searchTerm, setSearchTerm] = react.useState("");
  const [statusFilter, setStatusFilter] = react.useState("all");
  const { formatCurrency } = useStoreCurrency();
  const [createModalOpen, setCreateModalOpen] = react.useState(false);
  const [isCreating, setIsCreating] = react.useState(false);
  const [settings, setSettings] = react.useState({
    email_notifications_enabled: true,
    sms_notifications_enabled: true,
    whatsapp_notifications_enabled: true,
    zoho_books_enabled: false,
    zoho_client_id: "",
    zoho_client_secret: "",
    zoho_refresh_token: "",
    zoho_organization_id: "",
    zoho_domain: "com",
    paystack_enabled: false,
    paystack_public_key: "",
    paystack_secret_key: "",
    company_name: "Repair Shop",
    storefront_url: ""
  });
  const loadSettings = () => {
    fetch("/admin/repairs/settings", { credentials: "include" }).then((res) => res.json()).then((data) => {
      if (data.settings) {
        setSettings({
          ...data.settings,
          zoho_client_id: data.settings.zoho_client_id || "",
          zoho_client_secret: data.settings.zoho_client_secret || "",
          zoho_refresh_token: data.settings.zoho_refresh_token || "",
          zoho_organization_id: data.settings.zoho_organization_id || "",
          zoho_domain: data.settings.zoho_domain || "com",
          paystack_public_key: data.settings.paystack_public_key || "",
          paystack_secret_key: data.settings.paystack_secret_key || "",
          company_name: data.settings.company_name || "Repair Shop",
          storefront_url: data.settings.storefront_url || ""
        });
      }
    }).catch((err) => console.error(err));
  };
  const [isSaving, setIsSaving] = react.useState(false);
  const updateSettingState = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await fetch("/admin/repairs/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      alert("Settings saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };
  const [newDevice, setNewDevice] = react.useState({
    serial_number: "",
    model_name: "",
    brand: "Apple",
    customer_id: "",
    imei: "",
    condition: ""
  });
  const [newTicket, setNewTicket] = react.useState({
    customer_id: "",
    issue_description: "",
    terms_accepted: false,
    data_wiped_consent: false
  });
  const [accessoryInput, setAccessoryInput] = react.useState("");
  const [accessories, setAccessories] = react.useState([]);
  const [customers, setCustomers] = react.useState([]);
  const [loadingCustomers, setLoadingCustomers] = react.useState(false);
  const loadCustomers = () => {
    setLoadingCustomers(true);
    fetch(`/admin/customers`, {
      credentials: "include"
    }).then((res) => res.json()).then((data) => {
      setCustomers(data.customers || []);
      setLoadingCustomers(false);
    }).catch((err) => {
      console.error("Failed to load customers:", err);
      setLoadingCustomers(false);
    });
  };
  const loadTickets = () => {
    setLoading(true);
    fetch(`/admin/repairs`, {
      credentials: "include"
    }).then((res) => res.json()).then((data) => {
      setTickets(data.repair_tickets || []);
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to load repair tickets:", err);
      setLoading(false);
    });
  };
  react.useEffect(() => {
    loadTickets();
    loadCustomers();
    loadSettings();
  }, []);
  const handleAccessoryKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const val = accessoryInput.trim().replace(",", "");
      if (val && !accessories.includes(val)) {
        setAccessories([...accessories, val]);
      }
      setAccessoryInput("");
    }
  };
  const removeAccessory = (acc) => setAccessories(accessories.filter((a) => a !== acc));
  const handleCreateTicket = async () => {
    if (!newTicket.terms_accepted) {
      alert("Customer must accept the Repair Terms & Conditions to proceed.");
      return;
    }
    try {
      setIsCreating(true);
      const res = await fetch(`/admin/repairs`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device: {
            serial_number: newDevice.serial_number,
            model_name: newDevice.model_name,
            brand: newDevice.brand,
            customer_id: newDevice.customer_id || void 0,
            imei: newDevice.imei || void 0,
            condition: newDevice.condition || void 0
          },
          ticket: {
            customer_id: newTicket.customer_id || void 0,
            issue_description: newTicket.issue_description,
            accessories: accessories.length > 0 ? accessories.join(", ") : void 0,
            terms_accepted: newTicket.terms_accepted,
            data_wiped_consent: newTicket.data_wiped_consent
          }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create repair ticket");
      }
      setCreateModalOpen(false);
      setNewDevice({
        serial_number: "",
        model_name: "",
        brand: "Apple",
        customer_id: "",
        imei: "",
        condition: ""
      });
      setNewTicket({
        customer_id: "",
        issue_description: "",
        terms_accepted: false,
        data_wiped_consent: false
      });
      setAccessories([]);
      setAccessoryInput("");
      loadTickets();
    } catch (err) {
      console.error(err);
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsCreating(false);
    }
  };
  const getStatusColor = (status) => {
    const colors = {
      received: "grey",
      diagnosing: "blue",
      awaiting_approval: "orange",
      repairing: "blue",
      ready: "green",
      completed: "green",
      collected: "green",
      cancelled: "red"
    };
    return colors[status] || "grey";
  };
  const getCustomerName = (customerId) => {
    if (!customerId) return "No Customer";
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return "Unknown";
    return customer.first_name || customer.last_name ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : customer.email || "Unknown";
  };
  const filteredTickets = tickets.map((ticket) => {
    const parseNum = (val) => {
      if (typeof val === "object" && val !== null && "value" in val)
        return Number(val.value);
      if (val !== void 0) return Number(val);
      return 0;
    };
    return {
      ...ticket,
      total_estimate: parseNum(ticket.total_estimate)
    };
  }).filter((ticket) => {
    var _a;
    const matchesSearch = ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.issue_description.toLowerCase().includes(searchTerm.toLowerCase()) || ((_a = ticket.technician_name) == null ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const [activeTab, setActiveTab] = react.useState("tickets");
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "p-0 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex border-b border-ui-border-base px-6 pt-2 space-x-6", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: () => setActiveTab("tickets"),
          className: `pb-3 text-sm font-medium transition-colors ${activeTab === "tickets" ? "border-b-2 border-ui-fg-base text-ui-fg-base" : "text-ui-fg-subtle hover:text-ui-fg-base"}`,
          children: "Tickets"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: () => setActiveTab("settings"),
          className: `pb-3 text-sm font-medium transition-colors ${activeTab === "settings" ? "border-b-2 border-ui-fg-base text-ui-fg-base" : "text-ui-fg-subtle hover:text-ui-fg-base"}`,
          children: "Settings"
        }
      )
    ] }),
    activeTab === "tickets" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h1", children: "Repair Tickets" }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.FocusModal, { open: createModalOpen, onOpenChange: setCreateModalOpen, children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "primary", children: "Create Repair Ticket" }) }),
          /* @__PURE__ */ jsxRuntime.jsxs(ui.FocusModal.Content, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal.Header, { children: /* @__PURE__ */ jsxRuntime.jsx(
              ui.Button,
              {
                variant: "primary",
                onClick: handleCreateTicket,
                isLoading: isCreating,
                children: "Save Ticket"
              }
            ) }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal.Body, { className: "flex flex-col items-center py-16 overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full max-w-lg flex-col gap-y-8", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: "Create Repair Ticket" }),
                /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-ui-fg-subtle text-sm", children: "Add a new device and repair ticket." })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-4", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "text-lg", children: "Device Details" }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "brand", children: "Brand *" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ui.Input,
                      {
                        id: "brand",
                        value: newDevice.brand,
                        onChange: (e) => setNewDevice({ ...newDevice, brand: e.target.value }),
                        placeholder: "Apple"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "model_name", children: "Model Name *" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ui.Input,
                      {
                        id: "model_name",
                        value: newDevice.model_name,
                        onChange: (e) => setNewDevice({
                          ...newDevice,
                          model_name: e.target.value
                        }),
                        placeholder: "iPhone 13 Pro"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "serial_number", children: "Serial Number *" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ui.Input,
                      {
                        id: "serial_number",
                        value: newDevice.serial_number,
                        onChange: (e) => setNewDevice({
                          ...newDevice,
                          serial_number: e.target.value
                        }),
                        placeholder: "SN12345678"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "imei", children: "IMEI" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ui.Input,
                      {
                        id: "imei",
                        value: newDevice.imei,
                        onChange: (e) => setNewDevice({ ...newDevice, imei: e.target.value }),
                        placeholder: "Optional"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2 col-span-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "condition", children: "Device Condition" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ui.Textarea,
                      {
                        id: "condition",
                        value: newDevice.condition,
                        onChange: (e) => setNewDevice({
                          ...newDevice,
                          condition: e.target.value
                        }),
                        placeholder: "Scratches on screen, etc.",
                        rows: 3
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-4", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "text-lg", children: "Ticket Details" }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 gap-4", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "customer_id", children: "Customer" }),
                    /* @__PURE__ */ jsxRuntime.jsxs(
                      ui.Select,
                      {
                        value: newTicket.customer_id,
                        onValueChange: (val) => {
                          setNewTicket({ ...newTicket, customer_id: val });
                          setNewDevice({ ...newDevice, customer_id: val });
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Trigger, { children: /* @__PURE__ */ jsxRuntime.jsx(
                            ui.Select.Value,
                            {
                              placeholder: loadingCustomers ? "Loading..." : "Select a customer"
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Content, { children: customers.map((customer) => /* @__PURE__ */ jsxRuntime.jsxs(ui.Select.Item, { value: customer.id, children: [
                            customer.first_name || customer.last_name ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "No Name",
                            " ",
                            "(",
                            customer.email,
                            ")"
                          ] }, customer.id)) })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "issue_description", children: "Issue Description *" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ui.Textarea,
                      {
                        id: "issue_description",
                        value: newTicket.issue_description,
                        onChange: (e) => setNewTicket({
                          ...newTicket,
                          issue_description: e.target.value
                        }),
                        placeholder: "Screen is cracked and battery draining fast."
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "accessories", children: "Accessories Included (press comma to add)" }),
                    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: accessories.map((acc) => /* @__PURE__ */ jsxRuntime.jsxs(
                      ui.Badge,
                      {
                        color: "grey",
                        size: "small",
                        className: "flex items-center gap-1",
                        children: [
                          acc,
                          /* @__PURE__ */ jsxRuntime.jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => removeAccessory(acc),
                              className: "text-ui-fg-muted hover:text-ui-fg-base",
                              children: "×"
                            }
                          )
                        ]
                      },
                      acc
                    )) }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ui.Input,
                      {
                        id: "accessories",
                        value: accessoryInput,
                        onChange: (e) => setAccessoryInput(e.target.value),
                        onKeyDown: handleAccessoryKeyDown,
                        placeholder: "Type and press comma..."
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-4", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "text-lg", children: "Legal & Compliance" }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-4", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ui.Checkbox,
                      {
                        id: "terms_accepted",
                        checked: newTicket.terms_accepted,
                        onCheckedChange: (c) => setNewTicket({
                          ...newTicket,
                          terms_accepted: c === true
                        })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "terms_accepted", children: "Customer accepts Repair Terms & Conditions *" })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ui.Checkbox,
                      {
                        id: "data_wiped_consent",
                        checked: newTicket.data_wiped_consent,
                        onCheckedChange: (c) => setNewTicket({
                          ...newTicket,
                          data_wiped_consent: c === true
                        })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "data_wiped_consent", children: "Customer consents to device data wipe (if required)" })
                  ] })
                ] })
              ] })
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-48", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Trigger, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Value, { placeholder: "Filter by status" }) }),
          /* @__PURE__ */ jsxRuntime.jsxs(ui.Select.Content, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "all", children: "All Statuses" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "received", children: "Received" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "diagnosing", children: "Diagnosing" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "awaiting_approval", children: "Awaiting Approval" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "repairing", children: "Repairing" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "ready", children: "Ready" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "completed", children: "Completed" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "collected", children: "Collected" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "cancelled", children: "Cancelled" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Input,
          {
            placeholder: "Search tickets...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "flex-1"
          }
        )
      ] }),
      loading ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-center py-12", children: "Loading repair tickets..." }) : filteredTickets.length === 0 ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center py-12 text-ui-fg-subtle", children: [
        /* @__PURE__ */ jsxRuntime.jsx(icons.Wrench, { className: "mx-auto mb-4", size: 48 }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { children: "No repair tickets found" })
      ] }) : /* @__PURE__ */ jsxRuntime.jsxs(ui.Table, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Header, { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Table.Row, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Ticket #" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Status" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Technician" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Issue" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Estimate" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table.HeaderCell, { children: "Created" })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Body, { children: filteredTickets.map((ticket) => /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Table.Row,
          {
            onClick: () => navigate(`/repairs/${ticket.id}`),
            className: "cursor-pointer hover:bg-ui-bg-subtle-hover transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs(ui.Table.Cell, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "font-medium", children: ticket.ticket_number }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-ui-fg-subtle text-xs", children: getCustomerName(ticket.customer_id) })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2 items-center", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { color: getStatusColor(ticket.status), size: "small", children: ticket.status.replace("_", " ") }),
                (ticket.status === "completed" || ticket.status === "collected") && ticket.payment_status !== "captured" && ticket.payment_status !== "paid" && /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { color: "red", size: "small", children: "Unpaid" })
              ] }) }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: ticket.technician_name ? /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { color: "purple", size: "small", children: ticket.technician_name }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-ui-fg-muted text-xs", children: "Unassigned" }) }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { className: "max-w-xs truncate", children: ticket.issue_description }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: formatCurrency(ticket.total_estimate) }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Table.Cell, { children: new Date(ticket.created_at).toLocaleDateString() })
            ]
          },
          ticket.id
        )) })
      ] })
    ] }),
    activeTab === "settings" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-6 w-full max-w-2xl p-6", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: "General Settings" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-4 mt-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "font-medium text-ui-fg-base", children: "Company Name" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Displayed in notifications and SMS messages." }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Input,
              {
                placeholder: "e.g. Urban Device Care Ltd",
                value: settings.company_name,
                onChange: (e) => updateSettingState("company_name", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-2 mt-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "font-medium text-ui-fg-base", children: "Storefront URL" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Base URL for tracking links (e.g. http://localhost:8000)." }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Input,
              {
                placeholder: "e.g. https://store.example.com",
                value: settings.storefront_url,
                onChange: (e) => updateSettingState("storefront_url", e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-b border-ui-border-base my-6" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: "PDF Document Settings" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-4 mt-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "font-medium text-ui-fg-base", children: "Logo URL" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Enter an image URL for your company logo (e.g. https://example.com/logo.png)." }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Input,
              {
                placeholder: "https://...",
                value: settings.pdf_logo_url || "",
                onChange: (e) => updateSettingState("pdf_logo_url", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-2 mt-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "font-medium text-ui-fg-base", children: "Payment Details" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Bank account info, MPESA till number, or instructions to print on invoices." }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Textarea,
              {
                placeholder: "Account Name: Urban Device Care...",
                value: settings.pdf_payment_details || "",
                onChange: (e) => updateSettingState("pdf_payment_details", e.target.value),
                rows: 3
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-2 mt-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "font-medium text-ui-fg-base", children: "Terms & Conditions" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: "Legal text, warranty disclaimers, or terms to print at the bottom of Job Cards and Quotes." }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Textarea,
              {
                placeholder: "1. All repairs come with a 90-day warranty...",
                value: settings.pdf_terms || "",
                onChange: (e) => updateSettingState("pdf_terms", e.target.value),
                rows: 4
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-b border-ui-border-base my-6" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: "Notification Settings" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-ui-fg-subtle", children: "Configure which channels are enabled for automated repair notifications. (Note: Medusa must have a provider configured for these channels to actually send them)." }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-6 mt-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "font-semibold", children: "Email Notifications" }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-sm text-ui-fg-subtle", children: "Send status updates and payment links to customers via Email." })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Switch, { checked: settings.email_notifications_enabled, onCheckedChange: (v) => updateSettingState("email_notifications_enabled", v) })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "font-semibold", children: "SMS Notifications" }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-sm text-ui-fg-subtle", children: "Send status updates and payment links to customers via SMS." })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Switch, { checked: settings.sms_notifications_enabled, onCheckedChange: (v) => updateSettingState("sms_notifications_enabled", v) })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "font-semibold", children: "WhatsApp Notifications" }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-sm text-ui-fg-subtle", children: "Send status updates and payment links to customers via WhatsApp." })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Switch, { checked: settings.whatsapp_notifications_enabled, onCheckedChange: (v) => updateSettingState("whatsapp_notifications_enabled", v) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "my-8" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-6 max-w-2xl", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: "Zoho Books Integration" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-ui-fg-subtle", children: "Configure Zoho Books to automatically sync Repair Tickets as Estimates and Invoices." }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-6 mt-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "font-semibold", children: "Enable Zoho Books Sync" }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-sm text-ui-fg-subtle", children: "Replaces local PDF generation with official Zoho Books documents." })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Switch, { checked: settings.zoho_books_enabled, onCheckedChange: (v) => updateSettingState("zoho_books_enabled", v) })
          ] }),
          settings.zoho_books_enabled && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-4 p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Zoho Data Center (Domain)" }),
              /* @__PURE__ */ jsxRuntime.jsxs(
                ui.Select,
                {
                  value: settings.zoho_domain,
                  onValueChange: (v) => updateSettingState("zoho_domain", v),
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Trigger, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Value, { placeholder: "Select Data Center" }) }),
                    /* @__PURE__ */ jsxRuntime.jsxs(ui.Select.Content, { children: [
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "com", children: ".com (Global)" }),
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "eu", children: ".eu (Europe)" }),
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "in", children: ".in (India)" }),
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "com.au", children: ".com.au (Australia)" }),
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "jp", children: ".jp (Japan)" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Organization ID" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Input,
                {
                  placeholder: "e.g. 12345678",
                  value: settings.zoho_organization_id,
                  onChange: (e) => updateSettingState("zoho_organization_id", e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Client ID" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Input,
                {
                  placeholder: "1000.XXXXXXXXXXXXXXXXXXXXXXXX",
                  value: settings.zoho_client_id,
                  onChange: (e) => updateSettingState("zoho_client_id", e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Client Secret" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Input,
                {
                  placeholder: "Enter Client Secret",
                  type: "password",
                  value: settings.zoho_client_secret,
                  onChange: (e) => updateSettingState("zoho_client_secret", e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Refresh Token" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Input,
                {
                  placeholder: "1000.XXXXXXXXXXXXXXXXXXXXXXXX",
                  type: "password",
                  value: settings.zoho_refresh_token,
                  onChange: (e) => updateSettingState("zoho_refresh_token", e.target.value)
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "my-8" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-6 max-w-2xl", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: "Paystack Integration" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-ui-fg-subtle", children: "Configure Paystack to generate payment links for repairs." }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-6 mt-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "font-semibold", children: "Enable Paystack Checkout" }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-sm text-ui-fg-subtle", children: "Generate Paystack checkout links on approved tickets." })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Switch, { checked: settings.paystack_enabled, onCheckedChange: (v) => updateSettingState("paystack_enabled", v) })
          ] }),
          settings.paystack_enabled && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-4 p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Public Key" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Input,
                {
                  placeholder: "pk_test_...",
                  value: settings.paystack_public_key,
                  onChange: (e) => updateSettingState("paystack_public_key", e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Secret Key" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Input,
                {
                  placeholder: "sk_test_...",
                  type: "password",
                  value: settings.paystack_secret_key,
                  onChange: (e) => updateSettingState("paystack_secret_key", e.target.value)
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end mt-4", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "primary", onClick: saveSettings, isLoading: isSaving, children: "Save Settings" }) })
    ] })
  ] });
};
const config$1 = adminSdk.defineRouteConfig({
  label: "Repair",
  icon: icons.Wrench
});
const useParams = () => {
  const path = window.location.pathname;
  const parts = path.split("/");
  const id = parts[parts.length - 1];
  return { id };
};
const RepairDetailPage = () => {
  const { id } = useParams();
  const navigate = reactRouterDom.useNavigate();
  const [ticket, setTicket] = react.useState(null);
  const [loading, setLoading] = react.useState(true);
  const { formatCurrency } = useStoreCurrency();
  const [newStatus, setNewStatus] = react.useState("");
  const [unifiedMessage, setUnifiedMessage] = react.useState("");
  const [messageType, setMessageType] = react.useState("chat");
  const [technicianName, setTechnicianName] = react.useState("");
  const [technicianId, setTechnicianId] = react.useState("");
  const [laborCost, setLaborCost] = react.useState("");
  const [etc, setEtc] = react.useState("");
  const [inventoryParts, setInventoryParts] = react.useState([]);
  const [selectedInventoryPart, setSelectedInventoryPart] = react.useState("");
  const [partSearch, setPartSearch] = react.useState("");
  const [isAddingPart, setIsAddingPart] = react.useState(false);
  const [customPartName, setCustomPartName] = react.useState("");
  const [customPartPrice, setCustomPartPrice] = react.useState("");
  const [partInputMode, setPartInputMode] = react.useState("inventory");
  const [technicianSearch, setTechnicianSearch] = react.useState("");
  const [technicianOptions, setTechnicianOptions] = react.useState([]);
  const [showTechnicianDropdown, setShowTechnicianDropdown] = react.useState(false);
  const [isSendingReminder, setIsSendingReminder] = react.useState(false);
  const [isPushingStk, setIsPushingStk] = react.useState(false);
  react.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!technicianSearch) {
        setTechnicianOptions([]);
        return;
      }
      Promise.all([
        fetch(`/admin/users?q=${technicianSearch}`, { credentials: "include" }).then((res) => res.json()),
        fetch(`/admin/customers?q=${technicianSearch}`, { credentials: "include" }).then((res) => res.json())
      ]).then(([usersData, customersData]) => {
        const admins = (usersData.users || []).map((u) => ({ ...u, type: "Admin" }));
        const customers = (customersData.customers || []).map((c) => ({ ...c, type: "Customer" }));
        setTechnicianOptions([...admins, ...customers]);
      }).catch((err) => console.error("Search failed", err));
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [technicianSearch]);
  const loadTicket = async () => {
    try {
      if (!ticket) setLoading(true);
      const res = await fetch(`/admin/repairs/${id}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch ticket");
      }
      const t = data.repair_ticket;
      const parseNum = (val) => {
        if (typeof val === "object" && val !== null && "value" in val)
          return Number(val.value);
        if (val !== void 0) return Number(val);
        return 0;
      };
      t.labor_estimate = parseNum(t.labor_estimate);
      t.parts_estimate = parseNum(t.parts_estimate);
      t.total_estimate = parseNum(t.total_estimate);
      t.labor_actual = parseNum(t.labor_actual);
      t.parts_actual = parseNum(t.parts_actual);
      t.total_actual = parseNum(t.total_actual);
      t.custom_parts = t.custom_parts || [];
      setTicket(t);
      setNewStatus(t.status);
      setTechnicianName(t.technician_name || "");
      setTechnicianId(t.technician_id || "");
      setLaborCost((t.labor_estimate || 0).toFixed(2));
      setEtc(
        t.estimated_completion ? t.estimated_completion.split("T")[0] : ""
      );
      loadInventoryParts();
    } catch (err) {
      console.error("Failed to load repair ticket:", err);
    } finally {
      setLoading(false);
    }
  };
  const loadInventoryParts = async () => {
    try {
      const res = await fetch(`/admin/parts`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setInventoryParts(data.parts || []);
      }
    } catch (err) {
    }
  };
  react.useEffect(() => {
    if (id) {
      loadTicket();
    }
  }, [id]);
  const handleAddInventoryPart = async () => {
    if (!selectedInventoryPart) return;
    try {
      setIsAddingPart(true);
      await fetch(`/admin/repairs/${id}/parts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_ids: [selectedInventoryPart] })
      });
      ui.toast.success("Inventory part added");
      setSelectedInventoryPart("");
      setPartSearch("");
      loadTicket();
    } catch (err) {
      ui.toast.error("Failed to add part");
    } finally {
      setIsAddingPart(false);
    }
  };
  const handleRemoveInventoryPart = async (variantId) => {
    try {
      setIsAddingPart(true);
      await fetch(`/admin/repairs/${id}/parts/${variantId}`, {
        method: "DELETE",
        credentials: "include"
      });
      ui.toast.success("Inventory part removed");
      loadTicket();
    } catch (err) {
      ui.toast.error("Failed to remove part");
    } finally {
      setIsAddingPart(false);
    }
  };
  const handleAddCustomPart = async () => {
    if (!customPartName || customPartPrice === "") return;
    try {
      setIsAddingPart(true);
      await fetch(`/admin/repairs/${id}/custom-parts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customPartName,
          price: Number(customPartPrice)
        })
      });
      ui.toast.success("Custom part added");
      setCustomPartName("");
      setCustomPartPrice("");
      setCustomPartTaxable(true);
      loadTicket();
    } catch (err) {
      ui.toast.error("Failed to add custom part");
    } finally {
      setIsAddingPart(false);
    }
  };
  const handleStkPush = async () => {
    var _a;
    const phone = prompt("Enter customer M-PESA phone number:", (ticket == null ? void 0 : ticket.customer_phone) || "");
    if (!phone) return;
    let amount = prompt("Enter amount to charge (KES):", (_a = ticket == null ? void 0 : ticket.total_estimate) == null ? void 0 : _a.toString());
    if (!amount) return;
    setIsPushingStk(true);
    try {
      const response = await fetch(`/admin/repairs/${id}/stk-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount: Number(amount) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "STK Push failed");
      ui.toast.success("STK Push successfully sent to customer's phone!");
    } catch (e) {
      ui.toast.error("Error: " + e.message);
    } finally {
      setIsPushingStk(false);
    }
  };
  const handleMarkPaid = async () => {
    if (!confirm("Are you sure you want to mark this ticket as Paid manually (e.g. Cash in store)? This will sync the payment to Zoho Books.")) return;
    try {
      const response = await fetch(`/admin/repairs/${id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "Cash" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to mark paid");
      ui.toast.success("Successfully marked as paid and synced to Zoho Books!");
      loadTicket();
    } catch (e) {
      ui.toast.error("Error: " + e.message);
    }
  };
  const handleSendUnified = async () => {
    if (!unifiedMessage.trim()) return;
    try {
      if (messageType === "chat") {
        await fetch(`/admin/repairs/${id}/messages`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: unifiedMessage })
        });
        ui.toast.success("Message sent");
      } else {
        await fetch(`/admin/repairs/${id}/notes`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: unifiedMessage,
            is_internal: messageType === "internal_note"
          })
        });
        ui.toast.success("Note added");
      }
      setUnifiedMessage("");
      loadTicket();
    } catch (err) {
      ui.toast.error("Failed to add entry");
    }
  };
  const handleSendReminder = async () => {
    try {
      setIsSendingReminder(true);
      await fetch(`/admin/repairs/${id}/remind`, {
        method: "POST",
        credentials: "include"
      });
      ui.toast.success("Reminder sent successfully");
    } catch (err) {
      ui.toast.error("Failed to send reminder");
    } finally {
      setIsSendingReminder(false);
    }
  };
  const handleUpdateCosts = async (overrides) => {
    try {
      const promises = [];
      const currentLaborCost = (overrides == null ? void 0 : overrides.laborCost) ?? laborCost;
      const currentEtc = (overrides == null ? void 0 : overrides.etc) !== void 0 ? overrides.etc : etc;
      const currentTechName = (overrides == null ? void 0 : overrides.technicianName) !== void 0 ? overrides.technicianName : technicianName;
      const currentTechId = (overrides == null ? void 0 : overrides.technicianId) !== void 0 ? overrides.technicianId : technicianId;
      const currentStatus = (overrides == null ? void 0 : overrides.newStatus) ?? newStatus;
      if (currentLaborCost !== "") {
        const laborAmount = parseFloat(currentLaborCost);
        if (!isNaN(laborAmount)) {
          promises.push(
            fetch(`/admin/repairs/${id}/costs`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                labor_estimate: laborAmount
              })
            })
          );
        }
      }
      promises.push(
        fetch(`/admin/repairs/${id}/details`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estimated_completion: currentEtc ? new Date(currentEtc).toISOString() : null,
            technician_name: currentTechName || null,
            technician_id: currentTechId || null
          })
        })
      );
      if (ticket && currentStatus !== ticket.status) {
        promises.push(
          fetch(`/admin/repairs/${id}/status`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: currentStatus })
          })
        );
      }
      await Promise.all(promises);
      ui.toast.success("Details saved successfully");
      loadTicket();
    } catch (err) {
      ui.toast.error("Failed to update details");
    }
  };
  const handleManualApprove = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/admin/repairs/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) {
        throw new Error("Failed to approve ticket");
      }
      await loadTicket();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleToggleTax = async (checked) => {
    try {
      const res = await fetch(`/admin/repairs/${id}/tax`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apply_tax: checked })
      });
      if (!res.ok) {
        throw new Error("Failed to update tax setting");
      }
      ui.toast.success(checked ? "VAT applied to total" : "VAT removed from total");
      await loadTicket();
    } catch (err) {
      ui.toast.error(err.message || "Failed to update tax setting");
    }
  };
  const getStatusColor = (status) => {
    const colors = {
      pending_dropoff: "grey",
      received: "grey",
      diagnosing: "blue",
      awaiting_approval: "orange",
      repairing: "blue",
      ready: "green",
      completed: "green",
      collected: "green",
      cancelled: "red"
    };
    return colors[status] || "grey";
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsx(ui.Container, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "Loading repair ticket..." }) });
  }
  if (!ticket) {
    return /* @__PURE__ */ jsxRuntime.jsx(ui.Container, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "Repair ticket not found" }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Toaster, {}),
    /* @__PURE__ */ jsxRuntime.jsx(ui.Container, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h1", children: ticket.ticket_number }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { color: getStatusColor(ticket.status), children: ticket.status.replace("_", " ") }),
          ticket.technician_name && /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { color: "purple", children: ticket.technician_name })
        ] }),
        ticket.device && /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { className: "text-ui-fg-subtle mt-2", children: [
          ticket.device.brand,
          " ",
          ticket.device.model_name,
          " - S/N:",
          " ",
          ticket.device.serial_number
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center justify-end gap-x-5 gap-y-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("a", { href: `/admin/repairs/${id}/document?type=job_card`, target: "_blank", className: "text-[11px] uppercase tracking-wider font-semibold text-ui-fg-subtle hover:text-ui-fg-base transition-colors", children: "Job Card" }),
        /* @__PURE__ */ jsxRuntime.jsx("a", { href: `/admin/repairs/${id}/document?type=quote`, target: "_blank", className: "text-[11px] uppercase tracking-wider font-semibold text-ui-fg-subtle hover:text-ui-fg-base transition-colors", children: "Quote" }),
        /* @__PURE__ */ jsxRuntime.jsx("a", { href: `/admin/repairs/${id}/document?type=invoice`, target: "_blank", className: "text-[11px] uppercase tracking-wider font-semibold text-ui-fg-subtle hover:text-ui-fg-base transition-colors", children: "Invoice" }),
        (ticket.payment_status === "captured" || ticket.payment_status === "paid") && /* @__PURE__ */ jsxRuntime.jsx("a", { href: `/admin/repairs/${id}/document?type=receipt`, target: "_blank", className: "text-[11px] uppercase tracking-wider font-semibold text-ui-fg-subtle hover:text-ui-fg-base transition-colors", children: "Receipt" }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            onClick: handleSendReminder,
            disabled: isSendingReminder,
            className: "text-[11px] uppercase tracking-wider font-semibold text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors flex items-center gap-1 disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(icons.BellAlert, { className: "w-3 h-3" }),
              " Reminder"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => navigate("/repairs"), className: "text-[11px] uppercase tracking-wider font-semibold text-ui-fg-subtle hover:text-ui-fg-base transition-colors pl-2 border-l border-ui-border-base ml-2", children: "Back" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "lg:col-span-7 space-y-6", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-base border border-ui-border-base rounded-lg shadow-sm", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-6 border-b border-ui-border-base", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-baseline gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: "Issue Details" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-ui-fg-muted text-xs", children: "•" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-ui-fg-muted text-xs", children: new Date(ticket.created_at).toLocaleString(void 0, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Description" }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: ticket.issue_description })
              ] }),
              ticket.accessories && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Accessories" }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: ticket.accessories })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "pt-3 border-t", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Compliance" }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2 mt-1.5", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("span", { className: `text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm leading-none tracking-wider ${ticket.terms_accepted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`, children: [
                    "Terms: ",
                    ticket.terms_accepted ? "YES" : "NO"
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("span", { className: `text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm leading-none tracking-wider ${ticket.data_wiped_consent ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`, children: [
                    "Wipe: ",
                    ticket.data_wiped_consent ? "YES" : "NO"
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-6 border-b border-ui-border-base bg-ui-bg-subtle/20", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "mb-4", children: "Update Details" }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] uppercase font-semibold text-ui-fg-muted tracking-wider mb-1 block", children: "Technician" }),
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center border border-ui-border-base rounded-md overflow-hidden bg-ui-bg-base focus-within:ring-2 focus-within:ring-ui-fg-interactive transition-all", children: technicianName ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 px-3 py-[9px] text-sm text-ui-fg-base truncate", children: technicianName }),
                    /* @__PURE__ */ jsxRuntime.jsx("button", { className: "px-3 text-ui-fg-muted hover:text-ui-fg-base", onClick: () => {
                      setTechnicianName("");
                      setTechnicianId("");
                      handleUpdateCosts({ technicianName: "", technicianId: "" });
                    }, children: "×" })
                  ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "input",
                      {
                        placeholder: "Search tech...",
                        className: "w-full bg-transparent text-sm px-3 py-[9px] outline-none text-ui-fg-base placeholder-ui-fg-muted",
                        value: technicianSearch,
                        onChange: (e) => {
                          setTechnicianSearch(e.target.value);
                          setShowTechnicianDropdown(true);
                        },
                        onFocus: () => setShowTechnicianDropdown(true),
                        onBlur: () => setTimeout(() => setShowTechnicianDropdown(false), 200)
                      }
                    ),
                    showTechnicianDropdown && technicianOptions.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute top-full left-0 z-50 w-full mt-1 bg-ui-bg-base border border-ui-border-base rounded-md shadow-lg max-h-60 overflow-y-auto", children: technicianOptions.map((opt) => /* @__PURE__ */ jsxRuntime.jsxs(
                      "div",
                      {
                        className: "p-2 text-sm cursor-pointer hover:bg-ui-bg-subtle-hover flex justify-between items-center",
                        onClick: () => {
                          const name = `${opt.first_name} ${opt.last_name}`;
                          setTechnicianName(name);
                          setTechnicianId(opt.id);
                          setTechnicianSearch("");
                          setShowTechnicianDropdown(false);
                          handleUpdateCosts({ technicianName: name, technicianId: opt.id });
                        },
                        children: [
                          opt.first_name,
                          " ",
                          opt.last_name
                        ]
                      },
                      opt.id
                    )) })
                  ] }) })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] uppercase font-semibold text-ui-fg-muted tracking-wider block", children: "Status" }),
                    ((ticket == null ? void 0 : ticket.status) === "completed" || (ticket == null ? void 0 : ticket.status) === "collected") && (ticket == null ? void 0 : ticket.payment_status) !== "captured" && (ticket == null ? void 0 : ticket.payment_status) !== "paid" && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[9px] font-bold px-1 py-0.5 bg-red-100 text-red-700 rounded-sm leading-none", children: "UNPAID" })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center border border-ui-border-base rounded-md overflow-hidden bg-ui-bg-base focus-within:ring-2 focus-within:ring-ui-fg-interactive transition-all", children: /* @__PURE__ */ jsxRuntime.jsxs(
                    "select",
                    {
                      className: "w-full bg-transparent text-sm px-3 py-[9px] outline-none text-ui-fg-base appearance-none cursor-pointer",
                      value: newStatus,
                      onChange: (e) => {
                        const val = e.target.value;
                        setNewStatus(val);
                        handleUpdateCosts({ newStatus: val });
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntime.jsx("option", { value: "pending_dropoff", children: "Pending Dropoff" }),
                        /* @__PURE__ */ jsxRuntime.jsx("option", { value: "received", children: "Received" }),
                        /* @__PURE__ */ jsxRuntime.jsx("option", { value: "diagnosing", children: "Diagnosing" }),
                        /* @__PURE__ */ jsxRuntime.jsx("option", { value: "awaiting_approval", children: "Awaiting Approval" }),
                        /* @__PURE__ */ jsxRuntime.jsxs("option", { value: "repairing", disabled: !(ticket == null ? void 0 : ticket.is_approved), children: [
                          "Repairing ",
                          !(ticket == null ? void 0 : ticket.is_approved) && "(Req Approval)"
                        ] }),
                        /* @__PURE__ */ jsxRuntime.jsxs("option", { value: "ready", disabled: !(ticket == null ? void 0 : ticket.is_approved), children: [
                          "Ready ",
                          !(ticket == null ? void 0 : ticket.is_approved) && "(Req Approval)"
                        ] }),
                        /* @__PURE__ */ jsxRuntime.jsxs("option", { value: "completed", disabled: !(ticket == null ? void 0 : ticket.is_approved), children: [
                          "Completed ",
                          !(ticket == null ? void 0 : ticket.is_approved) && "(Req Approval)"
                        ] }),
                        /* @__PURE__ */ jsxRuntime.jsxs("option", { value: "collected", disabled: !(ticket == null ? void 0 : ticket.is_approved), children: [
                          "Collected ",
                          !(ticket == null ? void 0 : ticket.is_approved) && "(Req Approval)"
                        ] }),
                        /* @__PURE__ */ jsxRuntime.jsx("option", { value: "cancelled", children: "Cancelled" }),
                        /* @__PURE__ */ jsxRuntime.jsx("option", { value: "refunded", children: "Refunded" })
                      ]
                    }
                  ) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] uppercase font-semibold text-ui-fg-muted tracking-wider mb-1 block", children: "Labor Cost (KES)" }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center border border-ui-border-base rounded-md overflow-hidden bg-ui-bg-base focus-within:ring-2 focus-within:ring-ui-fg-interactive transition-all", children: [
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-ui-fg-muted pl-3 text-sm", children: "KES" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "input",
                      {
                        type: "number",
                        step: "0.01",
                        placeholder: "0.00",
                        className: "w-full bg-transparent text-sm px-2 py-[9px] outline-none text-ui-fg-base placeholder-ui-fg-muted",
                        value: laborCost,
                        onChange: (e) => setLaborCost(e.target.value),
                        onBlur: (e) => handleUpdateCosts({ laborCost: e.target.value }),
                        onKeyDown: (e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[10px] uppercase font-semibold text-ui-fg-muted tracking-wider mb-1 block", children: "Est. Completion" }),
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center border border-ui-border-base rounded-md overflow-hidden bg-ui-bg-base focus-within:ring-2 focus-within:ring-ui-fg-interactive transition-all", children: /* @__PURE__ */ jsxRuntime.jsx(
                    "input",
                    {
                      type: "date",
                      className: "w-full bg-transparent text-sm px-3 py-[9px] outline-none text-ui-fg-base text-ui-fg-muted",
                      value: etc,
                      min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                      onChange: (e) => {
                        setEtc(e.target.value);
                        handleUpdateCosts({ etc: e.target.value });
                      }
                    }
                  ) })
                ] })
              ] }),
              !(ticket == null ? void 0 : ticket.is_approved) && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-xs text-ui-fg-error -mt-1", children: "Customer must approve estimate before starting work." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-6 border-b border-ui-border-base", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "mb-4", children: "Parts & Inventory" }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4 mb-6", children: [
              ticket.parts && ticket.parts.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Inventory Parts Used" }),
                ticket.parts.map((p) => {
                  var _a, _b, _c;
                  return /* @__PURE__ */ jsxRuntime.jsxs(
                    "div",
                    {
                      className: "flex items-center justify-between p-2 bg-ui-bg-subtle rounded border text-sm",
                      children: [
                        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
                          /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { children: [
                            ((_a = p.product) == null ? void 0 : _a.title) ? `${p.product.title} - ` : "",
                            p.title
                          ] }),
                          /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { className: "text-ui-fg-subtle text-xs", children: [
                            p.sku || "-",
                            " ",
                            ((_c = (_b = p.prices) == null ? void 0 : _b[0]) == null ? void 0 : _c.amount) != null ? ` • ${formatCurrency(p.prices[0].amount)}` : ""
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntime.jsx(
                          ui.Button,
                          {
                            variant: "transparent",
                            className: "text-ui-fg-muted hover:text-ui-fg-base",
                            onClick: () => handleRemoveInventoryPart(p.id),
                            disabled: isAddingPart,
                            children: /* @__PURE__ */ jsxRuntime.jsx(icons.Trash, {})
                          }
                        )
                      ]
                    },
                    p.id
                  );
                })
              ] }),
              ticket.custom_parts && ticket.custom_parts.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { children: "Custom Parts" }),
                ticket.custom_parts.map((cp, idx) => /* @__PURE__ */ jsxRuntime.jsxs(
                  "div",
                  {
                    className: "flex items-center justify-between p-2 bg-ui-bg-subtle rounded border text-sm",
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
                        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: cp.name }),
                        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "font-medium text-xs", children: formatCurrency(cp.price) })
                      ] }),
                      /* @__PURE__ */ jsxRuntime.jsx(
                        ui.Button,
                        {
                          variant: "transparent",
                          className: "text-ui-fg-muted hover:text-ui-fg-base",
                          onClick: async () => {
                            try {
                              setIsAddingPart(true);
                              await fetch(`/admin/repairs/${id}/custom-parts/${idx}`, {
                                method: "DELETE",
                                credentials: "include"
                              });
                              ui.toast.success("Custom part removed");
                              loadTicket();
                            } catch (e) {
                              ui.toast.error("Failed to remove custom part");
                            } finally {
                              setIsAddingPart(false);
                            }
                          },
                          disabled: isAddingPart,
                          children: /* @__PURE__ */ jsxRuntime.jsx(icons.Trash, {})
                        }
                      )
                    ]
                  },
                  idx
                ))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "pt-4 border-t", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center border border-ui-border-base rounded-md overflow-visible bg-ui-bg-base focus-within:ring-2 focus-within:ring-ui-fg-interactive transition-all", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-r border-ui-border-base px-2 py-[7px] bg-ui-bg-subtle h-full", children: /* @__PURE__ */ jsxRuntime.jsxs(
                "select",
                {
                  className: "bg-transparent text-xs font-medium text-ui-fg-subtle outline-none cursor-pointer appearance-none pr-1",
                  value: partInputMode,
                  onChange: (e) => {
                    setPartInputMode(e.target.value);
                    setPartSearch("");
                    setSelectedInventoryPart("");
                    setCustomPartName("");
                    setCustomPartPrice("");
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx("option", { value: "inventory", children: "Inventory ▾" }),
                    /* @__PURE__ */ jsxRuntime.jsx("option", { value: "custom", children: "Custom ▾" })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 px-3 relative", children: partInputMode === "inventory" ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  "input",
                  {
                    placeholder: "Search variant...",
                    className: "w-full bg-transparent text-sm outline-none text-ui-fg-base placeholder-ui-fg-muted",
                    value: partSearch,
                    onChange: (e) => {
                      setPartSearch(e.target.value);
                      setSelectedInventoryPart("");
                    }
                  }
                ),
                partSearch && !selectedInventoryPart && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute left-0 z-50 w-full mt-2 bg-ui-bg-base border border-ui-border-base rounded-md shadow-md max-h-48 overflow-y-auto", children: [
                  inventoryParts.filter(
                    (p) => {
                      var _a;
                      return p.title.toLowerCase().includes(partSearch.toLowerCase()) || ((_a = p.sku) == null ? void 0 : _a.toLowerCase().includes(partSearch.toLowerCase()));
                    }
                  ).map((p) => /* @__PURE__ */ jsxRuntime.jsxs(
                    "div",
                    {
                      className: "p-2 text-sm hover:bg-ui-bg-subtle-hover cursor-pointer",
                      onClick: () => {
                        setSelectedInventoryPart(p.id);
                        setPartSearch(`${p.title} ${p.sku ? `(${p.sku})` : ""}`);
                      },
                      children: [
                        p.title,
                        " ",
                        p.sku ? `(${p.sku})` : ""
                      ]
                    },
                    p.id
                  )),
                  inventoryParts.filter(
                    (p) => {
                      var _a;
                      return p.title.toLowerCase().includes(partSearch.toLowerCase()) || ((_a = p.sku) == null ? void 0 : _a.toLowerCase().includes(partSearch.toLowerCase()));
                    }
                  ).length === 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2 text-sm text-ui-fg-subtle", children: "No parts found" })
                ] })
              ] }) : /* @__PURE__ */ jsxRuntime.jsx(
                "input",
                {
                  placeholder: "Part description...",
                  className: "w-full bg-transparent text-sm outline-none text-ui-fg-base placeholder-ui-fg-muted",
                  value: customPartName,
                  onChange: (e) => setCustomPartName(e.target.value)
                }
              ) }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center border-l border-ui-border-base bg-ui-bg-subtle pl-2", children: [
                partInputMode === "custom" && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-ui-fg-subtle text-xs mr-1", children: "KES" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "input",
                    {
                      type: "number",
                      step: "0.01",
                      placeholder: "0.00",
                      className: "w-16 bg-transparent text-sm text-right outline-none text-ui-fg-base placeholder-ui-fg-muted py-[7px]",
                      value: customPartPrice,
                      onChange: (e) => setCustomPartPrice(e.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    className: `ml-2 px-3 py-[7px] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${partInputMode === "custom" ? "border-l border-ui-border-base" : ""} text-ui-fg-base hover:bg-ui-bg-base-hover`,
                    onClick: partInputMode === "inventory" ? handleAddInventoryPart : handleAddCustomPart,
                    disabled: isAddingPart || partInputMode === "inventory" && !selectedInventoryPart || partInputMode === "custom" && (!customPartName || !customPartPrice),
                    children: "Add"
                  }
                )
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-6", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "mb-4", children: "Cost Breakdown" }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "Parts Estimate:" }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "font-medium", children: formatCurrency(ticket.parts_estimate) })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "Labor Estimate:" }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "font-medium", children: formatCurrency(ticket.labor_estimate) })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between items-center py-2", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "global-vat-toggle", className: "text-sm cursor-pointer text-ui-fg-subtle", children: "+ Add 16% VAT to Total" }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "global-vat-toggle",
                    checked: ticket.apply_tax ?? false,
                    onChange: (e) => handleToggleTax(e.target.checked),
                    disabled: loading
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between text-lg font-semibold border-t pt-2", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "Total Estimate:" }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: formatCurrency(ticket.total_estimate) })
              ] }),
              ticket.payment_status !== "paid" && ticket.payment_status !== "captured" && ticket.status !== "cancelled" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4 pt-3 border-t grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    onClick: handleStkPush,
                    disabled: loading || isPushingStk,
                    className: "py-1.5 text-[11px] uppercase tracking-wider font-semibold text-ui-fg-interactive bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover rounded-md transition-colors disabled:opacity-50",
                    children: isPushingStk ? "Pushing..." : "Push STK"
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    onClick: handleMarkPaid,
                    disabled: loading,
                    className: "py-1.5 text-[11px] uppercase tracking-wider font-semibold text-ui-fg-base bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover rounded-md transition-colors disabled:opacity-50",
                    children: "Mark Paid (Cash)"
                  }
                )
              ] }),
              ticket.is_approved ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-4 pt-3 border-t", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-[10px] uppercase font-semibold text-ui-fg-muted tracking-wider", children: "Status / Paid" }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[9px] uppercase font-bold text-ui-fg-muted tracking-wider", children: [
                    "APPR: ",
                    new Date(ticket.approved_at).toLocaleDateString()
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: `text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm leading-none tracking-wider ${ticket.payment_status === "paid" || ticket.payment_status === "captured" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`, children: ticket.payment_status })
                ] })
              ] }) }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-4 pt-3 border-t", children: /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  onClick: handleManualApprove,
                  disabled: loading,
                  className: "w-full py-1.5 text-[11px] uppercase tracking-wider font-semibold text-ui-fg-base bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover border border-ui-border-base rounded-md transition-colors disabled:opacity-50",
                  children: "Manually Approve & Create Payment"
                }
              ) })
            ] })
          ] })
        ] }),
        ticket.media && ticket.media.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "mb-4", children: "Media" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-2 gap-3", children: ticket.media.map((media) => /* @__PURE__ */ jsxRuntime.jsxs(
            "a",
            {
              href: media.file_url,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "relative aspect-square rounded border overflow-hidden hover:opacity-80",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  "img",
                  {
                    src: media.file_url,
                    alt: "Repair media",
                    className: "w-full h-full object-cover"
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(
                  icons.ArrowUpRightOnBox,
                  {
                    className: "absolute top-2 right-2 text-white",
                    size: 16
                  }
                )
              ]
            },
            media.id
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "lg:col-span-5", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx(icons.ChatBubbleLeftRight, { size: 20 }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: "Timeline & Communication" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-2 max-h-[600px] overflow-y-auto mb-4 pl-4 border-l-2 border-ui-border-base ml-2", children: (() => {
            const items = [
              ...(ticket.notes || []).map((n) => ({
                ...n,
                entryType: "note"
              })),
              ...(ticket.updates || []).map((u) => ({
                ...u,
                entryType: "update"
              }))
            ].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            if (items.length === 0) {
              return /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-ui-fg-muted p-2 text-center text-sm", children: "No activity yet." });
            }
            return items.map((item) => {
              var _a;
              return /* @__PURE__ */ jsxRuntime.jsxs(
                "div",
                {
                  className: `p-3 rounded border bg-ui-bg-base ${item.entryType === "update" && item.author_type !== "customer" ? "ml-8" : item.entryType === "update" && item.author_type === "customer" ? "mr-8" : ""}`,
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                      item.entryType === "note" ? /* @__PURE__ */ jsxRuntime.jsx(
                        ui.Badge,
                        {
                          color: item.is_internal ? "orange" : "blue",
                          size: "small",
                          children: item.is_internal ? "Internal Note" : "Public Note"
                        }
                      ) : /* @__PURE__ */ jsxRuntime.jsx(
                        ui.Badge,
                        {
                          color: item.author_type === "customer" ? "green" : "purple",
                          size: "small",
                          children: item.author_type === "customer" ? ((_a = ticket.customer) == null ? void 0 : _a.first_name) ? `${ticket.customer.first_name} ${ticket.customer.last_name || ""}`.trim() : "Customer" : ticket.technician_name || "Technician"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xsmall", className: "text-ui-fg-muted", children: new Date(item.created_at).toLocaleString() })
                    ] }),
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "whitespace-pre-wrap", children: item.entryType === "note" ? item.content : item.message })
                  ]
                },
                `${item.entryType}_${item.id}`
              );
            });
          })() }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-2 p-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Textarea,
              {
                value: unifiedMessage,
                onChange: (e) => setUnifiedMessage(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendUnified();
                  }
                },
                placeholder: "Type a message or note... (Press Enter to send)",
                rows: 3,
                className: "bg-ui-bg-base"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
              /* @__PURE__ */ jsxRuntime.jsxs(
                ui.Select,
                {
                  value: messageType,
                  onValueChange: (val) => setMessageType(val),
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Trigger, { className: "w-[180px] bg-ui-bg-base", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Value, {}) }),
                    /* @__PURE__ */ jsxRuntime.jsxs(ui.Select.Content, { children: [
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "chat", children: "Message Customer" }),
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "internal_note", children: "Internal Note" }),
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "public_note", children: "Public Note" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 text-xs text-ui-fg-muted flex justify-end", children: [
                "Press ",
                /* @__PURE__ */ jsxRuntime.jsx("kbd", { className: "mx-1 px-1.5 py-0.5 bg-ui-bg-subtle border border-ui-border-base rounded text-[10px] font-mono", children: "Enter" }),
                " to submit"
              ] })
            ] })
          ] })
        ] })
      ] }) })
    ] })
  ] });
};
const ReportsPage = () => {
  const [data, setData] = react.useState(null);
  const [loading, setLoading] = react.useState(true);
  const { formatCurrency } = useStoreCurrency();
  react.useEffect(() => {
    fetch(`/admin/repairs/analytics`, {
      credentials: "include"
    }).then((res) => res.json()).then((resData) => {
      setData(resData.analytics);
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to load analytics:", err);
      setLoading(false);
    });
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsx(ui.Container, { className: "p-8", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "Loading reports..." }) });
  }
  if (!data) {
    return /* @__PURE__ */ jsxRuntime.jsx(ui.Container, { className: "p-8", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "No analytics data available." }) });
  }
  const chartData = Object.keys(data.status_counts).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
    count: data.status_counts[key]
  }));
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "p-8", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 mb-8", children: [
      /* @__PURE__ */ jsxRuntime.jsx(icons.ChartBar, { className: "text-ui-fg-subtle" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h1", children: "Repair Analytics & Reports" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-6 border rounded-lg bg-ui-bg-base border-ui-border-base shadow-sm", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-ui-fg-subtle mb-1", children: "Total Repairs" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "text-3xl", children: data.total_repairs })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-6 border rounded-lg bg-ui-bg-base border-ui-border-base shadow-sm", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-ui-fg-subtle mb-1", children: "Total Revenue (Estimated)" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "text-3xl", children: formatCurrency(data.total_expected_revenue) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-6 border rounded-lg bg-ui-bg-base border-ui-border-base shadow-sm", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-ui-fg-subtle mb-1", children: "Completed Repairs" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "text-3xl", children: data.completed_count })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-6 border rounded-lg bg-ui-bg-base border-ui-border-base shadow-sm", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-ui-fg-subtle mb-1", children: "Avg Repair Time (Days)" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "text-3xl", children: data.avg_repair_time_days.toFixed(1) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-base border border-ui-border-base rounded-lg p-6 shadow-sm h-96", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "mb-6", children: "Repairs by Status" }),
        /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntime.jsxs(recharts.BarChart, { data: chartData, children: [
          /* @__PURE__ */ jsxRuntime.jsx(recharts.CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.XAxis, { dataKey: "name" }),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.YAxis, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Tooltip, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Legend, {}),
          /* @__PURE__ */ jsxRuntime.jsx(recharts.Bar, { dataKey: "count", fill: "#8884d8", name: "Tickets" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-base border border-ui-border-base rounded-lg p-6 shadow-sm h-96", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", className: "mb-6", children: "Revenue by Month (Parts vs Labor)" }),
        /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntime.jsxs(
          recharts.BarChart,
          {
            data: data.monthly_revenue,
            margin: { top: 20, right: 30, left: 20, bottom: 5 },
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(recharts.CartesianGrid, { strokeDasharray: "3 3" }),
              /* @__PURE__ */ jsxRuntime.jsx(recharts.XAxis, { dataKey: "month" }),
              /* @__PURE__ */ jsxRuntime.jsx(recharts.YAxis, {}),
              /* @__PURE__ */ jsxRuntime.jsx(recharts.Tooltip, { formatter: (value) => `$${Number(value).toFixed(2)}` }),
              /* @__PURE__ */ jsxRuntime.jsx(recharts.Legend, {}),
              /* @__PURE__ */ jsxRuntime.jsx(
                recharts.Bar,
                {
                  dataKey: "partsRevenue",
                  stackId: "a",
                  fill: "#82ca9d",
                  name: "Parts Revenue"
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                recharts.Bar,
                {
                  dataKey: "laborRevenue",
                  stackId: "a",
                  fill: "#ffc658",
                  name: "Labor Revenue"
                }
              )
            ]
          }
        ) })
      ] })
    ] })
  ] });
};
const config = adminSdk.defineRouteConfig({
  label: "Repair Reports",
  icon: icons.ChartBar
});
const i18nTranslations0 = {};
const widgetModule = { widgets: [
  {
    Component: RepairTicketWidget,
    zone: ["customer.details.before"],
    widgetId: "Widget-8fda"
  }
] };
const routeModule = {
  routes: [
    {
      Component: RepairsPage,
      path: "/repairs"
    },
    {
      Component: RepairDetailPage,
      path: "/repairs/:id"
    },
    {
      Component: ReportsPage,
      path: "/repairs/reports"
    }
  ]
};
const menuItemModule = {
  menuItems: [
    {
      label: config$1.label,
      icon: config$1.icon,
      path: "/repairs",
      nested: void 0,
      rank: void 0,
      translationNs: void 0
    },
    {
      label: config.label,
      icon: config.icon,
      path: "/repairs/reports",
      nested: void 0,
      rank: void 0,
      translationNs: void 0
    }
  ]
};
const formModule = { customFields: {} };
const displayModule = {
  displays: {}
};
const i18nModule = { resources: i18nTranslations0 };
const layoutModule = { layouts: [] };
const plugin = {
  widgetModule,
  routeModule,
  menuItemModule,
  formModule,
  displayModule,
  i18nModule,
  layoutModule
};
module.exports = plugin;
