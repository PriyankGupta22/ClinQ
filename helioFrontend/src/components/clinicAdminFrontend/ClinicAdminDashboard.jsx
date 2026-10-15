import React, { useState, useEffect } from "react";
import gsap from "gsap";
// =====================================================
// CLINIC CALENDAR
// =====================================================

const DoctorSelector = () => {
  const [open, setOpen] = useState(false);

  const doctors = [
    "Dr. Aryan Sharma",
    "Dr. Neha Kapoor",
    "Dr. Rahul Verma",
  ];

  const [selectedDoctor, setSelectedDoctor] = useState("General");

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex h-[58px] min-w-[245px] items-center justify-between rounded-full border border-[#3D2B45] bg-[#28172F] px-5 text-left transition-all duration-200 hover:bg-[#32203A]">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#A59CA9]">Doctors</p>
          <p className="mt-[3px] text-[12px] font-semibold text-[#F5F1F6]">{selectedDoctor}</p>
        </div>

        <div className={`ml-5 flex h-[30px] w-[30px] items-center justify-center rounded-[8px] transition-all duration-200 ${open ? "rotate-180" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#C4BAC8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-[66px] z-50 w-full overflow-hidden rounded-[18px] bg-[#28172F] p-2 shadow-[0_15px_40px_rgba(40,23,47,0.22)]">
          <button onClick={() => { setSelectedDoctor("General"); setOpen(false); }} className={`w-full rounded-[12px] px-4 py-3 text-left text-[12px] font-medium transition-all duration-200 ${selectedDoctor === "General" ? "bg-[#3D2B45] text-white" : "text-[#A59CA9] hover:bg-[#32203A] hover:text-[#F0EBF2]"}`}>General</button>

          {doctors.map((doctor) => (
            <button key={doctor} onClick={() => { setSelectedDoctor(doctor); setOpen(false); }} className={`w-full rounded-[12px] px-4 py-3 text-left text-[12px] font-medium transition-all duration-200 ${selectedDoctor === doctor ? "bg-[#3D2B45] text-white" : "text-[#A59CA9] hover:bg-[#32203A] hover:text-[#F0EBF2]"}`}>
              {doctor}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ClinicCalendar = () => {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  // ===================================================
  // CLINIC DAYS
  // ===================================================

  const clinicDays = [
    "2026-09-02",
    "2026-09-04",
    "2026-09-08",
    "2026-09-10",
    "2026-09-12",
    "2026-09-15",
    "2026-09-17",
    "2026-09-19",
    "2026-09-22",
    "2026-09-25",
    "2026-09-28",
  ];

  // ===================================================
  // MONTHS
  // ===================================================

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // ===================================================
  // HELPERS
  // ===================================================

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDay = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (year, month, date) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      date
    ).padStart(2, "0")}`;
  };

  const todayString = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const selectedDateString = formatDate(
    currentYear,
    currentMonth,
    selectedDate
  );

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDay(currentYear, currentMonth);

  const calendarDays = [];

  // Empty spaces before first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Actual dates
  for (let date = 1; date <= daysInMonth; date++) {
    calendarDays.push(date);
  }

  // ===================================================
  // PREVIOUS MONTH
  // ===================================================

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }

    setSelectedDate(1);
  };

  // ===================================================
  // NEXT MONTH
  // ===================================================

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }

    setSelectedDate(1);
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <aside
      className="
        w-[100%]
        rounded-[26px]
        bg-[#28172F]
        p-[17px]
        text-white
      "
    >
      {/* =================================================
          CALENDAR
      ================================================= */}

      <div className="rounded-[18px] bg-white p-[20px]">

        {/* MONTH HEADER */}

        <div className="mb-5 flex items-center justify-between">

          {/* PREVIOUS */}

          <button
            onClick={handlePreviousMonth}
            className="
              flex
              h-[32px]
              w-[32px]
              items-center
              justify-center
              rounded-[9px]
              border
              border-[#E7E4E9]
              bg-[#FAF9FB]
              text-[#756B7B]
              transition
              hover:bg-[#F1EDF3]
            "
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <path
                d="M8 2.5L4 6.5L8 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* MONTH */}

          <div className="text-center">
            <h3 className="text-[16px] font-semibold text-[#28172F]">
              {monthNames[currentMonth]}
            </h3>

            <p className="mt-[2px] text-[9px] font-medium tracking-[1.5px] text-[#A59CA9]">
              {currentYear}
            </p>
          </div>

          {/* NEXT */}

          <button
            onClick={handleNextMonth}
            className="
              flex
              h-[32px]
              w-[32px]
              items-center
              justify-center
              rounded-[9px]
              border
              border-[#E7E4E9]
              bg-[#FAF9FB]
              text-[#756B7B]
              transition
              hover:bg-[#F1EDF3]
            "
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <path
                d="M5 2.5L9 6.5L5 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* WEEK DAYS */}

        <div className="mb-2 grid grid-cols-7">
          {days.map((day) => (
            <div
              key={day}
              className="
                flex
                h-[28px]
                items-center
                justify-center
                text-[8px]
                font-semibold
                tracking-[0.5px]
                text-[#AAA2AE]
              "
            >
              {day}
            </div>
          ))}
        </div>

        {/* DATES */}

        <div className="grid grid-cols-7 gap-y-[5px]">
          {calendarDays.map((date, index) => {

            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-[43px]"
                />
              );
            }

            const dateString = formatDate(
              currentYear,
              currentMonth,
              date
            );

            const isToday = dateString === todayString;

            const isClinicDay = clinicDays.includes(
              dateString
            );

            const isSelected =
              dateString === selectedDateString;

            return (
              <div
                key={date}
                className="
                  flex
                  h-[43px]
                  items-center
                  justify-center
                "
              >
                <button
                  onClick={() => setSelectedDate(date)}
                  className={`
                    relative
                    flex
                    h-[38px]
                    w-[38px]
                    items-center
                    justify-center
                    rounded-full
                    text-[11px]
                    font-semibold
                    transition-all
                    duration-200
                    ${
                      isSelected
                        ? "bg-[#28172F] text-white"
                        : isToday
                        ? "bg-[#28172F] text-white"
                        : isClinicDay
                        ? "bg-[#E9DFEC] text-[#28172F]"
                        : "text-[#655B6B] hover:bg-[#F3F0F4]"
                    }
                  `}
                >
                  {date}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

const PatientStats = () => {
  const totalPatients = 24;
  const completedPatients = 16;
  const remainingPatients = totalPatients - completedPatients;
  const changeFromYesterday = 12;

  return (
    <div className="grid grid-cols-2">
      <div className="col-span-2 w-[250px] rounded-t-[20px] bg-white p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#B9F23D]"></span>
            <span className="text-[10px] font-semibold tracking-[-0.1px] text-[#28172F]">TOTAL PATIENTS</span>
          </div>
          <span className="rounded-full bg-[#EAF5D1] px-2 py-1 text-[8px] font-semibold text-[#66851F]">↑ {changeFromYesterday}%</span>
        </div>

        <div className="mt-5">
          <h2 className="text-[40px] font-medium leading-none tracking-[-2px] text-[#28172F]">{totalPatients}</h2>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#A59CA9]">Today</p>
        </div>

        <div className="mt-7 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#655B6B]">PATIENT FLOW</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.4px] text-[#A59CA9]">Compared to yesterday</p>
        </div>
      </div>

      <div className="rounded-bl-[20px] bg-white p-4">
        <h2 className="text-[32px] font-medium leading-none tracking-[-1.5px] text-[#28172F]">{completedPatients}</h2>
        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[1px] text-[#756A7B]">Completed</p>
        <p className="mt-5 text-[10px] text-[#A59CA9]">Patients served</p>
      </div>

      <div className="rounded-br-[20px] bg-white p-4">
        <h2 className="text-[32px] font-medium leading-none tracking-[-1.5px] text-[#28172F]">{String(remainingPatients).padStart(2, "0")}</h2>
        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[1px] text-[#756A7B]">Remaining</p>
        <p className="mt-5 text-[10px] text-[#A59CA9]">In queue</p>
      </div>
    </div>
  );
};


const WeeklyPatientChart = () => {
  const weeklyData = [
    { day: "Thu", patients: 28 },
    { day: "Fri", patients: 21 },
    { day: "Sat", patients: 14 },
    { day: "Sun", patients: 8 },
    { day: "Mon", patients: 18 },
    { day: "Tue", patients: 24 },
    { day: "Wed", patients: 16 },
    { day: "Thu", patients: 28 },
    { day: "Fri", patients: 21 },
    { day: "Sat", patients: 14 },
    { day: "Sun", patients: 8 },
  ];

  const maxPatients = Math.max(...weeklyData.map((item) => item.patients));

  useEffect(() => {
    gsap.fromTo(".weekly-chart-bar", { scaleY: 0, transformOrigin: "bottom" }, { scaleY: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 });
  }, []);

  return (
    <div className="h-[335px] min-w-[550px] flex-1 rounded-[20px] bg-white px-6 pt-4.5 pb-1">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#28172F]"></span>
            <span className="text-[10px] font-semibold tracking-[-0.1px] text-[#28172F]">PATIENT ANALYTICS</span>
          </div>
          <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#28172F]">Patients from last 10 days</h3>
        </div>

        <span className="rounded-full bg-[#E9DFEC] px-3 py-1.5 text-[8px] font-semibold text-[#28172F]">LAST 10 DAYS</span>
      </div>

      <div className="mt-7 flex h-[170px] items-end justify-between gap-3 px-2">
        {weeklyData.map((item, index) => {
          const height = (item.patients / maxPatients) * 100;
          const isHighest = item.patients === maxPatients;

          return (
            <div key={`${item.day}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end">
              <div className="mb-2 text-[8px] font-semibold text-[#A59CA9]">{item.patients}</div>

              <div className="flex h-[130px] w-full items-end justify-center">
                <div className={`weekly-chart-bar min-w-[35px] max-w-[42px] rounded-full ${isHighest ? "bg-[#CBBBD0]" : "bg-[#28172F]"}`} style={{ height: `${height}%` }}></div>
              </div>

              <span className="mt-3 text-[8px] font-semibold uppercase tracking-[0.5px] text-[#A59CA9]">{item.day}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#A59CA9]">Total Patients</p>
          <p className="mt-1 text-[18px] font-semibold tracking-[-0.5px] text-[#28172F]">{weeklyData.reduce((total, item) => total + item.patients, 0)}</p>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#A59CA9]">Peak Day</p>
          <p className="mt-1 text-[11px] font-semibold text-[#28172F]">Thursday · 28</p>
        </div>
      </div>
    </div>
  );
};

const QueueOverview = () => {
  const appointments = [
    { time: "09:30 AM", name: "Rahul Sharma", condition: "Fever & Cold", token: "01", status: "Completed" },
    { time: "10:00 AM", name: "Ananya Singh", condition: "Migraine", token: "02", status: "Completed" },
    { time: "10:30 AM", name: "Vikash Kumar", condition: "Blood Pressure", token: "03", status: "Remaining" },
  ];

  return (
    <div className="mt-4 w-full py-[1px]">
      <div className="w-full rounded-[20px] bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-[9px] w-[9px] rounded-[2px] bg-[#CBBBD0]"></span>
              <span className="text-[9px] font-semibold tracking-[0.2px] text-[#28172F]">APPOINTMENTS</span>
            </div>
            <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#28172F]">Upcoming Today</h3>
          </div>

          <span className="text-[9px] font-medium text-[#A59CA9]">4 appointments</span>
        </div>

        <div className="mt-6">
          {appointments.map((appointment) => (
            <div key={appointment.token} className="mb-3 flex w-full items-center gap-4 rounded-full border border-black/7 px-5 py-3">
              <div className="w-[45px] min-w-[45px] text-center">
                <p className="text-[22px] font-semibold text-[#28172F]">{appointment.token}</p>
              </div>

              <div className="flex h-[45px] w-[45px] min-w-[45px] items-center justify-center rounded-full bg-[#E9DFEC] text-[10px] font-semibold text-[#28172F]">
                {appointment.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-[#28172F]">{appointment.name}</p>
                <p className="mt-1 truncate text-[9px] text-[#A59CA9]">{appointment.condition}</p>
              </div>

              <div className="flex min-w-[210px] items-center justify-end gap-6">
                <span className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.5px] ${appointment.status === "Completed" ? "bg-[#EAF5D1] text-[#222d08]" : "bg-[#F4E9B9] text-[#806A00]"}`}>
                  {appointment.status}
                </span>

                <p className="whitespace-nowrap text-[18px] font-semibold text-[#28172F]">{appointment.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RightSideControls = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setDarkMode(!darkMode)} className="flex h-[42px] w-[76px] items-center justify-between rounded-full border border-[#E4E0E6] bg-white p-1.5 shadow-[0_2px_8px_rgba(40,23,47,0.04)] transition-all duration-300">
        <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-[13px] transition-all duration-300 ${!darkMode ? "bg-[#28172F] text-white" : "text-[#A59CA9]"}`}>☀</span>
        <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-[13px] transition-all duration-300 ${darkMode ? "bg-[#28172F] text-white" : "text-[#A59CA9]"}`}>☾</span>
      </button>
    </div>
  );
};

const DoctorAvailability = () => {
  const doctors = [
    { name: "Dr. Aryan Sharma", specialty: "General Physician", status: "Available", initial: "A" },
    { name: "Dr. Neha Kapoor", specialty: "Dermatologist", status: "With Patient", initial: "N" },
    { name: "Dr. Rahul Verma", specialty: "Cardiologist", status: "Available", initial: "R" },
    { name: "Dr. Priya Mehta", specialty: "Pediatrician", status: "On Break", initial: "P" },
  ];

  return (
    <div className="w-[25%] min-w-[375px] max-w-[410px] rounded-[20px] bg-white border p-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#28172F]"></span>
            <span className="text-[9px] font-semibold tracking-[0.2px] text-[#28172F]">DOCTORS</span>
          </div>
          <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.5px] text-[#28172F]">Doctor Availability</h3>
        </div>

        <span className="rounded-full bg-[#E9DFEC] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.5px] text-[#28172F]">4 Active</span>
      </div>

      <div className="mt-5">
        {doctors.map((doctor, index) => (
          <div key={doctor.name} className={`flex items-center gap-3 py-3 ${index !== doctors.length - 1 ? "border-b border-[#F0EDF1]" : ""}`}>
            <div className="flex h-[38px] w-[38px] min-w-[38px] items-center justify-center rounded-full bg-[#E9DFEC] text-[10px] font-semibold text-[#28172F]">{doctor.initial}</div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-[#28172F]">{doctor.name}</p>
              <p className="mt-1 truncate text-[8px] text-[#A59CA9]">{doctor.specialty}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`h-[6px] w-[6px] rounded-full ${doctor.status === "Available" ? "bg-[#91C52F]" : doctor.status === "With Patient" ? "bg-[#D5B44A]" : "bg-[#B0A7B2]"}`}></span>
              <span className={`whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.3px] ${doctor.status === "Available" ? "text-[#66851F]" : doctor.status === "With Patient" ? "text-[#9A7B12]" : "text-[#8D838F]"}`}>{doctor.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =====================================================
// CLINIC ADMIN DASHBOARD
// =====================================================

const ClinicAdminDashboard = () => {
  return (
    <div className="min-h-screen bg-white p-[15px]">
      <div className = "flex h-full min-w-full flex-row items-center gap-4">
        <div className = "flex h-full min-w-0 flex-1 flex-col items-stretch justify-between">
            <DoctorSelector />
            <div className = "flex w-full min-w-0 flex-row items-center gap-4">
                <div className="shrink-0"><PatientStats /></div>
                <WeeklyPatientChart />
            </div>
            <QueueOverview />
        </div>
        <div className = "flex w-[400px] min-w-[400px] shrink-0 flex-col items-center justify-between">
            <ClinicCalendar />
            <DoctorAvailability />
        </div>
      </div>
    </div>
  );
};

export default ClinicAdminDashboard;
