
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { useData } from "@/lib/store";
import { rbacMatrix, roleLabel } from "@/lib/rbac";
import type { Role } from "@/lib/types";
import { Check, Eye, Minus } from "lucide-react";



export default function SettingsPage() {
  const { settings, updateSettings } = useData();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const roles: Role[] = ["FleetManager", "Dispatcher", "SafetyOfficer", "FinancialAnalyst"];
  const modules = [
    { key: "fleet", label: "Fleet" },
    { key: "drivers", label: "Drivers" },
    { key: "trips", label: "Trips" },
    { key: "expenses", label: "Fuel / Exp" },
    { key: "analytics", label: "Analytics" },
  ] as const;

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
              className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Save changes</button>
            {saved && <span className="ml-3 text-xs text-success">✓ Saved</span>}
          </div>
        </div>

        <div className="bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] p-5">
          <h3 className="font-display font-semibold mb-1">Role-Based Access (RBAC)</h3>
          <p className="text-xs text-slate mb-4">Cells reflect the access level each role has to each module.</p>
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
                    const acc = rbacMatrix[r][m.key];
                    return (
                      <td key={m.key} className="py-3 text-center">
                        {acc === "full" && <Check className="h-4 w-4 text-success inline" />}
                        {acc === "view" && <span className="text-xs text-info font-medium">view</span>}
                        {acc === "none" && <Minus className="h-4 w-4 text-slate inline" />}
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
      </div>
    </div>
  );
}
