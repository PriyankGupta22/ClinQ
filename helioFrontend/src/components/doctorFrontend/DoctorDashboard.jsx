import React, { useState, useEffect, useSyncExternalStore } from "react";
import gsap from "gsap";
import { useDoctorClinic } from "./DoctorClinicContext";
import { readApiError } from "../../api/client";
import { requestDashboard as request } from "../../api/dashboardRequest";
import DashboardDemoIndicator from "../DashboardDemoIndicator";

let doctorSession = { token: "", revision: 0 };
let doctorIdentity = null;
const sessionListeners = new Set();
const readDoctorSession = () => {
  const token = localStorage.getItem("doctorAccessToken") || "";
  if (token !== doctorSession.token) {
    doctorSession = { token, revision: doctorSession.revision + 1 };
    doctorIdentity = null;
  }
  return doctorSession;
};
const refreshDoctorSession = () => {
  readDoctorSession();
  sessionListeners.forEach(listener => listener());
};
const subscribeDoctorSession = listener => {
  sessionListeners.add(listener);
  let active = true;
  const refresh = () => { if (active) refreshDoctorSession(); };
  const onStorage = event => {
    if ((!event.storageArea || event.storageArea === localStorage) &&
        (event.key === null || event.key === "doctorAccessToken")) refresh();
  };
  // Native storage events exclude the writing tab. Recheck after application
  // interaction handlers, and allow token writers to signal doctor-auth-changed.
  // Silent same-tab writes without an event/render/request completion cannot be
  // detected immediately here without polling or changing the token writer.
  const afterInteraction = () => queueMicrotask(refresh);
  window.addEventListener("storage", onStorage);
  window.addEventListener("focus", refresh);
  window.addEventListener("pageshow", refresh);
  window.addEventListener("doctor-auth-changed", refresh);
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("click", afterInteraction);
  window.addEventListener("keyup", afterInteraction);
  window.addEventListener("submit", afterInteraction);
  return () => {
    active = false;
    sessionListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("focus", refresh);
    window.removeEventListener("pageshow", refresh);
    window.removeEventListener("doctor-auth-changed", refresh);
    document.removeEventListener("visibilitychange", refresh);
    window.removeEventListener("click", afterInteraction);
    window.removeEventListener("keyup", afterInteraction);
    window.removeEventListener("submit", afterInteraction);
  };
};
const readDoctorIdentity = () => {
  const session = readDoctorSession();
  return session.token && doctorIdentity?.session === session ? doctorIdentity.doctor : null;
};
const publishDoctorIdentity = (session, doctor) => {
  if (readDoctorSession() !== session) return;
  doctorIdentity = doctor ? { session, doctor } : null;
  sessionListeners.forEach(listener => listener());
};
// The sibling sidebar consumes the same validated dashboard response, without
// another request or persisting identity data in browser storage.
export const DoctorIdentity = ({ children }) => {
  const doctor = useSyncExternalStore(subscribeDoctorSession, readDoctorIdentity);
  return children(doctor);
};

const validDoctorScope = (response, clinicId) => {
  const filters = response?.appliedFilters;
  const objectId = value => typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);
  if (response?.success !== true || response?.dashboard !== "doctor" ||
      !filters || typeof filters !== "object" || Array.isArray(filters) ||
      !objectId(filters.doctorId) || filters.doctorId !== response.doctor?._id ||
      Object.keys(filters).some(key => key !== "doctorId" && key !== "clinicId")) return false;
  return clinicId ? Object.hasOwn(filters, "clinicId") && objectId(filters.clinicId) && filters.clinicId === clinicId
    : !Object.hasOwn(filters, "clinicId");
};

const unavailable = "\u2014";
const countText = value => Number.isFinite(value) ? value : unavailable;
const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
// Calendar labels belong to the backend's calendar, not UTC instants.
const calendarDate = value => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return localDate(date) === value ? date : null;
};
const timeText = value => {
  if (value == null || value === "") return unavailable;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? unavailable : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
const statusText = value => typeof value === "string" && value ? value.charAt(0).toUpperCase() + value.slice(1) : unavailable;
const recordId = value => typeof value === "string" ? value : value?._id;
const scheduleText = schedule => schedule
  ? `${schedule.day || unavailable} · ${schedule.startTime || unavailable}–${schedule.endTime || unavailable}`
  : "Schedule unavailable";
const queueRow = row => ({
  id: row._id,
  name: row.userId?.name || "Patient unavailable",
  avatar: (row.userId?.name || "?").charAt(0),
  condition: `Queue #${countText(row.queueNumber)} · Started ${timeText(row.consultationStartedAt)} · Ended ${timeText(row.consultationEndedAt)}`,
  time: timeText(row.appointmentTime),
  status: statusText(row.status),
});

const ClinicSelector = ({ clinics, selectedClinic, setSelectedClinic, message }) => {
  const [open, setOpen] = useState(false);
  const selectedName = selectedClinic ? clinics.find(clinic => clinic._id === selectedClinic)?.clinicName || "Selected clinic" : "General";

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
          border-[#2A3658]
          bg-[#17213F]
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
            {selectedName}
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
           
            bg-[#17213F]
            p-2
            shadow-[0_15px_40px_rgba(15,25,50,0.18)]
          "
        >
          {/* General */}
          <button
            onClick={() => {
              setSelectedClinic("");
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
                !selectedClinic
                  ? "bg-[#263354] text-white"
                  : "text-[#9AA6BC] hover:bg-[#202C4B] hover:text-[#E5E9F1]"
              }
            `}
          >
            General
          </button>

          {/* Clinics */}
          {clinics.length === 0 && <p role="status">{message || "No clinic assignments"}</p>}
          {clinics.map((clinic) => (
            <button
              key={clinic._id}
              onClick={() => {
                setSelectedClinic(clinic._id);
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
                  selectedClinic === clinic._id
                    ? "bg-[#263354] text-white"
                    : "text-[#9AA6BC] hover:bg-[#202C4B] hover:text-[#E5E9F1]"
                }
              `}
            >
              {clinic.clinicName || "Clinic unavailable"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const SchedulePanel = ({ data, selection, onChange, message }) => {
  const today = calendarDate(data?.dailyQueue?.date) || new Date();
  const month = selection.month || data?.calendar?.month || localDate(today).slice(0, 7);
  const [currentYear, monthNumber] = month.split("-").map(Number);
  const currentMonth = monthNumber - 1;
  const chosenDate = selection.date || data?.selectedDay?.date || localDate(today);
  const selectedDate = Number(chosenDate.slice(-2));
  const doctorClinicDays = (data?.calendar?.month === month ? data.calendar.days || [] : [])
    .filter(day => day.appointments > 0).map(day => day.date);

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

  const changeMonth = offset => {
    const date = localDate(new Date(currentYear, currentMonth + offset, 1));
    onChange({ month: date.slice(0, 7), date });
  };
  const handlePreviousMonth = () => changeMonth(-1);
  const handleNextMonth = () => changeMonth(1);
  const queue = chosenDate === data?.dailyQueue?.date ? data?.dailyQueue : data?.selectedDay;
  const selectedQueue = (queue?.date === chosenDate ? queue.queueEntries || [] : []).map(queueRow);
  const queueTotal = queue?.total ?? queue?.queueCount;
  const queueTruncated = queue?.truncated ?? queue?.queuesTruncated;


  return (
    <aside
      className="
        w-[25%]
        min-h-[calc(100vh-20px)]
        rounded-[26px]
        bg-[#17213F]
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
              bg-[#F8F9FB]
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
            <h3 className="text-[16px] font-semibold text-[#17213F]">
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
              bg-[#F8F9FB]
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
              doctorClinicDays.includes(dateString);

            const isSelected =
              dateString === selectedDateString;

            return (
              <div
                key={date}
                className="flex h-[43px] items-center justify-center"
              >
                <button
                  onClick={() => onChange({ month, date: dateString })}
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
              QUEUE FOR THE DAY · {countText(queueTotal)}
              {queueTruncated ? ` (showing ${selectedQueue.length})` : ""}
            </p>

            
          </div>

          <span className="text-[10px] font-medium text-[#7E8AA6]">
            {selectedDate} {monthNames[currentMonth].slice(0, 3)}
          </span>

        </div>

        <p className="mt-1 text-[9px] text-[#8490A9]">{scheduleText(data?.doctor?.schedule)}</p>

        {/* Queue */}

        <div className="space-y-2.5">

          {selectedQueue.length > 0 ? (
            selectedQueue.map((patient, index) => (
              <div
                key={patient.id || index}
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

                  <p title={patient.condition} className="mt-1 truncate text-[9px] text-[#8490A9]">
                    {patient.condition}
                  </p>

                </div>

                {/* Time */}

                <div className="text-right">

                  <p className="text-[10px] font-semibold text-[#DCE2ED]">
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
                {message || "No queue entries"}
              </p>

              <p className="mt-1 text-[9px] text-[#687590]">
                {message ? "Queue unavailable" : "Booked appointments are listed separately"}
              </p>
            </div>
          )}

        </div>

      </div>
    </aside>
  );
};

const PatientStats = ({ data, message }) => {
  const totalPatients = countText(data?.stats?.activePatientsToday);
  const completedPatients = countText(data?.consultationStats?.patientsServed);
  const remainingPatients = countText(data?.stats?.waitingPatients);
  const comparison = data?.comparison;
  const change = comparison?.metric === "activePatients" && comparison.previousDay !== 0 && Number.isFinite(comparison.percentageChange)
    ? comparison.percentageChange : null;
  const changeFromYesterday = change === null ? unavailable : `${change > 0 ? "\u2191 " : change < 0 ? "\u2193 " : ""}${Math.abs(change).toFixed(1)}%`;


  return (
    <div className="grid grid-cols-2">
      <div className="col-span-2 rounded-t-[20px] bg-white p-4 w-[250px]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#B9F23D]"></span>
            <span className="text-[10px] font-semibold tracking-[-0.1px] text-[#202D55]">ACTIVE PATIENTS</span>
          </div>
          <span className="rounded-full bg-[#EAF5D1] px-2 py-1 text-[8px] font-semibold text-[#66851F]">{changeFromYesterday}</span>
        </div>

        <div className="mt-5">
          <h2 className="text-[40px] font-medium leading-none tracking-[-2px] text-[#17213F]">{totalPatients}</h2>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8D96A7]">Today · {countText(data?.stats?.patientsToday)} patients · {countText(data?.stats?.appointmentsToday)} bookings</p>
        </div>

        <div className="mt-7 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#68738A]">{message || `Completed ${countText(data?.stats?.completedToday)} · Cancelled ${countText(data?.stats?.cancelledToday)}`}</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.4px] text-[#9BA2AF]">Compared to yesterday</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-bl-[20px]">
        <h2 className="text-[32px] font-medium leading-none tracking-[-1.5px] text-[#17213F]">{completedPatients}</h2>
        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[1px] text-[#7D8799]">Patients served</p>
        <p className="mt-5 text-[10px] text-[#A0A7B3]">Consultations: {countText(data?.consultationStats?.completedConsultations)}</p>
      </div>

      <div className="bg-white p-4 rounded-br-[20px]">
        <h2 className="text-[32px] font-medium leading-none tracking-[-1.5px] text-[#17213F]">{remainingPatients}</h2>
        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[1px] text-[#7D8799]">Waiting</p>
        <p className="mt-5 text-[10px] text-[#A0A7B3]">Consulting: {countText(data?.stats?.consultingPatients)}</p>
      </div>
    </div>
  );
};

const WeeklyPatientChart = ({ data }) => {
  const chartRef = React.useRef(null);
  const end = calendarDate(data?.trend10Days?.at(-1)?.date) || new Date();
  const weeklyData = Array.from({ length: 10 }, (_, index) => {
    const date = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 9 + index);
    const label = localDate(date);
    const row = data?.trend10Days?.find(item => item.date === label);
    return { date: label, day: date.toLocaleDateString("en-US", { weekday: "short" }),
      patients: Number.isFinite(row?.patients) ? row.patients : null };
  });
  const maxPatients = Math.max(0, ...weeklyData.map(item => item.patients ?? 0));
  const complete = weeklyData.every(item => item.patients !== null);
  const peak = complete && maxPatients > 0 ? weeklyData.find(item => item.patients === maxPatients) : null;

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(".weekly-chart-bar", { scaleY: 0, transformOrigin: "bottom" }, { scaleY: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 });
    }, chartRef);
    return () => context.revert();
  }, [data]);

  return (
    <div ref={chartRef} className="h-[335px] max-w-[700px] min-w-[550px] rounded-[20px] bg-white pt-4.5 px-6 pb-1">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#202D55]"></span>
            <span className="text-[10px] font-semibold tracking-[-0.1px] text-[#202D55]">PATIENT ANALYTICS</span>
          </div>
          <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#17213F]">Patients from last 10 days</h3>
        </div>

        <span className="rounded-full bg-[#E8F0FB] px-3 py-1.5 text-[8px] font-semibold text-[#202D55]">LAST 10 DAYS</span>
      </div>

      <div className="mt-7 flex h-[170px] items-end justify-between gap-3 px-2">
        {weeklyData.map((item) => {
          const height = maxPatients > 0 ? ((item.patients ?? 0) / maxPatients) * 100 : 0;
          const isHighest = maxPatients > 0 && item.patients === maxPatients;

          return (
            <div key={item.date} title={item.date} className="flex h-full flex-1 flex-col items-center justify-end">
              <div className="mb-2 text-[8px] font-semibold text-[#8B95A7]">{countText(item.patients)}</div>

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
          <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">Daily active patients (sum)</p>
          <p className="mt-1 text-[18px] font-semibold tracking-[-0.5px] text-[#17213F]">{complete ? weeklyData.reduce((total, item) => total + item.patients, 0) : unavailable}</p>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">Peak Day</p>
          <p className="mt-1 text-[11px] font-semibold text-[#202D55]">{peak ? `${peak.date} · ${peak.patients}` : unavailable}</p>
        </div>
      </div>
    </div>
  );
};

const QueueOverview = ({ data, selection, message }) => {
  const date = selection.date || data?.selectedDay?.date;
  const selected = data?.selectedDay && data.selectedDay.date === date ? data.selectedDay : null;
  // Use the full selected-day count, never the bounded list length as a total.
  const rows = selected?.appointments || (date === data?.dailyQueue?.date ? data?.todayAppointments || [] : []);
  const queues = [...(selected?.queueEntries || []), ...(data?.dailyQueue?.queueEntries || [])];
  const appointments = rows.map(row => {
    const queue = queues.find(entry => recordId(entry.appointmentId) && recordId(entry.appointmentId) === row._id);
    return { id: row._id, name: row.userId?.name || "Patient unavailable", condition: row.reason || unavailable,
      token: countText(queue?.queueNumber), status: statusText(row.status),
      // Bookings store a date only; midnight is not a consultation time.
      time: timeText(queue?.appointmentTime) };
  });
  const total = selected?.appointmentCount ?? (date === data?.dailyQueue?.date ? data?.stats?.appointmentsToday : null);
  const truncated = selected?.appointmentsTruncated || (Number.isFinite(total) && total > rows.length);


  return (
    <div className="mt-4 grid grid-cols-[1fr_1.25fr] gap-4 absolute top-[410px] h-min py-[1px]">

      <div className="rounded-[20px] bg-white p-6 min-w-[815px]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-[9px] w-[9px] rounded-[2px] bg-[#9DBBE3]"></span>
              <span className="text-[9px] font-semibold tracking-[0.2px] text-[#202D55]">APPOINTMENTS</span>
            </div>
            <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#17213F]">Appointments · {date || unavailable}</h3>
          </div>

          <span className="text-[9px] font-medium text-[#8B95A7]">{countText(total)} appointments{truncated ? ` (showing ${appointments.length})` : ""}</span>
        </div>

        <div className="mt-6">
          {appointments.length === 0 && <p role="status">{message || "No appointments for this day"}</p>}
          {appointments.map((appointment) => (
            <div key={appointment.id} className={`flex items-center gap-4 py-3 border border-black/7 px-7 mb-3 rounded-full`}>

              <div className="text-right">
                <p className="text-[22px] font-semibold text-[#202D55] mr-4">{appointment.token}</p>
              </div>

              <div className="flex h-[45px] w-[45px] min-w-[36px] items-center justify-center rounded-full bg-[#E8F0FB] text-[10px] font-semibold text-[#202D55]">
                {appointment.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#17213F]">{appointment.name}</p>
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
        <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-[13px] transition-all duration-300 ${!darkMode ? "bg-[#17213F] text-white" : "text-[#8B95A7]"}`}>☀</span>
        <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-[13px] transition-all duration-300 ${darkMode ? "bg-[#17213F] text-white" : "text-[#8B95A7]"}`}>☾</span>
      </button>
    </div>
  );
};



const DoctorDashboard = () => {
  const { selectClinic } = useDoctorClinic();
  const session = useSyncExternalStore(subscribeDoctorSession, readDoctorSession);
  const [selectedClinic, setSelectedClinic] = useState("");
  const changeClinic = clinicId => {
    setSelectedClinic(clinicId);
    // Queue/prescription/message views require a concrete assigned clinic.
    // General clears only the dashboard filter, retaining that workflow scope.
    if (clinicId) selectClinic(clinicId);
  };
  const [selection, setSelection] = useState({ month: "", date: "" });
  const [result, setResult] = useState(null);
  const [clinicOptions, setClinicOptions] = useState(null);
  const [renderedSession, setRenderedSession] = useState(session);
  const pendingRequest = React.useRef(null);
  const requestSequence = React.useRef(0);
  // Reset stored records and selections before committing a different session.
  if (renderedSession !== session) {
    setRenderedSession(session);
    setResult(null);
    setClinicOptions(null);
    setSelectedClinic("");
    setSelection({ month: "", date: "" });
  }
  const scopeKey = `${selectedClinic}|${selection.month}|${selection.date}`;
  // Authentication identity and selection must both match before rendering data.
  const current = session.token && result?.session === session && result.key === scopeKey ? result : null;
  const clinics = session.token && clinicOptions?.session === session ? clinicOptions.clinics : [];
  const data = current?.data || null;
  const message = !session.token ? "Please sign in as a doctor to view your dashboard." :
    current?.error || (!current ? "Loading dashboard..." : "");

  useEffect(() => {
    let active = true;
    const sequence = ++requestSequence.current;
    const isCurrent = () => {
      if (!active || sequence !== requestSequence.current) return false;
      if (readDoctorSession() !== session) {
        refreshDoctorSession();
        return false;
      }
      return true;
    };
    const load = async () => {
      try {
        if (!session.token || !isCurrent()) return;
        const params = new URLSearchParams();
        if (selectedClinic) params.set("clinicId", selectedClinic);
        if (selection.month) params.set("month", selection.month);
        if (selection.date) params.set("date", selection.date);
        const query = params.toString();
        const path = `/api/dashboard/doctor${query ? `?${query}` : ""}`;
        // Reuse only an in-flight request, including StrictMode effect replay.
        if (pendingRequest.current?.session !== session || pendingRequest.current?.path !== path) {
          const pending = { session, path, promise: request("GET", path, undefined, session.token) };
          pendingRequest.current = pending;
          const clear = () => { if (pendingRequest.current === pending) pendingRequest.current = null; };
          pending.promise.then(clear, clear);
        }
        const response = await pendingRequest.current.promise;
        if (!isCurrent()) return;
        if (!validDoctorScope(response, selectedClinic)) {
          publishDoctorIdentity(session, null);
          setResult({ key: scopeKey, session, error: "Dashboard response is unavailable for this selection." });
          return;
        }
        setClinicOptions({ session, clinics: (response.clinics || []).filter(clinic => clinic?._id) });
        setResult({ key: scopeKey, session, data: response });
        publishDoctorIdentity(session, response.doctor);
      } catch (error) {
        if (!isCurrent()) return;
        publishDoctorIdentity(session, null);
        const details = readApiError(error);
        const messages = {
          401: "Your doctor session has expired or is invalid. Please sign in again.",
          403: "Access denied for this doctor or clinic.",
          404: "Doctor not found.",
          500: "Unable to load the dashboard. Please try again later.",
        };
        setResult({ key: scopeKey, session, error: messages[error.response?.status] || details.message || "Unable to load the dashboard." });
      }
    };
    load();
    return () => { active = false; };
  }, [scopeKey, selectedClinic, selection.month, selection.date, session]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-[15px]">
      <DashboardDemoIndicator />
      
      {/* Dashboard Header */}
      <header className="h-[80px]">
        <SchedulePanel data={data} selection={selection} onChange={setSelection} message={message} />
        <div className="flex h-full items-center">
          <div className = "min-w-[815px] flex items-center items-center justify-between absolute top-[10px]">
            <ClinicSelector clinics={clinics} selectedClinic={selectedClinic} setSelectedClinic={changeClinic} message={message} />
            <RightSideControls />
          </div>

          <div className = "min-w-[815px] max-w-[1100px] flex items-center justify-between absolute top-[75px] ">
            <PatientStats data={data} message={message} />
            <WeeklyPatientChart data={data} />
          </div>
          <QueueOverview data={data} selection={selection} message={message} />
        </div>
      </header>

      {/* Dashboard Content will come here */}

    </div>
  );
};

export default DoctorDashboard;
