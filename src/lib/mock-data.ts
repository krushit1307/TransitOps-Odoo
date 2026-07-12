import type {
  SeedUser, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Settings,
} from "./types";

export const seedUsers: SeedUser[] = [
  { id: "u1", name: "Patel Rajesh", email: "fleet@transitops.demo", role: "FleetManager", password: "Transit@123" },
  { id: "u2", name: "Bhaiya Neeraj", email: "dispatch@transitops.demo", role: "Dispatcher", password: "Transit@123" },
  { id: "u3", name: "Shah Amit", email: "safety@transitops.demo", role: "SafetyOfficer", password: "Transit@123" },
  { id: "u4", name: "Desai Priya", email: "finance@transitops.demo", role: "FinancialAnalyst", password: "Transit@123" },
];

export const seedVehicles: Vehicle[] = [
  { id: "v1", regNo: "GJ01AB4521", nameModel: "Tata Ace Gold", type: "Van", maxCapacityKg: 500, odometerKm: 74000, acquisitionCost: 620000, status: "Available" },
  { id: "v2", regNo: "GJ01AB9981", nameModel: "Ashok Leyland Dost", type: "Truck", maxCapacityKg: 5000, odometerKm: 182000, acquisitionCost: 2450000, status: "OnTrip" },
  { id: "v3", regNo: "GJ01AB1120", nameModel: "Mahindra Bolero Pik-Up", type: "Mini", maxCapacityKg: 1000, odometerKm: 66000, acquisitionCost: 410000, status: "InShop" },
  { id: "v4", regNo: "GJ01AB0008", nameModel: "Maruti Super Carry", type: "Van", maxCapacityKg: 750, odometerKm: 241900, acquisitionCost: 590000, status: "Retired" },
  { id: "v5", regNo: "GJ01XY5555", nameModel: "Eicher Pro 2049", type: "Truck", maxCapacityKg: 3000, odometerKm: 118200, acquisitionCost: 1850000, status: "OnTrip" },
  { id: "v6", regNo: "GJ01MN9090", nameModel: "Mahindra Jeeto", type: "Mini", maxCapacityKg: 700, odometerKm: 22450, acquisitionCost: 490000, status: "Available" },
];

export const seedDrivers: Driver[] = [
  { id: "d1", name: "Alex", licenseNo: "DL-88213", category: "LMV", licenseExpiry: "2028-12-15", contact: "9876543210", tripCompletionPct: 96, safetyScore: 96, status: "Available" },
  { id: "d2", name: "John", licenseNo: "DL-44120", category: "HMV", licenseExpiry: "2025-03-10", contact: "9987654321", tripCompletionPct: 81, safetyScore: 81, status: "Suspended" },
  { id: "d3", name: "Priya", licenseNo: "DL-77031", category: "LMV", licenseExpiry: "2027-08-20", contact: "9765432109", tripCompletionPct: 99, safetyScore: 99, status: "OnTrip" },
  { id: "d4", name: "Suresh", licenseNo: "DL-90045", category: "HMV", licenseExpiry: "2027-01-12", contact: "9812345678", tripCompletionPct: 88, safetyScore: 88, status: "OffDuty" },
];

export const seedTrips: Trip[] = [
  { id: "TR001", source: "Gandhinagar Depot", destination: "Ahmedabad Hub", vehicleId: "v2", driverId: "d3", cargoWeightKg: 4500, plannedDistanceKm: 42, status: "Dispatched", etaMinutes: 45 },
  { id: "TR002", source: "Gandhinagar Depot", destination: "Vatva Industrial Area", vehicleId: "v5", driverId: "d4", cargoWeightKg: 2400, plannedDistanceKm: 38, status: "Draft" },
  { id: "TR003", source: "Gandhinagar Depot", destination: "Sanand Warehouse", vehicleId: "v1", driverId: "d1", cargoWeightKg: 420, plannedDistanceKm: 55, finalOdometerKm: 74000, fuelConsumedL: 6.4, status: "Completed" },
  { id: "TR006", source: "Mansa", destination: "Kalol Depot", vehicleId: "v3", driverId: null, cargoWeightKg: 900, plannedDistanceKm: 88, status: "Cancelled", note: "Vehicle went to shop" },
];

export const seedMaintenance: MaintenanceLog[] = [
  { id: "m1", vehicleId: "v3", serviceType: "Engine Overhaul", cost: 42000, date: "2026-07-08", status: "InShop" },
  { id: "m2", vehicleId: "v3", serviceType: "Brake Service", cost: 18500, date: "2026-07-10", status: "InShop" },
  { id: "m3", vehicleId: "v5", serviceType: "Oil Change", cost: 9200, date: "2026-06-15", status: "Completed" },
];

export const seedFuel: FuelLog[] = [
  { id: "f1", vehicleId: "v1", date: "2026-07-10", liters: 32, cost: 3200 },
  { id: "f2", vehicleId: "v2", date: "2026-07-09", liters: 68, cost: 6800 },
];

export const seedExpenses: Expense[] = [
  { id: "e1", tripId: "TR003", vehicleId: "v1", toll: 320, other: 150, maintenanceLinkedCost: 0, total: 470, status: "Approved" },
];

export const seedSettings: Settings = {
  depotName: "Gandhinagar Depot GJ4",
  currency: "INR (Rs)",
  distanceUnit: "Kilometers",
};
