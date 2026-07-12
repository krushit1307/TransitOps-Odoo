import { useNavigate, Outlet } from "react-router-dom";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth, useData } from "@/lib/store";


export default function AppLayout() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    useData.getState().fetchData();
  }, []);
  useEffect(() => {
    if (mounted && !user) navigate("/login");
  }, [mounted, user, navigate]);

  if (!mounted) return null;
  if (!user) return null;
  return <AppShell><Outlet /></AppShell>;
}
