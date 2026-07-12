import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Role, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Settings } from "./types";
import { seedVehicles, seedDrivers, seedTrips, seedMaintenance, seedFuel, seedExpenses, seedSettings, seedUsers } from "./mock-data";

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
        // Offline login logic using seed data
        const u = seedUsers.find((x) => x.email === email && x.role === role);
        if (u && u.password === password) {
          set({ user: { id: u.id, name: u.name, email: u.email, role: u.role as Role } });
          return { ok: true };
        }
        return { ok: false, error: "Invalid credentials" };
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

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
      vehicles: seedVehicles,
      drivers: seedDrivers,
      trips: seedTrips,
      maintenance: seedMaintenance,
      fuel: seedFuel,
      expenses: seedExpenses,
      settings: seedSettings,
      rbacMatrix: defaultRBACMatrix,

      loadData: async () => {
        // Data is automatically loaded by Zustand persist!
      },

      addVehicle: async (v) => {
        const newVehicle: Vehicle = { ...v, id: `v${Date.now()}` };
        set((s) => ({ vehicles: [newVehicle, ...s.vehicles] }));
        return { ok: true };
      },

      updateVehicleStatus: async (id, status) => {
        set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, status } : v)) }));
      },

      addDriver: async (d) => {
        const newDriver: Driver = { ...d, id: `d${Date.now()}` };
        set((s) => ({ drivers: [newDriver, ...s.drivers] }));
        return { ok: true };
      },

      updateDriverStatus: async (id, status) => {
        set((s) => ({ drivers: s.drivers.map((d) => (d.id === id ? { ...d, status } : d)) }));
      },

      createTrip: async (t) => {
        const newTrip: Trip = { ...t, id: `TR${Date.now()}`, status: t.status ?? "Draft" };
        
        set((s) => {
          let updatedVehicles = s.vehicles;
          let updatedDrivers = s.drivers;
          
          if (newTrip.status === "Dispatched") {
            if (newTrip.vehicleId) {
              updatedVehicles = updatedVehicles.map(v => v.id === newTrip.vehicleId ? { ...v, status: "OnTrip" } : v);
            }
            if (newTrip.driverId) {
              updatedDrivers = updatedDrivers.map(d => d.id === newTrip.driverId ? { ...d, status: "OnTrip" } : d);
            }
          }
          return { trips: [newTrip, ...s.trips], vehicles: updatedVehicles, drivers: updatedDrivers };
        });
        
        return { ok: true };
      },

      dispatchTrip: async (id) => {
        set((s) => {
          const trip = s.trips.find((t) => t.id === id);
          if (!trip) return s;
          
          let updatedVehicles = s.vehicles;
          let updatedDrivers = s.drivers;
          
          if (trip.vehicleId) {
            updatedVehicles = updatedVehicles.map(v => v.id === trip.vehicleId ? { ...v, status: "OnTrip" } : v);
          }
          if (trip.driverId) {
            updatedDrivers = updatedDrivers.map(d => d.id === trip.driverId ? { ...d, status: "OnTrip" } : d);
          }
          
          return {
            trips: s.trips.map((t) => (t.id === id ? { ...t, status: "Dispatched" } : t)),
            vehicles: updatedVehicles,
            drivers: updatedDrivers
          };
        });
        return { ok: true };
      },

      completeTrip: async (id, finalOdo, fuelL, fuelCost) => {
        set((s) => {
          const trip = s.trips.find((t) => t.id === id);
          if (!trip) return s;

          let updatedVehicles = s.vehicles;
          let updatedDrivers = s.drivers;
          let newFuel = s.fuel;

          if (trip.vehicleId) {
            updatedVehicles = updatedVehicles.map(v => v.id === trip.vehicleId ? { ...v, status: "Available", odometerKm: finalOdo } : v);
            if (fuelL > 0) {
              newFuel = [{ id: `f${Date.now()}`, vehicleId: trip.vehicleId, date: new Date().toISOString(), liters: fuelL, cost: fuelCost }, ...s.fuel];
            }
          }
          if (trip.driverId) {
            updatedDrivers = updatedDrivers.map(d => d.id === trip.driverId ? { ...d, status: "Available" } : d);
          }

          return {
            trips: s.trips.map((t) => (t.id === id ? { ...t, status: "Completed", finalOdometerKm: finalOdo, fuelConsumedL: fuelL } : t)),
            vehicles: updatedVehicles,
            drivers: updatedDrivers,
            fuel: newFuel,
          };
        });
        return { ok: true };
      },

      cancelTrip: async (id, reason) => {
        set((s) => {
          const trip = s.trips.find((t) => t.id === id);
          if (!trip) return s;

          let updatedVehicles = s.vehicles;
          let updatedDrivers = s.drivers;

          if (trip.status === "Dispatched") {
            if (trip.vehicleId) {
              updatedVehicles = updatedVehicles.map(v => v.id === trip.vehicleId ? { ...v, status: "Available" } : v);
            }
            if (trip.driverId) {
              updatedDrivers = updatedDrivers.map(d => d.id === trip.driverId ? { ...d, status: "Available" } : d);
            }
          }

          return {
            trips: s.trips.map((t) => (t.id === id ? { ...t, status: "Cancelled", note: reason } : t)),
            vehicles: updatedVehicles,
            drivers: updatedDrivers
          };
        });
        return { ok: true };
      },

      addMaintenance: async (m) => {
        const newLog: MaintenanceLog = { ...m, id: `m${Date.now()}` };
        set((s) => {
          const updatedVehicles = s.vehicles.map(v => v.id === m.vehicleId ? { ...v, status: "InShop" as any } : v);
          return { maintenance: [newLog, ...s.maintenance], vehicles: updatedVehicles };
        });
        return { ok: true };
      },

      closeMaintenance: async (id) => {
        set((s) => {
          const mLog = s.maintenance.find((m) => m.id === id);
          if (!mLog) return s;

          const updatedVehicles = s.vehicles.map(v => v.id === mLog.vehicleId ? { ...v, status: "Available" as any } : v);
          return {
            maintenance: s.maintenance.map((m) => (m.id === id ? { ...m, status: "Completed" } : m)),
            vehicles: updatedVehicles
          };
        });
        return { ok: true };
      },

      addFuel: async (f) => {
        const newFuel: FuelLog = { ...f, id: `f${Date.now()}` };
        set((s) => ({ fuel: [newFuel, ...s.fuel] }));
        return { ok: true };
      },

      addExpense: async (e) => {
        const total = e.toll + e.other + e.maintenanceLinkedCost;
        const newExpense: Expense = { ...e, id: `e${Date.now()}`, total, status: "Pending" };
        set((s) => ({ expenses: [newExpense, ...s.expenses] }));
        return { ok: true };
      },

      updateSettings: (s) => set({ settings: s }),
      updateRBAC: (role, mod, access) =>
        set((s) => ({
          rbacMatrix: {
            ...s.rbacMatrix,
            [role]: { ...s.rbacMatrix[role], [mod]: access },
          },
        })),
    }),
    { name: "transitops-data" }
  )
);
