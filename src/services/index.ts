/**
 * Service layer boundary.
 *
 * Each service function delegates to the in-memory Zustand store (mock data)
 * with a small artificial delay. To swap in the real backend, replace the
 * body of each function with a fetch/axios call against
 * `import.meta.env.VITE_API_BASE_URL + "/api/..."` — component code stays untouched.
 */
import { useData } from "@/lib/store";
import type {
  Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Settings,
} from "@/lib/types";

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

// Vehicles
export const vehicleService = {
  async list(): Promise<Vehicle[]> { await delay(); return useData.getState().vehicles; },
  async create(v: Omit<Vehicle, "id">) { await delay(); return useData.getState().addVehicle(v); },
};

// Drivers
export const driverService = {
  async list(): Promise<Driver[]> { await delay(); return useData.getState().drivers; },
  async create(d: Omit<Driver, "id">) { await delay(); useData.getState().addDriver(d); },
  async setStatus(id: string, status: Driver["status"]) { await delay(); useData.getState().updateDriverStatus(id, status); },
};

// Trips
export const tripService = {
  async list(): Promise<Trip[]> { await delay(); return useData.getState().trips; },
  async create(t: Omit<Trip, "id" | "status"> & { status?: Trip["status"] }) { await delay(); return useData.getState().createTrip(t); },
  async complete(id: string, odo: number, fuelL: number, fuelCost: number) { await delay(); useData.getState().completeTrip(id, odo, fuelL, fuelCost); },
  async cancel(id: string, reason: string) { await delay(); useData.getState().cancelTrip(id, reason); },
};

// Maintenance
export const maintenanceService = {
  async list(): Promise<MaintenanceLog[]> { await delay(); return useData.getState().maintenance; },
  async create(m: Omit<MaintenanceLog, "id">) { await delay(); useData.getState().addMaintenance(m); },
  async close(id: string) { await delay(); useData.getState().closeMaintenance(id); },
};

// Fuel & Expenses
export const fuelService = {
  async listFuel(): Promise<FuelLog[]> { await delay(); return useData.getState().fuel; },
  async addFuel(f: Omit<FuelLog, "id">) { await delay(); useData.getState().addFuel(f); },
  async listExpenses(): Promise<Expense[]> { await delay(); return useData.getState().expenses; },
  async addExpense(e: Omit<Expense, "id" | "total">) { await delay(); useData.getState().addExpense(e); },
};

// Analytics
export const analyticsService = {
  async summary() {
    await delay();
    const { vehicles, trips, fuel, maintenance, expenses } = useData.getState();
    const totalFuel = fuel.reduce((a, b) => a + b.cost, 0);
    const totalFuelL = fuel.reduce((a, b) => a + b.liters, 0);
    const totalMaint = maintenance.reduce((a, b) => a + b.cost, 0);
    const totalDist = trips.filter((t) => t.status === "Completed").reduce((a, b) => a + b.plannedDistanceKm, 0);
    const kmPerL = totalFuelL ? totalDist / totalFuelL : 0;
    const active = vehicles.filter((v) => v.status !== "Retired").length;
    const inUse = vehicles.filter((v) => v.status === "OnTrip").length;
    const utilization = active ? (inUse / active) * 100 : 0;
    const acqTotal = vehicles.reduce((a, b) => a + b.acquisitionCost, 0);
    const revenue = trips.filter((t) => t.status === "Completed").length * 12500; // mock
    const roi = acqTotal ? ((revenue - (totalMaint + totalFuel)) / acqTotal) * 100 : 0;
    return { totalFuel, totalMaint, totalExpenses: expenses.reduce((a, b) => a + b.total, 0), kmPerL, utilization, roi, revenue };
  },
};

// Settings
export const settingsService = {
  async get(): Promise<Settings> { await delay(); return useData.getState().settings; },
  async update(s: Settings) { await delay(); useData.getState().updateSettings(s); },
};

// Auth (mock)
export const authService = {
  async login(email: string, password: string) {
    await delay();
    if (!email || !password) throw new Error("Invalid credentials.");
    return { ok: true };
  },
};
