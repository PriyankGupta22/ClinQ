import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PageTitle, Response } from "./ProfilePage";
import { Calendar } from "./ui/calendar";
import { format, isToday } from "date-fns";

const emptyForm = {
  clinicId: "",
  doctorId: "",
  appointmentDate: new Date(),
  reason: "",
};

export default function AppointmentsPage({ request, response }) {
  const [items, setItems] = useState([]);
  const location = useLocation();
  const [form, setForm] = useState(() => {
    let bookingSelection = null;
    try {
      bookingSelection = JSON.parse(localStorage.getItem("bookingSelection"));
    } catch(e) {}
    
    return { 
      ...emptyForm, 
      clinicId: location.state?.clinicId || localStorage.getItem("lastClinicId") || bookingSelection?.clinic?._id || "",
      doctorId: location.state?.doctorId || bookingSelection?.doctor?._id || ""
    };
  });
  const [clinicDetails, setClinicDetails] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const load = useCallback(async () => {
    const data = await request("get", "/api/appointment/my-appointments");
    if (data?.appointments) {
      setItems(data.appointments);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (form.clinicId) {
      localStorage.setItem("lastClinicId", form.clinicId);
      
      // Fetch clinic details and doctors
      request("get", "/api/clinic/public").then((data) => {
        if (data?.clinics) {
          const matchedClinic = data.clinics.find(c => c._id === form.clinicId);
          if (matchedClinic) setClinicDetails(matchedClinic);
        }
      });

      request("get", `/api/clinic/public/${form.clinicId}/doctors`).then((data) => {
        if (data?.doctors) setDoctors(data.doctors);
        else setDoctors([]);
      });
    } else {
      setClinicDetails(null);
      setDoctors([]);
    }
  }, [form.clinicId, request]);

  const change = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const book = async (event) => {
    event.preventDefault();
    if (!form.doctorId || !form.appointmentDate) return;
    
    // Format the date to ISO string for backend
    const payload = {
      ...form,
      appointmentDate: form.appointmentDate.toISOString()
    };
    
    const data = await request("post", "/api/appointment/appointment", payload);
    if (data) {
      setForm(prev => ({ ...prev, doctorId: "", appointmentDate: new Date(), reason: "" }));
      load();
    }
  };

  // Filter items to show only today's appointments
  const todaysItems = items.filter(item => {
    if (!item.appointmentDate) return false;
    return isToday(new Date(item.appointmentDate));
  });

  return (
    <>
      <PageTitle eyebrow="Patient space" title="Appointments">
        <div className="two-column">
          {/* LEFT SIDE: TODAY'S APPOINTMENTS */}
          <div className="panel">
            <div className="panel-title">
              <p className="eyebrow">Your visits</p>
              <h2>Today's Appointments</h2>
            </div>
            <div className="appointment-list mt-4">
              {todaysItems.length === 0 && (
                <p className="empty">
                  No appointments for today.
                </p>
              )}
              {todaysItems.map((item) => (
                <article key={item._id}>
                  <div>
                    <strong>{item.reason || "General consultation"}</strong>
                    <small>
                      {item.doctorId?.name || item.doctorId} ·{" "}
                      {item.clinicId?.clinicName || item.clinicId} ·{" "}
                      {item.appointmentDate
                        ? format(new Date(item.appointmentDate), "hh:mm a")
                        : "Time pending"}
                    </small>
                  </div>
                  <span className={`pill ${item.status}`}>{item.status}</span>
                </article>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: CLINIC DETAILS AND BOOKING */}
          <div className="panel">
            <p className="eyebrow">New visit</p>
            <h2>Book an appointment</h2>
            
            {!form.clinicId || !clinicDetails ? (
              <p className="empty mt-4">No clinic selected. Please return to the discovery page and select a clinic first.</p>
            ) : (
              <div className="mt-4">
                {/* CLINIC DETAILS */}
                <div style={{ padding: "1.25rem", border: "1px solid #eaeaea", borderRadius: "12px", marginBottom: "1.5rem", background: "#f9fafb" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", marginBottom: "0.25rem" }}>
                    {clinicDetails.clinicName}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {clinicDetails.address?.city}, {clinicDetails.address?.state} · {clinicDetails.phone}
                  </p>
                </div>

                <form className="form-grid" onSubmit={book} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* DOCTOR LIST */}
                  <div className="field">
                    <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem", display: "block" }}>Select a Doctor</span>
                    <div className="doctor-grid" style={{ display: "grid", gap: "1rem" }}>
                      {doctors.map((link) => (
                        <article 
                          key={link.doctorId?._id} 
                          className={`doctor-row ${form.doctorId === link.doctorId?._id ? "selected" : ""}`}
                          style={{ border: form.doctorId === link.doctorId?._id ? "2px solid #2474e8" : "1px solid #eaeaea", cursor: "pointer", padding: "1rem", borderRadius: "12px", transition: "all 0.2s" }}
                          onClick={() => setForm({ ...form, doctorId: link.doctorId?._id })}
                        >
                          <div>
                            <strong style={{ color: form.doctorId === link.doctorId?._id ? "#111827" : "inherit" }}>{link.doctorId?.name}</strong>
                            <small style={{ display: "block", color: "#6b7280", marginTop: "0.25rem" }}>
                              {link.doctorId?.specialization} ·{" "}
                              {link.doctorId?.schedule?.day} ·{" "}
                              {link.doctorId?.schedule?.startTime}–{link.doctorId?.schedule?.endTime}
                            </small>
                          </div>
                        </article>
                      ))}
                      {doctors.length === 0 && <p className="empty" style={{ padding: "1rem 0" }}>No doctors available at this clinic.</p>}
                    </div>
                  </div>
                  
                  {/* SHADCN CALENDAR */}
                  <div className="field">
                    <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem", display: "block" }}>Select Date</span>
                    <div style={{ display: "flex", justifyContent: "center", border: "1px solid #eaeaea", borderRadius: "12px", padding: "1rem" }}>
                      <Calendar
                        mode="single"
                        selected={form.appointmentDate}
                        onSelect={(date) => setForm({ ...form, appointmentDate: date || new Date() })}
                        className="rounded-md border-0"
                      />
                    </div>
                  </div>

                  {/* REASON */}
                  <Field
                    label="Reason for visit"
                    name="reason"
                    value={form.reason}
                    onChange={change}
                    placeholder="E.g., Routine checkup"
                  />

                  <button className="primary" type="submit" disabled={!form.doctorId || !form.appointmentDate}>
                    Book appointment <span>↗</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
        <Response data={response} />
      </PageTitle>
    </>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="field">
      <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>{label}</span>
      <input required {...props} style={{ marginTop: "0.5rem", padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db", width: "100%" }} />
    </label>
  );
}
