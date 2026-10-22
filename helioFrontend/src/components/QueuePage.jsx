import { useEffect, useState } from "react";
import socket, { authenticateSocket } from "../socket";
import { PageTitle, Response } from "./ProfilePage";

export default function QueuePage({
  request,
  response,
  currentUserId,
  isAdmin,
  isDoctor,
  initialClinicId,
  onStartConsultation,
}) {
  const [form, setForm] = useState({
    clinicId: initialClinicId || "",
    doctorId: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [data, setData] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const token = localStorage.getItem(isDoctor ? "doctorAccessToken" : isAdmin ? "clinicAccessToken" : "patientAccessToken");

  const change = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  const { clinicId, doctorId, date } = form;

  useEffect(() => {
    request("get", isDoctor ? "/api/doctor-auth/clinics" : "/api/clinic/public").then((data) => {
      if (data?.clinics) setClinics(data.clinics.map((item) => isDoctor ? item.clinicId : item).filter(Boolean));
    });
  }, [request]);

  useEffect(() => {
    if (clinicId && !isDoctor) {
      request("get", `/api/clinic/public/${clinicId}/doctors`).then((data) => {
        if (data?.doctors) setDoctors(data.doctors);
        else setDoctors([]);
      });
    } else if (!isDoctor) {
      setDoctors([]);
    }
  }, [clinicId, request, isDoctor]);

  useEffect(() => {
    if (isDoctor && clinicId && currentUserId) setForm((value) => ({ ...value, doctorId: currentUserId }));
  }, [clinicId, currentUserId, isDoctor]);

  useEffect(() => {
    if (clinicId && doctorId && date) {
      const loadQueueData = async () => {
        const result = await request(
          "get",
          `/api/queue/getQueue/${clinicId}/${doctorId}/${encodeURIComponent(date)}`,
        );
        if (result?.queue) setData(result.queue);
      };
      loadQueueData();
    }
  }, [clinicId, doctorId, date, request]);

  useEffect(() => {
    if (token) authenticateSocket(token);
    if (clinicId && doctorId)
      socket.emit("joinQueue", { clinicId, doctorId, date });
    const refresh = () => {
      if (!clinicId || !doctorId) return;
      request("get", `/api/queue/getQueue/${clinicId}/${doctorId}/${encodeURIComponent(date)}`).then((result) => {
        if (result?.queue) setData(result.queue);
      });
    };
    const update = (event) => {
      if (event.queue) return setData(event.queue);
      if (!event.queueEntry) return;
      setData((current) =>
        current
          ? {
            ...current,
            entries: current.entries?.map((entry) =>
              entry._id === event.queueEntry._id
                ? { ...entry, ...event.queueEntry }
                : entry,
            ),
          }
          : current,
      );
    };
    socket.on("queueUpdated", update);
    socket.on("connect", refresh);
    return () => {
      socket.off("queueUpdated", update);
      socket.off("connect", refresh);
    };
  }, [clinicId, doctorId, date, request, token]);
  const updateEntry = async (entryId, action) => {
    await request("patch", `/api/queue/queue/${entryId}/${action}`);
  };
  const entries = data?.entries || [];
  const current = entries.find((entry) => entry.status === "consulting");
  const mine = entries.find(
    (entry) =>
      entry.userId?._id === currentUserId || entry.userId === currentUserId,
  );
  const ahead = mine
    ? entries.filter(
      (entry) =>
        entry.queueNumber < mine.queueNumber && entry.status === "waiting",
    ).length
    : entries.filter((entry) => entry.status === "waiting").length;
  const wait =
    mine?.estimatedWaitingTime ?? (ahead ? `${ahead * 10} min` : "--");

  return (
    <>
      <PageTitle
        eyebrow={isDoctor ? "Doctor workspace" : isAdmin ? "Clinic operations" : "Patient space"}
        title={isDoctor ? "My clinics & today's queue" : isAdmin ? "Today's queue" : "Your live queue"}
      >
        <div className="queue-metrics">
          <Metric
            label="Your queue number"
            value={mine ? `#${mine.queueNumber}` : "--"}
          />
          <Metric
            label="Currently serving"
            value={current ? `#${current.queueNumber}` : "--"}
          />
          <Metric label="People ahead" value={mine ? ahead : "--"} />
          <Metric
            label="Estimated wait"
            value={typeof wait === "number" ? `${wait} min` : wait}
          />
        </div>
        <div className="queue-layout">
          <div className="panel queue-panel">
            <div className="panel-title">
              <p className="eyebrow">Socket.IO live view</p>
              <h2>
                {current
                  ? `Now consulting #${current.queueNumber}`
                  : "Follow the waiting room"}
              </h2>
            </div>
            <div className="inline-form">
              <select
                name="clinicId"
                value={clinicId}
                onChange={change}
                className="select-dropdown"
              >
                <option value="">Select a clinic</option>
                {clinics.map((clinic) => (
                  <option key={clinic._id} value={clinic._id}>
                    {clinic.clinicName}
                  </option>
                ))}
              </select>
              {!isDoctor && <select
                name="doctorId"
                value={doctorId}
                onChange={change}
                className="select-dropdown"
                disabled={!clinicId}
              >
                <option value="">Select a doctor</option>
                {doctors.map((link) => (
                  <option key={link.doctorId?._id} value={link.doctorId?._id}>
                    {link.doctorId?.name} ({link.doctorId?.specialization})
                  </option>
                ))}
              </select>}
              <input
                type="date"
                name="date"
                value={date}
                onChange={change}
              />
            </div>
            {current && (
              <div className="now-consulting">
                <span className="live-ring" />
                <div>
                  <p className="eyebrow">Currently consulting</p>
                  <strong>Queue #{current.queueNumber}</strong>
                  <small>In consultation now</small>
                </div>
              </div>
            )}
            <div className="queue-list">
              {entries.length === 0 ? (
                <p className="empty">
                  Enter the clinic, doctor and date to load a live queue.
                </p>
              ) : (
                entries.map((entry) => (
                  <article
                    className={
                      entry._id === mine?._id ? "queue-row is-you" : "queue-row"
                    }
                    key={entry._id}
                  >
                    <b>#{entry.queueNumber}</b>
                    <div>
                      <strong>
                        {entry.userId?.name ||
                          (entry._id === mine?._id ? "You" : "Patient")}
                      </strong>
                      <small>
                        {entry.appointmentTime
                          ? new Date(entry.appointmentTime).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )
                          : "Appointment time pending"}
                        {entry.estimatedStartTime
                          ? ` · starts ${new Date(entry.estimatedStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : ""}
                      </small>
                    </div>
                    <span className={`pill ${entry.status}`}>
                      {entry._id === mine?._id ? "You" : entry.status}
                    </span>
                    {isDoctor && (
                      <>
                        <button
                          className="small-button"
                          disabled={entry.status !== "waiting"}
                          onClick={async () => { const result = await request("patch", `/api/queue/queue/${entry._id}/start`); if (result?.queue) { setData(result.queue); onStartConsultation?.(entry); } }}
                        >
                          Start consultation
                        </button>
                        <button
                          className="small-button"
                          disabled={entry.status !== "consulting"}
                          onClick={() => updateEntry(entry._id, "complete")}
                        >
                          Complete
                        </button>
                      </>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
          <Response data={response} />
        </div>
      </PageTitle>
    </>
  );
}
function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <small>updates live</small>
    </div>
  );
}
