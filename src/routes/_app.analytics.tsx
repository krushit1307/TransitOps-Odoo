
import { PageHeader } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { useAuth, useData } from "@/lib/store";
import { can } from "@/lib/rbac";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Download } from "lucide-react";



export default function AnalyticsPage() {
  const user = useAuth((s) => s.user);
  const noAccess = can(user?.role, "analytics") === "none";
  const { vehicles, trips, fuel, maintenance } = useData();

  if (noAccess) return <div className="text-slate">Your role has no access to Analytics.</div>;

  const totalFuel = fuel.reduce((a, b) => a + b.cost, 0);
  const totalFuelL = fuel.reduce((a, b) => a + b.liters, 0);
  const totalMaint = maintenance.reduce((a, b) => a + b.cost, 0);
  const totalDist = trips.filter((t) => t.status === "Completed").reduce((a, b) => a + b.plannedDistanceKm, 0);
  const kmPerL = totalFuelL ? (totalDist / totalFuelL).toFixed(1) : "0";
  const active = vehicles.filter((v) => v.status !== "Retired").length;
  const onTrip = vehicles.filter((v) => v.status === "OnTrip").length;
  const util = active ? Math.round((onTrip / active) * 100) : 0;
  const opCost = totalFuel + totalMaint;
  const acq = vehicles.reduce((a, b) => a + b.acquisitionCost, 0);
  const revenue = trips.filter((t) => t.status === "Completed").length * 12500;
  const roi = acq ? (((revenue - opCost) / acq) * 100).toFixed(1) : "0";

  const monthly = [
    { m: "Feb", revenue: 180000 },
    { m: "Mar", revenue: 215000 },
    { m: "Apr", revenue: 202000 },
    { m: "May", revenue: 248000 },
    { m: "Jun", revenue: 271000 },
    { m: "Jul", revenue: 289000 },
  ];

  // costliest vehicles
  const perVehicle = vehicles.map((v) => {
    const f = fuel.filter((x) => x.vehicleId === v.id).reduce((a, b) => a + b.cost, 0);
    const m = maintenance.filter((x) => x.vehicleId === v.id).reduce((a, b) => a + b.cost, 0);
    return { regNo: v.regNo, cost: f + m };
  }).sort((a, b) => b.cost - a.cost).slice(0, 6);

  const max = Math.max(...perVehicle.map((p) => p.cost), 1);
  const colors = ["oklch(0.58 0.22 27)", "oklch(0.63 0.2 40)", "oklch(0.68 0.16 50)", "oklch(0.66 0.14 70)", "oklch(0.6 0.15 200)", "oklch(0.55 0.2 260)"];

  const exportCSV = () => {
    const rows = [
      ["Trip", "Source", "Destination", "Vehicle", "Driver", "Cargo(kg)", "Distance(km)", "Status"],
      ...trips.map((t) => [
        t.id, t.source, t.destination,
        vehicles.find((v) => v.id === t.vehicleId)?.regNo ?? "",
        t.driverId ?? "", String(t.cargoWeightKg), String(t.plannedDistanceKm), t.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transitops-trips-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Efficiency, utilization, cost and ROI across the fleet."
        actions={
          <button onClick={exportCSV}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
        <KpiCard label="Fuel Efficiency" value={`${kmPerL} km/l`} tone="green" />
        <KpiCard label="Fleet Utilization" value={`${util}%`} tone="blue" />
        <KpiCard label="Operational Cost" value={`₹${opCost.toLocaleString()}`} tone="amber" />
        <KpiCard label="Vehicle ROI" value={`${roi}%`} tone="green" />
      </div>
      <p className="text-xs text-slate font-mono mb-6">ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] p-5">
          <h3 className="font-display font-semibold mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.918 0.006 260)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.5 0.02 260)" fontSize={11} />
                <YAxis stroke="oklch(0.5 0.02 260)" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.918 0.006 260)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="oklch(0.68 0.16 50)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] p-5">
          <h3 className="font-display font-semibold mb-4">Top Costliest Vehicles</h3>
          <div className="space-y-2.5">
            {perVehicle.map((p, i) => (
              <div key={p.regNo}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono">{p.regNo}</span>
                  <span className="font-mono">₹{p.cost.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(p.cost / max) * 100}%`, background: colors[i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
