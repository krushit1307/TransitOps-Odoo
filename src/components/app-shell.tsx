import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Truck, Users, Route as RouteIcon, Wrench,
  Receipt, BarChart3, Settings as SettingsIcon, Search, LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/store";
import { can, roleLabel, type Module } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface NavItem { to: string; label: string; icon: typeof Truck; mod: Module | null }

const NAV: NavItem[] = [
  { to: "/dashboard",   label: "Dashboard",       icon: LayoutDashboard, mod: null },
  { to: "/fleet",       label: "Fleet",           icon: Truck,           mod: "fleet" },
  { to: "/drivers",     label: "Drivers",         icon: Users,           mod: "drivers" },
  { to: "/trips",       label: "Trips",           icon: RouteIcon,       mod: "trips" },
  { to: "/maintenance", label: "Maintenance",     icon: Wrench,          mod: "fleet" },
  { to: "/expenses",    label: "Fuel & Expenses", icon: Receipt,         mod: "expenses" },
  { to: "/analytics",   label: "Analytics",       icon: BarChart3,       mod: "analytics" },
  { to: "/settings",    label: "Settings",        icon: SettingsIcon,    mod: null },
];

export function AppShell({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initials = user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "OP";

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-surface/95 backdrop-blur-sm border-r border-line flex flex-col">

        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#06B6D4] grid place-items-center text-white shadow-[0_6px_16px_-4px_rgb(109_40_217_/_0.5)]">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display font-bold text-base leading-none">TransitOps</div>
              <div className="text-[10px] text-slate mt-1 tracking-wider uppercase">Control Tower</div>
            </div>
          </div>
        </div>
        <div className="mx-5 h-[2px] dashed-route" />
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const access = item.mod ? can(user?.role, item.mod) : "full";
            if (access === "none") return null;
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-ink bg-gradient-to-r from-[rgb(109_40_217_/_0.12)] to-[rgb(6_182_212_/_0.10)]"
                    : "text-slate hover:text-ink hover:bg-secondary"
                )}
              >
                {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-gradient-to-b from-[#6D28D9] to-[#06B6D4]" />}
                <Icon className={cn("h-4 w-4", active && "text-[#6D28D9]")} />
                <span>{item.label}</span>
                {access === "view" && <span className="ml-auto text-[9px] label-caps">view</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-line">
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-2 text-xs text-slate hover:text-ink transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="glass-topbar h-14 px-6 flex items-center gap-4 sticky top-0 z-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
            <input
              type="text"
              placeholder="Search vehicles, drivers, trips…"
              className="w-full h-9 rounded-[10px] border border-line bg-white/70 backdrop-blur-sm pl-9 pr-3 text-sm placeholder:text-slate focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
            <span className="rounded-full bg-gradient-to-r from-[rgb(109_40_217_/_0.14)] to-[rgb(6_182_212_/_0.14)] text-[#6D28D9] text-xs font-medium px-2.5 py-0.5">
              {user ? roleLabel[user.role] : ""}
            </span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#06B6D4] text-white grid place-items-center text-xs font-semibold font-mono shadow-[0_4px_12px_-4px_rgb(109_40_217_/_0.5)]">
              {initials}
            </div>
          </div>
        </header>
        <main key={pathname} className="flex-1 overflow-auto p-6 fade-in">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold gradient-text">{title}</h1>
        {subtitle && <p className="text-sm text-slate mt-1">{subtitle}</p>}
        <div className="mt-3 h-[2px] w-24 dashed-route" />
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
