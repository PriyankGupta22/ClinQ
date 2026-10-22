import { FiArrowUpRight, FiEdit3, FiClock, FiMapPin, FiBriefcase } from "react-icons/fi";

import useDoctorProfile from "./useDoctorProfile";
import { doctorPhotoPlaceholder } from "./doctorProfileData";
import DashboardDemoIndicator from "../DashboardDemoIndicator";

const DoctorProfile = () => {
  const { profile, schedule, message } = useDoctorProfile();

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-[15px]">
      <DashboardDemoIndicator />

      <div className="mb-4 flex h-[82px] items-center justify-between rounded-full bg-white px-7">

        <div>
          <div className="flex items-center gap-2">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#9DBBE3]"></span>
            <span className="text-[9px] font-semibold tracking-[0.4px] text-[#202D55]">DOCTOR PROFILE</span>
          </div>

          <h1 className="mt-1 text-[23px] font-semibold tracking-[-0.8px] text-[#17213F]">
            Profile
          </h1>
        </div>

        <button disabled title="Profile editing is not supported by the current doctor API." aria-label="Edit Profile unavailable: no authorized update endpoint" className="flex h-[42px] items-center gap-2 rounded-full bg-[#17213F] px-5 text-[8px] font-semibold uppercase tracking-[0.8px] text-white transition-all duration-300 hover:bg-[#202D55]">
          <FiEdit3 className="text-[13px]" />
          Edit Profile
        </button>

      </div>


      <div className="grid min-w-0 grid-cols-[minmax(280px,0.32fr)_minmax(0,0.68fr)] gap-4">


        <div className="space-y-4">

          <div className="rounded-[20px] bg-[#17213F] p-6">

            <div className="relative mx-auto w-fit flex justify-center">

              <div className="h-[430px] w-[330px] overflow-hidden rounded-[18px] bg-[#E8ECF2]">
                <img src={doctorPhotoPlaceholder} alt="Profile photo not provided" className="h-full w-full object-cover" />
              </div>

            </div>


            <div className="mt-6 text-center">

              <h2 className="text-[21px] font-semibold tracking-[-0.6px] text-white">
                  {profile.name}
                </h2>

              <p className="mt-2 text-[8px] font-semibold uppercase tracking-[1px] text-white/45">
                  {profile.specialization}
                </p>

            </div>


            <div className="mt-7 border-t border-white/10 pt-5">

              <div className="flex items-center gap-3">
                <FiBriefcase className="text-[14px] text-white/40" />
                <div>
                  <p className="text-[7px] uppercase tracking-[0.8px] text-white/35">EXPERIENCE</p>
                  <p className="mt-1 text-[9px] font-medium text-white/75">{profile.experience}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <FiMapPin className="text-[14px] text-white/40" />
                <div>
                  <p className="text-[7px] uppercase tracking-[0.8px] text-white/35">CLINICS</p>
                  <p className="mt-1 text-[9px] font-medium text-white/75">{profile.clinicCountLabel}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <FiClock className="text-[14px] text-white/40" />
                <div>
                  <p className="text-[7px] uppercase tracking-[0.8px] text-white/35">CONSULTATION FEE</p>
                  <p className="mt-1 text-[9px] font-medium text-white/75">{profile.fee}</p>
                </div>
              </div>

            </div>

          </div>


          <div className="rounded-[20px] bg-white p-6">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">LANGUAGES</p>
                <h3 className="mt-2 text-[17px] font-semibold tracking-[-0.5px] text-[#17213F]">Communication</h3>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">

              {profile.languages.map((language) => (
                <div key={language} className="flex items-center gap-2 rounded-full bg-[#F0F2F5] px-3 py-2">
                  <span className="text-[8px] font-semibold text-[#17213F]">{language}</span>
                </div>
              ))}

            </div>

          </div>

        </div>


        <div className="space-y-4">

          <div className="rounded-[20px] bg-white p-7">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">PROFESSIONAL INFORMATION</p>
                <h2 className="mt-2 text-[21px] font-semibold tracking-[-0.7px] text-[#17213F]">About the Doctor</h2>
              </div>

              <span className="text-[8px] font-semibold text-[#A0A7B3]">01</span>

            </div>


            <div className="mt-6">

              <p className="mb-2 text-[7px] font-semibold uppercase tracking-[1px] text-[#A0A7B3]">
                PROFESSIONAL SUMMARY
              </p>

              <p className="max-w-[760px] text-[11px] leading-6 text-[#667185]">
                  {message || profile.about}
                </p>

            </div>


            <div className="mt-7 grid grid-cols-3 gap-3">

              <div className="rounded-[14px] bg-[#F7F8FA] p-4">
                <p className="text-[7px] font-semibold uppercase tracking-[0.8px] text-[#A0A7B3]">QUALIFICATION</p>

                <p className="mt-3 text-[11px] font-semibold text-[#17213F]">{profile.qualification}</p>
              </div>

              <div className="rounded-[14px] bg-[#F7F8FA] p-4">
                <p className="text-[7px] font-semibold uppercase tracking-[0.8px] text-[#A0A7B3]">EXPERIENCE</p>
                <p className="mt-3 text-[11px] font-semibold text-[#17213F]">{profile.experience}</p>
              </div>

              <div className="rounded-[14px] bg-[#F7F8FA] p-4">
                <p className="text-[7px] font-semibold uppercase tracking-[0.8px] text-[#A0A7B3]">CONSULTATION</p>

                <p className="mt-3 text-[11px] font-semibold text-[#17213F]">{profile.fee}</p>
              </div>

            </div>

          </div>


          <div className="rounded-[20px] bg-white p-7">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">CLINIC AFFILIATIONS</p>
                <h2 className="mt-2 text-[21px] font-semibold tracking-[-0.7px] text-[#17213F]">Where I Consult</h2>
              </div>

              <span className="text-[8px] font-semibold text-[#A0A7B3]">{profile.clinicHeading}</span>

            </div>


            <div className="mt-6 grid grid-cols-2 gap-3">

              {profile.clinics.map((clinic, index) => (
                <div key={`${index}-${clinic}`} className="flex items-center justify-between rounded-[15px] bg-[#F7F8FA] px-5 py-4">

                  <div className="flex items-center gap-3">

                    <span className="text-[9px] font-semibold text-[#9BA3B1]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <p className="text-[10px] font-semibold text-[#17213F]">{clinic}</p>
                      <p className="mt-1 text-[7px] uppercase tracking-[0.7px] text-[#A0A7B3]">
                        {profile.affiliationLabel}
                      </p>
                    </div>

                  </div>

                  <FiArrowUpRight className="text-[12px] text-[#A0A7B3]" />

                </div>
              ))}

            </div>

          </div>


          <div className="rounded-[20px] bg-white p-7">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">AVAILABILITY</p>
                <h2 className="mt-2 text-[21px] font-semibold tracking-[-0.7px] text-[#17213F]">Consultation Hours</h2>
              </div>

              <FiClock className="text-[17px] text-[#9BA3B1]" />

            </div>


            <div className="mt-5">

              {schedule.map((item) => (
                <div key={item.day} className={`flex items-center justify-between py-3.5 bg-[#F7F8FA] mb-3 px-5 rounded-full`}>

                  <span className="text-[9px] font-semibold text-[#17213F]">
                    {item.day}
                  </span>

                  <span className="rounded-full px-3 py-2 text-[8px] font-medium text-[#202D55]">
                      {item.time}
                    </span>

                </div>
              ))}

            </div>

          </div>


          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-[20px] bg-white p-6">
              <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#A0A7B3]">EMAIL</p>

              <p className="mt-3 truncate text-[10px] font-medium text-[#17213F]">{profile.email}</p>
            </div>

            <div className="rounded-[20px] bg-white p-6">
              <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#A0A7B3]">PHONE</p>

              <p className="mt-3 text-[10px] font-medium text-[#17213F]">{profile.phone}</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default DoctorProfile;