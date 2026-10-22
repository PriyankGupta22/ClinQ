import { useCallback, useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDoctorClinic, withDoctorClinic } from "./DoctorClinicContext";
import socket, { authenticateSocket } from "../../socket";

const toDateInput = (date) => date.toISOString().slice(0, 10);

export default function DoctorQueue({ request }) {
  const navigate = useNavigate();
  const [date, setDate] = useState(toDateInput(new Date()));
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { selectedClinicId } = useDoctorClinic();
  const token = localStorage.getItem("doctorAccessToken");

  const loadQueue = useCallback(async () => {
    setLoading(true); setError("");
    const data = await request("get", withDoctorClinic(`/api/queue/doctor/my-queue/${date}`, selectedClinicId));
    if (data?.success) setEntries(data.entries || []);
    else setError(data?.message || "Unable to load the queue.");
    setLoading(false);
  }, [date, request, selectedClinicId]);

  useEffect(() => { loadQueue(); }, [loadQueue]);
  useEffect(() => {
    if (!token || !selectedClinicId) return undefined;
    authenticateSocket(token);
    const join = () => socket.emit("joinQueue", { clinicId: selectedClinicId, doctorId: JSON.parse(atob(token.split(".")[1])).id, date });
    const receive = (event) => {
      if (event.queue?.entries) setEntries(event.queue.entries);
      else if (Array.isArray(event.entries)) setEntries(event.entries);
      else loadQueue();
    };
    if (socket.connected) join();
    socket.on("connect", join);
    socket.on("queueUpdated", receive);
    return () => {
      socket.off("connect", join);
      socket.off("queueUpdated", receive);
    };
  }, [date, loadQueue, selectedClinicId, token]);
  const completed = entries.filter((entry) => entry.status === "completed").length;
  const remaining = entries.filter((entry) => entry.status !== "completed").length;
  const openPrescription = (entry) => navigate("/doctor/prescription", { state: { consultation: {
    appointmentId: entry.appointmentId?._id || entry.appointmentId,
    doctorId: entry.doctorId?._id || entry.doctorId,
    userId: entry.userId?._id || entry.userId,
    clinicId: entry.clinicId?._id || entry.clinicId,
  } } });

  return <div className="min-h-screen bg-[#F8F9FB] p-[15px]">
    <div className="mb-4 flex min-h-[80px] flex-wrap items-center justify-between gap-4 rounded-[30px] bg-white px-6 py-4">
      <div><p className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">QUEUE MANAGEMENT</p><h1 className="mt-1 text-[22px] font-semibold tracking-[-0.7px] text-[#17213F]">Today's Queue</h1></div>
      <div className="flex items-center gap-3"><input aria-label="Queue date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-[48px] rounded-full border border-[#E5E8EE] px-4 text-xs text-[#17213F] outline-none" /><button onClick={loadQueue} className="h-[48px] rounded-full bg-[#17213F] px-5 text-[10px] font-semibold uppercase tracking-[.8px] text-white">Refresh</button></div>
    </div>
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3"><Metric label="Total patients" value={entries.length} caption="Today's queue" /><Metric label="Completed" value={completed} caption="Patients served" /><Metric label="Remaining" value={String(remaining).padStart(2, "0")} caption="Still in queue" /></div>
    <div className="rounded-[20px] bg-white p-6">
      <div className="mb-5 flex items-end justify-between"><div><div className="flex items-center gap-2"><span className="h-[9px] w-[9px] rounded-[2px] bg-[#17213F]" /><span className="text-[9px] font-semibold tracking-[0.3px] text-[#202D55]">PATIENT QUEUE</span></div><h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#17213F]">Patients waiting for consultation</h3></div><div className="flex items-center gap-2"><FiClock className="text-[12px] text-[#A0A7B3]" /><span className="text-[9px] font-medium text-[#8B95A7]">Live queue</span></div></div>
      {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</p>}
      {loading ? <p className="py-8 text-center text-sm text-[#8B95A7]">Loading queue…</p> : entries.length === 0 ? <p className="py-8 text-center text-sm text-[#8B95A7]">No patients in the queue for this date.</p> : entries.map((entry) => <div key={entry._id} className="group flex min-h-[86px] flex-wrap items-center gap-5 border-b border-[#F1F3F6] py-3 last:border-0 hover:bg-[#FAFBFC]">
        <div className="w-[68px] text-center"><span className="text-[24px] font-semibold tracking-[-0.5px] text-[#202D55]">{String(entry.queueNumber).padStart(2, "0")}</span></div><div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#EEF1F5] text-sm font-semibold text-[#526785]">{entry.userId?.name?.slice(0, 1)?.toUpperCase() || "P"}</div><div className="min-w-[180px] flex-1"><p className="text-[14px] font-semibold text-[#17213F]">{entry.userId?.name || "Patient"}</p><p className="mt-1 text-[9px] font-medium uppercase tracking-[0.5px] text-[#929BAA]">{entry.appointmentId?.reason || entry.clinicId?.clinicName || "Consultation"}</p></div><div className="w-[125px]"><span className="inline-flex rounded-full bg-[#E7EFFA] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.5px] text-[#5278A9]">{entry.status}</span></div><div className="flex w-[90px] items-center gap-2"><FiClock className="text-[12px] text-[#A0A7B3]" /><span className="text-[11px] font-semibold text-[#202D55]">{entry.appointmentTime ? new Date(entry.appointmentTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--"}</span></div><button onClick={() => entry.hasPrescription ? navigate("/doctor/prescriptions") : openPrescription(entry)} className="h-[40px] min-w-[210px] rounded-full border border-[#DDE2E9] bg-[#202D55] px-5 text-[8px] font-bold uppercase tracking-[0.8px] text-white transition hover:bg-[#17213F]">{entry.hasPrescription ? "Prescription Written" : "Write Prescription"}</button>
      </div>)}
    </div>
  </div>;
}

function Metric({ label, value, caption }) { return <div className="rounded-[20px] bg-white p-6"><span className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">{label}</span><h2 className="mt-7 text-[44px] font-medium leading-none tracking-[-2px] text-[#17213F]">{value}</h2><p className="mt-3 text-[8px] font-semibold uppercase tracking-[1px] text-[#A0A7B3]">{caption}</p></div>; }
