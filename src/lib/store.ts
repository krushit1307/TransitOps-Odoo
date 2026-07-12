import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User, Role, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Settings,
} from "./types";
import { seedSettings } from "./mock-data";

const defaultRBACMatrix: Record<Role, Record<string, "full" | "view" | "none">> = {
  FleetManager:    { fleet: "full", drivers: "full", trips: "full", expenses: "full", analytics: "full" },
  Dispatcher:      { fleet: "view", drivers: "none", trips: "full", expenses: "none", analytics: "none" },
  SafetyOfficer:   { fleet: "none", drivers: "full", trips: "view", expenses: "none", analytics: "none" },
  FinancialAnalyst:{ fleet: "view", drivers: "none", trips: "none", expenses: "full", analytics: "full" },
};

interface AuthState {
  user: User | null;
  login: (email: string, password: string, role: Role) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email, password, role) => {
        const res = await fetch('/api/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        }).then(r => r.json());
        if (res.ok) {
          set({ user: res.user });
          return { ok: true };
        }
        return { ok: false, error: res.error || "Invalid credentials" };
      },
      logout: () => set({ user: null }),
    }),
    { name: "transitops-auth" }
  )
);

interface DataState {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceLog[];
  fuel: FuelLog[];
  expenses: Expense[];
  settings: Settings;
  rbacMatrix: Record<Role, Record<string, "full" | "view" | "none">>;

  fetchData: () => Promise<void>;

  addVehicle: (v: Omit<Vehicle, "id">) => Promise<{ ok: boolean; error?: string }>;
  updateVehicleStatus: (id: string, status: Vehicle["status"]) => Promise<void>;

  addDriver: (d: Omit<Driver, "id">) => Promise<{ ok: boolean; error?: string }>;
  updateDriverStatus: (id: string, status: Driver["status"]) => Promise<void>;

  createTrip: (t: Omit<Trip, "id" | "status"> & { status?: Trip["status"] }) => Promise<Trip>;
  dispatchTrip: (id: string) => Promise<{ ok: boolean; error?: string }>;
  completeTrip: (id: string, finalOdo: number, fuelL: number, fuelCost: number) => Promise<void>;
  cancelTrip: (id: string, reason: string) => Promise<void>;

  addMaintenance: (m: Omit<MaintenanceLog, "id">) => Promise<{ ok: boolean; error?: string }>;
  closeMaintenance: (id: string) => Promise<void>;

  addFuel: (f: Omit<FuelLog, "id">) => Promise<void>;
  addExpense: (e: Omit<Expense, "id" | "total">) => Promise<void>;

  updateSettings: (s: Settings) => void;
  updateRBAC: (role: Role, mod: string, access: "full" | "view" | "none") => void;
}

export const useData = create<DataState>()((set, get) => ({
  vehicles: [],
  drivers: [],
  trips: [],
  maintenance: [],
  fuel: [],
  expenses: [],
  settings: seedSettings,
  rbacMatrix: defaultRBACMatrix,

  fetchData: async () => {
    try {
      const [vehicles, drivers, trips, maintenance, fuel, expenses] = await Promise.all([
        fetch('/api/vehicles').then(r => r.json()),
        fetch('/api/drivers').then(r => r.json()),
        fetch('/api/trips').then(r => r.json()),
        fetch('/api/maintenance').then(r => r.json()),
        fetch('/api/fuel').then(r => r.json()),
        fetch('/api/expenses').then(r => r.json()),
      ]);
      set({ vehicles, drivers, trips, maintenance, fuel, expenses });
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  },

  addVehicle: async (v) => {
    const res = await fetch('/api/vehicles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }).then(r => r.json());
    if (res.ok) set((s) => ({ vehicles: [res.vehicle, ...s.vehicles] }));
    return res;
  },
  updateVehicleStatus: async (id, status) => {
    await fetch(`/api/vehicles/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, status } : v)) }));
  },

  addDriver: async (d) => {
    const res = await fetch('/api/drivers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json());
    if (res.ok) set((s) => ({ drivers: [res.driver, ...s.drivers] }));
    return res;
  },
  updateDriverStatus: async (id, status) => {
    await fetch(`/api/drivers/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    set((s) => ({ drivers: s.drivers.map((d) => (d.id === id ? { ...d, status } : d)) }));
  },

  createTrip: async (t) => {
    const trip = await fetch('/api/trips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...t, status: t.status ?? "Draft" }) }).then(r => r.json());
    set((s) => ({ trips: [trip, ...s.trips] }));
    if (trip.status === "Dispatched") await get().fetchData();
    return trip;
  },
  dispatchTrip: async (id) => {
    const res = await fetch(`/api/trips/${id}/dispatch`, { method: 'POST' }).then(r => r.json());
    if (res.ok) await get().fetchData();
    return res;
  },
  completeTrip: async (id, finalOdo, fuelL, fuelCost) => {
    const res = await fetch(`/api/trips/${id}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ finalOdo, fuelL, fuelCost }) }).then(r => r.json());
    if (res.ok) await get().fetchData();
  },
  cancelTrip: async (id, reason) => {
    const res = await fetch(`/api/trips/${id}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) }).then(r => r.json());
    if (res.ok) await get().fetchData();
  },

  addMaintenance: async (m) => {
    const res = await fetch('/api/maintenance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) }).then(r => r.json());
    if (res.ok) await get().fetchData();
    return res;
  },
  closeMaintenance: async (id) => {
    const res = await fetch(`/api/maintenance/${id}/close`, { method: 'POST' }).then(r => r.json());
    if (res.ok) await get().fetchData();
  },

  addFuel: async (f) => {
    await fetch('/api/fuel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    await get().fetchData();
  },
  addExpense: async (e) => {
    await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(e) });
    await get().fetchData();
  },

  updateSettings: (s) => set({ settings: s }),
  updateRBAC: (role, mod, access) =>
    set((s) => ({
      rbacMatrix: { ...s.rbacMatrix, [role]: { ...s.rbacMatrix[role], [mod]: access } },
    })),
}));
