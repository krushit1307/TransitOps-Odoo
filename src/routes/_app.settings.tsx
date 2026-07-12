
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { useAuth, useData } from "@/lib/store";
import { roleLabel } from "@/lib/rbac";
import type { Role } from "@/lib/types";
import { Check, Eye, Minus } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, rbacMatrix, updateRBAC } = useData();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const user = useAuth((s) => s.user);

  const roles: Role[] = ["FleetManager", "Dispatcher", "SafetyOfficer", "FinancialAnalyst"];
  const modules = [
    { key: "fleet", label: "Fleet" },
    { key: "drivers", label: "Drivers" },
    { key: "trips", label: "Trips" },
    { key: "expenses", label: "Fuel / Exp" },
    { key: "analytics", label: "Analytics" },
  ] as const;

  const isFleetManager = user?.role === "FleetManager";

  const cycleAccess = (role: Role, mod: string) => {
    const current = rbacMatrix[role]?.[mod] || "none";
    let next: "full" | "view" | "none" = "none";
    if (current === "none") next = "full";
    else if (current === "full") next = "view";
    else if (current === "view") next = "none";
    updateRBAC(role, mod, next);
  };

  return (
    <div>
      <PageHeader title="Settings & RBAC" subtitle="Depot configuration and role-based access." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] p-5">
          <h3 className="font-display font-semibold mb-4">General</h3>
          <div className="space-y-3">
            <div>
              <label className="label-caps block mb-1">Depot Name</label>
              <input value={form.depotName} onChange={(e) => setForm({ ...form, depotName: e.target.value })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-caps block mb-1">Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm">
                  <option>INR (Rs)</option><option>USD ($)</option><option>EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="label-caps block mb-1">Distance Unit</label>
                <select value={form.distanceUnit} onChange={(e) => setForm({ ...form, distanceUnit: e.target.value })}
                  className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm">
                  <option>Kilometers</option><option>Miles</option>
                </select>
              </div>
            </div>
            <button onClick={() => { updateSettings(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition">Save changes</button>
            {saved && <span className="ml-3 text-xs text-success">✓ Saved</span>}
          </div>
        </div>

        {isFleetManager ? (
          <div className="bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] p-5">
            <h3 className="font-display font-semibold mb-1">Role-Based Access (RBAC)</h3>
            <p className="text-xs text-slate mb-4">Cells reflect the access level each role has to each module. Click a cell to toggle access level.</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="label-caps text-left">
                  <th className="pb-2">Role</th>
                  {modules.map((m) => <th key={m.key} className="pb-2 text-center">{m.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r} className="border-t border-line">
                    <td className="py-3 font-medium">{roleLabel[r]}</td>
                    {modules.map((m) => {
                      const acc = rbacMatrix[r]?.[m.key] || "none";
                      return (
                        <td key={m.key} className="py-2 text-center">
                          <button
                            onClick={() => cycleAccess(r, m.key)}
                            className="h-8 w-16 mx-auto rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-1 focus:ring-primary/30 flex items-center justify-center transition-all cursor-pointer"
                            title={`Click to toggle ${roleLabel[r]} access for ${m.label}`}
                          >
                            {acc === "full" && <Check className="h-4 w-4 text-success" />}
                            {acc === "view" && <span className="text-xs text-info font-medium">view</span>}
                            {acc === "none" && <Minus className="h-4 w-4 text-slate/50" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate">
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-success" /> Full</span>
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-info" /> View</span>
              <span className="flex items-center gap-1"><Minus className="h-3.5 w-3.5" /> None</span>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] p-5">
            <h3 className="font-display font-semibold mb-1">My Profile &amp; Permissions</h3>
            <p className="text-xs text-slate mb-4">Your account details and active permissions.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-lg border border-line">
                <div>
                  <div className="text-[10px] text-slate label-caps">Name</div>
                  <div className="text-sm font-medium">{user?.name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate label-caps">Email</div>
                  <div className="text-sm font-medium">{user?.email}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] text-slate label-caps">Assigned Role</div>
                  <div className="inline-flex mt-1 rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5">
                    {user ? roleLabel[user.role] : ""}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold label-caps text-slate mb-2">My Module Access</h4>
                <div className="space-y-2">
                  {modules.map((m) => {
                    const acc = user ? rbacMatrix[user.role][m.key] : "none";
                    return (
                      <div key={m.key} className="flex items-center justify-between py-2 border-b border-line/60 last:border-0 text-sm">
                        <span className="font-medium text-slate-700">{m.label}</span>
                        <div className="flex items-center gap-1.5">
                          {acc === "full" && (
                            <span className="inline-flex items-center gap-1 text-xs text-success font-semibold bg-success/10 px-2 py-0.5 rounded">
                              <Check className="h-3 w-3" /> Full Access
                            </span>
                          )}
                          {acc === "view" && (
                            <span className="inline-flex items-center gap-1 text-xs text-info font-semibold bg-info/10 px-2 py-0.5 rounded">
                              <Eye className="h-3 w-3" /> View Only
                            </span>
                          )}
                          {acc === "none" && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate font-medium bg-secondary px-2 py-0.5 rounded">
                              <Minus className="h-3 w-3" /> No Access
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
