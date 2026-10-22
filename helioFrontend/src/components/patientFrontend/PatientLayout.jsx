import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import PatientSidebar from "./PatientSidebar";

const PatientLayout = ({ onSignOut }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      <PatientSidebar collapsed={collapsed} setCollapsed={setCollapsed} onSignOut={onSignOut} />

      <main className={`min-h-screen transition-all duration-300 ease-in-out ${collapsed ? "ml-[88px]" : "ml-[280px]"}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;

