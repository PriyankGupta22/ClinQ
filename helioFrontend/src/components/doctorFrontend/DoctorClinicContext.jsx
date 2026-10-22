import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readApiError, request } from "../../api/client";

const DoctorClinicContext = createContext(null);

export function DoctorClinicProvider({ children }) {
  const token = localStorage.getItem("doctorAccessToken");
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState(
    localStorage.getItem("doctorSelectedClinicId") || ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    request("get", "/api/doctor-auth/clinics", null, token)
      .then((data) => {
        if (!active) return;
        const availableClinics = (data?.clinics || []).map((link) => ({
          id: link.clinicId._id,
          name: link.clinicId.clinicName,
          address: link.clinicId.address,
        }));
        setClinics(availableClinics);
        setSelectedClinicId((current) => {
          const stillAvailable = availableClinics.some((clinic) => clinic.id === current);
          const nextId = stillAvailable ? current : availableClinics[0]?.id || "";
          if (nextId) localStorage.setItem("doctorSelectedClinicId", nextId);
          else localStorage.removeItem("doctorSelectedClinicId");
          return nextId;
        });
        setError("");
      })
      .catch((requestError) => {
        if (active) setError(readApiError(requestError).message || "Could not load your clinics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const selectClinic = (clinicId) => {
    if (!clinics.some((clinic) => clinic.id === clinicId)) return;
    setSelectedClinicId(clinicId);
    localStorage.setItem("doctorSelectedClinicId", clinicId);
  };

  const value = useMemo(() => ({
    clinics,
    selectedClinicId,
    selectedClinic: clinics.find((clinic) => clinic.id === selectedClinicId) || null,
    loading,
    error,
    selectClinic,
  }), [clinics, selectedClinicId, loading, error]);

  return <DoctorClinicContext.Provider value={value}>{children}</DoctorClinicContext.Provider>;
}

export function useDoctorClinic() {
  const context = useContext(DoctorClinicContext);
  if (!context) throw new Error("useDoctorClinic must be used inside DoctorClinicProvider");
  return context;
}

export function withDoctorClinic(path, clinicId) {
  if (!clinicId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}clinicId=${encodeURIComponent(clinicId)}`;
}
