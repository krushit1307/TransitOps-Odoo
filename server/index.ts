import 'dotenv/config';
import express from 'express';
import cors from 'cors';
// @ts-ignore: IDE may not resolve dynamically generated PrismaClient immediately
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Users
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.password === password && user.role === role) {
    res.json({ ok: true, user });
  } else {
    res.json({ ok: false, error: "Invalid credentials" });
  }
});

// Vehicles
app.get('/api/vehicles', async (req, res) => {
  const vehicles = await prisma.vehicle.findMany();
  res.json(vehicles);
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const v = await prisma.vehicle.create({ data: req.body });
    res.json({ ok: true, vehicle: v });
  } catch (e: any) {
    res.json({ ok: false, error: e.message });
  }
});

app.put('/api/vehicles/:id/status', async (req, res) => {
  await prisma.vehicle.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  res.json({ ok: true });
});

// Drivers
app.get('/api/drivers', async (req, res) => {
  const drivers = await prisma.driver.findMany();
  res.json(drivers);
});

app.post('/api/drivers', async (req, res) => {
  try {
    const d = await prisma.driver.create({ data: { ...req.body, licenseExpiry: new Date(req.body.licenseExpiry) } });
    res.json({ ok: true, driver: d });
  } catch (e: any) {
    res.json({ ok: false, error: e.message });
  }
});

app.put('/api/drivers/:id/status', async (req, res) => {
  await prisma.driver.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  res.json({ ok: true });
});

// Trips
app.get('/api/trips', async (req, res) => {
  const trips = await prisma.trip.findMany();
  res.json(trips);
});

app.post('/api/trips', async (req, res) => {
  const t = await prisma.trip.create({ data: req.body });
  res.json(t);
});

app.post('/api/trips/:id/dispatch', async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.json({ ok: false, error: "Trip not found" });

    await prisma.$transaction(async (tx: any) => {
      await tx.trip.update({ where: { id }, data: { status: 'Dispatched' } });
      if (trip.vehicleId) await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'OnTrip' } });
      if (trip.driverId) await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'OnTrip' } });
    });
    res.json({ ok: true });
  } catch (e: any) {
    res.json({ ok: false, error: e.message });
  }
});

app.post('/api/trips/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { finalOdo, fuelL, fuelCost } = req.body;
    
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.json({ ok: false, error: "Trip not found" });

    const vehicle = trip.vehicleId ? await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } }) : null;
    const startOdo = vehicle?.odometerKm ?? 0;
    const actualDistanceKm = finalOdo - startOdo;

    await prisma.$transaction(async (tx: any) => {
      await tx.trip.update({ 
        where: { id }, 
        data: { status: 'Completed', finalOdometerKm: finalOdo, fuelConsumedL: fuelL, actualDistanceKm } 
      });
      if (trip.vehicleId) {
        await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'Available', odometerKm: finalOdo } });
        await tx.fuelLog.create({ 
          data: { vehicleId: trip.vehicleId, date: new Date().toISOString().slice(0,10), liters: fuelL, cost: fuelCost } 
        });
      }
      if (trip.driverId) {
        await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'Available' } });
      }
    });
    res.json({ ok: true });
  } catch (e: any) {
    res.json({ ok: false, error: e.message });
  }
});

app.post('/api/trips/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.json({ ok: false, error: "Trip not found" });

    await prisma.$transaction(async (tx: any) => {
      await tx.trip.update({ where: { id }, data: { status: 'Cancelled', note: reason } });
      if (trip.status !== 'Draft') {
        if (trip.vehicleId) {
          const v = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
          if (v && v.status !== "InShop") {
            await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'Available' } });
          }
        }
        if (trip.driverId) {
          await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'Available' } });
        }
      }
    });
    res.json({ ok: true });
  } catch (e: any) {
    res.json({ ok: false, error: e.message });
  }
});

// Maintenance
app.get('/api/maintenance', async (req, res) => {
  const m = await prisma.maintenanceLog.findMany();
  res.json(m);
});

app.post('/api/maintenance', async (req, res) => {
  try {
    const m = req.body;
    const vehicle = await prisma.vehicle.findUnique({ where: { id: m.vehicleId } });
    if (vehicle && vehicle.status === "OnTrip") return res.json({ ok: false, error: "Cannot add maintenance for a vehicle currently OnTrip" });

    await prisma.$transaction(async (tx: any) => {
      await tx.maintenanceLog.create({ data: m });
      if (m.status === "InShop") {
        await tx.vehicle.update({ where: { id: m.vehicleId }, data: { status: 'InShop' } });
      } else if (m.status === "Completed") {
        if (vehicle && vehicle.status !== "Retired") await tx.vehicle.update({ where: { id: m.vehicleId }, data: { status: 'Available' } });
      }
    });
    res.json({ ok: true });
  } catch (e: any) {
    res.json({ ok: false, error: e.message });
  }
});

app.post('/api/maintenance/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const m = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!m) return res.json({ ok: false, error: "Log not found" });

    await prisma.$transaction(async (tx: any) => {
      await tx.maintenanceLog.update({ where: { id }, data: { status: 'Completed' } });
      const active = await tx.maintenanceLog.findFirst({ where: { vehicleId: m.vehicleId, status: 'InShop' } });
      if (!active) {
        const v = await tx.vehicle.findUnique({ where: { id: m.vehicleId } });
        if (v && v.status !== "Retired") {
          await tx.vehicle.update({ where: { id: m.vehicleId }, data: { status: 'Available' } });
        }
      }
    });
    res.json({ ok: true });
  } catch (e: any) {
    res.json({ ok: false, error: e.message });
  }
});

// Expenses & Fuel
app.get('/api/expenses', async (req, res) => {
  const e = await prisma.expense.findMany();
  res.json(e);
});

app.post('/api/expenses', async (req, res) => {
  const total = (req.body.toll || 0) + (req.body.other || 0) + (req.body.maintenanceLinkedCost || 0);
  const e = await prisma.expense.create({ data: { ...req.body, total } });
  res.json(e);
});

app.get('/api/fuel', async (req, res) => {
  const f = await prisma.fuelLog.findMany();
  res.json(f);
});

app.post('/api/fuel', async (req, res) => {
  const f = await prisma.fuelLog.create({ data: req.body });
  res.json(f);
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
