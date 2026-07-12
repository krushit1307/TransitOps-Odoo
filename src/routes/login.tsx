import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { Truck, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/store";
import type { Role } from "@/lib/types";
import { roleLabel } from "@/lib/rbac";



export default function LoginPage() {
  const login = useAuth((s) => s.login);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [email, setEmail] = useState("ops@transitops.demo");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole] = useState<Role>("Dispatcher");
  const [remember, setRemember] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const locked = attempts >= 5;

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    const trimmedEmail = email.trim();
    if (trimmedEmail.length < 3 || password.length < 3) {
      const n = attempts + 1;
      setAttempts(n);
      setError(n >= 5 ? "Account locked after 5 failed attempts." : "Enter an email/username and password (min 3 characters).");
      return;
    }
    setError(null);
    login(trimmedEmail.includes("@") ? trimmedEmail : `${trimmedEmail}@transitops.demo`, role);
    navigate("/dashboard");
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left */}
      <div className="hidden lg:flex flex-col justify-between bg-secondary p-12 border-r border-line">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-md bg-primary grid place-items-center text-primary-foreground">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-none">TransitOps</div>
              <div className="text-[10px] text-slate mt-1 tracking-widest uppercase">Control Tower</div>
            </div>
          </div>
          <div className="mt-2 h-[2px] w-32 dashed-route" />

          <p className="mt-10 text-sm text-slate">Smart Transport Operations Platform</p>
          <h2 className="font-display text-3xl font-bold mt-2 max-w-sm leading-tight">
            One console for fleet, dispatch, and depot operations.
          </h2>

          <div className="mt-10">
            <div className="label-caps mb-3">One login, four roles</div>
            <ul className="space-y-2 text-sm">
              {(["FleetManager", "Dispatcher", "SafetyOfficer", "FinancialAnalyst"] as Role[]).map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {roleLabel[r]}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-xs text-slate">TransitOps © 2026 · RBAC Enabled</div>
      </div>

      {/* Right */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-surface">
        <form onSubmit={onSubmit} className="w-full max-w-md">
          <h1 className="font-display text-2xl font-bold">Sign in to your account</h1>
          <p className="text-sm text-slate mt-1">Demo credentials are pre-filled — pick a role and click Sign In.</p>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="label-caps block mb-1.5">Email / Username</label>
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded-md border border-line bg-canvas px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" />
            </div>
            <div>
              <label className="label-caps block mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 rounded-md border border-line bg-canvas px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" />
            </div>
            <div>
              <label className="label-caps block mb-1.5">Role (RBAC)</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}
                className="w-full h-10 rounded-md border border-line bg-canvas px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50">
                <option value="FleetManager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="SafetyOfficer">Safety Officer</option>
                <option value="FinancialAnalyst">Financial Analyst</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-line" />
                Remember me
              </label>
              <a href="#" className="text-primary hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={locked}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed shadow-[var(--shadow-e2)]"
            >{locked ? "Locked" : "Sign In"}</button>
          </div>

          <div className="mt-8 border-t border-line pt-5">
            <div className="label-caps mb-2">Access is scoped by role after login</div>
            <ul className="text-xs text-slate space-y-1">
              <li>Fleet Manager → Fleet, Maintenance</li>
              <li>Dispatcher → Dashboard, Trips</li>
              <li>Safety Officer → Drivers, Compliance</li>
              <li>Financial Analyst → Fuel &amp; Expenses, Analytics</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}
