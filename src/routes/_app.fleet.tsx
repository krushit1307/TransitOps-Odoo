
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { useAuth, useData } from "@/lib/store";
import { can } from "@/lib/rbac";
import { Plus, AlertTriangle, X, Download } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { downloadCSV } from "@/lib/csv";

export default function FleetPage() {
  const user = useAuth((s) => s.user);
  const access = can(user?.role, "fleet");
  const readOnly = access === "view";
  const { vehicles, addVehicle } = useData();
  const [typeF, setTypeF] = useState("All");
  const [statusF, setStatusF] = useState("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (typeF === "All" || v.type === typeF) &&
          (statusF === "All" || v.status === statusF) &&
          v.regNo.toLowerCase().includes(search.toLowerCase())
      ),
    [vehicles, typeF, statusF, search]
  );

  const handleExportCSV = () => {
    downloadCSV(
      rows,
      [
        { key: "regNo", label: "Registration No." },
        { key: "nameModel", label: "Name / Model" },
        { key: "type", label: "Type" },
        { key: "maxCapacityKg", label: "Capacity (kg)" },
        { key: "odometerKm", label: "Odometer (km)" },
        { key: "acquisitionCost", label: "Acquisition Cost (INR)" },
        { key: "status", label: "Status" },
      ],
      "fleet_registry"
    );
  };

  return (
    <div>
      <PageHeader
        title="Vehicle Registry"
        subtitle="Every vehicle in the depot, with capacity, cost and current status."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-line text-sm hover:bg-secondary/50 transition">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            {!readOnly && (
              <button onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition">
                <Plus className="h-4 w-4" /> Add Vehicle
              </button>
            )}
          </div>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={typeF} onChange={(e) => setTypeF(e.target.value)}
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm">
          {["All", "Van", "Truck", "Mini"].map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm">
          {["All", "Available", "OnTrip", "InShop", "Retired"].map((o) => <option key={o}>{o}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reg. no."
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm min-w-64" />
      </div>

      <div className="bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 sticky top-0">
            <tr className="text-left label-caps">
              <th className="px-4 py-2.5">Reg. No.</th>
              <th className="px-4 py-2.5">Name / Model</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5 text-right">Capacity</th>
              <th className="px-4 py-2.5 text-right">Odometer</th>
              <th className="px-4 py-2.5 text-right">Acq. Cost</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id} className="border-t border-line hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono text-xs">{v.regNo}</td>
                <td className="px-4 py-3">{v.nameModel}</td>
                <td className="px-4 py-3 text-slate">{v.type}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{v.maxCapacityKg} kg</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{v.odometerKm.toLocaleString()} km</td>
                <td className="px-4 py-3 text-right font-mono text-xs">₹{v.acquisitionCost.toLocaleString()}</td>
                <td className="px-4 py-3"><StatusPill status={v.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate text-sm">No vehicles match those filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-[oklch(0.5_0.16_50)]">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <span><span className="font-semibold">Rule:</span> Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher.</span>
      </div>

      {open && <AddVehicleModal onClose={() => setOpen(false)} onSubmit={addVehicle} />}
    </div>
  );
}

function AddVehicleModal({
  onClose, onSubmit,
}: { onClose: () => void; onSubmit: (v: Omit<Vehicle, "id">) => { ok: boolean; error?: string } }) {
  const [form, setForm] = useState<Omit<Vehicle, "id">>({
    regNo: "", nameModel: "", type: "Van", maxCapacityKg: 500, odometerKm: 0, acquisitionCost: 0, status: "Available",
  });
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-lg border border-line w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-display font-semibold">Add Vehicle</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-slate" /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const r = onSubmit(form);
            if (r.ok) onClose(); else setErr(r.error ?? "Failed to add");
          }}
          className="p-5 space-y-3"
        >
          {err && <div className="text-sm text-danger">{err}</div>}
          {[
            { k: "regNo", label: "Reg. No.", type: "text" },
            { k: "nameModel", label: "Name / Model", type: "text" },
          ].map((f) => (
            <div key={f.k}>
              <label className="label-caps block mb-1">{f.label}</label>
              <input
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm"
                value={String(form[f.k as keyof typeof form])}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-caps block mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm">
                {["Van", "Truck", "Mini"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label-caps block mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Vehicle["status"] })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm">
                {["Available", "InShop", "Retired"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label-caps block mb-1">Max Capacity (kg)</label>
              <input type="number" value={form.maxCapacityKg} onChange={(e) => setForm({ ...form, maxCapacityKg: +e.target.value })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" />
            </div>
            <div>
              <label className="label-caps block mb-1">Odometer (km)</label>
              <input type="number" value={form.odometerKm} onChange={(e) => setForm({ ...form, odometerKm: +e.target.value })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="label-caps block mb-1">Acquisition Cost (₹)</label>
              <input type="number" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: +e.target.value })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border border-line text-sm">Cancel</button>
            <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Save Vehicle</button>
          </div>
        </form>
      </div>
    </div>
  );
}
