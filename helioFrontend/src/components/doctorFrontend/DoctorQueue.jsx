import { useState } from "react";
import { FiChevronDown, FiClock, FiArrowUpRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const DoctorQueue = () => {
  const navigate = useNavigate();

  const clinics = ["City Care Clinic", "MedPlus Clinic", "HealthPoint Clinic"];

  const patients = [
    {
      id: 1,
      token: "01",
      name: "Rahul Sharma",
      problem: "Fever & Cold",
      image: "https://i.pravatar.cc/150?img=12",
      status: "Completed",
      time: "18 min",
    },
    {
      id: 2,
      token: "02",
      name: "Ananya Singh",
      problem: "Migraine",
      image: "https://i.pravatar.cc/150?img=47",
      status: "Completed",
      time: "24 min",
    },
    {
      id: 3,
      token: "03",
      name: "Vikash Kumar",
      problem: "Blood Pressure",
      image: "https://i.pravatar.cc/150?img=11",
      status: "In Queue",
      time: "--",
    },
    {
      id: 4,
      token: "04",
      name: "Neha Gupta",
      problem: "General Checkup",
      image: "https://i.pravatar.cc/150?img=32",
      status: "In Queue",
      time: "--",
    },
    {
      id: 5,
      token: "05",
      name: "Aman Verma",
      problem: "Headache",
      image: "https://i.pravatar.cc/150?img=68",
      status: "Waiting",
      time: "--",
    },
  ];

  const [selectedClinic, setSelectedClinic] = useState(clinics[0]);
  const [clinicOpen, setClinicOpen] = useState(false);

  const completed = patients.filter((patient) => patient.status === "Completed").length;
  const remaining = patients.length - completed;

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-[15px]">

      <div className="mb-4 flex h-[80px] items-center justify-between rounded-full bg-white px-6">

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">QUEUE MANAGEMENT</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.7px] text-[#17213F]">Today's Queue</h1>
        </div>

        <div className="relative">
          <button onClick={() => setClinicOpen(!clinicOpen)} className="flex h-[54px] min-w-[230px] items-center justify-between rounded-full bg-[#17213F] px-5 text-left">
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-[1px] text-white/45">CLINIC</p>
              <p className="mt-0.5 text-[11px] font-semibold text-white">{selectedClinic}</p>
            </div>
            <FiChevronDown className={`text-[15px] text-white/70 transition-transform duration-300 ${clinicOpen ? "rotate-180" : ""}`} />
          </button>

          {clinicOpen && (
            <div className="absolute right-0 top-[55px] z-30 w-[230px] overflow-hidden rounded-[16px] border border-[#E5E8EE] bg-white p-1.5 shadow-[0_15px_35px_rgba(23,33,63,0.12)]">
              {clinics.map((clinic) => (
                <button key={clinic} onClick={() => { setSelectedClinic(clinic); setClinicOpen(false); }} className={`w-full rounded-[11px] px-4 py-3 text-left text-[10px] font-semibold transition-colors ${selectedClinic === clinic ? "bg-[#F1F4F8] text-[#17213F]" : "text-[#7D8799] hover:bg-[#F8F9FB] hover:text-[#17213F]"}`}>
                  {clinic}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="mb-4 grid grid-cols-3 gap-4">

        <div className="rounded-[20px] bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">TOTAL PATIENTS</span>
            <span className="text-[9px] font-semibold text-[#B1B7C2]">01</span>
          </div>
          <h2 className="mt-7 text-[44px] font-medium leading-none tracking-[-2px] text-[#17213F]">{patients.length}</h2>
          <p className="mt-3 text-[8px] font-semibold uppercase tracking-[1px] text-[#A0A7B3]">Today's queue</p>
        </div>

        <div className="rounded-[20px] bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">COMPLETED</span>
            <span className="text-[9px] font-semibold text-[#B1B7C2]">02</span>
          </div>
          <h2 className="mt-7 text-[44px] font-medium leading-none tracking-[-2px] text-[#17213F]">{completed}</h2>
          <p className="mt-3 text-[8px] font-semibold uppercase tracking-[1px] text-[#A0A7B3]">Patients served</p>
        </div>

        <div className="rounded-[20px] bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">REMAINING</span>
            <span className="text-[9px] font-semibold text-[#B1B7C2]">03</span>
          </div>
          <h2 className="mt-7 text-[44px] font-medium leading-none tracking-[-2px] text-[#17213F]">{String(remaining).padStart(2, "0")}</h2>
          <p className="mt-3 text-[8px] font-semibold uppercase tracking-[1px] text-[#A0A7B3]">Still in queue</p>
        </div>

      </div>

      <div className="rounded-[20px] bg-white p-6">

        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-[9px] w-[9px] rounded-[2px] bg-[#17213F]"></span>
              <span className="text-[9px] font-semibold tracking-[0.3px] text-[#202D55]">PATIENT QUEUE</span>
            </div>
            <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.6px] text-[#17213F]">{selectedClinic}</h3>
          </div>

          <div className="flex items-center gap-2">
            <FiClock className="text-[12px] text-[#A0A7B3]" />
            <span className="text-[9px] font-medium text-[#8B95A7]">Live Queue</span>
          </div>
        </div>

        <div className="">

          {patients.map((patient) => (
            <div key={patient.id} className="group flex min-h-[86px] items-center gap-5 py-3 transition-colors duration-200 hover:bg-[#FAFBFC]">

              <div className="w-[68px] text-center">
                <span className="text-[24px] font-semibold tracking-[-0.5px] text-[#202D55]">{patient.token}</span>
              </div>

              <div className="h-[48px] w-[88px] shrink-0 overflow-hidden rounded-full bg-[#EEF1F5]">
                <img src={patient.image} alt={patient.name} className="h-full w-full object-cover" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#17213F]">{patient.name}</p>
                <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.5px] text-[#929BAA]">{patient.problem}</p>
              </div>

              <div className="w-[125px]">
                <span className={`inline-flex rounded-full px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.5px] ${patient.status === "Completed" ? "bg-[#DCEFE7] text-[#4A8B70]" : patient.status === "In Queue" ? "bg-[#E7EFFA] text-[#5278A9]" : "bg-[#F0F1F4] text-[#788294]"}`}>
                  {patient.status}
                </span>
              </div>

              <div className="flex w-[90px] items-center gap-2">
                <FiClock className="text-[12px] text-[#A0A7B3]" />
                <span className="text-[11px] font-semibold text-[#202D55]">{patient.time}</span>
              </div>

              <button onClick={() => navigate(`/doctor/prescription`)} className="flex h-[40px] w-[275px] items-center justify-center gap-2 rounded-full border border-[#DDE2E9] bg-[#202D55] text-[8px] font-bold uppercase tracking-[0.8px] text-white transition-all duration-300 hover:border-[#17213F] hover:bg-[#17213F] hover:text-white">
                Access Prescription
              </button>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
};

export default DoctorQueue;