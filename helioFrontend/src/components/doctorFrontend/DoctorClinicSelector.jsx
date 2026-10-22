import { useDoctorClinic } from "./DoctorClinicContext";

export default function DoctorClinicSelector() {
  const { clinics, selectedClinicId, selectClinic, loading, error } = useDoctorClinic();

  return (
    <div className="flex items-center justify-end gap-3 px-[15px] pt-[15px]">
      <label className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8B95A7]" htmlFor="doctor-clinic">
        Clinic
      </label>
      <select
        id="doctor-clinic"
        value={selectedClinicId}
        onChange={(event) => selectClinic(event.target.value)}
        disabled={loading || clinics.length === 0}
        className="h-[46px] min-w-[220px] rounded-full border border-[#E5E8EE] bg-white px-5 text-xs font-semibold text-[#17213F] outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {clinics.length === 0 ? <option value="">{loading ? "Loading clinics..." : "No clinics assigned"}</option> : clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.name}</option>)}
      </select>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
