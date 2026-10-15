import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiSend, FiMoreHorizontal, FiClock } from "react-icons/fi";
import { readApiError, request } from "../../api/client";
import socket, { authenticateSocket } from "../../socket";

const formatTime = (value) => value ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "";

const DoctorClinics = () => {
  const token = localStorage.getItem("doctorAccessToken");
  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    request("get", "/api/doctor-auth/clinics", null, token)
      .then(({ clinics: links }) => {
        const items = (links || []).map((link) => ({
          id: link._id,
          clinicId: link.clinicId._id,
          name: link.clinicId.clinicName,
          speciality: link.clinicId.address?.city || "Clinic",
          image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
          opening: "Contact clinic for hours",
          workingDays: "Schedule to be confirmed",
          admin: `${link.clinicId.clinicName} Admin`,
          status: "Active",
        }));
        setClinics(items);
        setSelectedClinic(items[0] || null);
        setError("");
      })
      .catch((requestError) => setError(readApiError(requestError).message || "Could not load your clinics"));
  }, [token]);

  useEffect(() => {
    if (!selectedClinic?.clinicId) return setChatMessages([]);
    request("get", `/api/messages/${selectedClinic.clinicId}`, null, token)
      .then((result) => setChatMessages(result.messages || []))
      .catch((requestError) => setError(readApiError(requestError).message || "Could not load messages"));
  }, [selectedClinic?.clinicId, token]);

  useEffect(() => {
    if (!token || !selectedClinic?.clinicId) return;
    authenticateSocket(token);
    const clinicId = String(selectedClinic.clinicId);
    socket.emit("joinConversation", { counterpartId: clinicId });
    const receiveMessage = (incoming) => {
      if (String(incoming.clinicId) !== clinicId) return;
      setChatMessages((current) => current.some((item) => item._id === incoming._id) ? current : [...current, incoming]);
    };
    socket.on("message:new", receiveMessage);
    return () => {
      socket.off("message:new", receiveMessage);
    };
  }, [selectedClinic?.clinicId, token]);

  const filteredClinics = useMemo(() => {
    return clinics.filter((clinic) => `${clinic.name} ${clinic.speciality}`.toLowerCase().includes(search.toLowerCase()));
  }, [clinics, search]);

  const selectClinic = (clinic) => {
    setSelectedClinic(clinic);
  };

  const sendMessage = () => {
    if (!message.trim() || !selectedClinic) return;
    const content = message.trim();
    setMessage("");
    setError("");
    socket.emit("sendMessage", { counterpartId: selectedClinic.clinicId, content }, (result) => {
      if (result?.ok) {
        setChatMessages((current) => current.some((item) => item._id === result.message._id) ? current : [...current, result.message]);
        return;
      }
      setMessage(content);
      setError(result?.message || "Message could not be sent");
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-[15px]">

      <div className="mb-4">
        <div className="flex h-[72px] items-center rounded-full bg-white px-6">
          <div className="flex w-full items-center gap-4">
            <FiSearch className="text-[22px] text-[#8B95A7]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clinics by name or speciality..." className="w-full bg-transparent text-[14px] font-medium text-[#17213F] outline-none placeholder:text-[#A1A8B5]" />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(420px,0.65fr)] gap-4">


        <div className="rounded-[20px] bg-white p-6">

          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-[9px] w-[9px] rounded-[2px] bg-[#9DBBE3]"></span>
                <span className="text-[9px] font-semibold tracking-[0.4px] text-[#202D55]">MY CLINICS</span>
              </div>
              <h1 className="mt-2 text-[25px] font-semibold tracking-[-0.8px] text-[#17213F]">Clinics</h1>
            </div>

            <span className="text-[9px] font-medium uppercase tracking-[0.8px] text-[#8B95A7]">{filteredClinics.length} Clinics</span>
          </div>


          <div className="space-y-3">

            {filteredClinics.map((clinic, index) => (

              <div key={clinic.id} onClick={() => selectClinic(clinic)} className={`group flex min-h-[155px] cursor-pointer items-center gap-5 overflow-hidden rounded-[32px] px-4 py-4 transition-all duration-300 ${selectedClinic?.id === clinic.id ? "bg-[#EAF0F9]" : "bg-[#F5F7FA] hover:bg-[#EEF2F7]"}`}>

                <div className="h-[123px] w-[180px] shrink-0 overflow-hidden rounded-[24px]">
                  <img src={clinic.image} alt={clinic.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>


                <div className="flex min-w-0 flex-1 items-center">

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-semibold text-[#A0A7B3]">{String(index + 1).padStart(2, "0")}</span>

                      <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.7px] text-[#5E9A7E]">
                        <span className="h-[5px] w-[5px] rounded-full bg-[#71B89A]"></span>
                        {clinic.status}
                      </span>
                    </div>

                    <h2 className="mt-3 text-[19px] font-semibold tracking-[-0.6px] text-[#17213F]">{clinic.name}</h2>

                    <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.8px] text-[#8B95A7]">{clinic.speciality}</p>


                    <div className="mt-5 flex items-center gap-8">

                      <div>
                        <p className="text-[7px] font-semibold uppercase tracking-[0.8px] text-[#A0A7B3]">CLINIC HOURS</p>
                        <p className="mt-1.5 text-[9px] font-medium text-[#202D55]">{clinic.opening}</p>
                      </div>

                      <div className="h-[28px] w-px bg-[#DDE2E9]"></div>

                      <div className="min-w-0">
                        <p className="text-[7px] font-semibold uppercase tracking-[0.8px] text-[#A0A7B3]">YOUR DAYS</p>
                        <p className="mt-1.5 truncate text-[9px] font-medium text-[#202D55]">{clinic.workingDays}</p>
                      </div>

                    </div>

                  </div>


                  <button onClick={(e) => { e.stopPropagation(); selectClinic(clinic); }} className="ml-5 flex h-[44px] w-[125px] shrink-0 items-center justify-center rounded-full bg-[#17213F] text-[8px] font-semibold uppercase tracking-[0.9px] text-white transition-all duration-300 hover:bg-[#202D55]">
                    Chat
                  </button>

                </div>

              </div>

            ))}

          </div>


          {filteredClinics.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <p className="text-[15px] font-semibold text-[#17213F]">{error ? "Could not load clinics" : "No clinics found"}</p>
                <p className="mt-2 text-[10px] text-[#8B95A7]">{error || "You have not been added to a clinic yet."}</p>
              </div>
            </div>
          )}

        </div>


        <div className="flex h-[calc(100vh-116px)] min-h-[620px] flex-col overflow-hidden rounded-[20px] bg-[#17213F]">

          <div className="border-b border-white/10 px-6 py-5">

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="h-[42px] w-[42px] overflow-hidden rounded-full bg-white">
                  {selectedClinic?.image && <img src={selectedClinic.image} alt={selectedClinic.name} className="h-full w-full object-cover" />}
                </div>

                <div>
                  <p className="text-[14px] font-semibold text-white">{selectedClinic?.name || "Select a clinic"}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-[6px] w-[6px] rounded-full bg-[#71B89A]"></span>
                    <span className="text-[8px] uppercase tracking-[0.7px] text-white/50">Clinic Admin</span>
                  </div>
                </div>

              </div>

              <button className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                <FiMoreHorizontal className="text-[17px]" />
              </button>

            </div>

          </div>


          <div className="scrollbar-hidden flex-1 overflow-y-auto px-5 py-6">

            <div className="mb-6 flex items-center justify-center">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[1px] text-white/40">Today</span>
            </div>

            <div className="space-y-4">

              {chatMessages.map((chat) => (

                <div key={chat._id} className={`flex ${chat.senderRole === "doctor" ? "justify-end" : "justify-start"}`}>

                  <div className={`max-w-[82%] ${chat.senderRole === "doctor" ? "items-end" : "items-start"}`}>

                    <div className={`rounded-[17px] px-4 py-3 ${chat.senderRole === "doctor" ? "rounded-br-[5px] bg-[#9DBBE3] text-[#17213F]" : "rounded-bl-[5px] bg-white/10 text-white"}`}>
                      <p className="text-[10px] font-medium leading-5">{chat.content}</p>
                    </div>

                    <p className={`mt-1.5 text-[7px] text-white/30 ${chat.senderRole === "doctor" ? "text-right" : "text-left"}`}>{formatTime(chat.createdAt)}</p>

                  </div>

                </div>

              ))}

            </div>

          </div>


          <div className="border-t border-white/10 p-4">

            <div className="flex items-center gap-2 rounded-full bg-white/10 p-1.5 pl-4">

              <input type="text" value={message} disabled={!selectedClinic} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={selectedClinic ? `Message ${selectedClinic.admin}...` : "Select a clinic to chat"} className="min-w-0 flex-1 bg-transparent text-[10px] text-white outline-none placeholder:text-white/30 disabled:cursor-not-allowed" />

              <button onClick={sendMessage} className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-white text-[#17213F] transition-transform duration-200 hover:scale-105">
                <FiSend className="text-[14px]" />
              </button>

            </div>
            {error && <p className="mt-2 text-center text-xs text-red-300">{error}</p>}

          </div>

        </div>

      </div>

    </div>
  );
};

export default DoctorClinics;
