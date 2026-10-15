import { useState } from "react";
import { PageTitle, Response } from "./ProfilePage";
const initial = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  day: "Monday",
  startTime: "09:00",
  endTime: "17:00",
  appointmentDuration: 10,
};
export default function ClinicAdminPage({ request, response }) {
  const [doctor, setDoctor] = useState(initial);
  const [doctors, setDoctors] = useState([]);
  const change = (e) =>
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  const load = async () => {
    const data = await request("get", "/api/clinic/doctor");
    if (data?.doctors) setDoctors(data.doctors);
  };
  const add = async (e) => {
    e.preventDefault();
    const data = {
      ...doctor,
      schedule: {
        day: doctor.day,
        startTime: doctor.startTime,
        endTime: doctor.endTime,
        appointmentDuration: Number(doctor.appointmentDuration),
      },
    };
    if (await request("post", "/api/clinic/doctor", data)) {
      setDoctor(initial);
      load();
    }
  };
  return (
    <>
      <PageTitle eyebrow="Clinic admin" title="Manage your clinic">
        <div className="two-column">
          <div className="panel">
            <p className="eyebrow">Directory</p>
            <h2>Add a doctor</h2>
            <form className="form-grid" onSubmit={add}>
              {["name", "email", "phone", "specialization"].map((name) => (
                <Field
                  key={name}
                  label={name}
                  name={name}
                  value={doctor[name]}
                  onChange={change}
                />
              ))}
              <Field
                label="Day"
                name="day"
                value={doctor.day}
                onChange={change}
              />
              <Field
                label="Start time"
                name="startTime"
                type="time"
                value={doctor.startTime}
                onChange={change}
              />
              <Field
                label="End time"
                name="endTime"
                type="time"
                value={doctor.endTime}
                onChange={change}
              />
              <Field
                label="Duration"
                name="appointmentDuration"
                type="number"
                value={doctor.appointmentDuration}
                onChange={change}
              />
              <button className="primary">
                Add doctor <span>↗</span>
              </button>
            </form>
          </div>
          <div className="panel">
            <p className="eyebrow">Your team</p>
            <h2>Doctors in clinic</h2>
            <button className="secondary" onClick={load}>
              Refresh directory
            </button>
            {doctors.map((link) => (
              <article className="doctor-row" key={link._id}>
                <div>
                  <strong>{link.doctorId?.name}</strong>
                  <small>{link.doctorId?.specialization}</small>
                </div>
                <button
                  className="small-button danger"
                  onClick={() =>
                    request(
                      "delete",
                      `/api/clinic/doctor/${link.doctorId?._id}`,
                    )
                  }
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        </div>
        <Response data={response} />
      </PageTitle>
    </>
  );
}
function Field({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input required {...props} />
    </label>
  );
}
