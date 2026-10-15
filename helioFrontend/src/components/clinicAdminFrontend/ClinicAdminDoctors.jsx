import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiSend, FiX } from "react-icons/fi";
import { clinicApi } from "../../api/clinic";
import { readApiError, request } from "../../api/client";
import socket, { authenticateSocket } from "../../socket";

const initials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const formatTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "";

export default function ClinicAdminDoctors() {
  const token = localStorage.getItem("clinicAccessToken");
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryDoctors, setDirectoryDoctors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState("");
  const [error, setError] = useState("");

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const result = await clinicApi.doctors(token);
      const items = result.doctors || [];
      setDoctors(items);
      setSelected(
        (current) =>
          items.find((item) => item.doctorId?._id === current?.doctorId?._id) ||
          items[0] ||
          null,
      );
    } catch (requestError) {
      setError(
        readApiError(requestError).message || "Could not load clinic doctors",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);
  useEffect(() => {
    if (!selected?.doctorId?._id) return setMessages([]);
    request("get", `/api/messages/${selected.doctorId._id}`, null, token)
      .then((result) => setMessages(result.messages || []))
      .catch((requestError) =>
        setError(
          readApiError(requestError).message || "Could not load messages",
        ),
      );
  }, [selected?.doctorId?._id, token]);
  useEffect(() => {
    if (!token || !selected?.doctorId?._id) return;
    authenticateSocket(token);
    const doctorId = String(selected.doctorId._id);
    socket.emit("joinConversation", { counterpartId: doctorId });
    const receiveMessage = (incoming) => {
      if (String(incoming.doctorId) !== doctorId) return;
      setMessages((current) => current.some((item) => item._id === incoming._id) ? current : [...current, incoming]);
    };
    socket.on("message:new", receiveMessage);
    return () => {
      socket.off("message:new", receiveMessage);
    };
  }, [selected?.doctorId?._id, token]);
  useEffect(() => {
    if (!isAddOpen) return;
    clinicApi
      .searchDoctors(directorySearch, token)
      .then((result) => setDirectoryDoctors(result.doctors || []))
      .catch((requestError) =>
        setError(
          readApiError(requestError).message || "Could not search doctors",
        ),
      );
  }, [directorySearch, isAddOpen, token]);

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((link) => {
        const doctor = link.doctorId || {};
        return `${doctor.name || ""} ${doctor.specialization || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
      }),
    [doctors, search],
  );

  const addDoctor = async (doctor) => {
    setAddingId(doctor._id);
    setError("");
    try {
      await clinicApi.addDoctor(doctor._id, token);
      setIsAddOpen(false);
      setDirectorySearch("");
      await loadDoctors();
    } catch (requestError) {
      setError(readApiError(requestError).message || "Could not add doctor");
    } finally {
      setAddingId("");
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !selected) return;
    const content = message.trim();
    setMessage("");
    setError("");
    socket.emit("sendMessage", { counterpartId: selected.doctorId._id, content }, (result) => {
      if (result?.ok) {
        setMessages((current) => current.some((item) => item._id === result.message._id) ? current : [...current, result.message]);
        return;
      }
      setMessage(content);
      setError(result?.message || "Message could not be sent");
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-[15px]">
      <div className="mb-4 flex h-[72px] items-center gap-4 rounded-full bg-white px-6">
        <FiSearch className="text-[22px] text-[#8B95A7]" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search your doctors by name or speciality..."
          className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#17213F] outline-none placeholder:text-[#A1A8B5]"
        />
        <button
          onClick={() => {
            setError("");
            setIsAddOpen(true);
          }}
          className="flex shrink-0 items-center gap-2 rounded-full bg-[#28172F] px-5 py-3 text-[9px] font-semibold uppercase tracking-[.9px] text-white transition hover:bg-[#28172F]"
        >
          <FiPlus className="text-sm" /> Add doctor
        </button>
      </div>

      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)] gap-4">
        <section className="rounded-[20px] bg-white p-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-[9px] w-[9px] rounded-[2px] bg-[#9DBBE3]" />
                <span className="text-[9px] font-semibold tracking-[.4px] text-[#202D55]">
                  MY CLINIC TEAM
                </span>
              </div>
              <h1 className="mt-2 text-[25px] font-semibold tracking-[-.8px] text-[#17213F]">
                Doctors
              </h1>
            </div>
            <span className="text-[9px] font-medium uppercase tracking-[.8px] text-[#8B95A7]">
              {doctors.length} Doctors
            </span>
          </div>
          <div className="space-y-3">
            {filteredDoctors.map((link, index) => {
              const doctor = link.doctorId || {};
              const active = selected?._id === link._id;
              return (
                <button
                  key={link._id}
                  onClick={() => setSelected(link)}
                  className={`group flex min-h-[132px] w-full items-center gap-5 rounded-full px-5 py-4 text-left transition ${active ? "bg-[#eddff469]" : "bg-[#3D2B45] hover:bg-[#3D2B45]"}`}
                >
                  <div className="flex h-[108px] w-[188px] shrink-0 items-center justify-center rounded-full bg-[#28172F] text-[22px] font-semibold text-white">
                    {initials(doctor.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-semibold text-[#A0A7B3]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[.7px] text-[#5E9A7E]">
                        <span className="h-[5px] w-[5px] rounded-full bg-[#71B89A]" />
                        Active
                      </span>
                    </div>
                    <h2 className="mt-3 truncate text-[19px] font-semibold tracking-[-.6px] text-[#17213F]">
                      Dr. {doctor.name}
                    </h2>
                    <p className="mt-1 text-[8px] font-semibold uppercase tracking-[.8px] text-[#8B95A7]">
                      {doctor.specialization || "General medicine"}
                    </p>
                    <p className="mt-4 truncate text-[9px] font-medium text-[#202D55]">
                      {doctor.email}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#28172F] px-10 py-3 text-[15px] font-semibold uppercase tracking-[.8px] text-white">
                    Chat
                  </span>
                </button>
              );
            })}
          </div>
          {!loading && !filteredDoctors.length && (
            <div className="py-24 text-center">
              <p className="text-[15px] font-semibold text-[#17213F]">
                No doctors found
              </p>
              <p className="mt-2 text-[10px] text-[#8B95A7]">
                Use Add doctor to invite a registered doctor to this clinic.
              </p>
            </div>
          )}
        </section>

        <section className="flex h-[calc(100vh-116px)] min-h-[620px] flex-col overflow-hidden rounded-[20px] bg-[#28172F]">
          {selected ? (
            <>
              <header className="border-b border-white/10 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white text-xs font-semibold text-[#17213F]">
                    {initials(selected.doctorId?.name)}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">
                      Dr. {selected.doctorId?.name}
                    </p>
                    <p className="mt-1 text-[8px] uppercase tracking-[.7px] text-white/50">
                      {selected.doctorId?.specialization || "Doctor"}
                    </p>
                  </div>
                </div>
              </header>
              <div className="scrollbar-hidden flex-1 overflow-y-auto px-5 py-6">
                <div className="mb-6 flex justify-center">
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[1px] text-white/40">
                    Messages
                  </span>
                </div>
                <div className="space-y-4">
                  {messages.map((item) => {
                    const mine = item.senderRole === "clinicAdmin";
                    return (
                      <div
                        key={item._id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[82%] rounded-[17px] px-4 py-3 text-[10px] leading-5 ${mine ? "rounded-br-[5px] bg-[#9DBBE3] text-[#17213F]" : "rounded-bl-[5px] bg-white/10 text-white"}`}
                        >
                          {item.content}
                          <p
                            className={`mt-1 text-[7px] ${mine ? "text-[#17213F]/50" : "text-white/35"}`}
                          >
                            {formatTime(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <footer className="border-t border-white/10 p-4">
                <div className="flex items-center gap-2 rounded-full bg-white/10 p-1.5 pl-4">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Enter" && sendMessage()
                    }
                    placeholder={`Message Dr. ${selected.doctorId?.name}...`}
                    className="min-w-0 flex-1 bg-transparent text-[10px] text-white outline-none placeholder:text-white/30"
                  />
                  <button
                    onClick={sendMessage}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#17213F]"
                  >
                    <FiSend />
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-center text-xs text-red-300">
                    {error}
                  </p>
                )}
              </footer>
            </>
          ) : (
            <div className="m-auto px-8 text-center text-sm text-white/50">
              Select a doctor to view your conversation.
            </div>
          )}
        </section>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#28172F]/40 p-5">
          <div className="w-full max-w-[650px] overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between px-7 pt-7">
              <div>
                <p className="text-[9px] font-semibold tracking-[.5px] text-[#202D55]">
                  REGISTERED DOCTORS
                </p>
                <h2 className="mt-2 text-[24px] font-semibold text-[#17213F]">
                  Add a doctor
                </h2>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="rounded-full p-2 text-[#8B95A7] hover:bg-[#F5F7FA]"
              >
                <FiX />
              </button>
            </div>
            <div className="mx-7 mt-6 flex items-center gap-3 rounded-full bg-[#F5F7FA] px-5 py-4">
              <FiSearch className="text-[#8B95A7]" />
              <input
                autoFocus
                value={directorySearch}
                onChange={(event) => setDirectorySearch(event.target.value)}
                placeholder="Search by name, speciality, email, or phone..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <div className="max-h-[420px] overflow-y-auto p-5">
              {directoryDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="mb-2 flex items-center gap-4 rounded-[20px] bg-[#F8F9FB] p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#17213F] text-xs font-semibold text-white">
                    {initials(doctor.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#17213F]">
                      Dr. {doctor.name}
                    </p>
                    <p className="mt-1 truncate text-[9px] uppercase tracking-[.5px] text-[#8B95A7]">
                      {doctor.specialization || "General medicine"}
                    </p>
                  </div>
                  <button
                    disabled={doctor.isLinked || addingId === doctor._id}
                    onClick={() => addDoctor(doctor)}
                    className={`rounded-full px-4 py-2.5 text-[8px] font-semibold uppercase tracking-[.7px] ${doctor.isLinked ? "bg-[#E5E8EC] text-[#8B95A7]" : "bg-[#17213F] text-white hover:bg-[#28172F]"}`}
                  >
                    {addingId === doctor._id
                      ? "Adding..."
                      : doctor.isLinked
                        ? "Added"
                        : "Add"}
                  </button>
                </div>
              ))}
              {!directoryDoctors.length && (
                <p className="py-12 text-center text-sm text-[#8B95A7]">
                  No registered doctors match this search.
                </p>
              )}
            </div>
            {error && <p className="px-7 pb-5 text-sm text-red-600">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
