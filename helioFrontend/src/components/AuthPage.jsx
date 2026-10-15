import { useState } from "react";
import { useLocation } from "react-router-dom";

const patientInitial = {
  name: "",
  email: "",
  password: "",
};

const clinicInitial = {
  clinicName: "",
  email: "",
  password: "",
  phone: "",
  description: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
};

const doctorInitial = {
  name: "",
  email: "",
  password: "",
  phone: "",
  specialization: "",
};

export default function AuthPage({
  identity,
  setIdentity,
  request,
  onLogin,
}) {
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(
    location.pathname !== "/register"
  );

  const [patient, setPatient] = useState(patientInitial);
  const [clinic, setClinic] = useState(clinicInitial);
  const [doctor, setDoctor] = useState(doctorInitial);

  const current =
    identity === "clinic"
      ? clinic
      : identity === "doctor"
        ? doctor
        : patient;

  const setCurrent =
    identity === "clinic"
      ? setClinic
      : identity === "doctor"
        ? setDoctor
        : setPatient;

  const change = (event) =>
    setCurrent((value) => ({
      ...value,
      [event.target.name]: event.target.value,
    }));

  const submit = async (event) => {
    event.preventDefault();

    let root;
    let data;

    if (identity === "clinic") {
      root = "/api/cliniAuthRoutes";

      data = {
        clinicName: clinic.clinicName,
        email: clinic.email,
        password: clinic.password,
        phone: clinic.phone,
        description: clinic.description,
        address: {
          street: clinic.street,
          city: clinic.city,
          state: clinic.state,
          pincode: clinic.pincode,
        },
      };
    } else if (identity === "doctor") {
      root = "/api/doctor-auth";

      data = isLogin
        ? {
            email: doctor.email,
            password: doctor.password,
          }
        : {
            name: doctor.name,
            email: doctor.email,
            password: doctor.password,
            phone: doctor.phone,
            specialization: doctor.specialization,
          };
    } else {
      root = "/api/auth";

      data = isLogin
        ? {
            email: patient.email,
            password: patient.password,
          }
        : patient;
    }

    const response = await request(
      "post",
      `${root}/${isLogin ? "login" : "register"}`,
      data,
      ""
    );

    const token = response?.accessToken || response?.token || response?.accesstoken;

    if (token) {
      onLogin(token, identity, response?.refreshToken);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-copy">
        <p className="eyebrow">Welcome to Healio</p>

        <h1>Healthcare that moves at your pace.</h1>

        <p>
          Find the right clinic, book your visit, and keep an eye on
          your place in line.
        </p>
      </div>

      <div className="auth-card">
        <div className="page-tabs">
          <button
            className={identity === "patient" ? "active" : ""}
            onClick={() => setIdentity("patient")}
          >
            Patient
          </button>

          <button
            className={identity === "doctor" ? "active" : ""}
            onClick={() => setIdentity("doctor")}
          >
            Doctor
          </button>

          <button
            className={identity === "clinic" ? "active" : ""}
            onClick={() => setIdentity("clinic")}
          >
            Clinic admin
          </button>
        </div>

        <p className="eyebrow">{identity} account</p>

        <h2>
          {isLogin
            ? "Welcome back"
            : "Create your account"}
        </h2>

        <form className="form-grid" onSubmit={submit}>
          {identity === "patient" && !isLogin && (
            <Field
              label="Full name"
              name="name"
              value={current.name}
              onChange={change}
            />
          )}

          {identity === "doctor" && !isLogin && (
            <>
              <Field
                label="Full name"
                name="name"
                value={current.name}
                onChange={change}
              />

              <Field
                label="Phone"
                name="phone"
                value={current.phone}
                onChange={change}
              />

              <Field
                label="Specialization"
                name="specialization"
                value={current.specialization}
                onChange={change}
              />
            </>
          )}

          {identity === "clinic" && !isLogin && (
            <>
              <Field
                label="Clinic name"
                name="clinicName"
                value={current.clinicName}
                onChange={change}
              />

              <Field
                label="Phone"
                name="phone"
                value={current.phone}
                onChange={change}
              />

              <Field
                label="Description"
                name="description"
                value={current.description}
                onChange={change}
              />

              <Field
                label="Street"
                name="street"
                value={current.street}
                onChange={change}
              />

              <Field
                label="City"
                name="city"
                value={current.city}
                onChange={change}
              />

              <Field
                label="State"
                name="state"
                value={current.state}
                onChange={change}
              />

              <Field
                label="Pincode"
                name="pincode"
                value={current.pincode}
                onChange={change}
              />
            </>
          )}

          <Field
            label="Email"
            name="email"
            type="email"
            value={current.email}
            onChange={change}
          />

          <Field
            label="Password"
            name="password"
            type="password"
            value={current.password}
            onChange={change}
          />

          <button
            className="primary"
            type="submit"
          >
            {isLogin ? "Sign in" : "Register"}{" "}
            <span>↗</span>
          </button>
        </form>

        <button
          className="text-button auth-toggle"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "New here? Create an account"
            : "Already registered? Sign in"}
        </button>
      </div>
    </div>
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
