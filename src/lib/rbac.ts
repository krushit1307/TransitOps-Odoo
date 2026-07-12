import type { Role } from "./types";

export type Module = "fleet" | "drivers" | "trips" | "expenses" | "analytics";
export type Access = "full" | "view" | "none";

export const rbacMatrix: Record<Role, Record<Module, Access>> = {
  FleetManager:    { fleet: "full", drivers: "full", trips: "none", expenses: "none", analytics: "full" },
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
  return rbacMatrix[role][mod];
}
