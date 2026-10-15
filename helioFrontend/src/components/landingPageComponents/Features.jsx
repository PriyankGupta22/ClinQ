// import React from "react";
// import {
//   FiArrowUpRight,
//   FiClock,
//   FiFileText,
//   FiBell,
//   FiCalendar,
//   FiCheckCircle,
//   FiActivity,
//   FiUser,
// } from "react-icons/fi";

// const Features = () => {
//   return (
//     <section
//       id="features"
//       className="w-full bg-[#f7f6f2] px-5 py-24 sm:px-8 lg:px-14 lg:py-32"
//     >
//       <div className="mx-auto max-w-[1600px]">

//         {/* ================= HEADER ================= */}
//         <div className="mb-16 flex flex-col gap-8 lg:mb-24 lg:flex-row lg:items-end lg:justify-between">

//           <div className="max-w-[1000px]">
//             <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#202d55]/50">
//               THE CLINQUEUE PLATFORM
//             </p>

//             <h2 className="text-[clamp(3.5rem,8vw,8.5rem)] font-semibold leading-[0.82] tracking-[-0.075em] text-[#202d55]">
//               YOUR CLINIC,
//               <br />
//               <span className="text-[#28172F]">FINALLY DIGITAL.</span>
//             </h2>
//           </div>

//           <div className="max-w-[390px] pb-2 lg:pb-3">
//             <p className="text-[17px] leading-[1.55] text-[#202d55]/65 sm:text-[19px]">
//               From the first appointment to the final prescription,
//               ClinQueue brings your entire clinic into one connected
//               digital workflow.
//             </p>
//           </div>
//         </div>

//         {/* ================= TRANSFORMATION ================= */}
//         <div className="mb-6 grid gap-6 lg:grid-cols-[0.85fr_1.6fr]">

//           {/* PAPER → DIGITAL */}
//           <div className="relative min-h-[560px] overflow-hidden rounded-[32px] bg-[#28172F] p-8 text-white sm:p-10 lg:p-12">

//             <div className="relative z-10 flex h-full flex-col justify-between">

//               <div>
//                 <div className="mb-8 flex items-center justify-between">
//                   <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/50">
//                     01 / DIGITAL CLINIC
//                   </span>

//                   <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15">
//                     <FiArrowUpRight size={18} />
//                   </div>
//                 </div>

//                 <h3 className="max-w-[430px] text-[clamp(2.8rem,5vw,5rem)] font-medium leading-[0.9] tracking-[-0.055em]">
//                   Leave the
//                   <br />
//                   <span className="text-[#f0c84b]">parchi</span>
//                   <br />
//                   behind.
//                 </h3>
//               </div>

//               <div>
//                 <p className="mb-8 max-w-[430px] text-[15px] leading-[1.6] text-white/60 sm:text-[16px]">
//                   Replace paper slips, registers and scattered patient
//                   information with one simple digital clinic workflow.
//                 </p>

//                 {/* Paper to digital visual */}
//                 <div className="relative h-[150px]">

//                   {/* Paper */}
//                   <div className="absolute left-0 top-5 w-[150px] rotate-[-6deg] rounded-2xl bg-[#f5f0e7] p-5 text-[#202d55] shadow-2xl transition-transform duration-500 hover:-translate-y-2 hover:rotate-[-3deg]">
//                     <div className="mb-4 flex items-center justify-between">
//                       <span className="text-[8px] font-bold uppercase tracking-widest">
//                         PATIENT
//                       </span>
//                       <FiFileText size={14} />
//                     </div>

//                     <div className="space-y-2">
//                       <div className="h-2 w-20 rounded-full bg-[#202d55]/20" />
//                       <div className="h-2 w-28 rounded-full bg-[#202d55]/10" />
//                       <div className="h-2 w-16 rounded-full bg-[#202d55]/10" />
//                     </div>
//                   </div>

//                   {/* Arrow */}
//                   <div className="absolute left-[38%] top-[55px] flex h-9 w-9 items-center justify-center rounded-full bg-[#f0c84b] text-[#202d55]">
//                     <FiArrowUpRight size={17} />
//                   </div>

//                   {/* Digital record */}
//                   <div className="absolute right-0 top-0 w-[185px] rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm transition-transform duration-500 hover:-translate-y-2">
//                     <div className="mb-4 flex items-center gap-3">
//                       <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0c84b] text-[#202d55]">
//                         <FiUser size={15} />
//                       </div>

//                       <div>
//                         <div className="text-[11px] font-semibold">
//                           Patient Record
//                         </div>
//                         <div className="text-[8px] text-white/40">
//                           Digitized
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <div className="h-1.5 w-full rounded-full bg-white/15" />
//                       <div className="h-1.5 w-[75%] rounded-full bg-white/10" />
//                       <div className="h-1.5 w-[55%] rounded-full bg-white/10" />
//                     </div>
//                   </div>

//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* SMART QUEUE */}
//           <div className="relative min-h-[560px] overflow-hidden rounded-[32px] bg-[#102f2b] p-8 text-white sm:p-10 lg:p-12">

//             <div className="relative z-10">

//               <div className="mb-14 flex items-center justify-between">
//                 <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/45">
//                   02 / SMART QUEUE
//                 </span>

//                 <div className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-widest text-white/60">
//                   <span className="h-2 w-2 animate-pulse rounded-full bg-[#f0c84b]" />
//                   Live
//                 </div>
//               </div>

//               <h3 className="max-w-[700px] text-[clamp(3rem,5.5vw,6rem)] font-medium leading-[0.88] tracking-[-0.06em]">
//                 Know
//                 <br />
//                 who’s
//                 <br />
//                 <span className="text-[#8bb8af]">next.</span>
//               </h3>

//               <p className="mt-8 max-w-[480px] text-[15px] leading-[1.6] text-white/55 sm:text-[16px]">
//                 Manage your clinic queue in real time and give patients
//                 visibility into their position and expected waiting time.
//               </p>

//               {/* Queue UI */}
//               <div className="absolute bottom-[-40px] right-[-20px] w-[min(75%,440px)] rotate-[-2deg] rounded-[28px] border border-white/10 bg-[#f7f6f2] p-6 text-[#202d55] shadow-2xl sm:bottom-[-65px] sm:right-[-30px]">

//                 <div className="mb-5 flex items-center justify-between">
//                   <div>
//                     <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#202d55]/40">
//                       LIVE QUEUE
//                     </p>
//                     <p className="mt-1 text-sm font-semibold">
//                       Dr. Sharma
//                     </p>
//                   </div>

//                   <FiActivity className="text-[#315e59]" size={20} />
//                 </div>

//                 <div className="mb-5 flex items-end justify-between">
//                   <div>
//                     <p className="text-[10px] uppercase tracking-wider text-[#202d55]/40">
//                       Your token
//                     </p>

//                     <p className="text-5xl font-semibold tracking-[-0.06em]">
//                       024
//                     </p>
//                   </div>

//                   <div className="text-right">
//                     <p className="text-[10px] uppercase tracking-wider text-[#202d55]/40">
//                       Estimated wait
//                     </p>
//                     <p className="text-lg font-semibold">
//                       18 min
//                     </p>
//                   </div>
//                 </div>

//                 <div className="rounded-2xl bg-[#102f2b]/5 p-4">
//                   <div className="mb-2 flex justify-between text-[10px]">
//                     <span className="text-[#202d55]/50">
//                       Patients ahead
//                     </span>
//                     <span className="font-semibold">3</span>
//                   </div>

//                   <div className="h-2 overflow-hidden rounded-full bg-[#102f2b]/10">
//                     <div className="h-full w-[72%] rounded-full bg-[#315e59]" />
//                   </div>

//                   <p className="mt-2 text-[9px] text-[#202d55]/40">
//                     Consultation in progress
//                   </p>
//                 </div>

//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ================= PATIENT RECORD ================= */}
//         <div className="mb-6 overflow-hidden rounded-[32px] bg-[#202d55] p-8 text-white sm:p-10 lg:p-14">

//           <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">

//             <div>
//               <p className="mb-8 text-[11px] uppercase tracking-[0.25em] text-white/40">
//                 03 / DIGITAL PATIENT RECORD
//               </p>

//               <h3 className="text-[clamp(3rem,5.5vw,6rem)] font-medium leading-[0.88] tracking-[-0.06em]">
//                 Every patient.
//                 <br />
//                 <span className="text-[#f0c84b]">
//                   One history.
//                 </span>
//               </h3>

//               <p className="mt-8 max-w-[500px] text-[15px] leading-[1.6] text-white/55 sm:text-[16px]">
//                 Keep consultations, visits, prescriptions and patient
//                 information connected instead of searching through old
//                 parchi files.
//               </p>
//             </div>

//             {/* Timeline */}
//             <div className="rounded-[28px] bg-white/10 p-6 backdrop-blur-sm sm:p-8">

//               <div className="mb-8 flex items-center justify-between">
//                 <div>
//                   <p className="text-[10px] uppercase tracking-widest text-white/40">
//                     Patient history
//                   </p>
//                   <p className="mt-1 text-lg font-medium">
//                     Rahul Mehta
//                   </p>
//                 </div>

//                 <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0c84b] text-[#202d55]">
//                   <FiUser size={18} />
//                 </div>
//               </div>

//               <div className="relative space-y-7 pl-7">

//                 <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/15" />

//                 {[
//                   ["TODAY", "Consultation", "Fever · Fatigue"],
//                   ["12 SEP", "Prescription", "Paracetamol · Follow-up"],
//                   ["28 AUG", "Visit", "Routine consultation"],
//                 ].map(([date, title, detail], index) => (
//                   <div key={title} className="relative flex gap-5">

//                     <span
//                       className={`absolute -left-[25px] top-1.5 h-3 w-3 rounded-full border-2 ${
//                         index === 0
//                           ? "border-[#f0c84b] bg-[#f0c84b]"
//                           : "border-white/30 bg-[#202d55]"
//                       }`}
//                     />

//                     <div className="min-w-[55px] text-[9px] font-medium tracking-wider text-white/35">
//                       {date}
//                     </div>

//                     <div>
//                       <p className="text-sm font-medium">{title}</p>
//                       <p className="mt-1 text-xs text-white/40">
//                         {detail}
//                       </p>
//                     </div>
//                   </div>
//                 ))}

//               </div>
//             </div>

//           </div>
//         </div>

//         {/* ================= RECOMMENDATION ================= */}
//         <div className="mb-6 overflow-hidden rounded-[32px] bg-[#28172F] p-8 text-white sm:p-10 lg:p-14">

//           <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">

//             <div>
//               <p className="mb-8 text-[11px] uppercase tracking-[0.25em] text-white/40">
//                 04 / CLINICAL DECISION SUPPORT
//               </p>

//               <h3 className="text-[clamp(3rem,5vw,5.7rem)] font-medium leading-[0.88] tracking-[-0.06em]">
//                 Better
//                 <br />
//                 information.
//                 <br />
//                 <span className="text-[#f0c84b]">
//                   Better decisions.
//                 </span>
//               </h3>

//               <p className="mt-8 max-w-[480px] text-[15px] leading-[1.6] text-white/55 sm:text-[16px]">
//                 Use patient history and consultation information to surface
//                 relevant medicine and care recommendations as decision
//                 support for clinicians.
//               </p>

//               <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.15em] text-white/45">
//                 <FiCheckCircle size={13} />
//                 Clinician review required
//               </div>
//             </div>

//             {/* Doctor consultation UI */}
//             <div className="rounded-[28px] bg-[#f7f6f2] p-5 text-[#202d55] shadow-2xl sm:p-7">

//               <div className="mb-6 flex items-center justify-between border-b border-[#202d55]/10 pb-5">

//                 <div>
//                   <p className="text-[9px] uppercase tracking-widest text-[#202d55]/40">
//                     Consultation
//                   </p>

//                   <p className="mt-1 font-semibold">
//                     Rahul Mehta · 28 yrs
//                   </p>
//                 </div>

//                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#28172F] text-white">
//                   <FiActivity size={16} />
//                 </div>
//               </div>

//               <div className="grid gap-5 sm:grid-cols-2">

//                 {/* History */}
//                 <div className="rounded-2xl bg-[#202d55]/5 p-5">

//                   <p className="mb-4 text-[9px] font-semibold uppercase tracking-widest text-[#202d55]/40">
//                     Patient history
//                   </p>

//                   <div className="space-y-3 text-xs">
//                     <div className="flex justify-between">
//                       <span className="text-[#202d55]/45">
//                         Symptoms
//                       </span>
//                       <span className="font-medium">
//                         Fever, fatigue
//                       </span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span className="text-[#202d55]/45">
//                         Previous meds
//                       </span>
//                       <span className="font-medium">
//                         Recorded
//                       </span>
//                     </div>

//                     <div className="flex justify-between">
//                       <span className="text-[#202d55]/45">
//                         Allergies
//                       </span>
//                       <span className="font-medium text-[#315e59]">
//                         None reported
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Recommendations */}
//                 <div className="rounded-2xl bg-[#28172F] p-5 text-white">

//                   <p className="mb-4 text-[9px] font-semibold uppercase tracking-widest text-white/40">
//                     Assisted recommendations
//                   </p>

//                   <div className="space-y-3">

//                     <div className="rounded-xl bg-white/10 p-3">
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs font-medium">
//                           Relevant options
//                         </span>
//                         <FiCheckCircle size={13} className="text-[#f0c84b]" />
//                       </div>
//                     </div>

//                     <div className="rounded-xl bg-white/10 p-3">
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs font-medium">
//                           Dosage reference
//                         </span>
//                         <FiFileText size={13} className="text-white/50" />
//                       </div>
//                     </div>

//                     <div className="rounded-xl bg-white/10 p-3">
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs font-medium">
//                           Potential considerations
//                         </span>
//                         <FiActivity size={13} className="text-white/50" />
//                       </div>
//                     </div>

//                   </div>

//                 </div>

//               </div>

//             </div>
//           </div>
//         </div>

//         {/* ================= SMALL FEATURES ================= */}
//         <div className="grid gap-6 md:grid-cols-3">

//           {/* Appointments */}
//           <div className="group rounded-[28px] bg-[#f0c84b] p-8 text-[#202d55] transition-transform duration-500 hover:-translate-y-1 sm:p-10">

//             <div className="mb-16 flex items-center justify-between">
//               <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">
//                 05 / APPOINTMENTS
//               </span>

//               <FiCalendar size={20} />
//             </div>

//             <h3 className="text-[clamp(2rem,3vw,3rem)] font-medium leading-[0.95] tracking-[-0.045em]">
//               Appointments
//               <br />
//               that actually
//               <br />
//               flow.
//             </h3>

//             <p className="mt-6 text-sm leading-[1.6] text-[#202d55]/60">
//               Connect scheduling with real-time clinic capacity and
//               queue movement.
//             </p>
//           </div>

//           {/* Notifications */}
//           <div className="group rounded-[28px] bg-[#dcece8] p-8 text-[#315e59] transition-transform duration-500 hover:-translate-y-1 sm:p-10">

//             <div className="mb-16 flex items-center justify-between">
//               <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">
//                 06 / UPDATES
//               </span>

//               <FiBell size={20} />
//             </div>

//             <h3 className="text-[clamp(2rem,3vw,3rem)] font-medium leading-[0.95] tracking-[-0.045em]">
//               Less waiting.
//               <br />
//               More knowing.
//             </h3>

//             <div className="mt-7 rounded-2xl bg-white/70 p-4">

//               <p className="text-xs font-semibold">
//                 You’re 3 patients away.
//               </p>

//               <div className="mt-2 flex justify-between text-[9px] text-[#315e59]/50">
//                 <span>Estimated consultation</span>
//                 <span>18 min</span>
//               </div>

//               <div className="mt-1 flex justify-between text-[9px] text-[#315e59]/50">
//                 <span>Time to leave</span>
//                 <span>10:42 AM</span>
//               </div>

//             </div>
//           </div>

//           {/* Clinic management */}
//           <div className="group rounded-[28px] bg-[#202d55] p-8 text-white transition-transform duration-500 hover:-translate-y-1 sm:p-10">

//             <div className="mb-16 flex items-center justify-between">
//               <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
//                 07 / CLINIC MANAGEMENT
//               </span>

//               <FiActivity size={20} className="text-[#f0c84b]" />
//             </div>

//             <h3 className="text-[clamp(2rem,3vw,3rem)] font-medium leading-[0.95] tracking-[-0.045em]">
//               One place
//               <br />
//               for the
//               <br />
//               whole clinic.
//             </h3>

//             <p className="mt-6 text-sm leading-[1.6] text-white/50">
//               Manage doctors, patients, appointments, records and
//               day-to-day clinic operations from one connected system.
//             </p>
//           </div>

//         </div>

//       </div>
//     </section>
//   );
// };

// export default Features;

import React from "react";
import {
  FiActivity,
  FiArrowUpRight,
  FiBell,
  FiCalendar,
  FiCheck,
  FiClock,
  FiFileText,
  FiUser,
} from "react-icons/fi";

const Features = () => {
  return (
    <section className="overflow-hidden bg-[#f7f6f2] text-black">
      {/* =========================================================
          INTRO
      ========================================================= */}
      <div className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 sm:px-10 lg:px-16 lg:pb-32 lg:pt-40">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.42fr] lg:items-end">
          <div>

            <h2 className="max-w-[1050px] text-[clamp(4rem,9vw,5.5rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
              Your Clinic,
              <br />
              <span className="text-black">Finally Digital.</span>
            </h2>
          </div>

          <p className="max-w-[390px] pb-2 text-[14px] leading-[1.55] text-[#202d55]/60 sm:text-[18px] lg:text-[16px] uppercase">
            From the first appointment to the final prescription,
            ClinQueue connects the entire patient journey in one place.
          </p>
        </div>
      </div>

      {/* =========================================================
          TRANSFORMATION STORY
      ========================================================= */}
      <div className="mx-auto max-w-[1600px] sm:px-0 lg:px-0">

        {/* ---------------------------------------------------------
            PAPER → DIGITAL
        --------------------------------------------------------- */}
        <div className="relative min-h-[720px] overflow-hidden bg-[#28172F] px-7 py-10 text-white sm:px-12 sm:py-14 lg:px-16 lg:py-16">

          {/* decorative oversized number */}
          <div className="pointer-events-none absolute -right-3 top-[-55px] select-none text-[260px] font-semibold leading-none tracking-[-0.12em] text-white/[0.095] sm:text-[340px]">
            01
          </div>

          <div className="relative z-10 grid min-h-[620px] gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">

            {/* TEXT */}
            <div className="self-start lg:self-center">

             

              <h3 className="max-w-[600px] text-[clamp(3.5rem,6vw,7rem)] font-medium leading-[0.84] tracking-[-0.065em]">
                Leave the
                <br />
                <span className="text-[#f0c84b]">parchi</span>
                <br />
                behind.
              </h3>

              <p className="mt-9 max-w-[390px] text-[15px] leading-[1.65] text-white/55 sm:text-[16px]">
                Replace paper slips and registers with a connected
                digital clinic workflow. Every patient starts building
                a usable digital history from day one.
              </p>
            </div>

            {/* VISUAL */}
            <div className="relative flex min-h-[390px] items-center justify-center lg:min-h-[570px]">

              {/* subtle connecting line */}

              {/* PAPER */}
              <div className="absolute left-[2%] top-[10%] w-[190px] rotate-[-8deg] sm:w-[230px] lg:left-[5%] lg:w-[260px]">
                <div className="relative aspect-[0.72] bg-[#f3eee5] p-6 text-[#202d55] shadow-[0_30px_80px_rgba(0,0,0,0.25)] sm:p-8">

                  <div className="mb-8 border-b border-[#202d55]/15 pb-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em]">
                      CLINIC
                    </p>
                    <p className="mt-1 text-[7px] text-[#202d55]/45">
                      PATIENT SLIP
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="text-[7px] uppercase tracking-wider text-[#202d55]/40">
                        Name
                      </p>
                      <div className="mt-2 h-2 w-[85%] bg-[#202d55]/15" />
                    </div>

                    <div>
                      <p className="text-[7px] uppercase tracking-wider text-[#202d55]/40">
                        Age
                      </p>
                      <div className="mt-2 h-2 w-[35%] bg-[#202d55]/15" />
                    </div>

                    <div>
                      <p className="text-[7px] uppercase tracking-wider text-[#202d55]/40">
                        Symptoms
                      </p>
                      <div className="mt-2 h-2 w-full bg-[#202d55]/10" />
                      <div className="mt-2 h-2 w-[70%] bg-[#202d55]/10" />
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 border-t border-[#202d55]/10 pt-4">
                    <p className="font-mono text-[7px] text-[#202d55]/35">
                      #PQ-024
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-center text-[9px] uppercase tracking-[0.25em] text-white/25">
                  paper
                </p>
              </div>

              {/* ARROW */}
           

              {/* DIGITAL RECORD */}
              <div className="absolute right-[-2%] top-[22%] w-[230px] rotate-[5deg] border border-white/10 bg-[#f7f6f2] p-5 text-[#202d55] shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:w-[300px] sm:p-7 lg:right-[2%] lg:w-[350px]">

                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#202d55]/35">
                      DIGITAL RECORD
                    </p>
                    <p className="mt-2 text-base font-semibold sm:text-lg">
                      Rahul Mehta
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#28172F] text-white">
                    <FiUser size={15} />
                  </div>
                </div>

                <div className="mb-7 flex gap-2">
                  <span className="rounded-full bg-[#28172F]/10 px-3 py-1 text-[8px] font-medium">
                    28 YEARS
                  </span>
                  <span className="rounded-full bg-[#28172F]/10 px-3 py-1 text-[8px] font-medium">
                    ACTIVE
                  </span>
                </div>

                <div className="border-l border-[#28172F]/15 pl-5">

                  <div className="relative pb-7">
                    <span className="absolute -left-[25px] top-0 h-2.5 w-2.5 rounded-full bg-[#28172F]" />

                    <p className="text-[8px] font-semibold uppercase tracking-widest text-[#202d55]/35">
                      TODAY
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      Consultation
                    </p>
                    <p className="mt-1 text-[9px] text-[#202d55]/45">
                      Fever · Fatigue
                    </p>
                  </div>

                  <div className="relative pb-7">
                    <span className="absolute -left-[25px] top-0 h-2.5 w-2.5 rounded-full border-2 border-[#28172F]/30 bg-[#f7f6f2]" />

                    <p className="text-[8px] font-semibold uppercase tracking-widest text-[#202d55]/35">
                      12 SEP
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      Prescription
                    </p>
                    <p className="mt-1 text-[9px] text-[#202d55]/45">
                      Follow-up recorded
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[25px] top-0 h-2.5 w-2.5 rounded-full border-2 border-[#28172F]/30 bg-[#f7f6f2]" />

                    <p className="text-[8px] font-semibold uppercase tracking-widest text-[#202d55]/35">
                      28 AUG
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      Previous visit
                    </p>
                  </div>

                </div>
              </div>

              {/* center transformation label */}
              <div className="absolute bottom-[5%] left-[50%] -translate-x-1/2 text-center">
                <p className="text-[8px] uppercase tracking-[0.3em] text-white/30">
                  ONE PATIENT
                </p>
                <p className="mt-2 text-[10px] font-medium text-white/60">
                  ONE CONNECTED HISTORY
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------
            SMART QUEUE
        --------------------------------------------------------- */}
        <div className="relative min-h-[680px] py-32 lg:py-44 lg:px-15">

          <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">

            {/* LEFT */}
            <div>
              

              <h3 className="text-[clamp(3.5rem,6vw,7rem)] font-medium leading-[0.84] tracking-[-0.065em]">
                Know
                <br />
                who’s
                <br />
                <span className="text-[#315e59]">next.</span>
              </h3>

              <p className="mt-9 max-w-[400px] text-[15px] leading-[1.65] text-[#202d55]/55 sm:text-[16px]">
                A live queue that works for everyone. Clinics see the
                flow. Doctors know who is next. Patients know how long
                they have to wait.
              </p>

              
            </div>

            {/* RIGHT VISUAL */}
            <div className="relative min-h-[450px]">

              {/* oversized token */}
              <div className="absolute left-0 top-0 text-[clamp(8rem,20vw,18rem)] font-bold leading-none tracking-[-0.1em] text-[#202d55]/[0.075]">
                02
              </div>

              {/* queue interface */}
              <div className="absolute right-0 top-[8%] w-[90%] max-w-[650px] rounded-[35px] border border-[#202d55]/10 bg-white/70 p-6 shadow-[0_30px_100px_rgba(32,45,85,0.08)] backdrop-blur-sm sm:p-9">

                <div className="mb-8 flex items-center justify-between border-b border-[#202d55]/10 pb-6">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.22em] text-[#202d55]/35">
                      LIVE QUEUE
                    </p>
                    <p className="mt-2 font-semibold">
                      Dr. Sharma
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-[#102f2b]/10 px-4 py-2 text-[8px] font-semibold uppercase tracking-widest text-[#315e59]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#315e59]" />
                    Consulting
                  </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-[0.8fr_1.2fr]">

                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-[#202d55]/35">
                      Your token
                    </p>

                    <p className="mt-1 text-[90px] font-semibold leading-none tracking-[-0.08em] text-[#202d55]">
                      024
                    </p>

                    <p className="mt-3 text-xs text-[#202d55]/45">
                      3 patients ahead
                    </p>
                  </div>

                  <div className="self-end">

                    <div className="mb-3 flex items-end justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-[#202d55]/35">
                          Estimated wait
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                          18 min
                        </p>
                      </div>

                      <FiClock
                        size={20}
                        className="mb-1 text-[#315e59]"
                      />
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#202d55]/10">
                      <div className="h-full w-[72%] rounded-full bg-[#315e59]" />
                    </div>

                    <div className="mt-3 flex justify-between text-[8px] uppercase tracking-wider text-[#202d55]/30">
                      <span>Queue moving</span>
                      <span>72%</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* floating notification */}
              <div className="absolute bottom-[5%] left-[3%] w-[250px] rounded-[25px] bg-[#f0c84b] p-5 shadow-xl sm:w-[290px]">

                <div className="mb-5 flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em]">
                    CLINQUEUE
                  </span>

                  <FiBell size={16} />
                </div>

                <p className="text-base font-semibold leading-tight">
                  You’re 3 patients away.
                </p>

                <div className="mt-4 flex justify-between text-[9px] text-[#202d55]/55">
                  <span>Estimated consultation</span>
                  <span>18 min</span>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------
            PATIENT HISTORY
        --------------------------------------------------------- */}
        <div className="relative border-t border-[#202d55]/10 py-32 lg:py-44 lg:px-15">

          <div className="grid gap-20 lg:grid-cols-[1fr_0.8fr] lg:items-center">

            <div>
              

              <h3 className="max-w-[800px] text-[clamp(3.5rem,6vw,7rem)] font-medium leading-[0.94] tracking-[-0.065em]">
                Every patient.
                <br />
                <span className="text-[#28172F]">
                  One history.
                </span>
              </h3>

              <p className="mt-9 max-w-[480px] text-[15px] leading-[1.65] text-[#202d55]/55 sm:text-[16px]">
                No more searching through old slips. Every consultation,
                visit and prescription stays connected to the patient.
              </p>
            </div>

            {/* Timeline visual */}
            <div className="relative">

              <div className="absolute left-8 top-0 h-full w-px bg-[#202d55]/10" />

              <div className="space-y-12 pl-16">

                {[
                  {
                    date: "TODAY",
                    title: "Consultation",
                    desc: "Fever · Fatigue",
                    active: true,
                  },
                  {
                    date: "12 SEP",
                    title: "Prescription",
                    desc: "Follow-up recorded",
                  },
                  {
                    date: "28 AUG",
                    title: "Previous visit",
                    desc: "Routine consultation",
                  },
                ].map((item) => (
                  <div key={item.date} className="relative">

                    <span
                      className={`absolute -left-[37px] top-1 h-4 w-4 rounded-full border-4 border-[#f7f6f2] ${
                        item.active
                          ? "bg-[#28172F]"
                          : "bg-[#202d55]/20"
                      }`}
                    />

                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#202d55]/35">
                      {item.date}
                    </p>

                    <h4 className="mt-2 text-xl font-semibold tracking-tight">
                      {item.title}
                    </h4>

                    <p className="mt-1 text-sm text-[#202d55]/45">
                      {item.desc}
                    </p>
                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            CONSULTATION + RECOMMENDATION
        ========================================================= */}
        <div className="relative overflow-hidden bg-[#101936] px-7 py-12 text-white sm:px-12 sm:py-16 lg:px-16 lg:py-20">

          <div className="pointer-events-none absolute -right-24 -top-24 h-[350px] w-[350px] rounded-full bg-[#28172F]/80 blur-[100px]" />

          <div className="pointer-events-none absolute -bottom-32 left-[-100px] h-[350px] w-[350px] rounded-full bg-[#f0c84b]/10 blur-[100px]" />

          <div className="relative z-10 grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

            <div>
             

              <h3 className="max-w-[650px] text-[clamp(3.5rem,6vw,7rem)] font-medium leading-[0.84] tracking-[-0.065em]">
                Better
                <br />
                information.
                <br />
                <span className="text-[#f0c84b]">
                  Better decisions.
                </span>
              </h3>

              <p className="mt-9 max-w-[430px] text-[15px] leading-[1.65] text-white/50 sm:text-[16px]">
                Bring patient history into the consultation and surface
                relevant information that can assist the clinician's
                decision-making process.
              </p>

              <div className="mt-8 flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-white/35">
                <FiCheck size={13} />
                Clinician review required
              </div>
            </div>

            {/* Consultation UI */}
            <div className="relative">

              <div className="rounded-[32px] bg-[#f7f6f2] p-5 text-[#202d55] shadow-[0_40px_100px_rgba(0,0,0,0.3)] sm:p-7">

                <div className="mb-7 flex items-center justify-between border-b border-[#202d55]/10 pb-6">

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-[#202d55]/35">
                      CURRENT CONSULTATION
                    </p>

                    <p className="mt-2 text-lg font-semibold">
                      Rahul Mehta
                    </p>

                    <p className="mt-1 text-[10px] text-[#202d55]/40">
                      28 years · Token 024
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#101936] text-white">
                    <FiUser size={17} />
                  </div>

                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* history */}
                  <div className="rounded-[22px] bg-[#202d55]/5 p-5">

                    <p className="mb-5 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#202d55]/35">
                      Patient information
                    </p>

                    <div className="space-y-4">

                      <div>
                        <p className="text-[9px] text-[#202d55]/35">
                          Symptoms
                        </p>
                        <p className="mt-1 text-xs font-semibold">
                          Fever, fatigue
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-[#202d55]/35">
                          Previous medication
                        </p>
                        <p className="mt-1 text-xs font-semibold">
                          History available
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-[#202d55]/35">
                          Allergies
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#315e59]">
                          None reported
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* recommendation */}
                  <div className="rounded-[22px] bg-[#28172F] p-5 text-white">

                    <div className="mb-5 flex items-center justify-between">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/35">
                        Assisted insight
                      </p>

                      <span className="rounded-full bg-white/10 px-2 py-1 text-[7px] uppercase tracking-wider text-white/45">
                        Review
                      </span>
                    </div>

                    <p className="text-sm font-semibold">
                      Relevant information
                    </p>

                    <div className="mt-4 space-y-2">

                      <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                        <span className="text-[9px] text-white/65">
                          Medication options
                        </span>
                        <FiArrowUpRight size={13} className="text-[#f0c84b]" />
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                        <span className="text-[9px] text-white/65">
                          Dosage reference
                        </span>
                        <FiFileText size={13} className="text-white/40" />
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                        <span className="text-[9px] text-white/65">
                          Patient considerations
                        </span>
                        <FiCheck size={13} className="text-[#f0c84b]" />
                      </div>

                    </div>

                    <p className="mt-5 text-[7px] uppercase tracking-[0.12em] text-white/25">
                      Decision support · clinician review required
                    </p>

                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>

        {/* =========================================================
            FINAL SUPPORTING FEATURES — NO CARDS
        ========================================================= */}
        <div className="border-b border-[#202d55]/10 py-28 lg:py-36 lg:px-15">

          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <h3 className="max-w-[800px] text-[clamp(3rem,5vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.06em]">
              Everything else
              <br />
              <span className="text-[#202d55]/50">
                just flows.
              </span>
            </h3>

            <p className="max-w-[330px] text-sm leading-[1.6] text-[#202d55]/50 uppercase">
              The small things become simple when the whole clinic is
              connected.
            </p>
          </div>

          <div className="grid border-y border-[#202d55]/10 sm:grid-cols-3">

            {/* appointment */}
            <div className="border-b border-[#202d55]/10 py-9 sm:border-b-0 sm:border-r sm:px-8 sm:py-12">

              <div className="mb-14 flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#202d55]/35">
                  05
                </span>
                <FiCalendar size={18} className="text-[#202d55]/45" />
              </div>

              <h4 className="text-2xl font-medium tracking-[-0.04em]">
                Appointments
                <br />
                that flow.
              </h4>

              <p className="mt-5 max-w-[260px] text-sm leading-[1.6] text-[#202d55]/45">
                Connect scheduling with real-time clinic capacity.
              </p>
            </div>

            {/* notifications */}
            <div className="border-b border-[#202d55]/10 py-9 sm:border-b-0 sm:border-r sm:px-8 sm:py-12">

              <div className="mb-14 flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#202d55]/35">
                  06
                </span>
                <FiBell size={18} className="text-[#202d55]/45" />
              </div>

              <h4 className="text-2xl font-medium tracking-[-0.04em]">
                Less waiting.
                <br />
                More knowing.
              </h4>

              <p className="mt-5 max-w-[260px] text-sm leading-[1.6] text-[#202d55]/45">
                Patients stay updated as their place in the queue changes.
              </p>
            </div>

            {/* management */}
            <div className="py-9 sm:px-8 sm:py-12">

              <div className="mb-14 flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#202d55]/35">
                  07
                </span>
                <FiActivity size={18} className="text-[#202d55]/45" />
              </div>

              <h4 className="text-2xl font-medium tracking-[-0.04em]">
                One clinic.
                <br />
                One system.
              </h4>

              <p className="mt-5 max-w-[260px] text-sm leading-[1.6] text-[#202d55]/45">
                Doctors, patients, appointments and records — connected.
              </p>
            </div>

          </div>
        </div>

        {/* =========================================================
            CLOSING STATEMENT
        ========================================================= */}
        <div className="py-32 text-center lg:py-48">

          <p className="mb-8 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#202d55]/35">
            THE BIGGER PICTURE
          </p>

          <h3 className="mx-auto max-w-[1200px] text-[clamp(4rem,9vw,9rem)] font-semibold leading-[0.8] tracking-[-0.08em]">
            ONE CLINIC.
            <br />
            <span className="text-[#28172F]">
              CONNECTED.
            </span>
          </h3>

          <p className="mx-auto mt-10 max-w-[520px] text-[16px] leading-[1.6] text-[#202d55]/50 sm:text-[18px]">
            From parchi to patient history. From waiting room to
            consultation. ClinQueue brings the whole journey together.
          </p>

          <div className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#202d55] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-transform duration-300 hover:scale-[1.03]">
            Explore ClinQueue
            <FiArrowUpRight size={15} />
          </div>

        </div>

      </div>
    </section>
  );
};

export default Features;