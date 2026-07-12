import type {
  Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Settings,
} from "./types";

export const seedVehicles: Vehicle[] = [
  { id: "v1", regNo: "VAN-05", nameModel: "Tata Ace Gold", type: "Van", maxCapacityKg: 500, odometerKm: 48210, acquisitionCost: 620000, status: "Available" },
  { id: "v2", regNo: "TRK-11", nameModel: "Ashok Leyland Dost", type: "Truck", maxCapacityKg: 1500, odometerKm: 92345, acquisitionCost: 1150000, status: "OnTrip" },
  { id: "v3", regNo: "MIN-02", nameModel: "Mahindra Bolero Pik-Up", type: "Mini", maxCapacityKg: 1200, odometerKm: 71100, acquisitionCost: 940000, status: "InShop" },
  { id: "v4", regNo: "VAN-08", nameModel: "Maruti Super Carry", type: "Van", maxCapacityKg: 750, odometerKm: 34500, acquisitionCost: 580000, status: "Available" },
  { id: "v5", regNo: "TRK-14", nameModel: "Eicher Pro 2049", type: "Truck", maxCapacityKg: 3000, odometerKm: 118200, acquisitionCost: 1850000, status: "OnTrip" },
  { id: "v6", regNo: "TRK-07", nameModel: "Tata 407", type: "Truck", maxCapacityKg: 2500, odometerKm: 205000, acquisitionCost: 1450000, status: "Retired" },
  { id: "v7", regNo: "MIN-04", nameModel: "Mahindra Jeeto", type: "Mini", maxCapacityKg: 700, odometerKm: 22450, acquisitionCost: 490000, status: "Available" },
];

export const seedDrivers: Driver[] = [
  { id: "d1", name: "Rajesh Kumar", licenseNo: "DL-1420110012345", category: "HMV", licenseExpiry: "2027-08-15", contact: "98765xxxxx", tripCompletionPct: 96, safetyScore: "Excellent", status: "Available" },
  { id: "d2", name: "Suresh Patil", licenseNo: "MH-1220098876543", category: "HMV", licenseExpiry: "2026-03-22", contact: "99876xxxxx", tripCompletionPct: 91, safetyScore: "Good", status: "OnTrip" },
  { id: "d3", name: "Amit Verma", licenseNo: "UP-3320085432198", category: "LMV", licenseExpiry: "2024-11-30", contact: "97654xxxxx", tripCompletionPct: 78, safetyScore: "Fair", status: "OffDuty" },
  { id: "d4", name: "Vikas Singh", licenseNo: "HR-0620110098721", category: "HMV", licenseExpiry: "2028-01-10", contact: "98123xxxxx", tripCompletionPct: 88, safetyScore: "Good", status: "OnTrip" },
  { id: "d5", name: "Prakash Nair", licenseNo: "KL-0720075431287", category: "LMV", licenseExpiry: "2025-06-18", contact: "96543xxxxx", tripCompletionPct: 65, safetyScore: "Poor", status: "Suspended" },
  { id: "d6", name: "Manish Yadav", licenseNo: "DL-1420130054821", category: "LMV", licenseExpiry: "2027-04-05", contact: "98211xxxxx", tripCompletionPct: 93, safetyScore: "Excellent", status: "Available" },
];

export const seedTrips: Trip[] = [
  { id: "T-1042", source: "Delhi Depot", destination: "Gurugram Hub", vehicleId: "v2", driverId: "d2", cargoWeightKg: 1200, plannedDistanceKm: 42, status: "Dispatched", etaMinutes: 45 },
  { id: "T-1041", source: "Delhi Depot", destination: "Noida FC", vehicleId: "v5", driverId: "d4", cargoWeightKg: 2400, plannedDistanceKm: 38, status: "Dispatched", etaMinutes: 22 },
  { id: "T-1040", source: "Delhi Depot", destination: "Faridabad", vehicleId: "v1", driverId: "d1", cargoWeightKg: 420, plannedDistanceKm: 55, finalOdometerKm: 48210, fuelConsumedL: 6.4, status: "Completed" },
  { id: "T-1039", source: "Delhi Depot", destination: "Sonipat", vehicleId: "v4", driverId: "d6", cargoWeightKg: 680, plannedDistanceKm: 62, finalOdometerKm: 34500, fuelConsumedL: 7.1, status: "Completed" },
  { id: "T-1038", source: "Delhi Depot", destination: "Meerut", vehicleId: null, driverId: null, cargoWeightKg: 900, plannedDistanceKm: 88, status: "Cancelled", note: "Vehicle went to shop" },
];

export const seedMaintenance: MaintenanceLog[] = [
  { id: "m1", vehicleId: "v3", serviceType: "Engine Overhaul", cost: 42000, date: "2026-07-08", status: "InShop" },
  { id: "m2", vehicleId: "v1", serviceType: "Tyre Replacement", cost: 18500, date: "2026-06-22", status: "Completed" },
  { id: "m3", vehicleId: "v5", serviceType: "Brake Service", cost: 9200, date: "2026-06-15", status: "Completed" },
  { id: "m4", vehicleId: "v2", serviceType: "Oil Change", cost: 4500, date: "2026-06-02", status: "Completed" },
];

export const seedFuel: FuelLog[] = [
  { id: "f1", vehicleId: "v1", date: "2026-07-10", liters: 32, cost: 3200 },
  { id: "f2", vehicleId: "v2", date: "2026-07-09", liters: 68, cost: 6800 },
  { id: "f3", vehicleId: "v5", date: "2026-07-08", liters: 92, cost: 9200 },
  { id: "f4", vehicleId: "v4", date: "2026-07-07", liters: 28, cost: 2800 },
  { id: "f5", vehicleId: "v7", date: "2026-07-06", liters: 22, cost: 2200 },
];

export const seedExpenses: Expense[] = [
  { id: "e1", tripId: "T-1040", vehicleId: "v1", toll: 320, other: 150, maintenanceLinkedCost: 0, total: 470, status: "Approved" },
  { id: "e2", tripId: "T-1039", vehicleId: "v4", toll: 480, other: 90, maintenanceLinkedCost: 0, total: 570, status: "Approved" },
  { id: "e3", tripId: "T-1042", vehicleId: "v2", toll: 240, other: 0, maintenanceLinkedCost: 4500, total: 4740, status: "Pending" },
];

export const seedSettings: Settings = {
  depotName: "TransitOps Delhi Depot",
  currency: "INR",
  distanceUnit: "km",
};
