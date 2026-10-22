import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdMenu } from "react-icons/io";
import gsap from "gsap";
import AuthenticatedIdentity from "../AuthenticatedIdentity";


// =====================================================
// MENU ITEMS
// =====================================================

const menuItems = [
  {
    number: "01",
    name: "Dashboard",
    path: "/doctor/dashboard",
  },
  {
    number: "02",
    name: "Clinics",
    path: "/doctor/clinics",
  },
  {
    number: "03",
    name: "Queues",
    path: "/doctor/queues",
  },
  {
    number: "04",
    name: "Messages",
    path: "/doctor/messages",
    badge: 3,
  },
  {
    number: "05",
    name: "Prescriptions",
    path: "/doctor/prescriptions",
  },
  {
    number: "06",
    name: "Profile",
    path: "/doctor/profile",
  },
];


// =====================================================
// DOCTOR SIDEBAR
// =====================================================

const DoctorSidebar = ({ onSignOut }) => {

  const [collapsed, setCollapsed] = useState(false);
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
  // Every menu item comes after 0.2 seconds
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

    if (
      !collapsed ||
      hoveredItem === null ||
      !tooltipRef.current
    ) {
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

        bg-[#17213F]

        border-r
        border-[#2A3658]

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
              text-[#F0F2F6]
            "
          >
            ClinQueue
          </h1>

        )}

        {/* RECTANGULAR TOGGLE */}

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

            text-[#AAB4C8]

            transition-all
            duration-200

            hover:text-white
          "
        >

          {collapsed ? (

            <span className="text-[17px] font-semibold">
              <IoMdMenu />
            </span>

          ) : (

            <span className="text-[17px] font-semibold">
              <IoMdMenu />
            </span>

          )}

        </button>

      </div>


      {/* =================================================
          DOCTOR PROFILE
      ================================================= */}

      <AuthenticatedIdentity role="doctor">{doctor => {
        const name = typeof doctor?.name === "string" ? doctor.name.trim() : "";
        const specialization = typeof doctor?.specialization === "string" ? doctor.specialization.trim() : "";
        const nameParts = name.replace(/^dr\.?\s+/i, "").split(/\s+/).filter(Boolean);
        const initials = nameParts.length ? `${Array.from(nameParts[0])[0]}${nameParts.length > 1 ? Array.from(nameParts.at(-1))[0] : ""}`.toLocaleUpperCase() : "?";
        return (
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
            border-[#526080]

            bg-[#263354]

            text-[15px]
            font-semibold

            text-[#E0E5EF]
          "
        >
          {initials}
        </div>


        {/* DOCTOR NAME */}

        {!collapsed && (

          <div>

            <h3
              className="
                text-[13px]
                font-semibold
                text-[#E7EAF1]
              "
            >
              {name || "Doctor unavailable"}
            </h3>


            <p
              className="
                mt-1
                text-[10px]
                text-[#8995B0]
              "
            >
              {specialization || "Specialization unavailable"}
            </p>

          </div>

        )}

      </div>
        );
      }}</AuthenticatedIdentity>


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

              text-[#66738F]
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

                    ${
                      collapsed
                        ? "justify-center"
                        : "justify-start gap-5 px-3"
                    }

                    ${
                      active
                        ? "bg-[#263354] text-white"
                        : "text-[#8995B0] hover:bg-[#202C4B] hover:text-[#E1E5EE]"
                    }
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

                      ${
                        active
                          ? "text-[#E5E9F1]"
                          : "text-[#697792] group-hover:text-[#AAB4C8]"
                      }
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

                        text-[#8794AF]
                      "
                    >
                      {item.badge}
                    </span>

                  )}

                </button>


                {/* =================================================
                    CUSTOM TOOLTIP
                ================================================= */}

                {collapsed &&
                  hoveredItem === index && (

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
                        border-[#34415F]

                        bg-[#202C4B]

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
                            text-[#7785A1]
                          "
                        >
                          {item.number}
                        </span>


                        <span
                          className="
                            text-[12px]
                            font-medium
                            text-[#E4E8F0]
                          "
                        >
                          {item.name}
                        </span>


                        {item.badge && (

                          <span
                            className="
                              text-[9px]
                              text-[#8995B0]
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

                text-[#DCE2ED]

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

                text-[#687590]
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

            text-[#7F8BA4]

            transition-all
            duration-200

            hover:bg-[#202C4B]
            hover:text-[#DCE1EC]

            ${
              collapsed
                ? "justify-center"
                : "justify-start gap-5 px-3"
            }
          `}
        >


          {/* NUMBER */}

          <span
            className="
              text-[18px]
              font-semibold
            "
          >
            06
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

export default DoctorSidebar;
