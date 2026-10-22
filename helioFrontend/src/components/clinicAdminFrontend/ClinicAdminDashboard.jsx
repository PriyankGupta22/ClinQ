import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { readApiError } from "../../api/client";
import { requestDashboard as request } from "../../api/dashboardRequest";
import DashboardDemoIndicator from "../DashboardDemoIndicator";

const unavailable = "—";
const countText = value => Number.isFinite(value) ? value : unavailable;
const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const calendarDate = value => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return localDate(date) === value ? date : null;
};
const timeText = value => {
  if (!value) return unavailable;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? unavailable : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
// =====================================================
// CLINIC CALENDAR
// =====================================================

const DoctorSelector = ({ doctors, selectedDoctor, setSelectedDoctor }) => {
  const [open, setOpen] = useState(false);
  const selectedName = selectedDoctor ? doctors.find(doctor => doctor._id === selectedDoctor)?.name || "Selected doctor" : "General";

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex h-[58px] min-w-[245px] items-center justify-between rounded-full border border-[#3D2B45] bg-[#28172F] px-5 text-left transition-all duration-200 hover:bg-[#32203A]">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-[#A59CA9]">Doctors</p>
          <p className="mt-[3px] text-[12px] font-semibold text-[#F5F1F6]">{selectedName}</p>
        </div>

        <div className={`ml-5 flex h-[30px] w-[30px] items-center justify-center rounded-[8px] transition-all duration-200 ${open ? "rotate-180" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#C4BAC8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-[66px] z-50 w-full overflow-hidden rounded-[18px] bg-[#28172F] p-2 shadow-[0_15px_40px_rgba(40,23,47,0.22)]">
          <button onClick={() => { setSelectedDoctor(""); setOpen(false); }} className={`w-full rounded-[12px] px-4 py-3 text-left text-[12px] font-medium transition-all duration-200 ${!selectedDoctor ? "bg-[#3D2B45] text-white" : "text-[#A59CA9] hover:bg-[#32203A] hover:text-[#F0EBF2]"}`}>General</button>

          {doctors.map((doctor) => (
            <button key={doctor._id} onClick={() => { setSelectedDoctor(doctor._id); setOpen(false); }} className={`w-full rounded-[12px] px-4 py-3 text-left text-[12px] font-medium transition-all duration-200 ${selectedDoctor === doctor._id ? "bg-[#3D2B45] text-white" : "text-[#A59CA9] hover:bg-[#32203A] hover:text-[#F0EBF2]"}`}>
              {doctor.name || "Doctor unavailable"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ClinicCalendar = ({ data, selection, onChange }) => {
  const today = calendarDate(data?.trend10Days?.at(-1)?.date) || new Date();
  const month = selection?.month || data?.calendar?.month || localDate(today).slice(0, 7);
  const [currentYear, monthNumber] = month.split("-").map(Number);
  const currentMonth = monthNumber - 1;
  const chosenDate = selection?.date || data?.selectedDay?.date || localDate(today);
  const selectedDate = Number(chosenDate.slice(-2));

  // ===================================================
  // CLINIC DAYS
  // ===================================================

  const clinicDays = (data?.calendar?.month === month ? data.calendar.days || [] : [])
    .filter(day => day.appointments > 0).map(day => day.date);

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

  const changeMonth = offset => {
    const date = new Date(currentYear, currentMonth + offset, 1);
    const dateString = localDate(date);
    onChange({ month: dateString.slice(0, 7), date: dateString });
  };
  const handlePreviousMonth = () => changeMonth(-1);
  const handleNextMonth = () => changeMonth(1);

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
                  onClick={() => onChange({ month, date: formatDate(currentYear, currentMonth, date) })}
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

const PatientStats = ({ data, notice }) => {
  const totalPatients = countText(data?.stats?.activePatientsToday);
  const completedPatients = countText(data?.consultationStats?.patientsServed);
  const remainingPatients = countText(data?.stats?.waitingPatients);
  const percentage = data?.comparison?.percentageChange;
  const changeFromYesterday = Number.isFinite(percentage) ? `${percentage < 0 ? "↓" : "↑"} ${Math.abs(percentage).toLocaleString(undefined, { maximumFractionDigits: 1 })}%` : unavailable;

  return (
    <div className="grid grid-cols-2">
      <div className="col-span-2 w-[250px] rounded-t-[20px] bg-white p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#B9F23D]"></span>
            <span className="text-[10px] font-semibold tracking-[-0.1px] text-[#28172F]">ACTIVE PATIENTS</span>
          </div>
          <span className="rounded-full bg-[#EAF5D1] px-2 py-1 text-[8px] font-semibold text-[#66851F]">{changeFromYesterday}</span>
        </div>

        <div className="mt-5">
          <h2 className="text-[40px] font-medium leading-none tracking-[-2px] text-[#28172F]">{totalPatients}</h2>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#A59CA9]">Today</p>
        </div>

        <div className="mt-7 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#655B6B]" role="status" aria-live="polite">{notice || "PATIENT FLOW"}</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.4px] text-[#A59CA9]">Compared to yesterday</p>
        </div>
      </div>

      <div className="rounded-bl-[20px] bg-white p-4">
        <h2 title={`Completed consultations: ${countText(data?.consultationStats?.completedConsultations)}`} className="text-[32px] font-medium leading-none tracking-[-1.5px] text-[#28172F]">{completedPatients}</h2>
        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[1px] text-[#756A7B]">Completed</p>
        <p className="mt-5 text-[10px] text-[#A59CA9]">Patients served</p>
      </div>

      <div className="rounded-br-[20px] bg-white p-4">
        <h2 className="text-[32px] font-medium leading-none tracking-[-1.5px] text-[#28172F]">{typeof remainingPatients === "number" ? String(remainingPatients).padStart(2, "0") : unavailable}</h2>
        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[1px] text-[#756A7B]">Waiting</p>
        <p className="mt-5 text-[10px] text-[#A59CA9]">Queue entries</p>
      </div>
    </div>
  );
};


const WeeklyPatientChart = ({ data }) => {
  const chartRef = useRef(null);
  const trend = data?.trend10Days;
  const ready = Array.isArray(trend) && trend.length === 10;
  const weeklyData = ready ? trend.map(item => ({ ...item,
    day: calendarDate(item.date)?.toLocaleDateString("en", { weekday: "short" }) || unavailable
  })) : Array.from({ length: 10 }, () => ({ day: unavailable, patients: null }));
  const maxPatients = Math.max(0, ...weeklyData.map(item => item.patients || 0));
  const peak = maxPatients > 0 ? weeklyData.find(item => item.patients === maxPatients) : null;
  const peakText = peak ? `${calendarDate(peak.date)?.toLocaleDateString("en", { weekday: "long" }) || unavailable} · ${peak.patients}` : unavailable;

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(".weekly-chart-bar", { scaleY: 0, transformOrigin: "bottom" }, { scaleY: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 });
    }, chartRef);
    return () => context.revert();
  }, [trend]);

  return (
    <div ref={chartRef} aria-label={ready && maxPatients === 0 ? "No patient activity in the last 10 days" : "Patient analytics for the last 10 days"} className="h-[335px] min-w-[550px] flex-1 rounded-[20px] bg-white px-6 pt-4.5 pb-1">
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
          const height = maxPatients > 0 && Number.isFinite(item.patients) ? (item.patients / maxPatients) * 100 : 0;
          const isHighest = maxPatients > 0 && item.patients === maxPatients;

          return (
            <div key={`${item.day}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end">
              <div className="mb-2 text-[8px] font-semibold text-[#A59CA9]">{countText(item.patients)}</div>

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
          <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#A59CA9]">Daily patient total</p>
          <p className="mt-1 text-[18px] font-semibold tracking-[-0.5px] text-[#28172F]">{ready ? weeklyData.reduce((total, item) => total + item.patients, 0) : unavailable}</p>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#A59CA9]">Peak Day</p>
          <p className="mt-1 text-[11px] font-semibold text-[#28172F]">{peakText}</p>
        </div>
      </div>
    </div>
  );
};

const QueueOverview = ({ data, selection, notice }) => {
  const selected = selection !== null;
  const source = selected ? data?.selectedDay?.appointments : data?.todayAppointments;
  const queues = selected ? data?.selectedDay?.queueEntries : data?.dailyQueue?.queueEntries;
  const queueByAppointment = new Map((queues || []).map(queue => [String(queue.appointmentId), queue]));
  const appointments = (source || []).map(appointment => {
    const queue = queueByAppointment.get(String(appointment._id));
    return { id: appointment._id, name: appointment.userId?.name || "Patient unavailable",
      condition: appointment.reason || "Reason unavailable", token: countText(queue?.queueNumber),
      time: timeText(queue?.appointmentTime),
      status: ({ scheduled: "Scheduled", completed: "Completed", cancelled: "Cancelled" })[appointment.status] || "Unavailable" };
  });
  const total = selected ? data?.selectedDay?.appointmentCount : data?.stats?.appointmentsToday;
  const truncated = selected ? data?.selectedDay?.appointmentsTruncated : Number.isFinite(total) && total > appointments.length;
  const heading = selected ? `Appointments · ${selection.date}` : "Today's appointments";

  return (
    <div className="mt-4 w-full py-[1px]">
      <div className="w-full rounded-[20px] bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-[9px] w-[9px] rounded-[2px] bg-[#CBBBD0]"></span>
              <span className="text-[9px] font-semibold tracking-[0.2px] text-[#28172F]">APPOINTMENTS</span>
            </div>
            <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#28172F]">{heading}</h3>
          </div>

          <span className="text-[9px] font-medium text-[#A59CA9]">{countText(total)} appointments{truncated ? ` · showing ${appointments.length}` : ""}</span>
        </div>

        <div className="mt-6">
          {appointments.length === 0 && <p className="text-[9px] font-medium text-[#A59CA9]">{notice || (data ? "No appointments for this day" : "Appointments unavailable")}</p>}
          {appointments.map((appointment) => (
            <div key={appointment.id} className="mb-3 flex w-full items-center gap-4 rounded-full border border-black/7 px-5 py-3">
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

const DoctorAvailability = ({ data, notice }) => {
  const selectedId = data?.appliedFilters?.doctorId;
  const doctors = (data?.doctors || []).filter(doctor => !selectedId || doctor._id === selectedId).map(doctor => {
    const availability = data?.doctorAvailability?.find(item => item.doctorId === doctor._id);
    const metrics = data?.doctorStats?.find(item => item.doctorId === doctor._id);
    return { id: doctor._id, name: doctor.name || "Doctor unavailable", specialty: doctor.specialization || "Specialization unavailable",
      initial: doctor.name?.charAt(0) || unavailable,
      status: availability?.status === "consulting" ? "With Patient" : "Unknown",
      detail: `Recorded snapshot; ${countText(metrics?.appointmentsToday)} appointments today; ${countText(metrics?.waitingPatients)} waiting queue entries; ${countText(metrics?.completedConsultations)} completed consultations` };
  });

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

        <span className="rounded-full bg-[#E9DFEC] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.5px] text-[#28172F]">{countText(data?.stats?.activeDoctors)} in scope</span>
      </div>

      <div className="mt-5">
        {doctors.length === 0 && <p className="text-[9px] font-medium text-[#A59CA9]">{notice || (data ? "No active doctors" : "Doctors unavailable")}</p>}
        {doctors.map((doctor, index) => (
          <div key={doctor.id} title={doctor.detail} className={`flex items-center gap-3 py-3 ${index !== doctors.length - 1 ? "border-b border-[#F0EDF1]" : ""}`}>
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
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selection, setSelection] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [result, setResult] = useState(null);
  const pendingRequest = useRef(null);
  const token = localStorage.getItem("clinicAccessToken") || "";
  const params = new URLSearchParams();
  if (selectedDoctor) params.set("doctorId", selectedDoctor);
  if (selection) { params.set("month", selection.month); params.set("date", selection.date); }
  const path = `/api/dashboard/clinic${params.size ? `?${params}` : ""}`;
  const changeDoctor = doctorId => {
    if (doctorId === selectedDoctor) return;
    setResult(null);
    setSelectedDoctor(doctorId);
  };
  const changeSelection = next => {
    if (next.month === selection?.month && next.date === selection?.date) return;
    setResult(null);
    setSelection(next);
  };

  useEffect(() => {
    let active = true;
    if (!token) {
      return () => { active = false; };
    }
    // Reuse the in-flight promise when development StrictMode replays this effect.
    if (pendingRequest.current?.path !== path || pendingRequest.current?.token !== token) {
      pendingRequest.current = { path, token, promise: request("get", path, null, token) };
    }
    pendingRequest.current.promise.then(data => {
      if (!active) return;
      if (data?.success !== true || data?.dashboard !== "clinic" ||
          (data.appliedFilters?.doctorId || "") !== selectedDoctor) {
        setResult({ path, token, error: "Dashboard response is unavailable for this selection." });
        return;
      }
      setDoctors(data.doctors || []);
      setResult({ path, token, data });
    }).catch(error => {
      if (!active) return;
      const status = error.response?.status;
      const message = ({ 401: "Your session has expired. Please sign in again.",
        403: "Access denied for this clinic or doctor selection.", 404: "Clinic not found." })[status] ||
        readApiError(error)?.message || "Unable to load the clinic dashboard.";
      setResult({ path, token, error: message });
    });
    return () => { active = false; };
  }, [path, token, selectedDoctor]);

  const current = result?.path === path && result?.token === token ? result : null;
  const data = current?.data || null;
  const notice = !token ? "Sign in to view the clinic dashboard." : current?.error ||
    (!current ? "Loading clinic dashboard…" : "");

  return (
    <div className="min-h-screen bg-white p-[15px]">
      <DashboardDemoIndicator />
      <div className = "flex h-full min-w-full flex-row items-center gap-4">
        <div className = "flex h-full min-w-0 flex-1 flex-col items-stretch justify-between">
            <DoctorSelector doctors={doctors} selectedDoctor={selectedDoctor} setSelectedDoctor={changeDoctor} />
            <div className = "flex w-full min-w-0 flex-row items-center gap-4">
                <div className="shrink-0"><PatientStats data={data} notice={notice} /></div>
                <WeeklyPatientChart data={data} />
            </div>
            <QueueOverview data={data} selection={selection} notice={notice} />
        </div>
        <div className = "flex w-[400px] min-w-[400px] shrink-0 flex-col items-center justify-between">
            <ClinicCalendar data={data} selection={selection} onChange={changeSelection} />
            <DoctorAvailability data={data} notice={notice} />
        </div>
      </div>
    </div>
  );
};

export default ClinicAdminDashboard;
