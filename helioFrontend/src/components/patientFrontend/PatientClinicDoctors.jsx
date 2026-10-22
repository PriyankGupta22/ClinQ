import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCalendar, FiClock, FiSearch, FiShield, FiAlertTriangle } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { readApiError, request } from "../../api/client";

const clinicImage = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80";

const getDefaultDate = () => {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
  return date.toISOString().slice(0, 16);
};

export default function PatientClinicDoctors() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("patientAccessToken");
  const clinicId = location.state?.clinicId;
  const clinicName = location.state?.clinicName || "Selected clinic";
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("patientBookingContext"));
      return saved?.clinicId === clinicId ? saved.doctor : null;
    } catch {
      return null;
    }
  });
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ reason: "", age: "", appointmentDate: getDefaultDate(), isEmergency: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!clinicId) {
      setLoading(false);
      setError("Choose a clinic before selecting a doctor.");
      return;
    }

    request("get", `/api/clinic/public/${clinicId}/doctors`)
      .then((result) => {
        setClinic(result?.clinic || { _id: clinicId, clinicName });
        setDoctors((result?.doctors || []).filter((link) => link.doctorId));
      })
      .catch((requestError) => setError(readApiError(requestError).message || "Could not load doctors for this clinic."))
      .finally(() => setLoading(false));
  }, [clinicId, clinicName]);

  const filteredDoctors = useMemo(() => doctors.filter((link) => {
    const doctor = link.doctorId;
    return `${doctor.name} ${doctor.specialization || ""}`.toLowerCase().includes(search.toLowerCase());
  }), [doctors, search]);

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const bookAppointment = async (event) => {
    event.preventDefault();
    if (!selectedDoctor) return setError("Select a doctor first.");
    if (!form.reason.trim() || !form.age || !form.appointmentDate) return setError("Reason, age, and appointment date are required.");
    if (Number(form.age) < 0 || Number(form.age) > 130) return setError("Enter a valid age.");
    const appointmentDate = new Date(form.appointmentDate);
    if (Number.isNaN(appointmentDate.getTime()) || appointmentDate <= new Date()) return setError("Choose a future appointment time.");

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await request("post", "/api/appointment/appointment", {
        clinicId,
        doctorId: selectedDoctor.doctorId._id,
        reason: form.reason.trim(),
        age: Number(form.age),
        appointmentDate: appointmentDate.toISOString(),
        isEmergency: form.isEmergency,
        priority: form.isEmergency ? "emergency" : "normal",
      }, token);
      setSuccess(form.isEmergency
        ? "Emergency appointment created and placed at the front of the queue."
        : "Appointment created and added to the clinic queue.");
      setForm({ reason: "", age: "", appointmentDate: getDefaultDate(), isEmergency: false });
    } catch (requestError) {
      const detail = readApiError(requestError);
      setError(detail.error ? `${detail.message}: ${detail.error}` : detail.message || "Could not create the appointment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F7] p-[15px]">
      <div className="mb-4 flex min-h-[80px] flex-wrap items-center justify-between gap-4 rounded-[30px] bg-white px-6 py-4">
        <div>
          <button onClick={() => navigate("/patient/clinics")} className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.8px] text-[#739D96]"><FiArrowLeft /> Back to clinics</button>
          <p className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8BA49F]">SELECT A DOCTOR</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.7px] text-[#17312E]">{clinic?.clinicName || clinicName}</h1>
        </div>
        <div className="flex h-[48px] min-w-[260px] items-center gap-3 rounded-full border border-[#E5EEEB] bg-[#F8FBFA] px-5"><FiSearch className="text-[#739D96]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search doctors..." className="w-full bg-transparent text-xs text-[#17312E] outline-none" /></div>
      </div>

      {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</p>}
      {success && <p className="mb-4 rounded-xl bg-[#E4F1EE] px-4 py-3 text-xs text-[#28504B]">{success}</p>}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,.8fr)]">
        <section className="rounded-[20px] bg-white p-6">
          <div className="mb-5 flex items-end justify-between"><div><p className="text-[9px] font-semibold tracking-[.4px] text-[#28504B]">CLINIC DOCTORS</p><h2 className="mt-2 text-[20px] font-semibold text-[#17312E]">Doctors available here</h2></div><span className="text-[9px] uppercase tracking-[.8px] text-[#8BA49F]">{filteredDoctors.length} Doctors</span></div>
          {loading ? <p className="py-16 text-center text-sm text-[#8BA49F]">Loading doctors...</p> : !filteredDoctors.length ? <p className="py-16 text-center text-sm text-[#8BA49F]">No active doctors found in this clinic.</p> : <div className="space-y-3">{filteredDoctors.map((link) => {
            const doctor = link.doctorId;
            const selected = selectedDoctor?.doctorId?._id === doctor._id;
            return <button key={link._id} onClick={() => { setSelectedDoctor(link); localStorage.setItem("patientBookingContext", JSON.stringify({ clinicId, clinicName: clinic?.clinicName || clinicName, doctor: link })); window.dispatchEvent(new Event("patient-booking-context")); setError(""); }} className={`flex w-full items-center gap-4 rounded-[24px] p-4 text-left transition ${selected ? "bg-[#E4F1EE]" : "bg-[#F5F9F8] hover:bg-[#EAF3F1]"}`}><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#17312E] text-lg font-semibold text-white">{doctor.name?.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="text-[14px] font-semibold text-[#17312E]">Dr. {doctor.name}</p><p className="mt-1 text-[9px] font-semibold uppercase tracking-[.7px] text-[#75908A]">{doctor.specialization || "General physician"}</p><p className="mt-2 text-[10px] text-[#54756F]">{doctor.schedule?.day || "Clinic schedule"} · {doctor.schedule?.startTime || "09:00"}–{doctor.schedule?.endTime || "17:00"}</p></div><span className="rounded-full bg-white px-4 py-2 text-[8px] font-semibold uppercase tracking-[.6px] text-[#28504B]">{selected ? "Selected" : "Choose"}</span></button>;
          })}</div>}
        </section>

        <section className="rounded-[20px] bg-[#17312E] p-6 text-white">
          <div className="mb-5 flex items-center gap-3"><div className="h-12 w-12 overflow-hidden rounded-2xl bg-white"><img src={clinic?.image || clinicImage} alt="" className="h-full w-full object-cover" /></div><div><p className="text-[9px] uppercase tracking-[1px] text-white/45">NEW APPOINTMENT</p><h2 className="mt-1 text-[20px] font-semibold">{selectedDoctor ? `Dr. ${selectedDoctor.doctorId.name}` : "Choose a doctor"}</h2></div></div>
          <form onSubmit={bookAppointment} className="space-y-4">
            <label className="block text-[9px] font-semibold uppercase tracking-[.8px] text-white/55">Reason<input name="reason" value={form.reason} onChange={updateForm} placeholder="What do you need help with?" className="mt-2 h-12 w-full rounded-2xl bg-white/10 px-4 text-xs text-white outline-none placeholder:text-white/35" /></label>
            <label className="block text-[9px] font-semibold uppercase tracking-[.8px] text-white/55">Patient age<input name="age" type="number" min="0" max="130" value={form.age} onChange={updateForm} placeholder="Age in years" className="mt-2 h-12 w-full rounded-2xl bg-white/10 px-4 text-xs text-white outline-none placeholder:text-white/35" /></label>
            <label className="block text-[9px] font-semibold uppercase tracking-[.8px] text-white/55">Appointment date and time<div className="relative mt-2"><FiCalendar className="absolute left-4 top-4 text-white/45" /><input name="appointmentDate" type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={form.appointmentDate} onChange={updateForm} className="h-12 w-full rounded-2xl bg-white/10 pl-11 pr-4 text-xs text-white outline-none" /></div></label>
            <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${form.isEmergency ? "border-amber-300/70 bg-amber-300/15" : "border-white/10 bg-white/5"}`}><input name="isEmergency" type="checkbox" checked={form.isEmergency} onChange={updateForm} className="h-4 w-4 accent-amber-300" /><span><span className="flex items-center gap-2 text-xs font-semibold"><FiAlertTriangle className="text-amber-300" /> Mark as emergency</span><span className="mt-1 block text-[9px] text-white/50">Emergency entries are placed ahead of normal waiting patients.</span></span></label>
            <button disabled={saving || !selectedDoctor} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[9px] font-bold uppercase tracking-[.9px] text-[#17312E] disabled:cursor-not-allowed disabled:opacity-45">{saving ? "Booking..." : "Confirm appointment"} <FiClock /></button>
          </form>
          <div className="mt-5 flex items-start gap-2 text-[9px] leading-4 text-white/45"><FiShield className="mt-0.5 shrink-0" /> Your appointment is created only for this clinic and selected doctor.</div>
        </section>
      </div>
    </div>
  );
}
