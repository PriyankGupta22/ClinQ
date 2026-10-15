import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ClinicAdminSidebar from "./ClinicAdminSidebar";

const ClinicAdminLayout = ({ onSignOut }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <ClinicAdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onSignOut={onSignOut}
      />

      <main
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? "ml-[88px]" : "ml-[280px]"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default ClinicAdminLayout;
