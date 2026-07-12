
import { PageHeader } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { StatusPill } from "@/components/status-pill";
import { useData } from "@/lib/store";
import { Truck, CheckCircle2, Wrench, Route as RouteIcon, Clock, Users, Gauge } from "lucide-react";
import { useState } from "react";



export default function Dashboard() {
  const { vehicles, drivers, trips } = useData();
  const [typeF, setTypeF] = useState("All");
  const [statusF, setStatusF] = useState("All");

  const filteredV = vehicles.filter(
    (v) => (typeF === "All" || v.type === typeF) && (statusF === "All" || v.status === statusF)
  );

  const active = filteredV.filter((v) => v.status !== "Retired").length;
  const available = filteredV.filter((v) => v.status === "Available").length;
  const inShop = filteredV.filter((v) => v.status === "InShop").length;
  const onTrip = filteredV.filter((v) => v.status === "OnTrip").length;
  const retired = filteredV.filter((v) => v.status === "Retired").length;
  const activeTrips = trips.filter((t) => t.status === "Dispatched").length;
  const pendingTrips = trips.filter((t) => t.status === "Draft").length;
  const onDuty = drivers.filter((d) => d.status === "OnTrip").length;
  const util = active ? Math.round((onTrip / active) * 100) : 0;

  const recent = trips.slice(0, 6);
  const total = active + retired || 1;

  const bar = (label: string, count: number, color: string) => (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate">{label}</span>
        <span className="font-mono">{count}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${(count / total) * 100}%`, background: color }} />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Operations Dashboard" subtitle="Live view of your depot at a glance." />

      <div className="flex gap-3 mb-6">
        {[
          { label: "Vehicle Type", value: typeF, set: setTypeF, opts: ["All", "Van", "Truck", "Mini"] },
          { label: "Status", value: statusF, set: setStatusF, opts: ["All", "Available", "OnTrip", "InShop", "Retired"] },
          { label: "Region", value: "All", set: () => {}, opts: ["All", "North", "South"] },
        ].map((f) => (
          <select key={f.label} value={f.value} onChange={(e) => f.set(e.target.value)}
            className="h-9 rounded-md border border-line bg-surface px-3 text-sm">
            {f.opts.map((o) => <option key={o} value={o}>{f.label}: {o}</option>)}
          </select>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        <KpiCard label="Active Vehicles" value={active} tone="blue" icon={<Truck className="h-4 w-4" />} />
        <KpiCard label="Available" value={available} tone="green" icon={<CheckCircle2 className="h-4 w-4" />} />
        <KpiCard label="In Maintenance" value={inShop} tone="amber" icon={<Wrench className="h-4 w-4" />} />
        <KpiCard label="Active Trips" value={activeTrips} tone="amber" icon={<RouteIcon className="h-4 w-4" />} />
        <KpiCard label="Pending Trips" value={pendingTrips} tone="slate" icon={<Clock className="h-4 w-4" />} />
        <KpiCard label="Drivers on Duty" value={onDuty} tone="green" icon={<Users className="h-4 w-4" />} />
        <KpiCard label="Fleet Utilization" value={`${util}%`} tone="green" icon={<Gauge className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)]">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <h3 className="font-display font-semibold">Recent Trips</h3>
            <span className="text-xs text-slate">Last 6</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left label-caps">
                <th className="px-5 py-2.5">Trip</th>
                <th className="px-5 py-2.5">Vehicle</th>
                <th className="px-5 py-2.5">Driver</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5 text-right">ETA</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => {
                const v = vehicles.find((x) => x.id === t.vehicleId);
                const d = drivers.find((x) => x.id === t.driverId);
                return (
                  <tr key={t.id} className="border-t border-line hover:bg-secondary/30">
                    <td className="px-5 py-3 font-mono text-xs">{t.id}</td>
                    <td className="px-5 py-3 font-mono text-xs">{v?.regNo ?? "—"}</td>
                    <td className="px-5 py-3">{d?.name ?? "—"}</td>
                    <td className="px-5 py-3"><StatusPill status={t.status} /></td>
                    <td className="px-5 py-3 text-right font-mono text-xs">
                      {t.etaMinutes ? `${t.etaMinutes} min` : t.status === "Completed" ? "—" : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] p-5">
          <h3 className="font-display font-semibold">Vehicle Status</h3>
          <p className="text-xs text-slate mb-4">Distribution across the fleet</p>
          <div className="space-y-3">
            {bar("Available", available, "oklch(0.62 0.13 158)")}
            {bar("On Trip", onTrip, "oklch(0.55 0.2 260)")}
            {bar("In Shop", inShop, "oklch(0.68 0.16 50)")}
            {bar("Retired", retired, "oklch(0.58 0.22 27)")}
          </div>
        </div>
      </div>
    </div>
  );
}
