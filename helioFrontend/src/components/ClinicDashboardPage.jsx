import { useEffect, useState } from "react";
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

export default function ClinicDashboardPage({ request, response, setPage }) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [stats, setStats] = useState(null);
  useEffect(() => {
    Promise.all([
      request("get", "/api/clinic/doctor"),
      request("get", "/api/clinic/appointments"),
      request("get", "/api/cliniAuthRoutes/clinicMe"),
      request("get", "/api/clinic/dashboard-stats"),
    ]).then(([doctorData, appointmentData, clinicData, statsData]) => {
      if (doctorData?.doctors) setDoctors(doctorData.doctors);
      if (appointmentData?.appointments)
        setAppointments(appointmentData.appointments);
      if (clinicData) setClinic(clinicData);
      const loadedDoctors = doctorData?.doctors || [];
      const loadedAppointments = appointmentData?.appointments || [];
      setStats(
        statsData?.stats ||
          getFallbackStats(loadedAppointments, loadedDoctors.length),
      );
    });
  }, [request]);
  const scheduled = appointments.filter((item) => item.status === "scheduled");
  const completed = appointments.filter((item) => item.status === "completed");
  const trend = getMonthlyData(appointments);
  const today = appointments.filter(
    (item) =>
      item.appointmentDate &&
      new Date(item.appointmentDate).toDateString() ===
        new Date().toDateString(),
  );
  const sevenDayTrend =
    stats?.trend || getSevenDayData(appointments, doctors.length);
  return (
    <PageTitle eyebrow="Clinic overview" title="Overview">
      <div className="dashboard-intro">
        <div>
          <p className="dashboard-subtitle">
            {clinic?.clinicName || "Your clinic"} performance at a glance
          </p>
        </div>
        <div className="dashboard-actions">
          <button type="button" className="filter-button">
            Last 7 days⌄
          </button>
          <button
            type="button"
            className="export-button"
            onClick={() => setPage("queue")}
          >
            Open today's queue ↗
          </button>
        </div>
      </div>
      <section className="dashboard-kpis">
        <Kpi
          title="Total patients today"
          value={stats?.patientsToday ?? "--"}
          note="unique patients today"
          values={sevenDayTrend.map((item) => item.patients)}
        />
        <Kpi
          title="Appointments today"
          value={stats?.appointmentsToday ?? "--"}
          note="scheduled for today"
          values={sevenDayTrend.map((item) => item.appointments)}
          positive
        />
        <Kpi
          title="Active doctors"
          value={stats?.activeDoctors ?? "--"}
          note="in your directory"
          values={sevenDayTrend.map((item) => item.doctors)}
        />
      </section>
      <section className="dashboard-panels">
        <div className="dashboard-panel lab-panel">
          <PanelHeading
            title="Appointment status overview"
            action="Live data"
          />
          <div className="status-summary">
            <div className="status-ring">
              <strong>
                {appointments.length
                  ? Math.round((completed.length / appointments.length) * 100)
                  : 0}
                %
              </strong>
              <small>completed</small>
            </div>
            <div className="status-legend">
              <StatusLine
                color="#2474e8"
                label="Scheduled"
                value={scheduled.length}
              />
              <StatusLine
                color="#7aaaf2"
                label="Completed"
                value={completed.length}
              />
              <StatusLine
                color="#cbd8e9"
                label="Cancelled"
                value={
                  appointments.filter((item) => item.status === "cancelled")
                    .length
                }
              />
            </div>
          </div>
          <div className="status-bars">
            <StatusBar
              label="Scheduled"
              value={scheduled.length}
              total={appointments.length}
              color="#2474e8"
            />
            <StatusBar
              label="Completed"
              value={completed.length}
              total={appointments.length}
              color="#7aaaf2"
            />
            <StatusBar
              label="Today"
              value={today.length}
              total={appointments.length}
              color="#cbd8e9"
            />
          </div>
        </div>
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
          <PanelHeading title="Revenue overview" action="Not connected" />
          <div className="revenue-placeholder">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={trend}>
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
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#b7cfee"
                  fill="#edf4ff"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
            <p>Revenue data is not available in the current backend.</p>
          </div>
        </div>
        <div className="dashboard-panel specialist-panel">
          <PanelHeading title="Our specialists" action="Manage doctors" />
          <div className="specialist-list">
            {doctors.length === 0 && (
              <p className="empty">No doctors added yet.</p>
            )}
            {doctors.slice(0, 3).map((link) => (
              <div className="specialist-row" key={link._id}>
                <div className="doctor-avatar">
                  {link.doctorId?.name?.slice(0, 1) || "D"}
                </div>
                <div>
                  <strong>Dr. {link.doctorId?.name}</strong>
                  <small>{link.doctorId?.specialization || "Specialist"}</small>
                </div>
                <button
                  type="button"
                  onClick={() => setPage("clinic-admin/doctors")}
                >
                  ↗
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="dashboard-next">
        <div>
          <p className="eyebrow">Clinic operations</p>
          <strong>{today.length} appointments today</strong>
          <small>Keep the waiting room moving with the live queue.</small>
        </div>
        <button
          type="button"
          className="primary"
          onClick={() => setPage("queue")}
        >
          View queue <span>↗</span>
        </button>
      </div>
      <Response data={response} />
    </PageTitle>
  );
}
function Kpi({ title, value, note, values, positive }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <p>{title}</p>
        <button type="button">•••</button>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
      <SquareSpark values={values} positive={positive} />
    </div>
  );
}
function SquareSpark({ values, positive }) {
  const max = Math.max(...values, 1);
  return (
    <div className="square-spark" aria-label="seven day trend">
      {Array.from({ length: 7 }, (_, index) => {
        const value = values[index % Math.max(values.length, 1)] || 0;
        const count = value ? Math.max(1, Math.round((value / max) * 5)) : 1;
        return (
          <span className="square-spark-column" key={index}>
            {Array.from({ length: count }, (_, cell) => (
              <i
                key={cell}
                className={value ? "filled" : ""}
                style={{
                  opacity: value ? 0.35 + (value / max) * 0.65 : 0.28,
                  background: positive ? "#2474e8" : "#77aaf1",
                }}
              />
            ))}
          </span>
        );
      })}
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
function StatusLine({ color, label, value }) {
  return (
    <div>
      <i style={{ background: color }} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function StatusBar({ label, value, total, color }) {
  return (
    <div>
      <span>{label}</span>
      <div>
        <b
          style={{
            width: `${total ? Math.max(4, (value / total) * 100) : 4}%`,
            background: color,
          }}
        />
      </div>
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
      const date = new Date(item.createdAt || item.appointmentDate);
      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === monthDate.getFullYear() &&
        date.getMonth() === monthDate.getMonth()
      );
    });
    return {
      month: monthDate.toLocaleString("en-US", { month: "short" }),
      value: monthItems.length,
    };
  });
}
function getFallbackStats(items, doctorCount) {
  const todayKey = new Date().toDateString();
  const todayItems = items.filter(
    (item) =>
      item.appointmentDate &&
      new Date(item.appointmentDate).toDateString() === todayKey,
  );
  return {
    patientsToday: new Set(
      todayItems.map((item) => item.userId?._id || item.userId),
    ).size,
    appointmentsToday: todayItems.length,
    activeDoctors: doctorCount,
    trend: getSevenDayData(items, doctorCount),
  };
}
function getSevenDayData(items, doctorCount) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(today);
    day.setDate(today.getDate() - 6 + offset);
    const dayItems = items.filter(
      (item) =>
        item.appointmentDate &&
        new Date(item.appointmentDate).toDateString() === day.toDateString(),
    );
    return {
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      patients: new Set(dayItems.map((item) => item.userId?._id || item.userId))
        .size,
      appointments: dayItems.length,
      doctors: doctorCount,
    };
  });
}
