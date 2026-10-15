import { useCallback, useEffect, useState } from "react";
import { PageTitle } from "./ProfilePage";

export default function PatientPrescriptionsPage({ request }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    setError("");
    const data = await request("get", "/api/prescription/patient/my-prescriptions");
    if (data?.prescriptions) setPrescriptions(data.prescriptions);
    else if (data?.message) setError(data.message);
    setLoading(false);
  }, [request]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  const openDetail = async (id) => {
    setLoading(true);
    setError("");
    const data = await request("get", `/api/prescription/${id}`);
    if (data?.prescription) setSelected(data.prescription);
    else setError(data?.message || "Failed to load prescription.");
    setLoading(false);
  };

  return (
    <PageTitle eyebrow="Patient space" title="My Prescriptions">
      {error && <div className="rx-alert rx-alert-error">{error}</div>}

      {selected ? (
        <PatientPrescriptionDetail
          rx={selected}
          onBack={() => setSelected(null)}
        />
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: "var(--muted)", fontSize: 12, margin: 0 }}>
              {prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""} from your doctors
            </p>
          </div>

          {loading && <p className="empty" style={{ marginTop: 24 }}>Loading prescriptions…</p>}

          {!loading && prescriptions.length === 0 && (
            <div className="rx-empty">
              <span className="rx-empty-icon">📋</span>
              <strong>No prescriptions yet</strong>
              <p>Your doctor's prescriptions will appear here after your consultations.</p>
            </div>
          )}

          {!loading && prescriptions.length > 0 && (
            <div className="appointment-list">
              {prescriptions.map((rx) => (
                <article key={rx._id}>
                  <div>
                    <strong>{rx.diagnosis || "Consultation"}</strong>
                    <small>
                      {rx.doctorId?.name ? `Dr. ${rx.doctorId.name}` : "Doctor"}{" "}
                      {rx.doctorId?.specialization ? `· ${rx.doctorId.specialization}` : ""} ·{" "}
                      {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} ·{" "}
                      {rx.medicines?.length || 0} medicine{rx.medicines?.length !== 1 ? "s" : ""}
                    </small>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    {rx.followUpDate && (
                      <span className="pill scheduled">
                        Follow-up: {new Date(rx.followUpDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    )}
                    <button className="small-button" onClick={() => openDetail(rx._id)}>
                      View ↗
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </PageTitle>
  );
}

function PatientPrescriptionDetail({ rx, onBack }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button className="small-button" onClick={onBack}>← Back to prescriptions</button>
      </div>

      <div className="rx-detail-card">
        <div className="rx-detail-band">
          <div>
            <p className="eyebrow" style={{ color: "#a8c9f5", marginBottom: 4 }}>Prescription</p>
            <h2 style={{ margin: 0, fontSize: 22, letterSpacing: -1, color: "white" }}>
              {rx.diagnosis || "Consultation"}
            </h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#a8c9f5" }}>Issued on</p>
            <strong style={{ fontSize: 13, color: "white" }}>
              {rx.createdAt
                ? new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                : "—"}
            </strong>
          </div>
        </div>

        <div className="rx-meta-grid">
          <RxMeta label="Doctor" value={rx.doctorId?.name ? `Dr. ${rx.doctorId.name}` : "—"} />
          <RxMeta label="Specialization" value={rx.doctorId?.specialization || "—"} />
          <RxMeta label="Clinic" value={rx.clinicId?.clinicName || rx.clinicId?.name || "—"} />
          <RxMeta
            label="Follow-up"
            value={rx.followUpDate
              ? new Date(rx.followUpDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "Not scheduled"}
          />
        </div>

        {rx.symptoms?.length > 0 && (
          <RxSection title="Symptoms reported">
            <div className="rx-tags" style={{ marginTop: 0 }}>
              {rx.symptoms.map((s) => (
                <span key={s} className="rx-tag" style={{ cursor: "default" }}>{s}</span>
              ))}
            </div>
          </RxSection>
        )}

        {rx.medicines?.length > 0 && (
          <RxSection title={`Medicines prescribed (${rx.medicines.length})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rx.medicines.map((med, i) => (
                <div key={i} className="rx-med-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <strong style={{ fontSize: 13 }}>{med.name}</strong>
                    <span className="pill">{med.dosage}</span>
                  </div>
                  <small style={{ color: "var(--muted)", marginTop: 4, display: "block" }}>
                    {[med.frequency, med.duration, med.instructions].filter(Boolean).join(" · ")}
                  </small>
                </div>
              ))}
            </div>
          </RxSection>
        )}

        {rx.tests?.length > 0 && (
          <RxSection title="Tests prescribed">
            <div className="rx-tags" style={{ marginTop: 0 }}>
              {rx.tests.map((t) => (
                <span key={t} className="rx-tag" style={{ background: "#e8f0ff", color: "#2166d1", cursor: "default" }}>{t}</span>
              ))}
            </div>
          </RxSection>
        )}

        {rx.advice && (
          <RxSection title="Doctor's advice">
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>{rx.advice}</p>
          </RxSection>
        )}

        {rx.notes && (
          <RxSection title="Clinical notes">
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

