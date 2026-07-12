import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Role, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Settings } from "./types";

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
        try {
          const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role })
          });
          const data = await res.json();
          if (data.ok) {
            set({ user: { id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role as Role } });
            return { ok: true };
          }
          return { ok: false, error: data.error || "Invalid credentials" };
        } catch (e: any) {
          return { ok: false, error: e.message };
        }
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

  loadData: () => Promise<void>;

  addVehicle: (v: Omit<Vehicle, "id">) => Promise<{ ok: boolean; error?: string }>;
  updateVehicleStatus: (id: string, status: Vehicle["status"]) => Promise<void>;

  addDriver: (d: Omit<Driver, "id">) => Promise<{ ok: boolean; error?: string }>;
  updateDriverStatus: (id: string, status: Driver["status"]) => Promise<void>;

  createTrip: (t: Omit<Trip, "id" | "status"> & { status?: Trip["status"] }) => Promise<{ ok: boolean; error?: string }>;
  dispatchTrip: (id: string) => Promise<{ ok: boolean; error?: string }>;
  completeTrip: (id: string, finalOdo: number, fuelL: number, fuelCost: number) => Promise<{ ok: boolean; error?: string }>;
  cancelTrip: (id: string, reason: string) => Promise<{ ok: boolean; error?: string }>;

  addMaintenance: (m: Omit<MaintenanceLog, "id">) => Promise<{ ok: boolean; error?: string }>;
  closeMaintenance: (id: string) => Promise<{ ok: boolean; error?: string }>;

  addFuel: (f: Omit<FuelLog, "id">) => Promise<{ ok: boolean; error?: string }>;
  addExpense: (e: Omit<Expense, "id" | "total">) => Promise<{ ok: boolean; error?: string }>;

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
  settings: { theme: "light", defaultRouteMode: "fastest", notificationsEnabled: true },
  rbacMatrix: defaultRBACMatrix,

  loadData: async () => {
    try {
      const [vRes, dRes, tRes, mRes, fRes, eRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/drivers"),
        fetch("/api/trips"),
        fetch("/api/maintenance"),
        fetch("/api/fuel"),
        fetch("/api/expenses"),
      ]);
      set({
        vehicles: await vRes.json(),
        drivers: await dRes.json(),
        trips: await tRes.json(),
        maintenance: await mRes.json(),
        fuel: await fRes.json(),
        expenses: await eRes.json(),
      });
    } catch (e) {
      console.error("Failed to load data:", e);
    }
  },

  addVehicle: async (v) => {
    const res = await fetch("/api/vehicles", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v)
    });
    const data = await res.json();
    if (data.ok) {
      set((s) => ({ vehicles: [data.vehicle, ...s.vehicles] }));
      return { ok: true };
    }
    return { ok: false, error: data.error };
  },

  updateVehicleStatus: async (id, status) => {
    await fetch(`/api/vehicles/${id}/status`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
    });
    set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, status } : v)) }));
  },

  addDriver: async (d) => {
    const res = await fetch("/api/drivers", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d)
    });
    const data = await res.json();
    if (data.ok) {
      set((s) => ({ drivers: [data.driver, ...s.drivers] }));
      return { ok: true };
    }
    return { ok: false, error: data.error };
  },

  updateDriverStatus: async (id, status) => {
    await fetch(`/api/drivers/${id}/status`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
    });
    set((s) => ({ drivers: s.drivers.map((d) => (d.id === id ? { ...d, status } : d)) }));
  },

  createTrip: async (t) => {
    const res = await fetch("/api/trips", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...t, status: t.status ?? "Draft" })
    });
    const data = await res.json();
    if (data.error) return { ok: false, error: data.error };
    get().loadData(); // Reload all to get updated vehicles/drivers if status changed
    return { ok: true };
  },

  dispatchTrip: async (id) => {
    const res = await fetch(`/api/trips/${id}/dispatch`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      get().loadData();
      return { ok: true };
    }
    return { ok: false, error: data.error };
  },

  completeTrip: async (id, finalOdo, fuelL, fuelCost) => {
    const res = await fetch(`/api/trips/${id}/complete`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ finalOdo, fuelL, fuelCost })
    });
    const data = await res.json();
    if (data.ok) {
      get().loadData();
      return { ok: true };
    }
    return { ok: false, error: data.error };
  },

  cancelTrip: async (id, reason) => {
    const res = await fetch(`/api/trips/${id}/cancel`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (data.ok) {
      get().loadData();
      return { ok: true };
    }
    return { ok: false, error: data.error };
  },

  addMaintenance: async (m) => {
    const res = await fetch("/api/maintenance", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(m)
    });
    const data = await res.json();
    if (data.ok) {
      get().loadData();
      return { ok: true };
    }
    return { ok: false, error: data.error };
  },

  closeMaintenance: async (id) => {
    const res = await fetch(`/api/maintenance/${id}/close`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      get().loadData();
      return { ok: true };
    }
    return { ok: false, error: data.error };
  },

  addFuel: async (f) => {
    const res = await fetch("/api/fuel", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f)
    });
    const data = await res.json();
    if (!data.error) {
      set((s) => ({ fuel: [data, ...s.fuel] }));
      return { ok: true };
    }
    return { ok: false, error: data.error };
  },

  addExpense: async (e) => {
    const res = await fetch("/api/expenses", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e)
    });
    const data = await res.json();
    if (!data.error) {
      set((s) => ({ expenses: [data, ...s.expenses] }));
      return { ok: true };
    }
    return { ok: false, error: data.error };
  },

  updateSettings: (s) => set({ settings: s }),
  updateRBAC: (role, mod, access) =>
    set((s) => ({
      rbacMatrix: {
        ...s.rbacMatrix,
        [role]: { ...s.rbacMatrix[role], [mod]: access },
      },
    })),
}));
