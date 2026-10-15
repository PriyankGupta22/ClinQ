import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdMenu } from "react-icons/io";
import gsap from "gsap";

// =====================================================
// MENU ITEMS
// =====================================================

const menuItems = [
  {
    number: "01",
    name: "Dashboard",
    path: "/clinic/dashboard",
  },
  {
    number: "02",
    name: "Doctors",
    path: "/clinic/doctors",
  },
  {
    number: "03",
    name: "Appointments",
    path: "/clinic/appointments",
  },
  {
    number: "04",
    name: "Queues",
    path: "/clinic/queues",
  },
  {
    number: "05",
    name: "Patients",
    path: "/clinic/patients",
  },
  {
    number: "06",
    name: "Messages",
    path: "/clinic/messages",
    badge: 3,
  },
  {
    number: "07",
    name: "Profile",
    path: "/clinic/profile",
  },
];

// =====================================================
// CLINIC SIDEBAR
// =====================================================

const ClinicAdminSidebar = ({ collapsed, setCollapsed, onSignOut }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [time, setTime] = useState(new Date());

  const location = useLocation();
  const navigate = useNavigate();

  const menuRefs = useRef([]);
  const tooltipRef = useRef(null);

  // ===================================================
  // LIVE CLOCK
  // ===================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ===================================================
  // FORMAT TIME
  // ===================================================

  const formattedTime = time.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // ===================================================
  // ROUTE ENTRY ANIMATION
  // ===================================================

  useEffect(() => {
    gsap.fromTo(
      menuRefs.current,
      {
        x: -40,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.2,
      }
    );
  }, []);

  // ===================================================
  // TOOLTIP GSAP ANIMATION
  // ===================================================

  useEffect(() => {
    if (!collapsed || hoveredItem === null || !tooltipRef.current) {
      return;
    }

    gsap.fromTo(
      tooltipRef.current,
      {
        x: -15,
        opacity: 0,
        scale: 0.95,
      },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.22,
        ease: "power2.out",
      }
    );
  }, [hoveredItem, collapsed]);

  // ===================================================
  // CHECK ACTIVE ROUTE
  // ===================================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ===================================================
  // NAVIGATION
  // ===================================================

  const handleNavigation = (path) => {
    navigate(path);
    setHoveredItem(null);
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <aside
      className={`
        fixed
        left-0
        top-0
        z-50
        h-screen
        ${collapsed ? "w-[88px]" : "w-[280px]"}
        bg-[#28172F]
        border-r
        border-[#3D2B45]
        text-white
        flex
        flex-col
        px-5
        py-7
        overflow-visible
        transition-all
        duration-300
        ease-in-out
      `}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className={`
          flex
          items-center
          ${collapsed ? "justify-center" : "justify-between"}
          h-[40px]
        `}
      >
        {/* CLINQUEUE */}

        {!collapsed && (
          <h1
            className="
              text-[21px]
              font-semibold
              tracking-[-0.7px]
              text-[#F4EFF5]
            "
          >
            ClinQueue
          </h1>
        )}

        {/* TOGGLE */}

        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          className="
            flex
            h-[36px]
            w-[42px]
            items-center
            justify-center
            rounded-[8px]
            text-[#B6AABD]
            transition-all
            duration-200
            hover:text-white
          "
        >
          <span className="text-[17px] font-semibold">
            <IoMdMenu />
          </span>
        </button>
      </div>

      {/* =================================================
          CLINIC PROFILE
      ================================================= */}

      <div
        className={`
          mt-11
          flex
          items-center
          ${collapsed ? "justify-center" : "gap-3"}
        `}
      >
        {/* PROFILE CIRCLE */}

        <div
          className="
            flex
            h-[42px]
            w-[42px]
            min-w-[42px]
            items-center
            justify-center
            rounded-full
            border
            border-[#66536D]
            bg-[#382541]
            text-[15px]
            font-semibold
            text-[#E8E0EB]
          "
        >
          C
        </div>

        {/* CLINIC NAME */}

        {!collapsed && (
          <div>
            <h3
              className="
                text-[13px]
                font-semibold
                text-[#EEE8F0]
              "
            >
              City Care Clinic
            </h3>

            <p
              className="
                mt-1
                text-[10px]
                text-[#A091A8]
              "
            >
              Clinic Admin
            </p>
          </div>
        )}
      </div>

      {/* =================================================
          MENU
      ================================================= */}

      <nav className="mt-10">
        {/* MENU LABEL */}

        {!collapsed && (
          <p
            className="
              mb-4
              ml-1
              text-[9px]
              font-bold
              tracking-[2px]
              text-[#806D88]
            "
          >
            MENU
          </p>
        )}

        <div className="relative">
          {menuItems.map((item, index) => {
            const active = isActive(item.path);

            return (
              <div
                key={item.path}
                ref={(el) => {
                  menuRefs.current[index] = el;
                }}
                className="relative"
              >
                {/* MENU BUTTON */}

                <button
                  onClick={() => handleNavigation(item.path)}
                  onMouseEnter={() => {
                    if (collapsed) {
                      setHoveredItem(index);
                    }
                  }}
                  onMouseLeave={() => {
                    if (collapsed) {
                      setHoveredItem(null);
                    }
                  }}
                  className={`
                    group
                    mb-2
                    flex
                    h-[50px]
                    w-full
                    items-center
                    rounded-[10px]
                    transition-all
                    duration-200
                    ${collapsed ? "justify-center" : "justify-start gap-5 px-3"}
                    ${active ? "bg-[#382541] text-white" : "text-[#A091A8] hover:bg-[#32203A] hover:text-[#E9E3EB]"}
                  `}
                >
                  {/* NUMBER */}

                  <span
                    className={`
                      text-[18px]
                      font-semibold
                      tracking-[-0.5px]
                      transition-colors
                      duration-200
                      ${active ? "text-[#F0EAF2]" : "text-[#806C88] group-hover:text-[#B9ADBE]"}
                    `}
                  >
                    {item.number}
                  </span>

                  {/* ROUTE NAME */}

                  {!collapsed && (
                    <span
                      className="
                        text-[12px]
                        font-medium
                      "
                    >
                      {item.name}
                    </span>
                  )}

                  {/* BADGE */}

                  {!collapsed && item.badge && (
                    <span
                      className="
                        ml-auto
                        text-[9px]
                        font-semibold
                        text-[#A493AB]
                      "
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* =================================================
                    CUSTOM TOOLTIP
                ================================================= */}

                {collapsed && hoveredItem === index && (
                  <div
                    ref={tooltipRef}
                    className="
                      absolute
                      left-[72px]
                      top-[3px]
                      z-[100]
                      whitespace-nowrap
                      rounded-[8px]
                      border
                      border-[#4B3853]
                      bg-[#32203A]
                      px-4
                      py-2.5
                      shadow-xl
                      pointer-events-none
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          text-[11px]
                          font-semibold
                          text-[#8F7C97]
                        "
                      >
                        {item.number}
                      </span>

                      <span
                        className="
                          text-[12px]
                          font-medium
                          text-[#EAE4EC]
                        "
                      >
                        {item.name}
                      </span>

                      {item.badge && (
                        <span
                          className="
                            text-[9px]
                            text-[#A493AB]
                          "
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* =================================================
          BOTTOM SECTION
      ================================================= */}

      <div className="mt-auto">
        {/* =================================================
            LARGE DIGITAL CLOCK
        ================================================= */}

        {!collapsed && (
          <div
            className="
              mb-7
              flex
              flex-col
              items-center
            "
          >
            {/* TIME */}

            <div
              className="
                text-[29px]
                font-semibold
                tracking-[1px]
                text-[#E7E0E9]
                tabular-nums
              "
            >
              {formattedTime}
            </div>

            {/* LABEL */}

            <p
              className="
                mt-1
                text-[9px]
                font-medium
                tracking-[2px]
                text-[#806D88]
              "
            >
              LOCAL TIME
            </p>
          </div>
        )}

        {/* =================================================
            SIGN OUT
        ================================================= */}

        <button
          onClick={onSignOut}
          className={`
            flex
            h-[50px]
            w-full
            items-center
            rounded-[10px]
            text-[#9B8AA3]
            transition-all
            duration-200
            hover:bg-[#32203A]
            hover:text-[#E7E0E9]
            ${collapsed ? "justify-center" : "justify-start gap-5 px-3"}
          `}
        >
          {/* NUMBER */}

          <span
            className="
              text-[18px]
              font-semibold
            "
          >
            08
          </span>

          {/* NAME */}

          {!collapsed && (
            <span
              className="
                text-[12px]
                font-medium
              "
            >
              Sign Out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default ClinicAdminSidebar;
