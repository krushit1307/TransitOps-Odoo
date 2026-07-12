import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedUsers, seedVehicles, seedDrivers, seedTrips, seedMaintenance, seedFuel, seedExpenses } from '../src/lib/mock-data';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Database...');
  for (const u of seedUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { id: u.id, name: u.name, email: u.email, password: u.password!, role: u.role as any },
    });
  }
  for (const v of seedVehicles) {
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: {},
      create: { id: v.id, regNo: v.regNo, nameModel: v.nameModel, type: v.type, maxCapacityKg: v.maxCapacityKg, odometerKm: v.odometerKm, acquisitionCost: v.acquisitionCost, status: v.status as any },
    });
  }
  for (const d of seedDrivers) {
    await prisma.driver.upsert({
      where: { id: d.id },
      update: {},
      create: { id: d.id, name: d.name, licenseNo: d.licenseNo, category: d.category, licenseExpiry: new Date(d.licenseExpiry), contact: d.contact, safetyScore: d.safetyScore, status: d.status as any },
    });
  }
  // Trips
  for (const t of seedTrips) {
    await prisma.trip.upsert({
      where: { id: t.id },
      update: {},
      create: { id: t.id, source: t.source, destination: t.destination, cargoWeightKg: t.cargoWeightKg, plannedDistanceKm: t.plannedDistanceKm, finalOdometerKm: t.finalOdometerKm, actualDistanceKm: t.actualDistanceKm, fuelConsumedL: t.fuelConsumedL, status: t.status as any, etaMinutes: t.etaMinutes, note: t.note, vehicleId: t.vehicleId, driverId: t.driverId },
    });
  }
  for (const m of seedMaintenance) {
    await prisma.maintenanceLog.upsert({
      where: { id: m.id },
      update: {},
      create: { id: m.id, vehicleId: m.vehicleId, serviceType: m.serviceType, cost: m.cost, date: m.date, status: m.status as any },
    });
  }
  for (const f of seedFuel) {
    await prisma.fuelLog.upsert({
      where: { id: f.id },
      update: {},
      create: { id: f.id, vehicleId: f.vehicleId, date: f.date, liters: f.liters, cost: f.cost },
    });
  }
  for (const e of seedExpenses) {
    await prisma.expense.upsert({
      where: { id: e.id },
      update: {},
      create: { id: e.id, tripId: e.tripId, vehicleId: e.vehicleId, toll: e.toll, other: e.other, maintenanceLinkedCost: e.maintenanceLinkedCost, total: e.total, status: e.status as any },
    });
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
