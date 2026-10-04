import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Text, Select } from "@medusajs/ui";
import { ChartBar, ArrowDownTray } from "@medusajs/icons";
import { useEffect, useState, useMemo } from "react";
import { useStoreCurrency } from "../../../lib/use-store-currency";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const ReportsPage = () => {
  const [data, setData] = useState<any>(null);
  const [rawTickets, setRawTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("all");
  const { formatCurrency, currencyCode } = useStoreCurrency();

  useEffect(() => {
    setLoading(true);
    fetch(`/admin/repairs/analytics?timeframe=${timeframe}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((resData) => {
        setData(resData.analytics);
        setRawTickets(resData.raw_tickets || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load analytics:", err);
        setLoading(false);
      });
  }, [timeframe]);

  const handleExportCSV = (allTime: boolean = false) => {
    let url = `/admin/repairs/analytics?timeframe=all`;
    if (!allTime) {
      url = `/admin/repairs/analytics?timeframe=${timeframe}`;
    }

    fetch(url, { credentials: "include" })
      .then((res) => res.json())
      .then((resData) => {
        const tickets = resData.raw_tickets || [];
        if (!tickets.length) {
          alert("No data to export");
          return;
        }

        const headers = ["Ticket Number", "Status", "Created At", "Customer Name", "Technician", "Parts Estimate", "Labor Estimate", "Total Estimate"];
        const rows = tickets.map((t: any) => [
          t.ticket_number,
          t.status,
          new Date(t.created_at).toLocaleDateString(),
          t.customer_id || "N/A", // This might need mapping if customer names are fetched differently
          t.technician_name || "Unassigned",
          t.parts_estimate?.value || t.parts_estimate || 0,
          t.labor_estimate?.value || t.labor_estimate || 0,
          t.total_estimate?.value || t.total_estimate || 0,
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((r: any) => r.map((cell: any) => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const urlObj = URL.createObjectURL(blob);
        link.setAttribute("href", urlObj);
        link.setAttribute("download", `repair_export_${allTime ? 'all' : timeframe}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };





  const chartData = data ? Object.keys(data.status_counts).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
    count: data.status_counts[key],
  })) : [];

  const technicianDistribution = useMemo(() => {
    if (!rawTickets || rawTickets.length === 0) return [];
    
    const countMap: Record<string, number> = {};
    rawTickets.forEach((t: any) => {
      const techName = t.technician_name || "Unassigned";
      countMap[techName] = (countMap[techName] || 0) + 1;
    });

    return Object.entries(countMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  }, [rawTickets]);

  if (loading && !data) {
    return (
      <Container className="p-8 h-screen flex items-center justify-center">
        <Text className="text-ui-fg-subtle animate-pulse">Loading analytics...</Text>
      </Container>
    );
  }

  return (
    <Container className="p-8 bg-transparent border-none shadow-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <Heading level="h1" className="text-2xl font-semibold text-ui-fg-base mb-1">Performance Overview</Heading>
          <Text className="text-ui-fg-subtle text-sm">Monitor your repair operations and revenue trends.</Text>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={setTimeframe} size="small">
            <Select.Trigger className="w-32">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Time</Select.Item>
              <Select.Item value="year">Past Year</Select.Item>
              <Select.Item value="month">Past 30 Days</Select.Item>
              <Select.Item value="week">Past 7 Days</Select.Item>
              <Select.Item value="day">Today</Select.Item>
            </Select.Content>
          </Select>
          
          <button 
            onClick={() => handleExportCSV(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-ui-bg-base border border-ui-border-base rounded-md hover:bg-ui-bg-subtle transition-colors text-ui-fg-base shadow-sm"
          >
            <ArrowDownTray className="w-3 h-3" />
            Export Filtered
          </button>
          
          <button 
            onClick={() => handleExportCSV(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors"
          >
            Export All Data
          </button>
        </div>
      </div>

      {loading && data && (
        <div className="w-full h-1 bg-ui-bg-base mb-4 overflow-hidden rounded-full">
           <div className="h-full bg-ui-bg-interactive animate-pulse w-1/3"></div>
        </div>
      )}

      {data && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="flex flex-col p-4 bg-ui-bg-base rounded-xl border border-ui-border-base shadow-sm">
              <Text className="text-[11px] font-semibold text-ui-fg-subtle uppercase tracking-wider mb-2">Total Volume</Text>
              <Heading level="h2" className="text-2xl font-medium">{data.total_repairs}</Heading>
              <Text className="text-[10px] text-ui-fg-muted mt-2">Tickets in period</Text>
            </div>
            
            <div className="flex flex-col p-4 bg-ui-bg-base rounded-xl border border-ui-border-base shadow-sm relative overflow-hidden">
              <Text className="text-[11px] font-semibold text-ui-fg-subtle uppercase tracking-wider mb-2">Est. Revenue</Text>
              <Heading level="h2" className="text-2xl font-medium text-ui-fg-interactive">{formatCurrency(data.total_expected_revenue)}</Heading>
              <Text className="text-[10px] text-ui-fg-muted mt-2">Pipeline value</Text>
            </div>

            <div className="flex flex-col p-4 bg-ui-bg-base rounded-xl border border-ui-border-base shadow-sm">
              <Text className="text-[11px] font-semibold text-ui-fg-subtle uppercase tracking-wider mb-2">Completed</Text>
              <Heading level="h2" className="text-2xl font-medium text-green-600">{data.completed_count}</Heading>
              <Text className="text-[10px] text-ui-fg-muted mt-2">Successfully finished</Text>
            </div>

            <div className="flex flex-col p-4 bg-ui-bg-base rounded-xl border border-ui-border-base shadow-sm">
              <Text className="text-[11px] font-semibold text-ui-fg-subtle uppercase tracking-wider mb-2">Turnaround</Text>
              <Heading level="h2" className="text-2xl font-medium">{data.avg_repair_time_days > 0 ? data.avg_repair_time_days.toFixed(1) : '-'}</Heading>
              <Text className="text-[10px] text-ui-fg-muted mt-2">Average days to complete</Text>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Trend Chart */}
            <div className="lg:col-span-2 bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <Text className="text-sm font-medium text-ui-fg-base">Revenue Trend (Parts vs Labor)</Text>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthly_revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorParts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLabor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#6b7280'}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#6b7280'}}
                      tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short", style: "currency", currency: currencyCode }).format(val)}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                      itemStyle={{ fontSize: '12px' }}
                      formatter={(value: any) => [formatCurrency(Number(value)), '']}
                    />
                    <Area type="monotone" dataKey="partsRevenue" name="Parts" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorParts)" stackId="1" />
                    <Area type="monotone" dataKey="laborRevenue" name="Labor" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLabor)" stackId="1" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm">
              <Text className="text-sm font-medium text-ui-fg-base mb-6">Status Distribution</Text>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#374151'}} width={90} />
                    <Tooltip 
                      cursor={{fill: '#f3f4f6'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm mb-8">
            <Text className="text-sm font-medium text-ui-fg-base mb-6">Technician Performance (Repairs Assigned)</Text>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={technicianDistribution} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#374151'}} width={90} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Repair Reports",
  icon: ChartBar,
});

export default ReportsPage;
