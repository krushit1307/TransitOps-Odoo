import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { useAuth, useData } from "@/lib/store";
import { can } from "@/lib/rbac";
import { AlertTriangle, ArrowRight, Download } from "lucide-react";
import { downloadCSV } from "@/lib/csv";
import { toast } from "sonner";

export default function MaintenancePage() {
  const user = useAuth((s) => s.user);
  const readOnly = can(user?.role, "fleet") === "view";
  const noAccess = can(user?.role, "fleet") === "none";

  const { vehicles, maintenance, addMaintenance, closeMaintenance } = useData();
  const [form, setForm] = useState({
    vehicleId: vehicles[0]?.id ?? "",
    serviceType: "Oil Change",
    cost: 0,
    date: new Date().toISOString().slice(0, 10),
    status: "InShop" as "InShop" | "Completed",
  });

  if (noAccess) return <div className="text-slate">Your role has no access to Maintenance.</div>;

  const handleExportCSV = () => {
    downloadCSV(
      maintenance,
      [
        { key: "id", label: "Record ID" },
        {
          key: "vehicleId",
          label: "Vehicle Registration",
          transform: (vId: string) => {
            const v = vehicles.find((x) => x.id === vId);
            return v ? v.regNo : "Unknown";
          },
        },
        { key: "serviceType", label: "Service Type" },
        { key: "cost", label: "Cost (INR)" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status" },
      ],
      "maintenance_logs"
    );
  };

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Log service records; vehicles automatically move in and out of the dispatch pool."
        actions={
          <button onClick={handleExportCSV}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-line text-sm hover:bg-secondary/50 transition">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Form */}
        <div className="lg:col-span-2 bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] p-5">
          <h3 className="font-display font-semibold mb-4">Log Service Record</h3>
          <div className="space-y-3">
            <div>
              <label className="label-caps block mb-1">Vehicle</label>
              <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm">
                {vehicles.filter((v) => v.status !== "Retired").map((v) => (
                  <option key={v.id} value={v.id}>{v.regNo} — {v.nameModel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-caps block mb-1">Service Type</label>
              <input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-caps block mb-1">Cost (₹)</label>
                <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: +e.target.value })}
                  className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm font-mono" />
              </div>
              <div>
                <label className="label-caps block mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" />
              </div>
            </div>
            <div>
              <label className="label-caps block mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "InShop" | "Completed" })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm">
                <option value="InShop">In Shop</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <button disabled={readOnly} onClick={() => {
              const res = addMaintenance(form);
              if (res.ok) {
                setForm({ ...form, cost: 0 });
                toast.success("Maintenance record added");
              } else {
                toast.error(res.error);
              }
            }}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40">
              Save Record
            </button>
          </div>

          <div className="mt-6 bg-secondary/40 rounded-md p-4">
            <div className="label-caps mb-3">Status Transition</div>
            <div className="flex items-center gap-2 text-xs">
              <StatusPill status="Available" />
              <ArrowRight className="h-3.5 w-3.5 text-slate" />
              <StatusPill status="InShop" />
              <ArrowRight className="h-3.5 w-3.5 text-slate" />
              <StatusPill status="Available" />
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs text-[oklch(0.5_0.16_50)]">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5" />
              <span>In Shop vehicles are removed from the dispatch pool.</span>
            </div>
          </div>
        </div>

        {/* Log table */}
        <div className="lg:col-span-3 bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <h3 className="font-display font-semibold">Service Log</h3>
            <span className="text-xs text-slate">{maintenance.length} records</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left label-caps">
                <th className="px-4 py-2.5">Vehicle</th>
                <th className="px-4 py-2.5">Service</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5 text-right">Cost</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map((m) => {
                const v = vehicles.find((x) => x.id === m.vehicleId);
                return (
                  <tr key={m.id} className="border-t border-line hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs">{v?.regNo}</td>
                    <td className="px-4 py-3">{m.serviceType}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate">{m.date}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">₹{m.cost.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusPill status={m.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {!readOnly && m.status === "InShop" && (
                        <button onClick={() => closeMaintenance(m.id)}
                          className="text-[11px] px-2 py-1 rounded border border-success/40 text-success hover:bg-success/10">
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
