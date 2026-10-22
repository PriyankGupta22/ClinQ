import React, { useState, useEffect } from "react";
import gsap from "gsap";
import { readApiError } from "../../api/client";
import { requestDashboard as request } from "../../api/dashboardRequest";
import DashboardDemoIndicator from "../DashboardDemoIndicator";

const unavailable = "\u2014";
const countText = value => Number.isFinite(value) ? value : unavailable;
const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
// Backend calendar labels are calendar dates, not UTC instants.
const calendarDate = value => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return localDate(date) === value ? date : null;
};
const appointmentDateText = value => {
  if (calendarDate(value)) return value;
  // selectedDay.date describes the selected bucket, not a persistent row label.
  // Without a server timezone or a per-appointment calendar label, use the same
  // explicit UTC fallback in every panel and for every calendar/clinic selection.
  if (typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
      !calendarDate(value.slice(0, 10))) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return `${String(date.getUTCFullYear()).padStart(4, "0")}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")} UTC`;
};
const timeText = value => {
  if (typeof value !== "string" || !value) return unavailable;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? unavailable : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
};
const recordId = value => typeof value === "string" ? value : value?._id;
const statusText = value => typeof value === "string" && value ? value.charAt(0).toUpperCase() + value.slice(1) : unavailable;
const queueDetails = queue => queue
  ? `Queue #${countText(queue.queueNumber)} · ${statusText(queue.status)} · Estimated start ${timeText(queue.estimatedStartTime)}`
  : "Queue unavailable";
const queueRecords = data => {
  const rows = [...(data?.selectedDay?.queueEntries || []), ...(data?.dailyQueue?.queueEntries || []), ...(data?.queueEntries || [])];
  return rows.filter((row, index) => row && rows.findIndex(item => item?._id === row._id) === index);
};
const linkedQueue = (queues, appointment) => queues.find(queue => recordId(queue.appointmentId) && recordId(queue.appointmentId) === appointment._id);
const appointmentRow = (row, queues) => {
  const queue = linkedQueue(queues, row);
  const name = row.doctorId?.name || queue?.doctorId?.name || "Doctor unavailable";
  const date = appointmentDateText(row.appointmentDate);
  return {
    id: row._id, name, avatar: name.charAt(0), token: countText(queue?.queueNumber),
    condition: `${row.clinicId?.clinicName || queue?.clinicId?.clinicName || "Clinic unavailable"} · ${date} · ${row.reason || "Reason unavailable"}`,
    detail: `${queueDetails(queue)} · Stored appointment time ${timeText(queue?.appointmentTime)}`,
    // Date-only bookings do not establish a consultation time.
    time: timeText(queue?.appointmentTime), status: statusText(row.status),
  };
};

const ClinicSelector = ({ clinics, selectedClinic, setSelectedClinic, notice, coverage }) => {
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
           
            bg-[#17312E]
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
                  ? "bg-[#244D49] text-white"
                  : "text-[#9AA6BC] hover:bg-[#1E413D] hover:text-[#E5E9F1]"
              }
            `}
          >
            General
          </button>

          {/* Clinics */}
          {clinics.length === 0 && <p role="status" className="px-4 py-3 text-[12px] font-medium text-[#9AA6BC]">{notice || "No clinic options"}</p>}
          {coverage?.truncated && <p role="status" className="px-4 py-3 text-[12px] font-medium text-[#9AA6BC]">Showing the first {coverage.limit} clinic options</p>}
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
                    ? "bg-[#244D49] text-white"
                    : "text-[#9AA6BC] hover:bg-[#1E413D] hover:text-[#E5E9F1]"
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


const SchedulePanel = ({ data, selection, onChange, notice }) => {
  const today = calendarDate(data?.dailyQueue?.date) || new Date();
  const month = selection.month || data?.calendar?.month || localDate(today).slice(0, 7);
  const [currentYear, monthNumber] = month.split("-").map(Number);
  const currentMonth = monthNumber - 1;
  const chosenDate = selection.date || data?.selectedDay?.date || localDate(today);
  const selectedDate = Number(chosenDate.slice(-2));
  const patientClinicDays = (data?.calendar?.month === month ? data.calendar.days || [] : [])
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
  const selected = data?.selectedDay?.date === chosenDate ? data?.selectedDay : null;
  const bookings = selected?.appointments || [];
  const queues = selected?.queueEntries || [];
  const selectedAppointments = bookings.map(row => {
    const item = appointmentRow(row, queues);
    const queue = linkedQueue(queues, row);
    return { ...item, condition: `${item.condition} · ${queueDetails(queue)}`,
      status: queue ? `${item.status} · ${statusText(queue.status)}` : item.status };
  });
  // Queue records whose appointments fall outside the capped list still belong here.
  for (const queue of queues) {
    if (bookings.some(row => row._id && row._id === recordId(queue.appointmentId))) continue;
    const name = queue.doctorId?.name || "Doctor unavailable";
    selectedAppointments.push({ id: `queue-${queue._id}`, name, avatar: name.charAt(0),
      condition: `${queue.clinicId?.clinicName || "Clinic unavailable"} · ${queueDetails(queue)}`,
      detail: queueDetails(queue), time: timeText(queue.appointmentTime), status: statusText(queue.status) });
  }


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
              APPOINTMENTS & QUEUE
              · {countText(selected?.appointmentCount)} bookings · {countText(selected?.queueCount)} queue entries
              {selected?.appointmentsTruncated || selected?.queuesTruncated ? " (limited lists)" : ""}
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
                key={patient.id || index}
                title={patient.detail}
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
                {notice || "No appointments or queue entries"}
              </p>

              <p className="mt-1 text-[9px] text-[#709C95]">
                {notice ? "Selected-day details unavailable" : "No records for this day"}
              </p>
            </div>
          )}

        </div>

      </div>
    </aside>
  );
};

const PatientStats = ({ data, notice }) => {
  const totalPatients = countText(data?.stats?.totalAppointments);
  const completedPatients = countText(data?.stats?.completedAppointments);
  const remainingPatients = countText(data?.stats?.upcomingAppointments);
  const comparison = data?.comparison;
  const matching = comparison?.metric === "completedAppointments";
  const change = matching && comparison.previousDay > 0 && Number.isFinite(comparison.percentageChange)
    ? comparison.percentageChange : null;
  const changeFromYesterday = change === null ? unavailable : `${change > 0 ? "\u2191 " : change < 0 ? "\u2193 " : ""}${Math.abs(change).toFixed(1)}%`;


  return (
    <div className="grid w-[30%] min-w-[250px] shrink-0 grid-cols-2">
      <div className="col-span-2 w-full rounded-t-[20px] bg-white p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#B9F23D]"></span>
            <span className="text-[10px] font-semibold tracking-[-0.1px] text-[#202D55]">TOTAL APPOINTMENTS</span>
          </div>
          <span className="rounded-full bg-[#EAF5D1] px-2 py-1 text-[8px] font-semibold text-[#66851F]">{countText(data?.stats?.activeQueues)} queues</span>
        </div>

        <div className="mt-5">
          <h2 className="text-[40px] font-medium leading-none tracking-[-2px] text-[#17312E]">{totalPatients}</h2>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8D96A7]">All time</p>
        </div>

        <div className="mt-7 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#68738A]">{notice || `Completed today: ${matching ? countText(comparison.currentDay) : unavailable}`}</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.4px] text-[#9BA2AF]">{changeFromYesterday} compared to yesterday</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-bl-[20px]">
        <h2 className="text-[32px] font-medium leading-none tracking-[-1.5px] text-[#17312E]">{completedPatients}</h2>
        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[1px] text-[#7D8799]">Completed</p>
        <p className="mt-5 text-[10px] text-[#A0A7B3]">Consults today: {countText(data?.consultationStats?.completedConsultations)}</p>
      </div>

      <div className="bg-white p-4 rounded-br-[20px]">
        <h2 className="text-[32px] font-medium leading-none tracking-[-1.5px] text-[#17312E]">{remainingPatients}</h2>
        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[1px] text-[#7D8799]">Upcoming</p>
        <p className="mt-5 text-[10px] text-[#A0A7B3]">Scheduled</p>
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
      patients: Number.isFinite(row?.completed) ? row.completed : null };
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
    <div ref={chartRef} className="h-[335px] min-w-0 flex-1 rounded-[20px] bg-white px-6 pb-1 pt-4.5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#202D55]"></span>
            <span className="text-[10px] font-semibold tracking-[-0.1px] text-[#202D55]">PATIENT ANALYTICS</span>
          </div>
          <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#17312E]">Completed appointment history</h3>
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
          <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">Completed appointments</p>
          <p className="mt-1 text-[18px] font-semibold tracking-[-0.5px] text-[#17312E]">{complete ? weeklyData.reduce((total, item) => total + item.patients, 0) : unavailable}</p>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">Peak Day</p>
          <p className="mt-1 text-[11px] font-semibold text-[#202D55]">{peak ? `${peak.date} · ${peak.patients}` : unavailable}</p>
        </div>
      </div>
    </div>
  );
};

const AppointmentsOverview = ({ data, notice }) => {
  const queues = queueRecords(data);
  const upcoming = data?.upcomingAppointmentsList || [];
  const history = data?.appointmentHistory || [];
  const appointments = [...upcoming, ...history].map(row => appointmentRow(row, queues));
  for (const queue of data?.queueEntries || []) {
    if ([...upcoming, ...history].some(row => row._id && row._id === recordId(queue.appointmentId))) continue;
    const name = queue.doctorId?.name || "Doctor unavailable";
    appointments.push({ id: `queue-${queue._id}`, name, avatar: name.charAt(0), token: countText(queue.queueNumber),
      condition: `${queue.clinicId?.clinicName || "Clinic unavailable"} · ${calendarDate(data?.dailyQueue?.date) ? data.dailyQueue.date : "Date unavailable"} · Queue entry`,
      detail: queueDetails(queue), time: timeText(queue.appointmentTime), status: statusText(queue.status) });
  }


  return (
    <div className="mt-4 w-full py-[1px]">

      <div className="w-full rounded-[20px] bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-[9px] w-[9px] rounded-[2px] bg-[#8DC6B7]"></span>
              <span className="text-[9px] font-semibold tracking-[0.2px] text-[#202D55]">APPOINTMENTS</span>
            </div>
            <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#17312E]">Upcoming & history</h3>
          </div>

          <span className="text-[9px] font-medium text-[#8B95A7]">{countText(data?.stats?.upcomingAppointments)} upcoming · {countText(data?.stats?.totalAppointments)} total</span>
        </div>

        <div className="mt-6">
          {!data && <p role="status" className="text-[9px] font-medium text-[#8B95A7]">{notice || "Appointments unavailable"}</p>}
          {data && <p role="status" className="text-[9px] font-medium text-[#8B95A7]">Showing {upcoming.length} of {countText(data.stats?.upcomingAppointments)} upcoming appointments · {history.length} history records (up to 50)</p>}
          {data && upcoming.length === 0 && <p role="status" className="text-[9px] font-medium text-[#8B95A7]">No upcoming appointments</p>}
          {data && history.length === 0 && <p role="status" className="text-[9px] font-medium text-[#8B95A7]">No appointment history</p>}
          {data && <p role="status" className="text-[9px] font-medium text-[#8B95A7]">{countText(data.stats?.activeQueues)} active queues today · {data.queueEntries?.length || 0} shown{data.queueEntries?.length ? "" : " · No active queue entries"}</p>}
          {appointments.map((appointment) => (
            <div key={appointment.id} title={appointment.detail} className={`flex items-center gap-4 py-3 border border-black/7 px-7 mb-3 rounded-full`}>

              <div className="text-right">
                <p className="text-[22px] font-semibold text-[#202D55] mr-4">{appointment.token}</p>
              </div>

              <div className="flex h-[45px] w-[45px] min-w-[36px] items-center justify-center rounded-full bg-[#E8F0FB] text-[10px] font-semibold text-[#202D55]">
                {appointment.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#17312E]">{appointment.name}</p>
                <p title={appointment.detail} className="mt-1 text-[9px] text-[#8B95A7]">{appointment.condition} · {appointment.detail}</p>
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
  const [selectedClinic, setSelectedClinic] = useState("");
  const [selection, setSelection] = useState({ month: "", date: "" });
  const [result, setResult] = useState(null);
  const [options, setOptions] = useState(null);
  const pendingRequest = React.useRef(null);
  const token = localStorage.getItem("patientAccessToken") || "";
  const params = new URLSearchParams();
  if (selectedClinic) params.set("clinicId", selectedClinic);
  if (selection.month) params.set("month", selection.month);
  if (selection.date) params.set("date", selection.date);
  const path = `/api/dashboard/patient${params.size ? `?${params}` : ""}`;
  const current = result?.path === path && result?.token === token ? result : null;
  const data = current?.data || null;
  const notice = !token ? "Sign in to view your patient dashboard." : current?.error ||
    (!current || current.loading ? "Loading patient dashboard..." : "");
  const clinics = options?.token === token ? options.clinics : [];
  const changeClinic = clinicId => {
    if (clinicId === selectedClinic) return;
    setResult(null);
    setSelectedClinic(clinicId);
  };
  const changeSelection = next => {
    if (next.month === selection.month && next.date === selection.date) return;
    setResult(null);
    setSelection(next);
  };

  useEffect(() => {
    let active = true;
    if (!token) {
      return () => { active = false; };
    }
    // Share only an in-flight request during development StrictMode effect replay.
    if (pendingRequest.current?.path !== path || pendingRequest.current?.token !== token) {
      const pending = { path, token, promise: request("GET", path, undefined, token) };
      pendingRequest.current = pending;
      const clear = () => { if (pendingRequest.current === pending) pendingRequest.current = null; };
      pending.promise.then(clear, clear);
    }
    pendingRequest.current.promise.then(response => {
      if (!active) return;
      if (response?.success !== true || response?.dashboard !== "patient" ||
          (response.appliedFilters?.clinicId || "") !== selectedClinic) {
        setResult({ path, token, error: "Dashboard response is unavailable for this selection." });
        return;
      }
      setOptions({ token, clinics: (response.selectorClinics || []).filter(clinic => clinic?._id), coverage: response.selectorCoverage });
      setResult({ path, token, data: response });
    }).catch(error => {
      if (!active) return;
      const details = readApiError(error);
      const messages = {
        401: "Your patient session has expired or is invalid. Please sign in again.",
        403: "Access denied for this patient or clinic selection.",
        404: "Patient not found.",
        500: "Unable to load the patient dashboard. Please try again later.",
      };
      setResult({ path, token, error: messages[error.response?.status] || details?.message || "Unable to load the patient dashboard." });
    });
    return () => { active = false; };
  }, [path, token, selectedClinic]);

  return (
    <div className="relative min-h-screen bg-[#F8F9F7] p-[15px] pr-[calc(25%+15px)]">
      <DashboardDemoIndicator />
      
      {/* Dashboard Header */}
      <header>
        <SchedulePanel data={data} selection={selection} onChange={changeSelection} notice={notice} />
        <div className="w-full">
          {/* <ClinicSelector /> */}
          
          <div className="flex w-full items-center justify-between">
            <ClinicSelector clinics={clinics} selectedClinic={selectedClinic} setSelectedClinic={changeClinic} notice={notice} coverage={options?.token === token ? options.coverage : null} />
            <RightSideControls />
          </div>

          <div className="mt-4 flex w-full items-stretch gap-4">
            <PatientStats data={data} notice={notice} />
            <WeeklyPatientChart data={data} />
          </div>
          <AppointmentsOverview data={data} notice={notice} />
        </div>
      </header>

      {/* Dashboard Content will come here */}

    </div>
  );
};

export default PatientDashboard;
