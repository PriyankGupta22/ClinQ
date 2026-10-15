import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { readApiError, request } from "../../api/client";
import socket, { authenticateSocket } from "../../socket";

const clinicImage = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80";

export default function PatientClinics() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("patientAccessToken");

  useEffect(() => {
    request("get", "/api/clinic/public")
      .then((result) => {
        const items = (result.clinics || []).map((clinic) => ({ ...clinic, image: clinicImage }));
        setClinics(items);
        setSelectedClinic(items[0] || null);
      })
      .catch((requestError) => setError(readApiError(requestError).message || "Could not load clinics"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClinic?._id) return setMessages([]);
    request("get", `/api/messages/patient-clinic/${selectedClinic._id}`, null, token)
      .then((result) => setMessages(result.messages || []))
      .catch((requestError) => setError(readApiError(requestError).message || "Could not load messages"));
  }, [selectedClinic?._id, token]);

  useEffect(() => {
    if (!token || !selectedClinic?._id) return;
    authenticateSocket(token);
    const clinicId = String(selectedClinic._id);
    const joinConversation = () => socket.emit("joinPatientClinicConversation", { clinicId });
    if (socket.connected) joinConversation();
    socket.on("connect", joinConversation);
    const receiveMessage = (incoming) => {
      if (String(incoming.clinicId) !== clinicId) return;
      setMessages((current) => current.some((item) => item._id === incoming._id) ? current : [...current, incoming]);
    };
    socket.on("patient-clinic-message:new", receiveMessage);
    return () => {
      socket.off("connect", joinConversation);
      socket.off("patient-clinic-message:new", receiveMessage);
    };
  }, [selectedClinic?._id, token]);

  const filteredClinics = useMemo(() => clinics.filter((clinic) => {
    const address = clinic.address || {};
    return `${clinic.clinicName || ""} ${clinic.description || ""} ${address.city || ""}`.toLowerCase().includes(search.toLowerCase());
  }), [clinics, search]);

  const bookVisit = (clinic) => navigate("/patient/appointments", { state: { clinicId: clinic._id, clinicName: clinic.clinicName } });
  const sendMessage = () => {
    if (!message.trim() || !selectedClinic) return;
    const content = message.trim();
    setMessage("");
    socket.emit("sendPatientClinicMessage", { clinicId: selectedClinic._id, content }, (result) => {
      if (result?.ok) {
        setMessages((current) => current.some((item) => item._id === result.message._id) ? current : [...current, result.message]);
        return;
      }
      setMessage(content);
      setError(result?.message || "Message could not be sent");
    });
  };
  return <div className="min-h-screen bg-[#F8F9F7] p-[15px]">
    <div className="mb-4 flex h-[72px] items-center rounded-full bg-white px-6">
      <FiSearch className="mr-4 text-[22px] text-[#739D96]" />
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clinics by name, city, or speciality..." className="w-full bg-transparent text-[14px] font-medium text-[#17312E] outline-none placeholder:text-[#9BAEA9]" />
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.65fr)]">
      <section className="rounded-[20px] bg-white p-6">
        <div className="mb-6 flex items-end justify-between"><div><div className="flex items-center gap-2"><span className="h-[9px] w-[9px] rounded-[2px] bg-[#8DC6B7]" /><span className="text-[9px] font-semibold tracking-[.4px] text-[#28504B]">FIND A CLINIC</span></div><h1 className="mt-2 text-[25px] font-semibold tracking-[-.8px] text-[#17312E]">Clinics</h1></div><span className="text-[9px] font-medium uppercase tracking-[.8px] text-[#8BA49F]">{clinics.length} Clinics</span></div>
        {loading && <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-[155px] animate-pulse rounded-[32px] bg-[#F2F6F5]" />)}</div>}
        {!loading && error && <div className="py-24 text-center"><p className="text-[15px] font-semibold text-[#17312E]">Unable to load clinics</p><p className="mt-2 text-[10px] text-[#8BA49F]">{error}</p></div>}
        {!loading && !error && <div className="space-y-3">{filteredClinics.map((clinic, index) => <button key={clinic._id} onClick={() => setSelectedClinic(clinic)} className={`group flex min-h-[155px] w-full items-center gap-5 overflow-hidden rounded-[32px] px-4 py-4 text-left transition-all duration-300 ${selectedClinic?._id === clinic._id ? "bg-[#E4F1EE]" : "bg-[#F3F7F6] hover:bg-[#EAF3F1]"}`}><div className="h-[123px] w-[180px] shrink-0 overflow-hidden rounded-[24px]"><img src={clinic.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-3"><span className="text-[9px] font-semibold text-[#91A49F]">{String(index + 1).padStart(2, "0")}</span><span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[.7px] text-[#4E8A79]"><span className="h-[5px] w-[5px] rounded-full bg-[#71B89A]" />Open</span></div><h2 className="mt-3 truncate text-[19px] font-semibold tracking-[-.6px] text-[#17312E]">{clinic.clinicName}</h2><p className="mt-1 text-[8px] font-semibold uppercase tracking-[.8px] text-[#75908A]">{clinic.address?.city || "Clinic"}</p><p className="mt-5 truncate text-[9px] font-medium text-[#365E57]">{clinic.description || "Healthcare services"}</p></div><span onClick={(event) => { event.stopPropagation(); bookVisit(clinic); }} className="ml-3 flex h-[44px] w-[125px] shrink-0 items-center justify-center rounded-full bg-[#17312E] text-[8px] font-semibold uppercase tracking-[.9px] text-white transition hover:bg-[#28504B]">Book visit</span></button>)}</div>}
        {!loading && !error && !filteredClinics.length && <div className="py-24 text-center"><p className="text-[15px] font-semibold text-[#17312E]">No clinics found</p><p className="mt-2 text-[10px] text-[#8BA49F]">Try searching with another clinic name or city.</p></div>}
      </section>

      <aside className="flex min-h-[620px] flex-col overflow-hidden rounded-[20px] bg-[#17312E] text-white lg:h-[calc(100vh-116px)]">
        {selectedClinic ? <><header className="border-b border-white/10 px-6 py-5"><div className="flex items-center gap-3"><div className="h-[42px] w-[42px] overflow-hidden rounded-full bg-white"><img src={selectedClinic.image} alt="" className="h-full w-full object-cover" /></div><div><p className="text-[14px] font-semibold">{selectedClinic.clinicName}</p><p className="mt-1 text-[8px] uppercase tracking-[.7px] text-white/50">Clinic admin</p></div></div></header><div className="scrollbar-hidden flex-1 overflow-y-auto px-5 py-6"><div className="mb-6 flex justify-center"><span className="rounded-full bg-white/10 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[1px] text-white/40">Messages</span></div><div className="space-y-4">{messages.map((item) => { const mine = item.senderRole === "patient"; return <div key={item._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-[17px] px-4 py-3 text-[10px] leading-5 ${mine ? "rounded-br-[5px] bg-[#8DC6B7] text-[#17312E]" : "rounded-bl-[5px] bg-white/10 text-white"}`}>{item.content}<p className={`mt-1 text-[7px] ${mine ? "text-[#17312E]/50" : "text-white/35"}`}>{item.createdAt ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(item.createdAt)) : ""}</p></div></div>; })}</div></div><footer className="border-t border-white/10 p-4"><div className="flex items-center gap-2 rounded-full bg-white/10 p-1.5 pl-4"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} placeholder={`Message ${selectedClinic.clinicName}...`} className="min-w-0 flex-1 bg-transparent text-[10px] text-white outline-none placeholder:text-white/30" /><button onClick={sendMessage} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#17312E]"><FiArrowRight /></button></div><button onClick={() => bookVisit(selectedClinic)} className="mt-3 w-full text-[9px] font-semibold uppercase tracking-[.8px] text-[#B7D9D2] hover:text-white">Book visit</button></footer></> : <div className="m-auto px-8 text-center text-sm text-white/55">Select a clinic to message its admin.</div>}
      </aside>
    </div>
  </div>;
}
