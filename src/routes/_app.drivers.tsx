
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { useAuth, useData } from "@/lib/store";
import { can } from "@/lib/rbac";


import { AlertTriangle, Plus, X, Download } from "lucide-react";
import { toast } from "sonner";

import type { Driver, DriverStatus } from "@/lib/types";
import { downloadCSV } from "@/lib/csv";

const isExpired = (iso: string) => new Date(iso) < new Date();
const isExpiringSoon = (iso: string) => {
  const diff = new Date(iso).getTime() - new Date().getTime();
  return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
};

const getSafetyBadge = (score: number) => {
  const tone = score >= 90 ? "success" : score >= 70 ? "warning" : "danger";
  const sBg = tone === "success" ? "bg-[rgb(16_185_129_/_0.14)] text-[#047857]" : tone === "warning" ? "bg-[rgb(245_158_11_/_0.16)] text-[#B45309]" : "bg-[rgb(239_68_68_/_0.14)] text-[#B91C1C]";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sBg}`}>{score}%</span>;
};

export default function DriversPage() {
  const user = useAuth((s) => s.user);
  const readOnly = can(user?.role, "drivers") === "view";
  const noAccess = can(user?.role, "drivers") === "none";
  const { drivers, addDriver, updateDriverStatus } = useData();
  const [selectedId, setSelected] = useState<string | null>(drivers[0]?.id ?? null);
  const [open, setOpen] = useState(false);

  if (noAccess) return <div className="text-slate">Your role has no access to Drivers.</div>;

  const handleExportCSV = () => {
    downloadCSV(
      drivers,
      [
        { key: "name", label: "Name" },
        { key: "licenseNo", label: "License No." },
        { key: "category", label: "Category" },
        { key: "licenseExpiry", label: "License Expiry" },
        { key: "contact", label: "Contact" },
        { key: "tripCompletionPct", label: "Trip Completion %" },
        { key: "safetyScore", label: "Safety Score" },
        { key: "status", label: "Status" },
      ],
      "drivers_list"
    );
  };

  return (
    <div>
      <PageHeader
        title="Drivers & Safety Profiles"
        subtitle="License compliance, safety scores, and duty status."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-line text-sm hover:bg-secondary/50 transition">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            {!readOnly && (
              <button onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition">
                <Plus className="h-4 w-4" /> Add Driver
              </button>
            )}
          </div>
        }
      />

      <div className="bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr className="text-left label-caps">
              <th className="px-4 py-2.5">Driver</th>
              <th className="px-4 py-2.5">License No.</th>
              <th className="px-4 py-2.5">Cat.</th>
              <th className="px-4 py-2.5">Expiry</th>
              <th className="px-4 py-2.5">Contact</th>
              <th className="px-4 py-2.5 text-right">Trip Compl.</th>
              <th className="px-4 py-2.5">Safety</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const expired = isExpired(d.licenseExpiry);
              const expiringSoon = isExpiringSoon(d.licenseExpiry);
              return (
                <tr key={d.id} onClick={() => setSelected(d.id)}
                  className={`border-t border-line cursor-pointer hover:bg-secondary/30 ${selectedId === d.id ? "bg-primary/5" : ""}`}>
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{d.licenseNo}</td>
                  <td className="px-4 py-3 text-slate">{d.category}</td>
                  <td className={`px-4 py-3 font-mono text-xs ${expired ? "text-danger font-semibold" : expiringSoon ? "text-amber-600 font-semibold" : ""}`}>
                    {d.licenseExpiry}
                    {expired && <span className="ml-2 rounded bg-danger/10 text-danger px-1.5 py-0.5 text-[10px]">EXPIRED</span>}
                    {expiringSoon && <span className="ml-2 cursor-help" title="Expiring within 30 days">⚠️</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{d.contact.slice(0, 5)}xxxxx</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{d.tripCompletionPct}%</td>
                  <td className="px-4 py-3">{getSafetyBadge(d.safetyScore)}</td>
                  <td className="px-4 py-3"><StatusPill status={d.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!readOnly && selectedId && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="label-caps">Toggle status for {drivers.find((x) => x.id === selectedId)?.name}:</span>
          {(["Available", "OnTrip", "OffDuty", "Suspended"] as DriverStatus[]).map((s) => (
            <button key={s} onClick={() => {
              const driver = drivers.find((x) => x.id === selectedId);
              if (driver?.status === "OnTrip" && (s === "OffDuty" || s === "Suspended")) {
                toast.error("Cannot change status of a driver currently on a trip");
                return;
              }
              updateDriverStatus(selectedId, s);
            }} className="text-xs">
              <StatusPill status={s} className="cursor-pointer hover:opacity-80" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-[oklch(0.5_0.16_50)]">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <span><span className="font-semibold">Rule:</span> Expired license or Suspended status → blocked from trip assignment.</span>
      </div>

      {open && <AddDriverModal onClose={() => setOpen(false)} onSubmit={addDriver} />}
    </div>
  );
}

function AddDriverModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (d: Omit<Driver, "id">) => void }) {
  const [form, setForm] = useState<Omit<Driver, "id">>({
    name: "", licenseNo: "", category: "LMV", licenseExpiry: "2027-12-31",
    contact: "9876543210", tripCompletionPct: 0, safetyScore: 90, status: "Available",
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-lg border border-line w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-display font-semibold">Add Driver</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-slate" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); onClose(); }} className="p-5 space-y-3">
          <div>
            <label className="label-caps block mb-1">Name</label>
            <input className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-caps block mb-1">License No.</label>
              <input className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm font-mono"
                value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} />
            </div>
            <div>
              <label className="label-caps block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as "LMV" | "HMV" })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm">
                <option>LMV</option><option>HMV</option>
              </select>
            </div>
            <div>
              <label className="label-caps block mb-1">Expiry</label>
              <input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" />
            </div>
            <div>
              <label className="label-caps block mb-1">Contact</label>
              <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm font-mono" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border border-line text-sm">Cancel</button>
            <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Save Driver</button>
          </div>
        </form>
      </div>
    </div>
  );
}
