import { useState } from "react";
import { readApiError, request } from "../api/client";

const endpoints = { patient: "/api/auth", doctor: "/api/doctor-auth" };
const destinations = { patient: "/patient/dashboard", doctor: "/doctor/dashboard" };

export default function useRoleAuth(role) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event, isLogin) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const form = Object.fromEntries(new FormData(event.currentTarget));
      const body = isLogin
        ? { email: form.email, password: form.password }
        : role === "doctor"
          ? { name: form.name, email: form.email, password: form.password, phone: "Not provided", specialization: form.specialization }
          : { name: form.name, email: form.email, password: form.password };
      const result = await request("post", `${endpoints[role]}/${isLogin ? "login" : "register"}`, body);
      const token = result.accessToken || result.token || result.accesstoken;
      if (!token) throw new Error("No access token was returned.");
      localStorage.setItem(role === "doctor" ? "doctorAccessToken" : "patientAccessToken", token);
      if (result.refreshToken) localStorage.setItem(`${role}RefreshToken`, result.refreshToken);
      localStorage.setItem("healioIdentity", role);
      window.location.assign(destinations[role]);
    } catch (requestError) {
      setError(readApiError(requestError)?.message || requestError.message || "Unable to continue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return { error, submitting, submit };
}
