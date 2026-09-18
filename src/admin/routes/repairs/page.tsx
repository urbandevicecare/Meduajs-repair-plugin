import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  Container,
  Heading,
  Table,
  Badge,
  Button,
  Input,
  Select,
  FocusModal,
  Label,
  Textarea,
  Text,
  Checkbox,
  Tabs,
  Switch,
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import { Wrench } from "@medusajs/icons";
import { useStoreCurrency } from "../../lib/use-store-currency";
import { useNavigate } from "react-router-dom";

type RepairTicket = {
  id: string;
  ticket_number: string;
  customer_id?: string;
  status: string;
  technician_name?: string;
  issue_description: string;
  total_estimate: number;
  created_at: string;
  estimated_completion?: string;
};

const RepairsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { formatCurrency } = useStoreCurrency();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications_enabled: true,
    sms_notifications_enabled: true,
    whatsapp_notifications_enabled: true,
    zoho_books_enabled: false,
    zoho_client_id: "",
    zoho_client_secret: "",
    zoho_refresh_token: "",
    zoho_organization_id: "",
    paystack_enabled: false,
    paystack_public_key: "",
    paystack_secret_key: "",
    company_name: "Repair Shop",
    storefront_url: "",
  });

  const loadSettings = () => {
    fetch("/admin/repairs/settings", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            ...data.settings,
            zoho_client_id: data.settings.zoho_client_id || "",
            zoho_client_secret: data.settings.zoho_client_secret || "",
            zoho_refresh_token: data.settings.zoho_refresh_token || "",
            zoho_organization_id: data.settings.zoho_organization_id || "",
            paystack_public_key: data.settings.paystack_public_key || "",
            paystack_secret_key: data.settings.paystack_secret_key || "",
            company_name: data.settings.company_name || "Repair Shop",
            storefront_url: data.settings.storefront_url || "",
          });
        }
      })
      .catch((err) => console.error(err));
  };

  const [isSaving, setIsSaving] = useState(false);

  const updateSettingState = (key: string, value: boolean | string) => {
    setSettings({ ...settings, [key]: value });
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await fetch("/admin/repairs/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      alert("Settings saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };
  const [newDevice, setNewDevice] = useState({
    serial_number: "",
    model_name: "",
    brand: "Apple",
    customer_id: "",
    imei: "",
    condition: "",
  });
  const [newTicket, setNewTicket] = useState({
    customer_id: "",
    issue_description: "",
    terms_accepted: false,
    data_wiped_consent: false,
  });

  const [accessoryInput, setAccessoryInput] = useState("");
  const [accessories, setAccessories] = useState<string[]>([]);

  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const loadCustomers = () => {
    setLoadingCustomers(true);
    fetch(`/admin/customers`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setLoadingCustomers(false);
      })
      .catch((err) => {
        console.error("Failed to load customers:", err);
        setLoadingCustomers(false);
      });
  };

  const loadTickets = () => {
    setLoading(true);
    fetch(`/admin/repairs`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setTickets(data.repair_tickets || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load repair tickets:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTickets();
    loadCustomers();
    loadSettings();
  }, []);

  const handleAccessoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const val = accessoryInput.trim().replace(",", "");
      if (val && !accessories.includes(val)) {
        setAccessories([...accessories, val]);
      }
      setAccessoryInput("");
    }
  };
  const removeAccessory = (acc: string) =>
    setAccessories(accessories.filter((a) => a !== acc));

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
            customer_id: newDevice.customer_id || undefined,
            imei: newDevice.imei || undefined,
            condition: newDevice.condition || undefined,
          },
          ticket: {
            customer_id: newTicket.customer_id || undefined,
            issue_description: newTicket.issue_description,
            accessories:
              accessories.length > 0 ? accessories.join(", ") : undefined,
            terms_accepted: newTicket.terms_accepted,
            data_wiped_consent: newTicket.data_wiped_consent,
          },
        }),
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
        condition: "",
      });
      setNewTicket({
        customer_id: "",
        issue_description: "",
        terms_accepted: false,
        data_wiped_consent: false,
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, "grey" | "blue" | "orange" | "green" | "red"> =
      {
        received: "grey",
        diagnosing: "blue",
        awaiting_approval: "orange",
        repairing: "blue",
        ready: "green",
        completed: "green",
        cancelled: "red",
      };
    return colors[status] || "grey";
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return "No Customer";
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return "Unknown";
    return customer.first_name || customer.last_name
      ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
      : customer.email || "Unknown";
  };

  const filteredTickets = tickets
    .map((ticket) => {
      // Handle BigNumber parsing
      const parseNum = (val: any) => {
        if (typeof val === "object" && val !== null && "value" in val)
          return Number(val.value);
        if (val !== undefined) return Number(val);
        return 0;
      };
      return {
        ...ticket,
        total_estimate: parseNum(ticket.total_estimate),
      };
    })
    .filter((ticket) => {
      const matchesSearch =
        ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.issue_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        ticket.technician_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  const [activeTab, setActiveTab] = useState("tickets");

  return (
    <Container className="p-0 overflow-hidden">
      <div className="flex border-b border-ui-border-base px-6 pt-2 space-x-6">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "tickets"
              ? "border-b-2 border-ui-fg-base text-ui-fg-base"
              : "text-ui-fg-subtle hover:text-ui-fg-base"
          }`}
        >
          Tickets
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "settings"
              ? "border-b-2 border-ui-fg-base text-ui-fg-base"
              : "text-ui-fg-subtle hover:text-ui-fg-base"
          }`}
        >
          Settings
        </button>
      </div>
      
      {activeTab === "tickets" && (
        <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Repair Tickets</Heading>
        <FocusModal open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <FocusModal.Trigger asChild>
            <Button variant="primary">Create Repair Ticket</Button>
          </FocusModal.Trigger>
          <FocusModal.Content>
            <FocusModal.Header>
              <Button
                variant="primary"
                onClick={handleCreateTicket}
                isLoading={isCreating}
              >
                Save Ticket
              </Button>
            </FocusModal.Header>
            <FocusModal.Body className="flex flex-col items-center py-16 overflow-y-auto">
              <div className="flex w-full max-w-lg flex-col gap-y-8">
                <div className="flex flex-col gap-y-2">
                  <Heading>Create Repair Ticket</Heading>
                  <p className="text-ui-fg-subtle text-sm">
                    Add a new device and repair ticket.
                  </p>
                </div>

                <div className="flex flex-col gap-y-4">
                  <Heading level="h2" className="text-lg">
                    Device Details
                  </Heading>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-y-2">
                      <Label htmlFor="brand">Brand *</Label>
                      <Input
                        id="brand"
                        value={newDevice.brand}
                        onChange={(e) =>
                          setNewDevice({ ...newDevice, brand: e.target.value })
                        }
                        placeholder="Apple"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label htmlFor="model_name">Model Name *</Label>
                      <Input
                        id="model_name"
                        value={newDevice.model_name}
                        onChange={(e) =>
                          setNewDevice({
                            ...newDevice,
                            model_name: e.target.value,
                          })
                        }
                        placeholder="iPhone 13 Pro"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label htmlFor="serial_number">Serial Number *</Label>
                      <Input
                        id="serial_number"
                        value={newDevice.serial_number}
                        onChange={(e) =>
                          setNewDevice({
                            ...newDevice,
                            serial_number: e.target.value,
                          })
                        }
                        placeholder="SN12345678"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label htmlFor="imei">IMEI</Label>
                      <Input
                        id="imei"
                        value={newDevice.imei}
                        onChange={(e) =>
                          setNewDevice({ ...newDevice, imei: e.target.value })
                        }
                        placeholder="Optional"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2 col-span-2">
                      <Label htmlFor="condition">Device Condition</Label>
                      <Textarea
                        id="condition"
                        value={newDevice.condition}
                        onChange={(e) =>
                          setNewDevice({
                            ...newDevice,
                            condition: e.target.value,
                          })
                        }
                        placeholder="Scratches on screen, etc."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-y-4">
                  <Heading level="h2" className="text-lg">
                    Ticket Details
                  </Heading>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-y-2">
                      <Label htmlFor="customer_id">Customer</Label>
                      <Select
                        value={newTicket.customer_id}
                        onValueChange={(val) => {
                          setNewTicket({ ...newTicket, customer_id: val });
                          setNewDevice({ ...newDevice, customer_id: val });
                        }}
                      >
                        <Select.Trigger>
                          <Select.Value
                            placeholder={
                              loadingCustomers
                                ? "Loading..."
                                : "Select a customer"
                            }
                          />
                        </Select.Trigger>
                        <Select.Content>
                          {customers.map((customer) => (
                            <Select.Item key={customer.id} value={customer.id}>
                              {customer.first_name || customer.last_name
                                ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
                                : "No Name"}{" "}
                              ({customer.email})
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label htmlFor="issue_description">
                        Issue Description *
                      </Label>
                      <Textarea
                        id="issue_description"
                        value={newTicket.issue_description}
                        onChange={(e) =>
                          setNewTicket({
                            ...newTicket,
                            issue_description: e.target.value,
                          })
                        }
                        placeholder="Screen is cracked and battery draining fast."
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label htmlFor="accessories">
                        Accessories Included (press comma to add)
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {accessories.map((acc) => (
                          <Badge
                            key={acc}
                            color="grey"
                            size="small"
                            className="flex items-center gap-1"
                          >
                            {acc}
                            <button
                              type="button"
                              onClick={() => removeAccessory(acc)}
                              className="text-ui-fg-muted hover:text-ui-fg-base"
                            >
                              &times;
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        id="accessories"
                        value={accessoryInput}
                        onChange={(e) => setAccessoryInput(e.target.value)}
                        onKeyDown={handleAccessoryKeyDown}
                        placeholder="Type and press comma..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-y-4">
                  <Heading level="h2" className="text-lg">
                    Legal & Compliance
                  </Heading>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-x-2">
                      <Checkbox
                        id="terms_accepted"
                        checked={newTicket.terms_accepted}
                        onCheckedChange={(c) =>
                          setNewTicket({
                            ...newTicket,
                            terms_accepted: c === true,
                          })
                        }
                      />
                      <Label htmlFor="terms_accepted">
                        Customer accepts Repair Terms & Conditions *
                      </Label>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <Checkbox
                        id="data_wiped_consent"
                        checked={newTicket.data_wiped_consent}
                        onCheckedChange={(c) =>
                          setNewTicket({
                            ...newTicket,
                            data_wiped_consent: c === true,
                          })
                        }
                      />
                      <Label htmlFor="data_wiped_consent">
                        Customer consents to device data wipe (if required)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </FocusModal.Body>
          </FocusModal.Content>
        </FocusModal>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <Select.Trigger>
              <Select.Value placeholder="Filter by status" />
            </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">All Statuses</Select.Item>
            <Select.Item value="received">Received</Select.Item>
            <Select.Item value="diagnosing">Diagnosing</Select.Item>
            <Select.Item value="awaiting_approval">
              Awaiting Approval
            </Select.Item>
            <Select.Item value="repairing">Repairing</Select.Item>
            <Select.Item value="ready">Ready</Select.Item>
            <Select.Item value="completed">Completed</Select.Item>
            <Select.Item value="cancelled">Cancelled</Select.Item>
          </Select.Content>
        </Select>
        </div>
        <Input
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">Loading repair tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12 text-ui-fg-subtle">
          <Wrench className="mx-auto mb-4" size={48} />
          <p>No repair tickets found</p>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Ticket #</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Technician</Table.HeaderCell>
              <Table.HeaderCell>Issue</Table.HeaderCell>
              <Table.HeaderCell>Estimate</Table.HeaderCell>
              <Table.HeaderCell>Created</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredTickets.map((ticket) => (
              <Table.Row 
                key={ticket.id} 
                onClick={() => navigate(`/repairs/${ticket.id}`)}
                className="cursor-pointer hover:bg-ui-bg-subtle-hover transition-colors"
              >
                <Table.Cell>
                  <Text className="font-medium">{ticket.ticket_number}</Text>
                  <Text className="text-ui-fg-subtle text-xs">
                    {getCustomerName(ticket.customer_id)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={getStatusColor(ticket.status)} size="small">
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {ticket.technician_name ? (
                    <Badge color="purple" size="small">
                      {ticket.technician_name}
                    </Badge>
                  ) : (
                    <span className="text-ui-fg-muted text-xs">Unassigned</span>
                  )}
                </Table.Cell>
                <Table.Cell className="max-w-xs truncate">
                  {ticket.issue_description}
                </Table.Cell>
                <Table.Cell>{formatCurrency(ticket.total_estimate)}</Table.Cell>
                <Table.Cell>
                  {new Date(ticket.created_at).toLocaleDateString()}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      </div>
      )}
      
      {activeTab === "settings" && (
        <div className="flex flex-col gap-6 w-full max-w-2xl p-6">
          <div>
            <Heading level="h2">General Settings</Heading>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <Text size="small" className="font-medium text-ui-fg-base">Company Name</Text>
                <Text size="small" className="text-ui-fg-subtle">Displayed in notifications and SMS messages.</Text>
                <Input 
                  placeholder="e.g. Urban Device Care Ltd" 
                  value={settings.company_name} 
                  onChange={(e) => updateSettingState("company_name", e.target.value)} 
                />
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <Text size="small" className="font-medium text-ui-fg-base">Storefront URL</Text>
                <Text size="small" className="text-ui-fg-subtle">Base URL for tracking links (e.g. http://localhost:8000).</Text>
                <Input 
                  placeholder="e.g. https://store.example.com" 
                  value={settings.storefront_url} 
                  onChange={(e) => updateSettingState("storefront_url", e.target.value)} 
                />
              </div>
            </div>
            <div className="border-b border-ui-border-base my-6" />
          </div>

          <div>
            <Heading level="h2">Notification Settings</Heading>
            <Text className="text-ui-fg-subtle">
              Configure which channels are enabled for automated repair notifications. (Note: Medusa must have a provider configured for these channels to actually send them).
            </Text>
            <div className="flex flex-col gap-y-6 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold">Email Notifications</Label>
                  <Text className="text-sm text-ui-fg-subtle">Send status updates and payment links to customers via Email.</Text>
                </div>
                <Switch checked={settings.email_notifications_enabled} onCheckedChange={(v) => updateSettingState("email_notifications_enabled", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold">SMS Notifications</Label>
                  <Text className="text-sm text-ui-fg-subtle">Send status updates and payment links to customers via SMS.</Text>
                </div>
                <Switch checked={settings.sms_notifications_enabled} onCheckedChange={(v) => updateSettingState("sms_notifications_enabled", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold">WhatsApp Notifications</Label>
                  <Text className="text-sm text-ui-fg-subtle">Send status updates and payment links to customers via WhatsApp.</Text>
                </div>
                <Switch checked={settings.whatsapp_notifications_enabled} onCheckedChange={(v) => updateSettingState("whatsapp_notifications_enabled", v)} />
              </div>
            </div>
          </div>

          <hr className="my-8" />
          
          <div className="flex flex-col gap-y-6 max-w-2xl">
            <Heading level="h2">Zoho Books Integration</Heading>
            <Text className="text-ui-fg-subtle">
              Configure Zoho Books to automatically sync Repair Tickets as Estimates and Invoices.
            </Text>
            
            <div className="flex flex-col gap-y-6 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold">Enable Zoho Books Sync</Label>
                  <Text className="text-sm text-ui-fg-subtle">Replaces local PDF generation with official Zoho Books documents.</Text>
                </div>
                <Switch checked={settings.zoho_books_enabled} onCheckedChange={(v) => updateSettingState("zoho_books_enabled", v)} />
              </div>

              {settings.zoho_books_enabled && (
                <div className="flex flex-col gap-y-4 p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
                  <div className="flex flex-col gap-y-2">
                    <Label>Organization ID</Label>
                    <Input 
                      placeholder="e.g. 12345678" 
                      value={settings.zoho_organization_id} 
                      onChange={(e) => updateSettingState("zoho_organization_id", e.target.value)} 
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <Label>Client ID</Label>
                    <Input 
                      placeholder="1000.XXXXXXXXXXXXXXXXXXXXXXXX" 
                      value={settings.zoho_client_id} 
                      onChange={(e) => updateSettingState("zoho_client_id", e.target.value)} 
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <Label>Client Secret</Label>
                    <Input 
                      placeholder="Enter Client Secret" 
                      type="password"
                      value={settings.zoho_client_secret} 
                      onChange={(e) => updateSettingState("zoho_client_secret", e.target.value)} 
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <Label>Refresh Token</Label>
                    <Input 
                      placeholder="1000.XXXXXXXXXXXXXXXXXXXXXXXX" 
                      type="password"
                      value={settings.zoho_refresh_token} 
                      onChange={(e) => updateSettingState("zoho_refresh_token", e.target.value)} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="my-8" />
          
          <div className="flex flex-col gap-y-6 max-w-2xl">
            <Heading level="h2">Paystack Integration</Heading>
            <Text className="text-ui-fg-subtle">
              Configure Paystack to generate payment links for repairs.
            </Text>
            
            <div className="flex flex-col gap-y-6 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold">Enable Paystack Checkout</Label>
                  <Text className="text-sm text-ui-fg-subtle">Generate Paystack checkout links on approved tickets.</Text>
                </div>
                <Switch checked={settings.paystack_enabled} onCheckedChange={(v) => updateSettingState("paystack_enabled", v)} />
              </div>

              {settings.paystack_enabled && (
                <div className="flex flex-col gap-y-4 p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
                  <div className="flex flex-col gap-y-2">
                    <Label>Public Key</Label>
                    <Input 
                      placeholder="pk_test_..." 
                      value={settings.paystack_public_key} 
                      onChange={(e) => updateSettingState("paystack_public_key", e.target.value)} 
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <Label>Secret Key</Label>
                    <Input 
                      placeholder="sk_test_..." 
                      type="password"
                      value={settings.paystack_secret_key} 
                      onChange={(e) => updateSettingState("paystack_secret_key", e.target.value)} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={saveSettings} isLoading={isSaving}>
              Save Settings
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Repair",
  icon: Wrench,
});

export default RepairsPage;
