
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { useAuth, useData } from "@/lib/store";
import { can } from "@/lib/rbac";
import { Plus, X, Download, FileText } from "lucide-react";
import { downloadCSV } from "@/lib/csv";
import { downloadPDF } from "@/lib/pdf";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ExpensesPage() {
  const user = useAuth((s) => s.user);
  const readOnly = can(user?.role, "expenses") === "view";
  const noAccess = can(user?.role, "expenses") === "none";

  const { vehicles, fuel, expenses, maintenance, addFuel, addExpense } = useData();
  const [fuelOpen, setFuelOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);

  if (noAccess) return <div className="text-slate">Your role has no access to Expenses.</div>;

  const fuelTotal = fuel.reduce((a, b) => a + b.cost, 0);
  const maintTotal = maintenance.reduce((a, b) => a + b.cost, 0);
  const opTotal = fuelTotal + maintTotal;

  const handleExportFuelCSV = () => {
    downloadCSV(
      fuel,
      [
        { key: "id", label: "Fuel Log ID" },
        {
          key: "vehicleId",
          label: "Vehicle Registration",
          transform: (vId) => {
            const v = vehicles.find((x) => x.id === vId);
            return v ? v.regNo : "Unknown";
          },
        },
        { key: "date", label: "Date" },
        { key: "liters", label: "Liters" },
        { key: "cost", label: "Cost (INR)" },
      ],
      "fuel_logs"
    );
  };

  const handleExportExpensesCSV = () => {
    downloadCSV(
      expenses,
      [
        { key: "id", label: "Expense ID" },
        { key: "tripId", label: "Trip ID" },
        {
          key: "vehicleId",
          label: "Vehicle Registration",
          transform: (vId) => {
            const v = vehicles.find((x) => x.id === vId);
            return v ? v.regNo : "Unknown";
          },
        },
        { key: "toll", label: "Toll (INR)" },
        { key: "other", label: "Other Expense (INR)" },
        { key: "maintenanceLinkedCost", label: "Maintenance Cost (INR)" },
        { key: "total", label: "Total (INR)" },
        { key: "status", label: "Status" },
      ],
      "other_expenses"
    );
  };

  const handleExportFuelPDF = () => {
    downloadPDF(
      fuel,
      [
        { key: "id", label: "Fuel Log ID" },
        {
          key: "vehicleId",
          label: "Vehicle",
          transform: (vId) => vehicles.find((x) => x.id === vId)?.regNo || "Unknown",
        },
        { key: "date", label: "Date" },
        { key: "liters", label: "Liters", transform: (v) => `${v} L` },
        { key: "cost", label: "Cost (INR)", transform: (v) => `Rs ${v}` },
      ],
      "fuel_logs"
    );
  };

  const handleExportExpensesPDF = () => {
    downloadPDF(
      expenses,
      [
        { key: "id", label: "Expense ID" },
        { key: "tripId", label: "Trip ID" },
        {
          key: "vehicleId",
          label: "Vehicle",
          transform: (vId) => vehicles.find((x) => x.id === vId)?.regNo || "Unknown",
        },
        { key: "toll", label: "Toll", transform: (v) => `Rs ${v}` },
        { key: "other", label: "Other", transform: (v) => `Rs ${v}` },
        { key: "maintenanceLinkedCost", label: "Maint.", transform: (v) => `Rs ${v}` },
        { key: "total", label: "Total", transform: (v) => `Rs ${v}` },
        { key: "status", label: "Status" },
      ],
      "other_expenses"
    );
  };

  return (
    <div>
      <PageHeader
        title="Fuel &amp; Expense Management"
        subtitle="Fuel consumption, tolls, and linked maintenance costs — rolled up automatically."
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleExportFuelCSV} title="CSV: Fuel"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-line text-sm hover:bg-secondary/50 transition">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button onClick={handleExportFuelPDF} title="PDF: Fuel"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-line text-sm text-primary hover:bg-primary/5 transition">
              <FileText className="h-4 w-4" /> PDF
            </button>
            <div className="h-5 w-px bg-line mx-1" />
            <button onClick={handleExportExpensesCSV} title="CSV: Expenses"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-line text-sm hover:bg-secondary/50 transition">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button onClick={handleExportExpensesPDF} title="PDF: Expenses"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-line text-sm text-primary hover:bg-primary/5 transition">
              <FileText className="h-4 w-4" /> PDF
            </button>
            {!readOnly && (
              <>
                <button onClick={() => setFuelOpen(true)}
                  className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-line text-sm hover:bg-secondary/50 transition">
                  <Plus className="h-4 w-4" /> Log Fuel
                </button>
                <button onClick={() => setExpOpen(true)}
                  className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition">
                  <Plus className="h-4 w-4" /> Add Expense
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-line"><h3 className="font-display font-semibold">Fuel Logs</h3></div>
        <div className="overflow-hidden rounded-xl border border-line m-4 bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,1),inset_0px_-1px_4px_0px_rgba(0,0,0,0.05)] dark:shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,0.1),inset_0px_-1px_2px_0px_rgba(0,0,0,0.02)]">
                <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">Vehicle</TableHead>
                <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">Date</TableHead>
                <TableHead className="label-caps px-4 py-2.5 text-right font-semibold">Liters</TableHead>
                <TableHead className="label-caps px-4 py-2.5 text-right font-semibold">Fuel Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuel.map((f) => {
                const v = vehicles.find((x) => x.id === f.vehicleId);
                return (
                  <TableRow key={f.id} className="hover:bg-secondary/30 border-t border-line">
                    <TableCell className="px-4 py-3 font-mono text-xs">{v?.regNo}</TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-slate">{f.date}</TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-xs">{f.liters} L</TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-xs">₹{f.cost.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-xl shadow-[var(--shadow-e1)] overflow-hidden">
        <div className="px-5 py-4 border-b border-line"><h3 className="font-display font-semibold">Other Expenses (Toll / Misc)</h3></div>
        <div className="overflow-hidden rounded-xl border border-line m-4 bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,1),inset_0px_-1px_4px_0px_rgba(0,0,0,0.05)] dark:shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,0.1),inset_0px_-1px_2px_0px_rgba(0,0,0,0.02)]">
                <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">Trip</TableHead>
                <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">Vehicle</TableHead>
                <TableHead className="label-caps px-4 py-2.5 text-right font-semibold">Toll</TableHead>
                <TableHead className="label-caps px-4 py-2.5 text-right font-semibold">Other</TableHead>
                <TableHead className="label-caps px-4 py-2.5 text-right font-semibold">Maint. (Linked)</TableHead>
                <TableHead className="label-caps px-4 py-2.5 text-right font-semibold">Total</TableHead>
                <TableHead className="label-caps px-4 py-2.5 text-left font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => {
                const v = vehicles.find((x) => x.id === e.vehicleId);
                return (
                  <TableRow key={e.id} className="hover:bg-secondary/30 border-t border-line">
                    <TableCell className="px-4 py-3 font-mono text-xs">{e.tripId}</TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs">{v?.regNo}</TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-xs">₹{e.toll}</TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-xs">₹{e.other}</TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-xs">₹{e.maintenanceLinkedCost}</TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-sm font-semibold">₹{e.total.toLocaleString()}</TableCell>
                    <TableCell className="px-4 py-3"><StatusPill status={e.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-4 bg-primary/8 border border-primary/30 rounded-md px-5 py-3">
        <span className="label-caps text-primary">Total Operational Cost (Auto) = Fuel + Maint</span>
        <span className="font-mono font-bold text-xl text-primary">₹{opTotal.toLocaleString()}</span>
      </div>

      {fuelOpen && (
        <Modal title="Log Fuel" onClose={() => setFuelOpen(false)}>
          <FuelForm vehicles={vehicles} onSubmit={(f) => { addFuel(f); setFuelOpen(false); }} />
        </Modal>
      )}
      {expOpen && (
        <Modal title="Add Expense" onClose={() => setExpOpen(false)}>
          <ExpenseForm vehicles={vehicles} onSubmit={(e) => { addExpense(e); setExpOpen(false); }} />
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-lg border border-line w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-display font-semibold">{title}</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-slate" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function FuelForm({ vehicles, onSubmit }: { vehicles: any[]; onSubmit: (f: any) => void }) {
  const [f, setF] = useState({ vehicleId: vehicles[0]?.id ?? "", date: new Date().toISOString().slice(0, 10), liters: 0, cost: 0 });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(f); }} className="space-y-3">
      <select value={f.vehicleId} onChange={(e) => setF({ ...f, vehicleId: e.target.value })}
        className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm">
        {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo}</option>)}
      </select>
      <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })}
        className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm" />
      <input type="number" placeholder="Liters" value={f.liters} onChange={(e) => setF({ ...f, liters: +e.target.value })}
        className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm font-mono" />
      <input type="number" placeholder="Cost (₹)" value={f.cost} onChange={(e) => setF({ ...f, cost: +e.target.value })}
        className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm font-mono" />
      <button className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium">Save</button>
    </form>
  );
}

function ExpenseForm({ vehicles, onSubmit }: { vehicles: any[]; onSubmit: (e: any) => void }) {
  const [f, setF] = useState({ tripId: "", vehicleId: vehicles[0]?.id ?? "", toll: 0, other: 0, maintenanceLinkedCost: 0, status: "Pending" as const });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(f); }} className="space-y-3">
      <input placeholder="Trip ID (e.g. T-1042)" value={f.tripId} onChange={(e) => setF({ ...f, tripId: e.target.value })}
        className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm font-mono" />
      <select value={f.vehicleId} onChange={(e) => setF({ ...f, vehicleId: e.target.value })}
        className="w-full h-9 rounded-md border border-line bg-canvas px-3 text-sm">
        {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo}</option>)}
      </select>
      <div className="grid grid-cols-3 gap-2">
        <input type="number" placeholder="Toll" value={f.toll} onChange={(e) => setF({ ...f, toll: +e.target.value })}
          className="h-9 rounded-md border border-line bg-canvas px-3 text-sm font-mono" />
        <input type="number" placeholder="Other" value={f.other} onChange={(e) => setF({ ...f, other: +e.target.value })}
          className="h-9 rounded-md border border-line bg-canvas px-3 text-sm font-mono" />
        <input type="number" placeholder="Maint" value={f.maintenanceLinkedCost} onChange={(e) => setF({ ...f, maintenanceLinkedCost: +e.target.value })}
          className="h-9 rounded-md border border-line bg-canvas px-3 text-sm font-mono" />
      </div>
      <button className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium">Save</button>
    </form>
  );
}
