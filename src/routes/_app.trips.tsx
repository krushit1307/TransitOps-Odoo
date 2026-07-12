
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { useAuth, useData } from "@/lib/store";
import { can } from "@/lib/rbac";
import { AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";



const isExpired = (iso: string) => new Date(iso) < new Date();

export default function TripsPage() {
  const user = useAuth((s) => s.user);
  const access = can(user?.role, "trips");
  const readOnly = access === "view";
  const noAccess = access === "none";

  const { vehicles, drivers, trips, createTrip, completeTrip, cancelTrip } = useData();

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "Available"),
    [vehicles]
  );
  const availableDrivers = useMemo(
    () => drivers.filter((d) => d.status === "Available" && !isExpired(d.licenseExpiry)),
    [drivers]
  );

  const [form, setForm] = useState({
    source: "Delhi Depot",
    destination: "",
    vehicleId: "",
    driverId: "",
    cargoWeightKg: 0,
    plannedDistanceKm: 0,
  });

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
  const overCap =
    selectedVehicle && form.cargoWeightKg > selectedVehicle.maxCapacityKg
      ? form.cargoWeightKg - selectedVehicle.maxCapacityKg
      : 0;

  const canDispatch =
    !readOnly && form.destination && form.vehicleId && form.driverId && form.cargoWeightKg > 0 && !overCap;


  if (noAccess) return <div className="text-slate">Your role has no access to Trips.</div>;

  return (
    <div>
      <PageHeader title="Trip Dispatcher" subtitle="Assign a vehicle and driver to a new run — capacity and compliance enforced." />

      {/* Lifecycle stepper */}
      <div className="bg-surface border border-line rounded-xl p-5 mb-6 shadow-[var(--shadow-e1)]">
        <div className="label-caps mb-5">Trip Lifecycle</div>
        <div className="relative flex items-center justify-between max-w-3xl mx-auto px-2">
          <div className="absolute left-6 right-6 top-4 h-[2px] dashed-route" />
          {[
            { key: "Draft", label: "Draft", active: false, done: false },
            { key: "Dispatched", label: "Dispatched", active: true, done: false },
            { key: "Completed", label: "Completed", active: false, done: false },
            { key: "Cancelled", label: "Cancelled", active: false, done: false, terminal: true },
          ].map((s) => (
            <div key={s.key} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full border-2 grid place-items-center bg-surface font-mono text-xs ${
                  s.active
                    ? "border-primary bg-primary text-primary-foreground pulse-ring"
                    : s.terminal
                    ? "border-line text-slate"
                    : "border-line text-slate"
                }`}
              >
                {s.active ? <Check className="h-4 w-4" /> : s.terminal ? "×" : ""}
              </div>
              <span className={`text-xs font-medium ${s.active ? "text-ink" : "text-slate"}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Form */}
        <div className="lg:col-span-2 bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] p-5">
          <h3 className="font-display font-semibold mb-4">Create Trip</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Source">
                <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" />
              </Field>
              <Field label="Destination">
                <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" placeholder="e.g. Gurugram Hub" />
              </Field>
            </div>
            <Field label="Vehicle (available only)">
              <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm">
                <option value="">Select vehicle…</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.regNo} — {v.nameModel} · {v.maxCapacityKg} kg</option>
                ))}
              </select>
            </Field>
            <Field label="Driver (available only)">
              <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm">
                <option value="">Select driver…</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.category}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cargo Weight (kg)">
                <input type="number" value={form.cargoWeightKg}
                  onChange={(e) => setForm({ ...form, cargoWeightKg: +e.target.value })}
                  className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm font-mono" />
              </Field>
              <Field label="Planned Distance (km)">
                <input type="number" value={form.plannedDistanceKm}
                  onChange={(e) => setForm({ ...form, plannedDistanceKm: +e.target.value })}
                  className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm font-mono" />
              </Field>
            </div>

            {selectedVehicle && form.cargoWeightKg > 0 && (
              <div className={`rounded-md border px-3 py-2 text-xs ${
                overCap
                  ? "border-danger/40 bg-danger/5 text-danger"
                  : "border-success/40 bg-success/5 text-success"
              }`}>
                <div className="font-mono flex justify-between">
                  <span>Vehicle Capacity: {selectedVehicle.maxCapacityKg} kg</span>
                  <span>Cargo: {form.cargoWeightKg} kg</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  {overCap ? (
                    <><AlertCircle className="h-3.5 w-3.5" /> ✗ Capacity exceeded by {overCap} kg → dispatch blocked</>
                  ) : (
                    <><Check className="h-3.5 w-3.5" /> ✓ Within capacity</>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                disabled={!canDispatch}
                onClick={() => {
                  if (overCap) {
                    toast.error(`Dispatch blocked — capacity exceeded by ${overCap} kg`);
                    return;
                  }
                  createTrip({
                    source: form.source, destination: form.destination,
                    vehicleId: form.vehicleId, driverId: form.driverId,
                    cargoWeightKg: form.cargoWeightKg, plannedDistanceKm: form.plannedDistanceKm,
                    etaMinutes: Math.max(20, Math.round(form.plannedDistanceKm * 1.4)),
                  });
                  toast.success(`Trip dispatched to ${form.destination}`);
                  setForm({ source: "Delhi Depot", destination: "", vehicleId: "", driverId: "", cargoWeightKg: 0, plannedDistanceKm: 0 });
                }}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 shadow-[var(--shadow-e1)] hover:brightness-105"
              >
                {overCap ? "Dispatch (Blocked)" : "Dispatch"}
              </button>
              <button className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-secondary">Clear</button>
            </div>
          </div>
        </div>

        {/* Right: Live Board */}
        <div className="lg:col-span-3 bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Live Board</h3>
            <span className="text-xs text-slate">{trips.length} trips</span>
          </div>
          <div className="space-y-2.5">
            {trips.map((t) => {
              const v = vehicles.find((x) => x.id === t.vehicleId);
              const d = drivers.find((x) => x.id === t.driverId);
              return (
                <div key={t.id} className="border border-line rounded-md p-3 flex items-center gap-4 hover:bg-secondary/30">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{t.id}</span>
                      <StatusPill status={t.status} />
                    </div>
                    <div className="text-sm mt-1 truncate">
                      <span className="text-slate">{t.source}</span>
                      <span className="mx-2 text-primary">→</span>
                      <span>{t.destination}</span>
                    </div>
                    <div className="text-xs text-slate mt-0.5 font-mono">
                      {v?.regNo ?? "Unassigned"} · {d?.name ?? "No driver"} · {t.cargoWeightKg} kg
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {t.status === "Dispatched" && (
                      <>
                        <div className="text-xs text-slate">{t.etaMinutes ? `${t.etaMinutes} min` : "In transit"}</div>
                        {!readOnly && (
                          <div className="mt-2 flex gap-1">
                            <button onClick={() => { completeTrip(t.id, (v?.odometerKm ?? 0) + t.plannedDistanceKm, Math.round(t.plannedDistanceKm / 8)); toast.success(`Trip ${t.id} completed`); }}
                              className="text-[11px] px-2 py-1 rounded-md border border-success/40 text-success hover:bg-success/10">Complete</button>
                            <button onClick={() => { cancelTrip(t.id); toast(`Trip ${t.id} cancelled`); }}
                              className="text-[11px] px-2 py-1 rounded-md border border-danger/40 text-danger hover:bg-danger/10">Cancel</button>
                          </div>
                        )}
                      </>
                    )}
                    {t.status === "Cancelled" && t.note && <div className="text-xs text-danger">{t.note}</div>}
                    {t.status === "Completed" && <div className="text-xs text-success">Odo: {t.finalOdometerKm}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-slate">
            On Complete: odometer → fuel log → expenses → Vehicle &amp; Driver Available
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-caps block mb-1">{label}</label>
      {children}
    </div>
  );
}
