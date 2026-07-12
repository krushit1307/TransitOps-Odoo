
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { useAuth, useData } from "@/lib/store";
import { can } from "@/lib/rbac";
import { AlertCircle, Check, Download } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";

const isExpired = (iso: string) => new Date(iso) < new Date();

export default function TripsPage() {
  const user = useAuth((s) => s.user);
  const access = can(user?.role, "trips");
  const readOnly = access === "view";
  const noAccess = access === "none";

  const { vehicles, drivers, trips, createTrip, dispatchTrip, completeTrip, cancelTrip } = useData();

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "Available"),
    [vehicles]
  );
  const availableDrivers = useMemo(
    () => drivers.filter((d) => d.status === "Available" && !isExpired(d.licenseExpiry)),
    [drivers]
  );

  const [form, setForm] = useState({
    source: "Gandhinagar Depot",
    destination: "",
    vehicleId: "",
    driverId: "",
    cargoWeightKg: 0,
    plannedDistanceKm: 0,
  });

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [completingTripId, setCompletingTripId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const v = vehicles.find((x) => x.id === t.vehicleId);
      const d = drivers.find((x) => x.id === t.driverId);
      const matchSearch = 
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.source.toLowerCase().includes(search.toLowerCase()) ||
        t.destination.toLowerCase().includes(search.toLowerCase()) ||
        (v?.regNo.toLowerCase() || "").includes(search.toLowerCase()) ||
        (d?.name.toLowerCase() || "").includes(search.toLowerCase());
      return (statusF === "All" || t.status === statusF) && matchSearch;
    });
  }, [trips, vehicles, drivers, search, statusF]);

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
  const overCap =
    selectedVehicle && form.cargoWeightKg > selectedVehicle.maxCapacityKg
      ? form.cargoWeightKg - selectedVehicle.maxCapacityKg
      : 0;

  const canDispatch =
    !readOnly && form.destination && form.vehicleId && form.driverId && form.cargoWeightKg > 0 && !overCap;

  if (noAccess) return <div className="text-slate">Your role has no access to Trips.</div>;

  const handleExportCSV = () => {
    downloadCSV(
      trips,
      [
        { key: "id", label: "Trip ID" },
        { key: "status", label: "Status" },
        { key: "source", label: "Source" },
        { key: "destination", label: "Destination" },
        {
          key: "vehicleId",
          label: "Vehicle Registration",
          transform: (v) => {
            const veh = vehicles.find((x) => x.id === v);
            return veh ? veh.regNo : "Unassigned";
          },
        },
        {
          key: "driverId",
          label: "Driver Name",
          transform: (d) => {
            const drv = drivers.find((x) => x.id === d);
            return drv ? drv.name : "Unassigned";
          },
        },
        { key: "cargoWeightKg", label: "Cargo Weight (kg)" },
        { key: "plannedDistanceKm", label: "Planned Distance (km)" },
        { key: "finalOdometerKm", label: "Final Odometer (km)" },
        { key: "fuelConsumedL", label: "Fuel Consumed (L)" },
        { key: "etaMinutes", label: "ETA (min)" },
        { key: "note", label: "Note / Reason" },
      ],
      "trips_list"
    );
  };

  return (
    <div>
      <PageHeader
        title="Trip Dispatcher"
        subtitle="Assign a vehicle and driver to a new run — capacity and compliance enforced."
        actions={
          <button onClick={handleExportCSV}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-line text-sm hover:bg-secondary/50 transition">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      {/* Lifecycle stepper */}
      <div className="bg-surface border border-line rounded-xl p-5 mb-6 shadow-[var(--shadow-e1)]">
        <div className="flex items-center justify-between mb-5">
          <div className="label-caps">Trip Lifecycle</div>
          <div className="text-xs text-slate font-medium">
            {selectedTripId ? `Showing actual state for ${selectedTripId}` : "Select a trip from Live Board"}
          </div>
        </div>
        <div className="relative flex items-center justify-between max-w-3xl mx-auto px-2">
          <div className="absolute left-6 right-6 top-4 h-[2px] dashed-route" />
          {(() => {
            const t = trips.find(x => x.id === selectedTripId);
            const isCancelled = t?.status === "Cancelled";
            const currentIdx = t ? ["Draft", "Dispatched", "Completed", "Cancelled"].indexOf(t.status) : -1;
            return [
              { key: "Draft", label: "Draft", active: t?.status === "Draft", done: t && currentIdx > 0 && !isCancelled, terminal: false },
              { key: "Dispatched", label: "Dispatched", active: t?.status === "Dispatched", done: t?.status === "Completed", terminal: false },
              { key: "Completed", label: "Completed", active: t?.status === "Completed", done: t?.status === "Completed", terminal: false },
              { key: "Cancelled", label: "Cancelled", active: isCancelled, done: false, terminal: true },
            ].map((s) => (
              <div key={s.key} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full border-2 grid place-items-center bg-surface font-mono text-xs transition-colors ${
                    s.active && !s.terminal
                      ? "border-primary bg-primary text-primary-foreground pulse-ring"
                      : s.active && s.terminal
                      ? "border-danger bg-danger text-danger-foreground pulse-ring"
                      : s.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : s.terminal
                      ? "border-line text-slate"
                      : "border-line text-slate"
                  }`}
                >
                  {(s.active && !s.terminal) || s.done ? <Check className="h-4 w-4" /> : s.terminal ? "×" : ""}
                </div>
                <span className={`text-xs font-medium ${s.active || s.done ? "text-ink" : "text-slate"}`}>{s.label}</span>
              </div>
            ));
          })()}
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
                  className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" placeholder="e.g. Ahmedabad Hub" />
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
                onClick={async () => {
                  if (overCap) {
                    toast.error(`Dispatch blocked — capacity exceeded by ${overCap} kg`);
                    return;
                  }
                  const res = await createTrip({
                    source: form.source, destination: form.destination,
                    vehicleId: form.vehicleId, driverId: form.driverId,
                    cargoWeightKg: form.cargoWeightKg, plannedDistanceKm: form.plannedDistanceKm,
                    etaMinutes: Math.max(20, Math.round(form.plannedDistanceKm * 1.4)),
                    status: "Dispatched",
                  });
                  if (res.ok) {
                    toast.success(`Trip dispatched to ${form.destination}`);
                    setForm({ source: "Gandhinagar Depot", destination: "", vehicleId: "", driverId: "", cargoWeightKg: 0, plannedDistanceKm: 0 });
                  } else toast.error(res.error);
                }}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 shadow-[var(--shadow-e1)] hover:brightness-105"
              >
                {overCap ? "Dispatch (Blocked)" : "Dispatch"}
              </button>
              <button
                onClick={async () => {
                  const res = await createTrip({
                    source: form.source || "—", destination: form.destination || "—",
                    vehicleId: form.vehicleId || null, driverId: form.driverId || null,
                    cargoWeightKg: form.cargoWeightKg, plannedDistanceKm: form.plannedDistanceKm,
                    status: "Draft",
                  });
                  if (res.ok) {
                    toast.success(`Draft saved`);
                    setForm({ source: "Gandhinagar Depot", destination: "", vehicleId: "", driverId: "", cargoWeightKg: 0, plannedDistanceKm: 0 });
                  } else toast.error(res.error);
                }}
                className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-secondary"
              >
                Save Draft
              </button>
              <button onClick={() => setForm({ source: "Gandhinagar Depot", destination: "", vehicleId: "", driverId: "", cargoWeightKg: 0, plannedDistanceKm: 0 })} className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-secondary">Clear</button>
            </div>
          </div>
        </div>

        {/* Right: Live Board */}
        <div className="lg:col-span-3 bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Live Board</h3>
            <span className="text-xs text-slate">{filteredTrips.length} trips</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
              className="h-8 rounded-md border border-line bg-canvas px-2 text-xs">
              {["All", "Draft", "Dispatched", "Completed", "Cancelled"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search trips, reg, or drivers..."
              className="h-8 rounded-md border border-line bg-canvas px-3 text-xs flex-1 min-w-0" />
          </div>
          <div className="space-y-2.5">
            {filteredTrips.map((t) => {
              const v = vehicles.find((x) => x.id === t.vehicleId);
              const d = drivers.find((x) => x.id === t.driverId);
              return (
                <div key={t.id} onClick={() => setSelectedTripId(t.id)} className={`border rounded-md p-3 flex items-center gap-4 cursor-pointer transition-colors ${selectedTripId === t.id ? 'bg-secondary/50 border-primary/40 shadow-sm' : 'border-line hover:bg-secondary/30'}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{t.id}</span>
                      <StatusPill status={t.status} />
                    </div>
                    <div className="text-sm mt-1 truncate">
                      <span className="text-slate">{t.source || "—"}</span>
                      <span className="mx-2 text-primary">→</span>
                      <span>{t.destination || "—"}</span>
                    </div>
                    <div className="text-xs text-slate mt-0.5 font-mono">
                      {v?.regNo ?? "Unassigned"} · {d?.name ?? "Unassigned"} · {t.cargoWeightKg} kg
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {t.status === "Draft" && !readOnly && (
                      <div className="mt-2 flex justify-end gap-1">
                        <button onClick={async (e) => { 
                            e.stopPropagation(); 
                            const reason = window.prompt("Reason for cancellation?");
                            if (!reason) return;
                            const res = await cancelTrip(t.id, reason); 
                            if (res.ok) toast(`Trip ${t.id} cancelled`); else toast.error(res.error);
                          }}
                          className="text-[11px] px-2 py-1.5 rounded-md border border-danger/40 text-danger hover:bg-danger/10">
                          Cancel
                        </button>
                        <button onClick={async (e) => {
                          e.stopPropagation();
                          const res = await dispatchTrip(t.id);
                          if (!res.ok) {
                            toast.error(res.error);
                          } else {
                            toast.success(`Trip ${t.id} dispatched`);
                          }
                        }} className="text-[11px] px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:brightness-105 shadow-[var(--shadow-e1)]">
                          Dispatch
                        </button>
                      </div>
                    )}
                    {t.status === "Dispatched" && (
                      <>
                        <div className="text-xs text-slate">{t.etaMinutes ? `${t.etaMinutes} min` : "In transit"}</div>
                        {!readOnly && (
                          <div className="mt-2 flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); setCompletingTripId(t.id); }}
                              className="text-[11px] px-2 py-1 rounded-md border border-success/40 text-success hover:bg-success/10">Complete</button>
                            <button onClick={async (e) => { 
                                e.stopPropagation(); 
                                const reason = window.prompt("Reason for cancellation?");
                                if (!reason) return;
                                const res = await cancelTrip(t.id, reason); 
                                if (res.ok) toast(`Trip ${t.id} cancelled`); else toast.error(res.error);
                              }}
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
            {filteredTrips.length === 0 && (
              <div className="text-center text-slate text-sm py-6">No trips found.</div>
            )}
          </div>
          <div className="mt-4 text-xs text-slate">
            On Complete: odometer → fuel log → expenses → Vehicle &amp; Driver Available
          </div>
        </div>
      </div>
      {completingTripId && (
        <CompleteTripModal
          tripId={completingTripId}
          trips={trips}
          vehicles={vehicles}
          drivers={drivers}
          onClose={() => setCompletingTripId(null)}
          onComplete={async (finalOdo: number, fuelL: number, fuelCost: number) => {
            const t = trips.find((x) => x.id === completingTripId);
            const v = vehicles.find((x) => x.id === t?.vehicleId);
            const d = drivers.find((x) => x.id === t?.driverId);
            const res = await completeTrip(completingTripId, finalOdo, fuelL, fuelCost);
            if (res.ok) {
              toast.success(`Trip ${completingTripId} completed. ${v?.regNo} and ${d?.name} are now Available.`);
              setCompletingTripId(null);
            } else toast.error(res.error);
          }}
        />
      )}
    </div>
  );
}

function CompleteTripModal({ tripId, trips, vehicles, drivers, onClose, onComplete }: any) {
  const trip = trips.find((t: any) => t.id === tripId);
  const vehicle = vehicles.find((v: any) => v.id === trip?.vehicleId);
  const startOdo = vehicle?.odometerKm ?? 0;
  
  const [finalOdo, setFinalOdo] = useState<number | "">("");
  const [fuelL, setFuelL] = useState<number | "">("");
  const [fuelCost, setFuelCost] = useState<number | "">("");
  
  const error = (finalOdo !== "" && +finalOdo <= startOdo) ? `Odometer must be strictly greater than ${startOdo}` : "";
  const isValid = finalOdo !== "" && fuelL !== "" && fuelCost !== "" && !error && +finalOdo > startOdo && +fuelL >= 0 && +fuelCost >= 0;

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-surface rounded-xl shadow-[var(--shadow-e1)] w-full max-w-sm p-5 border border-line" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-semibold mb-4 text-lg">Complete Trip {tripId}</h3>
        <div className="space-y-4">
          <div>
            <label className="label-caps block mb-1">Final Odometer (km) (Start: {startOdo})</label>
            <input type="number" value={finalOdo} onChange={(e) => setFinalOdo(e.target.value === "" ? "" : +e.target.value)}
              className={`w-full h-9 rounded-md border bg-canvas px-3 text-sm ${error ? 'border-danger focus:outline-danger' : 'border-line'}`} />
            {error && <div className="text-danger text-[11px] mt-1 font-medium">{error}</div>}
          </div>
          <div>
            <label className="label-caps block mb-1">Fuel Consumed (liters)</label>
            <input type="number" value={fuelL} onChange={(e) => setFuelL(e.target.value === "" ? "" : +e.target.value)}
              className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" />
          </div>
          <div>
            <label className="label-caps block mb-1">Fuel Cost (₹)</label>
            <input type="number" value={fuelCost} onChange={(e) => setFuelCost(e.target.value === "" ? "" : +e.target.value)}
              className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-secondary">Cancel</button>
          <button
            disabled={!isValid}
            onClick={() => isValid && onComplete(+finalOdo, +fuelL, +fuelCost)}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 shadow-[var(--shadow-e1)] hover:brightness-105"
          >
            Submit
          </button>
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
