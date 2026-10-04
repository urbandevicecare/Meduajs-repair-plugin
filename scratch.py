with open("src/admin/routes/repairs/reports/page.tsx", "r") as f:
    code = f.read()

early_return = """  if (loading && !data) {
    return (
      <Container className="p-8 h-screen flex items-center justify-center">
        <Text className="text-ui-fg-subtle animate-pulse">Loading analytics...</Text>
      </Container>
    );
  }"""

calculations = """  const chartData = data ? Object.keys(data.status_counts).map((key) => ({
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
  }, [rawTickets]);"""

# Remove both blocks and then add them back in the right order
code = code.replace(early_return, "").replace(calculations, "")

# Find where to put them back
insert_marker = "  return ("
code = code.replace(insert_marker, f"{calculations}\n\n{early_return}\n\n{insert_marker}")

with open("src/admin/routes/repairs/reports/page.tsx", "w") as f:
    f.write(code)
