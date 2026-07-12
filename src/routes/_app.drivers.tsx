
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { useAuth, useData } from "@/lib/store";
import { can } from "@/lib/rbac";


import { AlertTriangle, Plus, X, Download } from "lucide-react";
import { toast } from "sonner";

import type { Driver, DriverStatus } from "@/lib/types";
import { downloadCSV } from "@/lib/csv";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const isExpired = (iso: string) => new Date(iso) < new Date();
const isExpiringSoon = (iso: string) => {
  const expiry = new Date(iso);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 30;
};

const getSafetyBadge = (score: number) => {
  if (score >= 90) return <span className="rounded bg-success/10 text-success px-2 py-0.5 text-xs font-semibold">Excellent</span>;
  if (score >= 80) return <span className="rounded bg-info/10 text-info px-2 py-0.5 text-xs font-semibold">Good</span>;
  if (score >= 70) return <span className="rounded bg-amber-500/10 text-amber-600 px-2 py-0.5 text-xs font-semibold">Fair</span>;
  return <span className="rounded bg-danger/10 text-danger px-2 py-0.5 text-xs font-semibold">Poor</span>;
};

export default function DriversPage() {
  const user = useAuth((s) => s.user);
  const readOnly = can(user?.role, "drivers") === "view";
  const noAccess = can(user?.role, "drivers") === "none";
  const { drivers, addDriver, updateDriverStatus } = useData();
  const [selectedId, setSelected] = useState<string | null>(drivers[0]?.id ?? null);
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");

  const rows = useMemo(() => {
    return drivers.filter(d => 
      (statusF === "All" || d.status === statusF) &&
      (d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNo.toLowerCase().includes(search.toLowerCase()))
    );
  }, [drivers, search, statusF]);

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

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm">
          {["All", "Available", "OnTrip", "OffDuty", "Suspended"].map((o) => <option key={o}>{o}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search driver name or license..."
          className="h-9 rounded-md border border-line bg-surface px-3 text-sm min-w-64" />
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,1),inset_0px_-1px_4px_0px_rgba(0,0,0,0.05)] dark:shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,0.1),inset_0px_-1px_2px_0px_rgba(0,0,0,0.02)]">
              <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">Driver</TableHead>
              <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">License No.</TableHead>
              <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">Cat.</TableHead>
              <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">Expiry</TableHead>
              <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">Contact</TableHead>
              <TableHead className="label-caps px-4 py-2.5 text-right font-semibold">Trip Compl.</TableHead>
              <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">Safety</TableHead>
              <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => {
              const expired = isExpired(d.licenseExpiry);
              const expiringSoon = isExpiringSoon(d.licenseExpiry);
              return (
                <TableRow key={d.id} onClick={() => setSelected(d.id)}
                  className={`cursor-pointer hover:bg-secondary/30 border-t border-line ${selectedId === d.id ? "bg-primary/5" : ""}`}>
                  <TableCell className="px-4 py-3 font-medium">{d.name}</TableCell>
                  <TableCell className="px-4 py-3 font-mono text-xs">{d.licenseNo}</TableCell>
                  <TableCell className="px-4 py-3 text-slate">{d.category}</TableCell>
                  <TableCell className={`px-4 py-3 font-mono text-xs ${expired ? "text-danger font-semibold" : expiringSoon ? "text-amber-600 font-semibold" : ""}`}>
                    {d.licenseExpiry}
                    {expired && <span className="ml-2 rounded bg-danger/10 text-danger px-1.5 py-0.5 text-[10px]">EXPIRED</span>}
                    {expiringSoon && <span className="ml-2 cursor-help" title="Expiring within 30 days">⚠️</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono text-xs">{d.contact.slice(0, 5)}xxxxx</TableCell>
                  <TableCell className="px-4 py-3 text-right font-mono text-xs">{d.tripCompletionPct}%</TableCell>
                  <TableCell className="px-4 py-3">{getSafetyBadge(d.safetyScore)}</TableCell>
                  <TableCell className="px-4 py-3"><StatusPill status={d.status} /></TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="px-4 py-8 text-center text-slate text-sm">No drivers match those filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
