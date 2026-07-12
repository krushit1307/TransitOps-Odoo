import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User, Role, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Settings,
} from "./types";
import {
  seedUsers, seedVehicles, seedDrivers, seedTrips, seedMaintenance, seedFuel, seedExpenses, seedSettings,
} from "./mock-data";

const defaultRBACMatrix: Record<Role, Record<string, "full" | "view" | "none">> = {
  FleetManager:    { fleet: "full", drivers: "full", trips: "full", expenses: "full", analytics: "full" },
  Dispatcher:      { fleet: "view", drivers: "none", trips: "full", expenses: "none", analytics: "none" },
  SafetyOfficer:   { fleet: "none", drivers: "full", trips: "view", expenses: "none", analytics: "none" },
  FinancialAnalyst:{ fleet: "view", drivers: "none", trips: "none", expenses: "full", analytics: "full" },
};

interface AuthState {
  user: User | null;
  login: (email: string, password: string, role: Role) => { ok: boolean; error?: string };
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, password, role) => {
        const found = seedUsers.find(
          (u) => u.email === email && u.password === password && u.role === role
        );
        if (found) {
          set({ user: { id: found.id, name: found.name, email: found.email, role: found.role } });
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

  addVehicle: (v: Omit<Vehicle, "id">) => { ok: boolean; error?: string };
  updateVehicleStatus: (id: string, status: Vehicle["status"]) => void;

  addDriver: (d: Omit<Driver, "id">) => void;
  updateDriverStatus: (id: string, status: Driver["status"]) => void;

  createTrip: (t: Omit<Trip, "id" | "status"> & { status?: Trip["status"] }) => Trip;
  dispatchTrip: (id: string) => { ok: boolean; error?: string };
  completeTrip: (id: string, finalOdo: number, fuelL: number, fuelCost: number) => void;
  cancelTrip: (id: string, reason: string) => void;

  addMaintenance: (m: Omit<MaintenanceLog, "id">) => void;
  closeMaintenance: (id: string) => void;

  addFuel: (f: Omit<FuelLog, "id">) => void;
  addExpense: (e: Omit<Expense, "id" | "total">) => void;

  updateSettings: (s: Settings) => void;
  updateRBAC: (role: Role, mod: string, access: "full" | "view" | "none") => void;
}

let counter = 1000;
const nid = (p: string) => `${p}-${Date.now().toString(36)}-${counter++}`;

export const useData = create<DataState>()((set, get) => ({
  vehicles: seedVehicles,
  drivers: seedDrivers,
  trips: seedTrips,
  maintenance: seedMaintenance,
  fuel: seedFuel,
  expenses: seedExpenses,
  settings: seedSettings,
  rbacMatrix: defaultRBACMatrix,

  addVehicle: (v) => {
    const exists = get().vehicles.some((x) => x.regNo.toLowerCase() === v.regNo.toLowerCase());
    if (exists) return { ok: false, error: "Registration No. must be unique" };
    set((s) => ({ vehicles: [{ ...v, id: nid("v") }, ...s.vehicles] }));
    return { ok: true };
  },
  updateVehicleStatus: (id, status) =>
    set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, status } : v)) })),

  addDriver: (d) => set((s) => ({ drivers: [{ ...d, id: nid("d") }, ...s.drivers] })),
  updateDriverStatus: (id, status) =>
    set((s) => ({ drivers: s.drivers.map((d) => (d.id === id ? { ...d, status } : d)) })),

  createTrip: (t) => {
    const trip: Trip = { ...t, id: `T-${1043 + get().trips.length}`, status: t.status ?? "Draft" };
    set((s) => ({ trips: [trip, ...s.trips] }));
    if (trip.status === "Dispatched") {
      if (trip.vehicleId) get().updateVehicleStatus(trip.vehicleId, "OnTrip");
      if (trip.driverId) get().updateDriverStatus(trip.driverId, "OnTrip");
    }
    return trip;
  },
  dispatchTrip: (id) => {
    const trip = get().trips.find((t) => t.id === id);
    if (!trip) return { ok: false, error: "Trip not found" };
    if (!trip.vehicleId || !trip.driverId) return { ok: false, error: "Trip must have both a vehicle and a driver assigned" };

    const vehicle = get().vehicles.find((v) => v.id === trip.vehicleId);
    if (!vehicle) return { ok: false, error: "Vehicle not found" };
    
    const driver = get().drivers.find((d) => d.id === trip.driverId);
    if (!driver) return { ok: false, error: "Driver not found" };

    if (vehicle.status !== "Available") return { ok: false, error: `Vehicle must be Available (currently ${vehicle.status})` };
    if (driver.status !== "Available") return { ok: false, error: `Driver must be Available (currently ${driver.status})` };
    if (new Date(driver.licenseExpiry) < new Date()) return { ok: false, error: "Driver license is expired" };
    if (trip.cargoWeightKg > vehicle.maxCapacityKg) return { ok: false, error: "Cargo weight exceeds vehicle capacity" };

    set((s) => ({
      trips: s.trips.map((t) => (t.id === id ? { ...t, status: "Dispatched" } : t)),
      vehicles: s.vehicles.map((v) => (v.id === vehicle.id ? { ...v, status: "OnTrip" } : v)),
      drivers: s.drivers.map((d) => (d.id === driver.id ? { ...d, status: "OnTrip" } : d)),
    }));
    return { ok: true };
  },
  completeTrip: (id, finalOdo, fuelL, fuelCost) => {
    const trip = get().trips.find((t) => t.id === id);
    if (!trip) return;
    const vehicle = get().vehicles.find((v) => v.id === trip.vehicleId);
    const startOdo = vehicle?.odometerKm ?? 0;
    set((s) => ({
      trips: s.trips.map((t) =>
        t.id === id ? { ...t, status: "Completed", finalOdometerKm: finalOdo, actualDistanceKm: finalOdo - startOdo, fuelConsumedL: fuelL } : t
      ),
    }));
    if (trip.vehicleId) {
      set((s) => ({
        vehicles: s.vehicles.map((v) =>
          v.id === trip.vehicleId ? { ...v, status: "Available", odometerKm: finalOdo } : v
        ),
        fuel: [
          { id: nid("f"), vehicleId: trip.vehicleId!, date: new Date().toISOString().slice(0, 10), liters: fuelL, cost: fuelCost },
          ...s.fuel,
        ],
      }));
    }
    if (trip.driverId) get().updateDriverStatus(trip.driverId, "Available");
  },
  cancelTrip: (id, reason) => {
    const trip = get().trips.find((t) => t.id === id);
    if (!trip) return;
    set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, status: "Cancelled", note: reason } : t)) }));
    if (trip.status === "Draft") return;
    
    if (trip.vehicleId) {
      const vehicle = get().vehicles.find((v) => v.id === trip.vehicleId);
      if (vehicle && vehicle.status !== "InShop") {
        get().updateVehicleStatus(trip.vehicleId, "Available");
      }
    }
    if (trip.driverId) get().updateDriverStatus(trip.driverId, "Available");
  },

  addMaintenance: (m) => {
    set((s) => ({ maintenance: [{ ...m, id: nid("m") }, ...s.maintenance] }));
    if (m.status === "InShop") get().updateVehicleStatus(m.vehicleId, "InShop");
    else if (m.status === "Completed") {
      const v = get().vehicles.find((x) => x.id === m.vehicleId);
      if (v && v.status !== "Retired") get().updateVehicleStatus(m.vehicleId, "Available");
    }
  },
  closeMaintenance: (id) => {
    const m = get().maintenance.find((x) => x.id === id);
    if (!m) return;
    set((s) => ({ maintenance: s.maintenance.map((x) => (x.id === id ? { ...x, status: "Completed" } : x)) }));
    const v = get().vehicles.find((x) => x.id === m.vehicleId);
    if (v && v.status !== "Retired") get().updateVehicleStatus(m.vehicleId, "Available");
  },

  addFuel: (f) => set((s) => ({ fuel: [{ ...f, id: nid("f") }, ...s.fuel] })),
  addExpense: (e) => {
    const total = (e.toll || 0) + (e.other || 0) + (e.maintenanceLinkedCost || 0);
    set((s) => ({ expenses: [{ ...e, id: nid("e"), total }, ...s.expenses] }));
  },

  updateSettings: (s) => set({ settings: s }),
  updateRBAC: (role, mod, access) =>
    set((s) => ({
      rbacMatrix: {
        ...s.rbacMatrix,
        [role]: {
          ...s.rbacMatrix[role],
          [mod]: access,
        },
      },
    })),
}));
