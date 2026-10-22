import { useCallback, useEffect, useState } from "react";

const statusClass = {
  pending: "bg-amber-50 text-amber-700",
  dispensed: "bg-emerald-50 text-emerald-700",
  unavailable: "bg-rose-50 text-rose-700",
};

export default function StoreQueue({ request }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const data = await request("get", "/api/prescription/store/queue");
    if (data?.success) setPrescriptions(data.prescriptions || []);
    else setError(data?.message || "Could not load the store queue.");
    setLoading(false);
  }, [request]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (prescriptionId, status) => {
    setUpdatingId(prescriptionId);
    setError("");
    const data = await request("patch", `/api/prescription/store/${prescriptionId}/status`, { status });
    if (data?.success) {
      setPrescriptions((items) => items.map((item) => item._id === prescriptionId ? data.prescription : item));
    } else {
      setError(data?.message || "Could not update the store status.");
    }
    setUpdatingId("");
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7] p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#86909f]">Clinic pharmacy</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17213F]">Prescription store queue</h1>
            <p className="mt-2 text-sm text-[#758096]">Newly issued prescriptions appear here automatically for fulfilment.</p>
          </div>
          <button onClick={load} className="rounded-full border border-[#dce2ea] bg-white px-5 py-2.5 text-xs font-semibold text-[#17213F]">Refresh</button>
        </div>

        {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {loading ? <p className="text-sm text-[#758096]">Loading prescriptions…</p> : prescriptions.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center text-sm text-[#758096]">No prescriptions have been sent to the store yet.</div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <article key={rx._id} className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(23,33,63,.04)] md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#17213F]">{rx.userId?.name || "Patient"}</h2>
                    <p className="mt-1 text-xs text-[#758096]">Dr. {rx.doctorId?.name || "—"}{rx.doctorId?.specialization ? ` · ${rx.doctorId.specialization}` : ""}</p>
                    <p className="mt-1 text-xs text-[#758096]">{rx.diagnosis || "Prescription"} · {rx.medicines?.length || 0} medicine{rx.medicines?.length === 1 ? "" : "s"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${statusClass[rx.storeStatus] || statusClass.pending}`}>{rx.storeStatus || "pending"}</span>
                </div>
                {rx.medicines?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{rx.medicines.map((medicine, index) => <span key={`${medicine.name}-${index}`} className="rounded-full bg-[#f2f5f9] px-3 py-1.5 text-xs text-[#42516c]">{medicine.name}{medicine.dosage ? ` · ${medicine.dosage}` : ""}</span>)}</div>}
                <div className="mt-5 flex flex-wrap gap-2">
                  <button disabled={updatingId === rx._id || rx.storeStatus === "dispensed"} onClick={() => setStatus(rx._id, "dispensed")} className="rounded-full bg-[#17213F] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">Mark dispensed</button>
                  <button disabled={updatingId === rx._id || rx.storeStatus === "unavailable"} onClick={() => setStatus(rx._id, "unavailable")} className="rounded-full border border-[#e2d2d5] px-4 py-2 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-45">Mark unavailable</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
