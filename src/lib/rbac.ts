import type { Role } from "./types";
import { useData } from "./store";

export type Module = "fleet" | "drivers" | "trips" | "expenses" | "analytics";
export type Access = "full" | "view" | "none";

export const rbacMatrix: Record<Role, Record<Module, Access>> = {
  FleetManager:    { fleet: "full", drivers: "full", trips: "full", expenses: "full", analytics: "full" },
  Dispatcher:      { fleet: "view", drivers: "none", trips: "full", expenses: "none", analytics: "none" },
  SafetyOfficer:   { fleet: "none", drivers: "full", trips: "view", expenses: "none", analytics: "none" },
  FinancialAnalyst:{ fleet: "view", drivers: "none", trips: "none", expenses: "full", analytics: "full" },
};

export const roleLabel: Record<Role, string> = {
  FleetManager: "Fleet Manager",
  Dispatcher: "Dispatcher",
  SafetyOfficer: "Safety Officer",
  FinancialAnalyst: "Financial Analyst",
};

export function can(role: Role | undefined, mod: Module): Access {
  if (!role) return "none";
  try {
    const dynamicMatrix = useData.getState().rbacMatrix;
    if (dynamicMatrix && dynamicMatrix[role]) {
      return dynamicMatrix[role][mod];
    }
  } catch (e) {
    // Ignore and fallback
  }
  return rbacMatrix[role][mod];
}

