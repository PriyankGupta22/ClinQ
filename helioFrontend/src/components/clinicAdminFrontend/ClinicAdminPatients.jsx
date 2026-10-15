import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiSend } from "react-icons/fi";
import { readApiError, request } from "../../api/client";
import socket, { authenticateSocket } from "../../socket";

const formatTime = (value) => value
  ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value))
  : "";

const initials = (name = "") => name
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

export default function ClinicAdminPatients() {
  const token = localStorage.getItem("clinicAccessToken");
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConversations = () => request("get", "/api/messages/clinic-patients", null, token)
    .then(({ conversations: items }) => {
      setConversations(items || []);
      setSelected((current) => (items || []).find((item) => item.patient?._id === current?.patient?._id) || (items || [])[0] || null);
    })
    .catch((requestError) => setError(readApiError(requestError).message || "Could not load patient messages"))
    .finally(() => setLoading(false));

  useEffect(() => {
    loadConversations();
  }, [token]);

  useEffect(() => {
    if (!selected?.patient?._id) {
      setMessages([]);
      return;
    }
    request("get", `/api/messages/clinic-patients/${selected.patient._id}`, null, token)
      .then(({ messages: items }) => setMessages(items || []))
      .catch((requestError) => setError(readApiError(requestError).message || "Could not load patient messages"));
  }, [selected?.patient?._id, token]);

  useEffect(() => {
    if (!token) return;
    authenticateSocket(token);
    const receiveMessage = (incoming) => {
      if (!incoming.patientId) return;
      const patientId = String(incoming.patientId);
      if (patientId === String(selected?.patient?._id)) {
        setMessages((current) => current.some((item) => item._id === incoming._id) ? current : [...current, incoming]);
      }
      loadConversations();
    };
    socket.on("patient-clinic-message:new", receiveMessage);
    return () => {
      socket.off("patient-clinic-message:new", receiveMessage);
    };
  }, [selected?.patient?._id, token]);

  const filtered = useMemo(() => conversations.filter(({ patient }) =>
    `${patient?.name || ""} ${patient?.email || ""}`.toLowerCase().includes(search.toLowerCase())
  ), [conversations, search]);

  const sendMessage = () => {
    if (!text.trim() || !selected?.patient?._id) return;
    const content = text.trim();
    setText("");
    setError("");
    socket.emit("sendClinicPatientMessage", { patientId: selected.patient._id, content }, (result) => {
      if (result?.ok) {
        setMessages((current) => current.some((item) => item._id === result.message._id) ? current : [...current, result.message]);
        return;
      }
      setText(content);
      setError(result?.message || "Message could not be sent");
    });
  };

  return <div className="min-h-screen bg-[#F8F8F7] p-[15px]">
    <div className="mb-4 flex h-[72px] items-center rounded-full bg-white px-6">
      <FiSearch className="mr-4 text-[22px] text-[#806D88]" />
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients by name or email..." className="w-full bg-transparent text-[14px] font-medium text-[#28172F] outline-none placeholder:text-[#A091A8]" />
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
      <section className="rounded-[20px] bg-white p-6">
        <div className="mb-6 flex items-end justify-between">
          <div><div className="flex items-center gap-2"><span className="h-[9px] w-[9px] rounded-[2px] bg-[#B6AABD]" /><span className="text-[9px] font-semibold tracking-[.4px] text-[#806D88]">PATIENT MESSAGES</span></div><h1 className="mt-2 text-[25px] font-semibold tracking-[-.8px] text-[#28172F]">Patients</h1></div>
          <span className="text-[9px] font-medium uppercase tracking-[.8px] text-[#806D88]">{conversations.length} Conversations</span>
        </div>
        {loading && <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-[92px] animate-pulse rounded-[26px] bg-[#F2F6F5]" />)}</div>}
        {!loading && <div className="space-y-3">{filtered.map((item) => {
          const patient = item.patient;
          const active = selected?.patient?._id === patient?._id;
          return <button key={patient._id} onClick={() => setSelected(item)} className={`flex w-full items-center gap-4 rounded-[26px] p-5 text-left transition ${active ? "bg-[#E8E0EB]" : "bg-[#F4EFF5] hover:bg-[#EEE8F0]"}`}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#28172F] text-sm font-semibold text-white">{initials(patient.name)}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold text-[#28172F]">{patient.name}</p><p className="mt-1 truncate text-[9px] uppercase tracking-[.6px] text-[#A091A8]">{patient.email}</p><p className="mt-2 truncate text-[10px] text-[#806D88]">{item.lastMessage?.content}</p></div>
            <span className="self-start text-[8px] text-[#A091A8]">{formatTime(item.lastMessage?.createdAt)}</span>
          </button>;
        })}</div>}
        {!loading && !filtered.length && <p className="py-16 text-center text-sm text-[#806D88]">No patients have messaged this clinic yet.</p>}
        {error && <p className="mt-4 text-center text-xs text-red-500">{error}</p>}
      </section>

      <section className="flex min-h-[620px] flex-col overflow-hidden rounded-[20px] bg-[#28172F] text-white lg:h-[calc(100vh-116px)]">
        {selected ? <><header className="border-b border-white/10 px-6 py-5"><p className="text-[15px] font-semibold">{selected.patient.name}</p><p className="mt-1 text-[8px] uppercase tracking-[.7px] text-white/45">{selected.patient.email}</p></header><div className="scrollbar-hidden flex-1 overflow-y-auto px-5 py-6"><div className="space-y-4">{messages.map((item) => { const mine = item.senderRole === "clinicAdmin"; return <div key={item._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-[17px] px-4 py-3 text-[10px] leading-5 ${mine ? "rounded-br-[5px] bg-[#B6AABD] text-[#28172F]" : "rounded-bl-[5px] bg-white/10 text-white"}`}>{item.content}<p className={`mt-1 text-[7px] ${mine ? "text-[#28172F]/50" : "text-white/35"}`}>{formatTime(item.createdAt)}</p></div></div>; })}</div></div><footer className="border-t border-white/10 p-4"><div className="flex gap-2 rounded-full bg-white/10 p-1.5 pl-4"><input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} placeholder={`Reply to ${selected.patient.name}...`} className="min-w-0 flex-1 bg-transparent text-[10px] text-white outline-none placeholder:text-white/30" /><button onClick={sendMessage} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#28172F]"><FiSend /></button></div>{error && <p className="mt-2 text-center text-xs text-red-300">{error}</p>}</footer></> : <div className="m-auto px-8 text-center text-sm text-white/55">Patients who contact your clinic will appear here.</div>}
      </section>
    </div>
  </div>;
}
