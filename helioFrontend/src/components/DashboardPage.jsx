import { useEffect } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageTitle, Response } from "./ProfilePage";

export default function DashboardPage({
  appointments,
  setAppointments,
  request,
  response,
  setPage,
}) {
  useEffect(() => {
    request("get", "/api/appointment/my-appointments").then((data) => {
      if (data?.appointments) setAppointments(data.appointments);
    });
  }, [request, setAppointments]);
  const scheduled = appointments.filter((item) => item.status === "scheduled");
  const completed = appointments.filter((item) => item.status === "completed");
  const trend = getMonthlyData(appointments);
  const specialists = [
    ...new Map(
      appointments
        .filter((item) => item.doctorId?.name)
        .map((item) => [item.doctorId._id, item.doctorId]),
    ).values(),
  ];
  const upcoming = scheduled[0];

  return (
    <PageTitle eyebrow="Patient overview" title="Overview">
      <div className="dashboard-intro">
        <p className="dashboard-subtitle">Your latest healthcare activity</p>
        <div className="dashboard-actions">
          <button type="button" className="filter-button">
            Last 6 months⌄
          </button>
          <button
            type="button"
            className="export-button"
            onClick={() => setPage("appointments")}
          >
            View appointments ↗
          </button>
        </div>
      </div>
      <section className="dashboard-kpis">
        <Kpi
          title="Total appointments"
          value={appointments.length}
          note="all recorded visits"
          data={trend}
        />
        <Kpi
          title="Upcoming visits"
          value={scheduled.length}
          note="scheduled appointments"
          data={trend.map((item) => ({ ...item, value: item.scheduled }))}
          positive
        />
        <Kpi
          title="Completed care"
          value={completed.length}
          note="completed consultations"
          data={trend.map((item) => ({ ...item, value: item.completed }))}
        />
      </section>
      <section className="dashboard-panels">
        <LabStatusPanel />
        <div className="dashboard-panel visits-panel">
          <PanelHeading
            title="Patient visits overview"
            action={`${appointments.length} total`}
          />
          <ResponsiveContainer width="100%" height={205}>
            <BarChart
              data={trend}
              margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#edf1f6" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#96a1b1" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#96a1b1" }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "#f5f8fd" }}
                contentStyle={{
                  border: "1px solid #e1e9f3",
                  borderRadius: 7,
                  fontSize: 11,
                }}
              />
              <Bar
                dataKey="value"
                fill="#5794ee"
                radius={[4, 4, 0, 0]}
                barSize={34}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="dashboard-panels lower-panels">
        <div className="dashboard-panel revenue-panel">
          <PanelHeading title="Appointment activity" action="Monthly⌄" />
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart
              data={trend}
              margin={{ top: 12, right: 5, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6ba5f5" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#6ba5f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#edf1f6"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#96a1b1" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#96a1b1" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #e1e9f3",
                  borderRadius: 7,
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2474e8"
                strokeWidth={2}
                fill="url(#blueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-panel specialist-panel">
          <PanelHeading title="Your specialists" action="See all" />
          <div className="specialist-list">
            {specialists.length === 0 && (
              <p className="empty">
                Your doctors will appear after your first appointment.
              </p>
            )}
            {specialists.slice(0, 3).map((doctor) => (
              <div className="specialist-row" key={doctor._id}>
                <div className="doctor-avatar">
                  {doctor.name?.slice(0, 1) || "D"}
                </div>
                <div>
                  <strong>Dr. {doctor.name}</strong>
                  <small>
                    {doctor.specialization || "Healthcare specialist"}
                  </small>
                </div>
                <button type="button" onClick={() => setPage("appointments")}>
                  ↗
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="dashboard-next">
        <div>
          <p className="eyebrow">Next appointment</p>
          <strong>
            {upcoming
              ? upcoming.reason || "General consultation"
              : "No upcoming appointment"}
          </strong>
          <small>
            {upcoming
              ? `${upcoming.doctorId?.name || "Doctor"} · ${upcoming.clinicId?.clinicName || "Clinic"}`
              : "Choose a clinic to book your next visit."}
          </small>
        </div>
        <button
          type="button"
          className="primary"
          onClick={() => setPage(upcoming ? "appointments" : "clinics")}
        >
          {upcoming ? "View details" : "Find a clinic"} <span>↗</span>
        </button>
      </div>
      <Response data={response} />
    </PageTitle>
  );
}

function LabStatusPanel() {
  return (
    <div className="dashboard-panel lab-panel">
      <PanelHeading title="Lab test status overview" action="Not connected" />
      <div className="lab-empty">
        <div className="lab-icon">+</div>
        <strong>Lab module unavailable</strong>
        <p>Lab test tracking is not supported by the current backend.</p>
      </div>
      <div className="status-bars disabled-bars">
        <div>
          <span>Completed tests</span>
          <div>
            <b />
          </div>
        </div>
        <div>
          <span>Pending tests</span>
          <div>
            <b />
          </div>
        </div>
        <div>
          <span>Critical / abnormal</span>
          <div>
            <b />
          </div>
        </div>
      </div>
    </div>
  );
}
function Kpi({ title, value, note, data, positive }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <p>{title}</p>
        <button type="button">•••</button>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
      <div className="kpi-chart">
        <ResponsiveContainer width="100%" height={45}>
          <AreaChart data={data}>
            <Area
              type="monotone"
              dataKey="value"
              stroke={positive ? "#2474e8" : "#77aaf1"}
              fill={positive ? "#e9f2ff" : "#edf4ff"}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
function PanelHeading({ title, action }) {
  return (
    <div className="dashboard-panel-heading">
      <h2>{title}</h2>
      <button type="button">{action}</button>
    </div>
  );
}
function getMonthlyData(items) {
  const now = new Date();
  const months = Array.from(
    { length: 12 },
    (_, offset) => new Date(now.getFullYear(), now.getMonth() - 11 + offset, 1),
  );
  return months.map((monthDate) => {
    const monthItems = items.filter((item) => {
      const itemDate = new Date(item.createdAt || item.appointmentDate);
      return (
        !Number.isNaN(itemDate.getTime()) &&
        itemDate.getFullYear() === monthDate.getFullYear() &&
        itemDate.getMonth() === monthDate.getMonth()
      );
    });
    return {
      month: monthDate.toLocaleString("en-US", { month: "short" }),
      value: monthItems.length,
      scheduled: monthItems.filter((item) => item.status === "scheduled")
        .length,
      completed: monthItems.filter((item) => item.status === "completed")
        .length,
    };
  });
}
