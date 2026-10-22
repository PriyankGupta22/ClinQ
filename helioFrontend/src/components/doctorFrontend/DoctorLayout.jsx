import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import { DoctorClinicProvider } from "./DoctorClinicContext";

const DoctorLayout = ({ onSignOut }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <DoctorClinicProvider>
      <div className="min-h-screen bg-[#F8F9FB]">
        <DoctorSidebar collapsed={collapsed} setCollapsed={setCollapsed} onSignOut={onSignOut} />

        <main className={`min-h-screen transition-all duration-300 ease-in-out ${collapsed ? "ml-[88px]" : "ml-[280px]"}`}>
          <Outlet />
        </main>
      </div>
    </DoctorClinicProvider>
  );
};

export default DoctorLayout;
