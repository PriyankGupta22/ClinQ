import { useCallback, useEffect, useState } from "react";
import { PageTitle } from "./ProfilePage";

const emptyMedicine = { name: "", dosage: "", frequency: "", duration: "", instructions: "" };

const emptyForm = {
  appointmentId: "",
  doctorId: "",
  userId: "",
  clinicId: "",
  diagnosis: "",
  symptoms: [],
  medicines: [{ ...emptyMedicine }],
  tests: [],
  advice: "",
  followUpDate: "",
  notes: "",
};

const VIEW = { LIST: "list", CREATE: "create", DETAIL: "detail", EDIT: "edit" };

export default function PrescriptionPage({ request, consultation, isDoctor }) {
  const [view, setView] = useState(VIEW.LIST);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ ...emptyForm, medicines: [{ ...emptyMedicine }] });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [symptomInput, setSymptomInput] = useState("");
  const [testInput, setTestInput] = useState("");

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError("");
    const data = await request("get", "/api/prescription/doctor/my-prescriptions");
    if (data?.prescriptions) setPrescriptions(data.prescriptions);
    else if (data?.message) setError(data.message);
    setLoading(false);
  }, [request]);

  const loadAppointments = useCallback(async () => {
    const data = await request("get", isDoctor ? "/api/doctor-auth/appointments" : "/api/clinic/appointments");
    if (data?.appointments) setAppointments(data.appointments);
  }, [request, isDoctor]);

  useEffect(() => {
    loadPrescriptions();
    loadAppointments();
  }, [loadPrescriptions, loadAppointments]);

  useEffect(() => {
    if (!consultation) return;
    setForm((current) => ({ ...current, appointmentId: consultation.appointmentId?._id || consultation.appointmentId || "", doctorId: consultation.doctorId?._id || consultation.doctorId || "", userId: consultation.userId?._id || consultation.userId || "", clinicId: consultation.clinicId?._id || consultation.clinicId || "" }));
    setView(VIEW.CREATE);
  }, [consultation]);

  const pickAppointment = (apptId) => {
    const appt = appointments.find((a) => a._id === apptId);
    if (appt) {
      setForm((f) => ({
        ...f,
        appointmentId: appt._id,
        doctorId: appt.doctorId?._id || appt.doctorId || "",
        userId: appt.userId?._id || appt.userId || "",
        clinicId: appt.clinicId?._id || appt.clinicId || "",
      }));
    } else {
      setForm((f) => ({ ...f, appointmentId: apptId, doctorId: "", userId: "", clinicId: "" }));
    }
  };

  const updateMedicine = (idx, field, val) =>
    setForm((f) => ({ ...f, medicines: f.medicines.map((m, i) => (i === idx ? { ...m, [field]: val } : m)) }));
  const addMedicine = () =>
    setForm((f) => ({ ...f, medicines: [...f.medicines, { ...emptyMedicine }] }));
  const removeMedicine = (idx) =>
    setForm((f) => ({ ...f, medicines: f.medicines.filter((_, i) => i !== idx) }));

  const addSymptom = () => {
    const v = symptomInput.trim();
    if (v && !form.symptoms.includes(v)) { setForm((f) => ({ ...f, symptoms: [...f.symptoms, v] })); setSymptomInput(""); }
  };
  const removeSymptom = (s) => setForm((f) => ({ ...f, symptoms: f.symptoms.filter((x) => x !== s) }));

  const addTest = () => {
    const v = testInput.trim();
    if (v && !form.tests.includes(v)) { setForm((f) => ({ ...f, tests: [...f.tests, v] })); setTestInput(""); }
  };
  const removeTest = (t) => setForm((f) => ({ ...f, tests: f.tests.filter((x) => x !== t) }));

  const resetForm = () => { setForm({ ...emptyForm, medicines: [{ ...emptyMedicine }] }); setSymptomInput(""); setTestInput(""); setError(""); setSuccess(""); };

  const create = async (e) => {
    e.preventDefault();
    if (!form.appointmentId || !form.doctorId || !form.userId || !form.clinicId) {
      setError("Please select an appointment to auto-fill required IDs."); return;
    }
    setSaving(true); setError(""); setSuccess("");
    const payload = { ...form, medicines: form.medicines.filter((m) => m.name.trim()) };
    const data = await request("post", "/api/prescription", payload);
    if (data?.success) {
      setSuccess("Prescription created successfully!");
      resetForm();
      await loadPrescriptions();
      setTimeout(() => { setSuccess(""); setView(VIEW.LIST); }, 1200);
    } else {
      setError(data?.message || "Failed to create prescription.");
    }
    setSaving(false);
  };

  const openDetail = async (id) => {
    setLoading(true); setError("");
    const data = await request("get", `/api/prescription/${id}`);
    if (data?.prescription) { setSelected(data.prescription); setView(VIEW.DETAIL); }
    else setError(data?.message || "Failed to load prescription.");
    setLoading(false);
  };

  const openEdit = (rx) => {
    setForm({
      appointmentId: rx.appointmentId?._id || rx.appointmentId || "",
      doctorId: rx.doctorId?._id || rx.doctorId || "",
      userId: rx.userId?._id || rx.userId || "",
      clinicId: rx.clinicId?._id || rx.clinicId || "",
      diagnosis: rx.diagnosis || "",
      symptoms: rx.symptoms || [],
      medicines: rx.medicines?.length ? rx.medicines : [{ ...emptyMedicine }],
      tests: rx.tests || [],
      advice: rx.advice || "",
      followUpDate: rx.followUpDate ? rx.followUpDate.substring(0, 10) : "",
      notes: rx.notes || "",
    });
    setSelected(rx); setSymptomInput(""); setTestInput(""); setError(""); setSuccess("");
    setView(VIEW.EDIT);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    const payload = {
      diagnosis: form.diagnosis, symptoms: form.symptoms,
      medicines: form.medicines.filter((m) => m.name.trim()),
      tests: form.tests, advice: form.advice,
      followUpDate: form.followUpDate || undefined, notes: form.notes,
    };
    const data = await request("put", `/api/prescription/${selected._id}`, payload);
    if (data?.success) {
      setSuccess("Prescription updated!");
      await loadPrescriptions();
      setTimeout(() => { setSuccess(""); setView(VIEW.LIST); }, 1200);
    } else {
      setError(data?.message || "Failed to update.");
    }
    setSaving(false);
  };

  const deletePrescription = async (id) => {
    if (!window.confirm("Delete this prescription? This cannot be undone.")) return;
    setLoading(true); setError("");
    const data = await request("delete", `/api/prescription/${id}`);
    if (data?.success) {
      setSuccess("Prescription deleted.");
      setView(VIEW.LIST);
      await loadPrescriptions();
      setTimeout(() => setSuccess(""), 2000);
    } else {
      setError(data?.message || "Failed to delete.");
    }
    setLoading(false);
  };

  return (
    <PageTitle eyebrow="Doctor workspace" title="Prescriptions">
      {error && <div className="rx-alert rx-alert-error">{error}</div>}
      {success && <div className="rx-alert rx-alert-success">{success}</div>}

      {view === VIEW.LIST && (
        <>
          <div className="rx-list-header">
            <div>
              <p className="eyebrow">Prescription history</p>
              <p style={{ color: "var(--muted)", fontSize: 12, margin: "4px 0 0" }}>
                {prescriptions.length} total prescription{prescriptions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button className="primary" onClick={() => { resetForm(); setView(VIEW.CREATE); }}>
              + New prescription <span>↗</span>
            </button>
          </div>

          {loading && <p className="empty" style={{ marginTop: 24 }}>Loading prescriptions…</p>}

          {!loading && prescriptions.length === 0 && (
            <div className="rx-empty">
              <span className="rx-empty-icon">📋</span>
              <strong>No prescriptions yet</strong>
              <p>Create your first prescription after a consultation.</p>
              <button className="primary" onClick={() => { resetForm(); setView(VIEW.CREATE); }}>
                Create prescription <span>↗</span>
              </button>
            </div>
          )}

          {!loading && prescriptions.length > 0 && (
            <div className="appointment-list">
              {prescriptions.map((rx) => (
                <article key={rx._id}>
                  <div>
                    <strong>{rx.diagnosis || "No diagnosis noted"}</strong>
                    <small>
                      Patient: {rx.userId?.name || "—"} ·{" "}
                      {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} ·{" "}
                      {rx.medicines?.length || 0} medicine{rx.medicines?.length !== 1 ? "s" : ""}
                    </small>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button className="small-button" onClick={() => openDetail(rx._id)}>View</button>
                    <button className="small-button" onClick={() => openEdit(rx)}>Edit</button>
                    <button className="small-button danger" onClick={() => deletePrescription(rx._id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {(view === VIEW.CREATE || view === VIEW.EDIT) && (
        <PrescriptionForm
          isEdit={view === VIEW.EDIT}
          form={form} setForm={setForm}
          appointments={appointments}
          pickAppointment={pickAppointment}
          symptomInput={symptomInput} setSymptomInput={setSymptomInput}
          testInput={testInput} setTestInput={setTestInput}
          addSymptom={addSymptom} removeSymptom={removeSymptom}
          addTest={addTest} removeTest={removeTest}
          updateMedicine={updateMedicine} addMedicine={addMedicine} removeMedicine={removeMedicine}
          onSubmit={view === VIEW.EDIT ? saveEdit : create}
          saving={saving}
          onCancel={() => setView(VIEW.LIST)}
        />
      )}

      {view === VIEW.DETAIL && selected && (
        <PrescriptionDetail
          rx={selected}
          onBack={() => setView(VIEW.LIST)}
          onEdit={() => openEdit(selected)}
          onDelete={() => deletePrescription(selected._id)}
          loading={loading}
        />
      )}
    </PageTitle>
  );
}

function PrescriptionForm({
  isEdit, form, setForm, appointments, pickAppointment,
  symptomInput, setSymptomInput, testInput, setTestInput,
  addSymptom, removeSymptom, addTest, removeTest,
  updateMedicine, addMedicine, removeMedicine,
  onSubmit, saving, onCancel,
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="rx-form-header">
        <div>
          <p className="eyebrow">{isEdit ? "Editing" : "New"} prescription</p>
          <h2 style={{ margin: "4px 0 0", fontSize: 22, letterSpacing: -1 }}>
            {isEdit ? "Edit Prescription" : "Create Prescription"}
          </h2>
        </div>
        <button type="button" className="small-button" onClick={onCancel}>← Back to list</button>
      </div>

      {!isEdit && (
        <div className="panel" style={{ marginBottom: 18 }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Link to appointment</p>
          <select className="rx-select" value={form.appointmentId}
            onChange={(e) => pickAppointment(e.target.value)}>
            <option value="">— Select appointment to auto-fill IDs —</option>
            {appointments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.userId?.name || "Patient"} · {a.reason || "Consultation"} ·{" "}
                {a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
              </option>
            ))}
          </select>
          {form.appointmentId && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <RxChip label="Doctor ID" value={form.doctorId} />
              <RxChip label="Patient ID" value={form.userId} />
              <RxChip label="Clinic ID" value={form.clinicId} />
            </div>
          )}
        </div>
      )}

      <div className="rx-form-cols">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="panel">
            <p className="eyebrow" style={{ marginBottom: 8 }}>Diagnosis</p>
            <input className="rx-input" placeholder="Primary diagnosis…"
              value={form.diagnosis}
              onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} />
          </div>

          <div className="panel">
            <p className="eyebrow" style={{ marginBottom: 8 }}>Symptoms</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="rx-input" placeholder="Type symptom, press Enter"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSymptom(); } }} />
              <button type="button" className="small-button" onClick={addSymptom}>Add</button>
            </div>
            {form.symptoms.length > 0 && (
              <div className="rx-tags">
                {form.symptoms.map((s) => (
                  <span key={s} className="rx-tag">{s}
                    <button type="button" onClick={() => removeSymptom(s)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <p className="eyebrow" style={{ marginBottom: 8 }}>Tests prescribed</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="rx-input" placeholder="Type test name, press Enter"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTest(); } }} />
              <button type="button" className="small-button" onClick={addTest}>Add</button>
            </div>
            {form.tests.length > 0 && (
              <div className="rx-tags">
                {form.tests.map((t) => (
                  <span key={t} className="rx-tag" style={{ background: "#e8f0ff", color: "#2166d1" }}>{t}
                    <button type="button" onClick={() => removeTest(t)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <p className="eyebrow" style={{ marginBottom: 8 }}>Advice</p>
            <textarea className="rx-textarea" rows={3} placeholder="Dietary advice, lifestyle changes…"
              value={form.advice}
              onChange={(e) => setForm((f) => ({ ...f, advice: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p className="eyebrow" style={{ margin: 0 }}>Medicines</p>
              <button type="button" className="small-button" onClick={addMedicine}>+ Add medicine</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {form.medicines.map((med, idx) => (
                <div key={idx} className="rx-medicine-row">
                  <div className="rx-medicine-grid">
                    <input className="rx-input" placeholder="Name *" value={med.name}
                      onChange={(e) => updateMedicine(idx, "name", e.target.value)} />
                    <input className="rx-input" placeholder="Dosage *" value={med.dosage}
                      onChange={(e) => updateMedicine(idx, "dosage", e.target.value)} />
                    <input className="rx-input" placeholder="Frequency *" value={med.frequency}
                      onChange={(e) => updateMedicine(idx, "frequency", e.target.value)} />
                    <input className="rx-input" placeholder="Duration *" value={med.duration}
                      onChange={(e) => updateMedicine(idx, "duration", e.target.value)} />
                  </div>
                  <input className="rx-input" style={{ marginTop: 8 }} placeholder="Instructions (optional)"
                    value={med.instructions}
                    onChange={(e) => updateMedicine(idx, "instructions", e.target.value)} />
                  {form.medicines.length > 1 && (
                    <button type="button" className="small-button danger"
                      style={{ marginTop: 6, fontSize: 10 }} onClick={() => removeMedicine(idx)}>
                      Remove medicine
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow" style={{ marginBottom: 8 }}>Follow-up date</p>
            <input type="date" className="rx-input" value={form.followUpDate}
              onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))} />
          </div>

          <div className="panel">
            <p className="eyebrow" style={{ marginBottom: 8 }}>Clinical notes</p>
            <textarea className="rx-textarea" rows={3} placeholder="Additional notes…"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create prescription"} <span>↗</span>
        </button>
        <button type="button" className="secondary" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}

function PrescriptionDetail({ rx, onBack, onEdit, onDelete, loading }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button className="small-button" onClick={onBack}>← Back to list</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="small-button" onClick={onEdit}>Edit</button>
          <button className="small-button danger" onClick={onDelete} disabled={loading}>Delete</button>
        </div>
      </div>

      <div className="rx-detail-card">
        <div className="rx-detail-band">
          <div>
            <p className="eyebrow" style={{ color: "#a8c9f5", marginBottom: 4 }}>Prescription</p>
            <h2 style={{ margin: 0, fontSize: 22, letterSpacing: -1, color: "white" }}>
              {rx.diagnosis || "No diagnosis noted"}
            </h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#a8c9f5" }}>Issued on</p>
            <strong style={{ fontSize: 13, color: "white" }}>
              {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </strong>
          </div>
        </div>

        <div className="rx-meta-grid">
          <RxMeta label="Patient" value={rx.userId?.name || rx.userId || "—"} />
          <RxMeta label="Doctor" value={rx.doctorId?.name ? `Dr. ${rx.doctorId.name}` : "—"} />
          <RxMeta label="Specialization" value={rx.doctorId?.specialization || "—"} />
          <RxMeta label="Follow-up" value={rx.followUpDate
            ? new Date(rx.followUpDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "Not scheduled"} />
        </div>

        {rx.symptoms?.length > 0 && (
          <RxSection title="Symptoms">
            <div className="rx-tags" style={{ marginTop: 0 }}>
              {rx.symptoms.map((s) => <span key={s} className="rx-tag" style={{ cursor: "default" }}>{s}</span>)}
            </div>
          </RxSection>
        )}

        {rx.medicines?.length > 0 && (
          <RxSection title={`Medicines (${rx.medicines.length})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rx.medicines.map((med, i) => (
                <div key={i} className="rx-med-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <strong style={{ fontSize: 13 }}>{med.name}</strong>
                    <span className="pill">{med.dosage}</span>
                  </div>
                  <small style={{ color: "var(--muted)", marginTop: 4, display: "block" }}>
                    {med.frequency} · {med.duration}{med.instructions ? ` · ${med.instructions}` : ""}
                  </small>
                </div>
              ))}
            </div>
          </RxSection>
        )}

        {rx.tests?.length > 0 && (
          <RxSection title="Tests Prescribed">
            <div className="rx-tags" style={{ marginTop: 0 }}>
              {rx.tests.map((t) => (
                <span key={t} className="rx-tag" style={{ background: "#e8f0ff", color: "#2166d1", cursor: "default" }}>{t}</span>
              ))}
            </div>
          </RxSection>
        )}

        {rx.advice && (
          <RxSection title="Advice">
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{rx.advice}</p>
          </RxSection>
        )}

        {rx.notes && (
          <RxSection title="Clinical Notes">
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{rx.notes}</p>
          </RxSection>
        )}
      </div>
    </div>
  );
}

function RxSection({ title, children }) {
  return (
    <div className="rx-section">
      <p className="eyebrow" style={{ marginBottom: 10 }}>{title}</p>
      {children}
    </div>
  );
}

function RxMeta({ label, value }) {
  return (
    <div>
      <p className="eyebrow" style={{ margin: "0 0 3px" }}>{label}</p>
      <strong style={{ fontSize: 13 }}>{value}</strong>
    </div>
  );
}

function RxChip({ label, value }) {
  if (!value) return null;
  return (
    <span style={{
      fontSize: 10, background: "#e8f0ff", color: "#2166d1",
      borderRadius: 4, padding: "3px 8px", fontFamily: "'DM Mono', monospace"
    }}>
      {label}: <b>{value.slice(0, 8)}…</b>
    </span>
  );
}

