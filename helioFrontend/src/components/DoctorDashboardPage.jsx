import { useCallback, useEffect, useState } from "react";
import { PageTitle } from "./ProfilePage";

export default function DoctorDashboardPage({ request, setPage }) {
  const [doctor, setDoctor] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const [me, clinicData, appointmentData] = await Promise.all([request("get", "/api/doctor-auth/me"), request("get", "/api/doctor-auth/clinics"), request("get", "/api/doctor-auth/appointments", null)]);
    if (me?.doctor) setDoctor(me.doctor);
    if (clinicData?.clinics) setClinics(clinicData.clinics);
    if (appointmentData?.appointments) setAppointments(appointmentData.appointments);
    else if (appointmentData?.message) setError(appointmentData.message);
  }, [request]);
  useEffect(() => { load(); }, [load]);
  const today = new Date().toDateString();
  const todayAppointments = appointments.filter((appointment) => new Date(appointment.appointmentDate).toDateString() === today);
  return <PageTitle eyebrow="Doctor workspace" title={`Welcome${doctor?.name ? `, Dr. ${doctor.name}` : ""}`}>
    {error && <div className="rx-alert rx-alert-error">{error}</div>}
    <div className="queue-metrics"><Metric label="My clinics" value={clinics.length} /><Metric label="Today's patients" value={todayAppointments.length} /><Metric label="Scheduled appointments" value={appointments.filter((item) => item.status === "scheduled").length} /></div>
    <div className="panel queue-panel"><div className="panel-title"><p className="eyebrow">My clinics</p><h2>Choose a clinic to open its live queue</h2></div>
      {clinics.length === 0 ? <p className="empty">You are not associated with a clinic yet. Ask a clinic administrator to add your existing doctor profile.</p> : <div className="queue-list">{clinics.map((link) => <article className="queue-row" key={link._id}><b>+</b><div><strong>{link.clinicId?.clinicName}</strong><small>{link.clinicId?.address?.city || "Clinic"} · {todayAppointments.filter((a) => String(a.clinicId?._id || a.clinicId) === String(link.clinicId?._id)).length} patients today</small></div><button className="small-button" onClick={() => setPage("queue", { state: { clinicId: link.clinicId?._id } })}>Open queue</button></article>)}</div>}
    </div>
  </PageTitle>;
}
function Metric({ label, value }) { return <div className="metric-card"><p className="eyebrow">{label}</p><strong>{value}</strong><small>live data</small></div>; }
