import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./routes/_app";
import Dashboard from "./routes/_app.dashboard";
import Fleet from "./routes/_app.fleet";
import Drivers from "./routes/_app.drivers";
import Trips from "./routes/_app.trips";
import Maintenance from "./routes/_app.maintenance";
import Expenses from "./routes/_app.expenses";
import Analytics from "./routes/_app.analytics";
import Settings from "./routes/_app.settings";
import Login from "./routes/login";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
