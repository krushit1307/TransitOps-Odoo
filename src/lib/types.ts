export type Role = "FleetManager" | "Dispatcher" | "SafetyOfficer" | "FinancialAnalyst";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type VehicleStatus = "Available" | "OnTrip" | "InShop" | "Retired";
export interface Vehicle {
  id: string;
  regNo: string;
  nameModel: string;
  type: string;
  maxCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: VehicleStatus;
}

export type DriverStatus = "Available" | "OnTrip" | "OffDuty" | "Suspended";
export interface Driver {
  id: string;
  name: string;
  licenseNo: string;
  category: "LMV" | "HMV";
  licenseExpiry: string; // ISO
  contact: string;
  tripCompletionPct: number;
  safetyScore: "Excellent" | "Good" | "Fair" | "Poor";
  status: DriverStatus;
}

export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";
export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string | null;
  driverId: string | null;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  finalOdometerKm?: number;
  fuelConsumedL?: number;
  status: TripStatus;
  etaMinutes?: number;
  note?: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType: string;
  cost: number;
  date: string;
  status: "InShop" | "Completed";
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
}

export interface Expense {
  id: string;
  tripId: string;
  vehicleId: string;
  toll: number;
  other: number;
  maintenanceLinkedCost: number;
  total: number;
  status: "Pending" | "Approved";
}

export interface Settings {
  depotName: string;
  currency: string;
  distanceUnit: string;
}
