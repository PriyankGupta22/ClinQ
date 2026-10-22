import { useCallback, useEffect, useState } from "react";
import { FiArrowLeft, FiCalendar, FiChevronRight, FiClock, FiRefreshCw } from "react-icons/fi";
import FeverChartEditor from "./FeverChartEditor";

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
    <div className="min-h-screen bg-[#F8F9F7] p-[15px]">
      <div className="mb-4 flex min-h-[80px] flex-wrap items-center justify-between gap-4 rounded-[30px] bg-white px-6 py-4">
        <div><p className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8BA49F]">PATIENT SPACE</p><h1 className="mt-1 text-[22px] font-semibold tracking-[-.7px] text-[#17312E]">My prescriptions</h1><p className="mt-1 text-[10px] text-[#8BA49F]">Prescriptions issued by your doctors</p></div>
        <button onClick={loadPrescriptions} className="flex h-11 items-center gap-2 rounded-full bg-[#17312E] px-5 text-[9px] font-semibold uppercase tracking-[.8px] text-white"><FiRefreshCw /> Refresh</button>
      </div>
      {error && <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div>}

      {selected ? (
        <PatientPrescriptionDetail
          rx={selected}
          request={request}
          onBack={() => setSelected(null)}
        />
      ) : (
        <div className="rounded-[20px] bg-white p-6">
          <div className="mb-5 flex items-end justify-between"><div><p className="text-[9px] font-semibold tracking-[.4px] text-[#28504B]">MEDICAL RECORDS</p><h2 className="mt-2 text-[20px] font-semibold text-[#17312E]">Issued prescriptions</h2></div><span className="text-[9px] uppercase tracking-[.8px] text-[#8BA49F]">{prescriptions.length} Records</span></div>

          {loading && <p className="py-16 text-center text-sm text-[#8BA49F]">Loading prescriptions...</p>}

          {!loading && prescriptions.length === 0 && (
            <div className="rounded-2xl bg-[#F5F9F8] py-16 text-center">
              <p className="text-[16px] font-semibold text-[#17312E]">No prescriptions yet</p>
              <p className="mt-2 text-[11px] text-[#8BA49F]">Your doctor’s prescriptions will appear here after your consultation.</p>
            </div>
          )}

          {!loading && prescriptions.length > 0 && (
            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <button key={rx._id} onClick={() => openDetail(rx._id)} className="flex w-full items-center gap-4 rounded-[24px] bg-[#F5F9F8] p-4 text-left transition hover:bg-[#EAF3F1]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#17312E] text-lg font-semibold text-white">{rx.doctorId?.name?.slice(0, 1).toUpperCase() || "D"}</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold text-[#17312E]">{rx.diagnosis || "Consultation"}</p><p className="mt-1 truncate text-[10px] text-[#54756F]">{rx.doctorId?.name ? `Dr. ${rx.doctorId.name}` : "Doctor"} · {rx.clinicId?.clinicName || "Clinic"}</p><div className="mt-2 flex flex-wrap gap-3 text-[9px] text-[#8BA49F]"><span className="flex items-center gap-1"><FiCalendar /> {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span><span className="flex items-center gap-1"><FiClock /> {rx.medicines?.length || 0} medicines</span></div></div>
                  <FiChevronRight className="shrink-0 text-[#739D96]" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PatientPrescriptionDetail({ rx, request, onBack }) {
  const [savingChart, setSavingChart] = useState(false);
  const [chartError, setChartError] = useState("");
  const saveChart = async (feverChart) => {
    setSavingChart(true);
    setChartError("");
    const data = await request("put", `/api/prescription/${rx._id}`, { feverChart });
    if (data?.success) setChartError("Fever chart saved.");
    else setChartError(data?.message || "Could not save fever chart.");
    setSavingChart(false);
  };
  return (
    <div>
      <button className="mb-4 flex items-center gap-2 rounded-full border border-[#DDE8E5] bg-white px-4 py-3 text-[9px] font-semibold uppercase tracking-[.7px] text-[#28504B]" onClick={onBack}><FiArrowLeft /> Back to prescriptions</button>

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

        <RxSection title="Temperature tracking">
          {chartError && <p className="mb-3 text-xs text-[#526785]">{chartError}</p>}
          <FeverChartEditor value={rx.feverChart || {}} onSave={saveChart} saving={savingChart} />
        </RxSection>
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
