import React, { useState, useEffect } from "react";
import gsap from "gsap";

const ClinicSelector = () => {
  const [open, setOpen] = useState(false);

  const clinics = [
    "City Care Clinic",
    "MedPlus Clinic",
    "HealthPoint Clinic",
  ];

  const [selectedClinic, setSelectedClinic] = useState("General");

  return (
    <div className="relative">
      {/* Clinic Selector */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          h-[58px]
          min-w-[245px]
          items-center
          justify-between
          rounded-full
          border
          border-[#35645E]
          bg-[#17312E]
          px-5
          text-left
          transition-all
          duration-200
          hover:bg-[#1C2748]
        "
      >
        {/* Left Content */}
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#8C98B1]">
            Clinics
          </p>

          <p className="mt-[3px] text-[12px] font-semibold text-[#F0F2F6]">
            {selectedClinic}
          </p>
        </div>

        {/* Arrow Rectangle */}
        <div
          className={`
            ml-5
            flex
            h-[30px]
            w-[30px]
            items-center
            justify-center
            rounded-[8px]
           
            transition-all
            duration-200
            ${open ? "rotate-180" : ""}
          `}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="#B6C0D2"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute
            left-0
            top-[66px]
            z-50
            w-full
            overflow-hidden
            rounded-[18px]
           
            bg-[#17312E]
            p-2
            shadow-[0_15px_40px_rgba(15,25,50,0.18)]
          "
        >
          {/* General */}
          <button
            onClick={() => {
              setSelectedClinic("General");
              setOpen(false);
            }}
            className={`
              w-full
              rounded-[12px]
              px-4
              py-3
              text-left
              text-[12px]
              font-medium
              transition-all
              duration-200
              ${
                selectedClinic === "General"
                  ? "bg-[#244D49] text-white"
                  : "text-[#9AA6BC] hover:bg-[#1E413D] hover:text-[#E5E9F1]"
              }
            `}
          >
            General
          </button>

          {/* Clinics */}
          {clinics.map((clinic) => (
            <button
              key={clinic}
              onClick={() => {
                setSelectedClinic(clinic);
                setOpen(false);
              }}
              className={`
                w-full
                rounded-[12px]
                px-4
                py-3
                text-left
                text-[12px]
                font-medium
                transition-all
                duration-200
                ${
                  selectedClinic === clinic
                    ? "bg-[#244D49] text-white"
                    : "text-[#9AA6BC] hover:bg-[#1E413D] hover:text-[#E5E9F1]"
                }
              `}
            >
              {clinic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const SchedulePanel = () => {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [selectedDate, setSelectedDate] = useState(today.getDate());

  /*
    Ye dates hain jin din patient clinic mein gaya hai.

    Format:
    "YYYY-MM-DD"
  */
  const patientClinicDays = [
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

  const appointmentData = {
    "2026-09-17": [
      {
        name: "Rahul Sharma",
        condition: "Fever & Cold",
        time: "09:30 AM",
        status: "Waiting",
        avatar: "R",
      },
      {
        name: "Ananya Singh",
        condition: "Migraine",
        time: "10:00 AM",
        status: "Waiting",
        avatar: "A",
      },
      {
        name: "Vikash Kumar",
        condition: "Blood Pressure",
        time: "10:30 AM",
        status: "Next",
        avatar: "V",
      },
      {
        name: "Neha Gupta",
        condition: "General Checkup",
        time: "11:00 AM",
        status: "Upcoming",
        avatar: "N",
      },
    ],

    "2026-09-19": [
      {
        name: "Aman Verma",
        condition: "Cough & Fever",
        time: "09:30 AM",
        status: "Waiting",
        avatar: "A",
      },
      {
        name: "Priya Mehta",
        condition: "Headache",
        time: "10:00 AM",
        status: "Next",
        avatar: "P",
      },
    ],

    "2026-09-22": [
      {
        name: "Rohan Gupta",
        condition: "Back Pain",
        time: "09:00 AM",
        status: "Waiting",
        avatar: "R",
      },
      {
        name: "Simran Kaur",
        condition: "General Checkup",
        time: "09:30 AM",
        status: "Waiting",
        avatar: "S",
      },
      {
        name: "Karan Singh",
        condition: "Diabetes",
        time: "10:30 AM",
        status: "Next",
        avatar: "K",
      },
    ],
  };

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

  // Previous month
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }

    setSelectedDate(1);
  };

  // Next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }

    setSelectedDate(1);
  };

  const selectedAppointments = appointmentData[selectedDateString] || [];

  return (
    <aside
      className="
        w-[25%]
        min-h-[calc(100vh-20px)]
        rounded-[26px]
        bg-[#17312E]
        p-[17px]
        text-white
        absolute
        right-[10px]
        top-[10px]
      "
    >
      {/* ================= HEADER ================= */}

     

      {/* ================= CALENDAR ================= */}

      <div className="rounded-[18px] bg-white p-[20px]">

        {/* Month Header */}

        <div className="mb-5 flex items-center justify-between">

          {/* Previous */}

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
              border-[#E7E9EE]
              bg-[#F8F9F7]
              text-[#657089]
              transition
              hover:bg-[#EEF1F6]
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

          {/* Month */}

          <div className="text-center">
            <h3 className="text-[16px] font-semibold text-[#17312E]">
              {monthNames[currentMonth]}
            </h3>

            <p className="mt-[2px] text-[9px] font-medium tracking-[1.5px] text-[#A0A7B5]">
              {currentYear}
            </p>
          </div>

          {/* Next */}

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
              border-[#E7E9EE]
              bg-[#F8F9F7]
              text-[#657089]
              transition
              hover:bg-[#EEF1F6]
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

        {/* Week Days */}

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
                text-[#A4AAB6]
              "
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dates */}

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

            const isClinicDay =
              patientClinicDays.includes(dateString);

            const isSelected =
              dateString === selectedDateString;

            return (
              <div
                key={date}
                className="flex h-[43px] items-center justify-center"
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
                        ? "bg-[#202D55] text-white"
                        : isToday
                        ? "bg-[#202D55] text-white"
                        : isClinicDay
                        ? "bg-[#DCE8FA] text-[#202D55]"
                        : "text-[#59647A] hover:bg-[#F1F3F7]"
                    }
                  `}
                >
                  {date}

                  {/* Clinic day indicator */}

                  {/* {isClinicDay && !isSelected && (
                    <span
                      className="
                        absolute
                        bottom-[4px]
                        h-[3px]
                        w-[3px]
                        rounded-full
                        bg-[#6E8FC5]
                      "
                    />
                  )} */}
                </button>
              </div>
            );
          })}

        </div>

        {/* Legend */}

        
      </div>

      {/* ================= QUEUE ================= */}

      <div className="mt-7">

        <div className="mb-4 flex items-end justify-between">

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[1.8px] text-[#71809D]">
              QUEUE FOR THE DAY
            </p>

            
          </div>

          <span className="text-[10px] font-medium text-[#7E8AA6]">
            {selectedDate} {monthNames[currentMonth].slice(0, 3)}
          </span>

        </div>

        {/* Appointments */}

        <div className="space-y-2.5">

          {selectedAppointments.length > 0 ? (
            selectedAppointments.map((patient, index) => (
              <div
                key={index}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-[15px]
                  -pl-3
                  py-2
                "
              >

                {/* Avatar */}

                <div
                  className="
                    flex
                    h-[38px]
                    w-[38px]
                    min-w-[38px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#2B3A5C]
                    text-[11px]
                    font-semibold
                    text-[#DCE3EF]
                  "
                >
                  {patient.avatar}
                </div>

                {/* Patient */}

                <div className="min-w-0 flex-1">

                  <p className="truncate text-[11px] font-semibold text-[#E8EBF1]">
                    {patient.name}
                  </p>

                  <p className="mt-1 truncate text-[9px] text-[#8490A9]">
                    {patient.condition}
                  </p>

                </div>

                {/* Time */}

                <div className="text-right">

                  <p className="text-[10px] font-semibold text-[#E0F1ED]">
                    {patient.time}
                  </p>

                  <p className="mt-1 text-[8px] text-[#71809D]">
                    {patient.status}
                  </p>

                </div>

              </div>
            ))
          ) : (
            <div
              className="
                rounded-[16px]
                border
                border-dashed
                border-[#34415F]
                px-5
                py-8
                text-center
              "
            >
              <p className="text-[11px] font-medium text-[#A0AABE]">
                No visit scheduled
              </p>

              <p className="mt-1 text-[9px] text-[#709C95]">
                No appointment for this day
              </p>
            </div>
          )}

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
    <div className="grid w-[30%] min-w-[250px] shrink-0 grid-cols-2">
      <div className="col-span-2 w-full rounded-t-[20px] bg-white p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#B9F23D]"></span>
            <span className="text-[10px] font-semibold tracking-[-0.1px] text-[#202D55]">TOTAL PATIENTS</span>
          </div>
          <span className="rounded-full bg-[#EAF5D1] px-2 py-1 text-[8px] font-semibold text-[#66851F]">↑ {changeFromYesterday}%</span>
        </div>

        <div className="mt-5">
          <h2 className="text-[40px] font-medium leading-none tracking-[-2px] text-[#17312E]">{totalPatients}</h2>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8D96A7]">Today</p>
        </div>

        <div className="mt-7 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#68738A]">PATIENT FLOW</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.4px] text-[#9BA2AF]">Compared to yesterday</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-bl-[20px]">
        <h2 className="text-[32px] font-medium leading-none tracking-[-1.5px] text-[#17312E]">{completedPatients}</h2>
        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[1px] text-[#7D8799]">Completed</p>
        <p className="mt-5 text-[10px] text-[#A0A7B3]">Visits completed</p>
      </div>

      <div className="bg-white p-4 rounded-br-[20px]">
        <h2 className="text-[32px] font-medium leading-none tracking-[-1.5px] text-[#17312E]">{String(remainingPatients).padStart(2, "0")}</h2>
        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[1px] text-[#7D8799]">Remaining</p>
        <p className="mt-5 text-[10px] text-[#A0A7B3]">Upcoming visits</p>
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
    <div className="h-[335px] min-w-0 flex-1 rounded-[20px] bg-white px-6 pb-1 pt-4.5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#202D55]"></span>
            <span className="text-[10px] font-semibold tracking-[-0.1px] text-[#202D55]">PATIENT ANALYTICS</span>
          </div>
          <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#17312E]">Your visit history</h3>
        </div>

        <span className="rounded-full bg-[#E8F0FB] px-3 py-1.5 text-[8px] font-semibold text-[#202D55]">LAST 10 DAYS</span>
      </div>

      <div className="mt-7 flex h-[170px] items-end justify-between gap-3 px-2">
        {weeklyData.map((item, index) => {
          const height = (item.patients / maxPatients) * 100;
          const isHighest = item.patients === maxPatients;

          return (
            <div key={`${item.day}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end">
              <div className="mb-2 text-[8px] font-semibold text-[#8B95A7]">{item.patients}</div>

              <div className="flex h-[130px] w-full items-end justify-center">
                <div className={`weekly-chart-bar min-w-[35px] max-w-[42px] rounded-full ${isHighest ? "bg-[#b6c9e1]" : "bg-[#131b33]"}`} style={{ height: `${height}%` }}></div>
              </div>

              <span className="mt-3 text-[8px] font-semibold uppercase tracking-[0.5px] text-[#8C96A7]">{item.day}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">Total visits</p>
          <p className="mt-1 text-[18px] font-semibold tracking-[-0.5px] text-[#17312E]">{weeklyData.reduce((total, item) => total + item.patients, 0)}</p>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">Peak Day</p>
          <p className="mt-1 text-[11px] font-semibold text-[#202D55]">Thursday · 28</p>
        </div>
      </div>
    </div>
  );
};

const AppointmentsOverview = () => {

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
              <span className="h-[9px] w-[9px] rounded-[2px] bg-[#8DC6B7]"></span>
              <span className="text-[9px] font-semibold tracking-[0.2px] text-[#202D55]">APPOINTMENTS</span>
            </div>
            <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#17312E]">Upcoming Today</h3>
          </div>

          <span className="text-[9px] font-medium text-[#8B95A7]">4 appointments</span>
        </div>

        <div className="mt-6">
          {appointments.map((appointment, index) => (
            <div key={appointment.token} className={`flex items-center gap-4 py-3 border border-black/7 px-7 mb-3 rounded-full`}>

              <div className="text-right">
                <p className="text-[22px] font-semibold text-[#202D55] mr-4">{appointment.token}</p>
              </div>

              <div className="flex h-[45px] w-[45px] min-w-[36px] items-center justify-center rounded-full bg-[#E8F0FB] text-[10px] font-semibold text-[#202D55]">
                {appointment.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#17312E]">{appointment.name}</p>
                <p className="mt-1 text-[9px] text-[#8B95A7]">{appointment.condition}</p>
              </div>

              

              <div className="flex items-center gap-10">
                    <span className={`rounded-full px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.5px] ${appointment.status === "Completed" ? "bg-[#EAF5D1] text-[#222d08]" : "bg-amber-100 text-amber-700"}`}>
                        {appointment.status}
                    </span>

                    <p className="text-[20px] font-semibold text-[#202D55]">{appointment.time}</p>
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
      <button onClick={() => setDarkMode(!darkMode)} className="flex h-[42px] w-[76px] items-center justify-between rounded-full border border-[#E3E7EE] bg-white p-1.5 shadow-[0_2px_8px_rgba(23,33,63,0.04)] transition-all duration-300">
        <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-[13px] transition-all duration-300 ${!darkMode ? "bg-[#17312E] text-white" : "text-[#8B95A7]"}`}>☀</span>
        <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-[13px] transition-all duration-300 ${darkMode ? "bg-[#17312E] text-white" : "text-[#8B95A7]"}`}>☾</span>
      </button>
    </div>
  );
};



const PatientDashboard = () => {
  return (
    <div className="relative min-h-screen bg-[#F8F9F7] p-[15px] pr-[calc(25%+15px)]">
      
      {/* Dashboard Header */}
      <header>
        <SchedulePanel />
        <div className="w-full">
          {/* <ClinicSelector /> */}
          
          <div className="flex w-full items-center justify-between">
            <ClinicSelector />
            <RightSideControls />
          </div>

          <div className="mt-4 flex w-full items-stretch gap-4">
            <PatientStats />
            <WeeklyPatientChart />
          </div>
          <AppointmentsOverview />
        </div>
      </header>

      {/* Dashboard Content will come here */}

    </div>
  );
};

export default PatientDashboard;
