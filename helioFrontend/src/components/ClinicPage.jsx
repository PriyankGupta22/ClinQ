import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PageTitle, Response } from "./ProfilePage";

export default function ClinicPage({ request, response, setPage }) {
  const [clinics, setClinics] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const location = useLocation();

  useEffect(() => {
    request("get", "/api/clinic/public", null, "").then(async (data) => {
      if (data?.clinics) {
        setClinics(data.clinics);
        if (location.state?.clinicId) {
          const preselect = data.clinics.find(c => c._id === location.state.clinicId);
          if (preselect) {
            setSelectedClinic(preselect);
            setDoctors([]);
            const doctorData = await request("get", `/api/clinic/public/${preselect._id}/doctors`, null, "");
            if (doctorData?.doctors) setDoctors(doctorData.doctors);
          }
        }
      } else {
        setClinics([]);
      }
    });
  }, [request, location.state]);

  const chooseClinic = async (clinic) => {
    setSelectedClinic(clinic);
    setDoctors([]);
    const data = await request(
      "get",
      `/api/clinic/public/${clinic._id}/doctors`,
      null,
      "",
    );
    if (data?.doctors) setDoctors(data.doctors);
  };

  const book = (doctor) => {
    localStorage.setItem(
      "bookingSelection",
      JSON.stringify({ clinic: selectedClinic, doctor: doctor.doctorId }),
    );
    setPage("appointments", { state: { clinicId: selectedClinic._id, doctorId: doctor.doctorId?._id } });
  };

  return (
    <PageTitle eyebrow="Explore care" title="Find your clinic">
      <div className="clinic-layout">
        <div className="panel">
          <div className="panel-title">
            <p className="eyebrow">Available clinics</p>
            <h2>Choose a care provider</h2>
          </div>
          {clinics === null && <p className="empty">Loading clinics...</p>}
          {clinics?.length === 0 && (
            <p className="empty">No active clinics are available yet.</p>
          )}
          {clinics?.map((clinic) => (
            <button
              className={
                selectedClinic?._id === clinic._id
                  ? "clinic-row selected"
                  : "clinic-row"
              }
              key={clinic._id}
              onClick={() => chooseClinic(clinic)}
            >
              <div>
                <strong>{clinic.clinicName}</strong>
                <small>
                  {clinic.address?.city}, {clinic.address?.state} ·{" "}
                  {clinic.phone}
                </small>
              </div>
              <span>↗</span>
            </button>
          ))}
        </div>
        <div className="panel doctor-directory">
          <div className="panel-title">
            <p className="eyebrow">
              {selectedClinic?.clinicName || "Select a clinic"}
            </p>
            <h2>Doctors at this clinic</h2>
          </div>
          {!selectedClinic && (
            <p className="empty">
              Select a clinic to see only its associated doctors.
            </p>
          )}
          {selectedClinic && doctors.length === 0 && (
            <p className="empty">No active doctors found for this clinic.</p>
          )}
          {doctors.map((link) => (
            <article key={link._id} className="doctor-row">
              <div>
                <strong>{link.doctorId?.name}</strong>
                <small>
                  {link.doctorId?.specialization} ·{" "}
                  {link.doctorId?.schedule?.day} ·{" "}
                  {link.doctorId?.schedule?.startTime}–
                  {link.doctorId?.schedule?.endTime}
                </small>
              </div>
              <button className="small-button" onClick={() => book(link)}>
                Book visit
              </button>
            </article>
          ))}
        </div>
      </div>
      <Response data={response} />
    </PageTitle>
  );
}
