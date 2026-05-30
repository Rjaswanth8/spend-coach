// Dashboard.jsx
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardHome from "./DashboardHome";
import Transactions from "./Transactions";

import Analytics from "./Analytics";

import { AICoach, Goals, Profile } from "./OtherPages";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.split("/").pop() || "dashboard";

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
    >
      <Sidebar
        active={activeTab}
        onChange={(tab) =>
          navigate(tab === "dashboard" ? "/dashboard" : `/dashboard/${tab}`)
        }
      />
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 36px",
          minWidth: 0,
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <DashboardHome
                onNavigate={(tab) =>
                  navigate(
                    tab === "dashboard" ? "/dashboard" : `/dashboard/${tab}`,
                  )
                }
              />
            }
          />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/coach" element={<AICoach />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}
