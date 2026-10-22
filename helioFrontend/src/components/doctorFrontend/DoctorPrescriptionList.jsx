import { useCallback, useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import { useDoctorClinic, withDoctorClinic } from "./DoctorClinicContext";
import FeverChartEditor from "../FeverChartEditor";

export default function DoctorPrescriptionList({ request }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { selectedClinicId } = useDoctorClinic();

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const data = await request("get", withDoctorClinic("/api/prescription/doctor/my-prescriptions", selectedClinicId));
    if (data?.success) setPrescriptions(data.prescriptions || []);
    else setError(data?.message || "Unable to load prescriptions.");
    setLoading(false);
  }, [request, selectedClinicId]);

  useEffect(() => { load(); }, [load]);

  return <div className="min-h-screen bg-[#F8F9FB] p-[15px]">
    <div className="mb-4 flex min-h-[80px] flex-wrap items-center justify-between gap-4 rounded-[30px] bg-white px-6 py-4"><div><p className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">PRESCRIPTIONS</p><h1 className="mt-1 text-[22px] font-semibold tracking-[-0.7px] text-[#17213F]">Written Prescriptions</h1></div><button onClick={load} className="h-[44px] rounded-full bg-[#17213F] px-5 text-[10px] font-semibold uppercase tracking-[.8px] text-white">Refresh</button></div>
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3"><Metric label="Written" value={prescriptions.length} caption="Total prescriptions" /><Metric label="Pending store" value={prescriptions.filter((rx) => rx.storeStatus === "pending").length} caption="Awaiting fulfilment" /><Metric label="Dispensed" value={prescriptions.filter((rx) => rx.storeStatus === "dispensed").length} caption="Collected by patients" /></div>
    <div className="rounded-[20px] bg-white p-6"><div className="mb-5 flex items-end justify-between"><div><div className="flex items-center gap-2"><span className="h-[9px] w-[9px] rounded-[2px] bg-[#17213F]" /><span className="text-[9px] font-semibold tracking-[0.3px] text-[#202D55]">PRESCRIPTION PATIENTS</span></div><h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#17213F]">Patients with a written prescription</h3></div><div className="flex items-center gap-2"><FiClock className="text-[12px] text-[#A0A7B3]" /><span className="text-[9px] font-medium text-[#8B95A7]">Saved records</span></div></div>
      {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</p>}
      {loading ? <p className="py-8 text-center text-sm text-[#8B95A7]">Loading prescriptions…</p> : prescriptions.length === 0 ? <p className="py-8 text-center text-sm text-[#8B95A7]">No prescriptions have been written yet.</p> : prescriptions.map((rx, index) => <div key={rx._id} className="flex min-h-[86px] flex-wrap items-center gap-5 border-b border-[#F1F3F6] py-3 last:border-0 hover:bg-[#FAFBFC]"><div className="w-[68px] text-center"><span className="text-[24px] font-semibold tracking-[-0.5px] text-[#202D55]">{String(index + 1).padStart(2, "0")}</span></div><div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#EEF1F5] text-sm font-semibold text-[#526785]">{rx.userId?.name?.slice(0, 1)?.toUpperCase() || "P"}</div><div className="min-w-[180px] flex-1"><p className="text-[14px] font-semibold text-[#17213F]">{rx.userId?.name || "Patient"}</p><p className="mt-1 text-[9px] font-medium uppercase tracking-[0.5px] text-[#929BAA]">{rx.diagnosis || "Consultation"} · {rx.clinicId?.clinicName || "Clinic"}</p></div><div className="w-[125px]"><span className="inline-flex rounded-full bg-[#DCEFE7] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.5px] text-[#4A8B70]">{rx.storeStatus || "pending"}</span></div><div className="flex w-[90px] items-center gap-2"><FiClock className="text-[12px] text-[#A0A7B3]" /><span className="text-[11px] font-semibold text-[#202D55]">{rx.createdAt ? new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "--"}</span></div><button onClick={() => setSelected(rx)} className="h-[40px] min-w-[210px] rounded-full border border-[#DDE2E9] bg-[#202D55] px-5 text-[8px] font-bold uppercase tracking-[0.8px] text-white transition hover:bg-[#17213F]">View Prescription</button></div>)}</div>
    {selected && <PrescriptionModal prescription={selected} request={request} onClose={() => setSelected(null)} />}
  </div>;
}

function Metric({ label, value, caption }) { return <div className="rounded-[20px] bg-white p-6"><span className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">{label}</span><h2 className="mt-7 text-[44px] font-medium leading-none tracking-[-2px] text-[#17213F]">{value}</h2><p className="mt-3 text-[8px] font-semibold uppercase tracking-[1px] text-[#A0A7B3]">{caption}</p></div>; }
function PrescriptionModal({ prescription, request, onClose }) {
  const [saving, setSaving] = useState(false);
  const saveChart = async (feverChart) => {
    setSaving(true);
    await request("put", `/api/prescription/${prescription._id}`, { feverChart });
    setSaving(false);
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17213F]/35 p-4"><div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.14em] text-[#8B95A7]">{prescription.userId?.name || "Patient"}</p><h2 className="mt-1 text-2xl font-semibold text-[#17213F]">{prescription.diagnosis || "Prescription"}</h2></div><button onClick={onClose} className="rounded-full border border-[#E0E5EC] px-4 py-2 text-xs text-[#526785]">Close</button></div><div className="mt-6 space-y-3">{prescription.medicines?.length ? prescription.medicines.map((medicine, index) => <div key={`${medicine.name}-${index}`} className="rounded-2xl bg-[#F7F9FC] p-4"><p className="font-semibold text-[#17213F]">{medicine.name} <span className="font-normal text-[#6F809A]">{medicine.dosage}</span></p><p className="mt-1 text-xs text-[#6F809A]">{[medicine.frequency, medicine.duration, medicine.instructions].filter(Boolean).join(" · ")}</p></div>) : <p className="text-sm text-[#8B95A7]">No medicines added.</p>}</div>{prescription.tests?.length > 0 && <p className="mt-5 text-xs text-[#526785]"><strong>Tests:</strong> {prescription.tests.join(", ")}</p>}{prescription.notes && <p className="mt-3 text-xs leading-5 text-[#526785]"><strong>Notes:</strong> {prescription.notes}</p>}<div className="mt-5"><FeverChartEditor value={prescription.feverChart || {}} onSave={saveChart} saving={saving} /></div></div></div>;
}
