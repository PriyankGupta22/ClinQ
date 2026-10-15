import { useRef, useState } from "react";
import { FiArrowUpRight, FiCamera, FiEdit3, FiSave, FiPlus, FiX, FiClock, FiMapPin, FiBriefcase } from "react-icons/fi";

const DoctorProfile = () => {
  const fileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState("https://i.pravatar.cc/500?img=12");

  const [profile, setProfile] = useState({
    name: "Dr. Aryan Sharma",
    specialization: "General Physician",
    experience: "6 Years",
    qualification: "MBBS, MD",
    about: "Experienced physician focused on providing clear, practical and patient-centered healthcare. I believe in taking time to understand each patient's concerns and providing personalized treatment.",
    email: "aryan.sharma@clinqueue.com",
    phone: "+91 98765 43210",
    fee: "₹500",
    languages: ["English", "Hindi"],
    clinics: ["City Care Clinic", "MedPlus Clinic"],
  });

  const [editing, setEditing] = useState(false);
  const [newLanguage, setNewLanguage] = useState("");

  const [schedule, setSchedule] = useState([
    { day: "Monday", time: "09:00 AM — 01:00 PM" },
    { day: "Tuesday", time: "09:00 AM — 01:00 PM" },
    { day: "Wednesday", time: "02:00 PM — 06:00 PM" },
    { day: "Thursday", time: "09:00 AM — 01:00 PM" },
    { day: "Friday", time: "02:00 PM — 06:00 PM" },
  ]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };

  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addLanguage = () => {
    if (!newLanguage.trim()) return;

    if (!profile.languages.includes(newLanguage.trim())) {
      updateField("languages", [...profile.languages, newLanguage.trim()]);
    }

    setNewLanguage("");
  };

  const removeLanguage = (language) => {
    updateField(
      "languages",
      profile.languages.filter((item) => item !== language)
    );
  };

  const handleSave = () => {
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-[15px]">

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

        <button onClick={editing ? handleSave : () => setEditing(true)} className="flex h-[42px] items-center gap-2 rounded-full bg-[#17213F] px-5 text-[8px] font-semibold uppercase tracking-[0.8px] text-white transition-all duration-300 hover:bg-[#202D55]">
          {editing ? <FiSave className="text-[13px]" /> : <FiEdit3 className="text-[13px]" />}
          {editing ? "Save Changes" : "Edit Profile"}
        </button>

      </div>


      <div className="grid min-w-0 grid-cols-[minmax(280px,0.32fr)_minmax(0,0.68fr)] gap-4">


        <div className="space-y-4">

          <div className="rounded-[20px] bg-[#17213F] p-6">

            <div className="relative mx-auto w-fit flex justify-center">

              <div className="h-[430px] w-[330px] overflow-hidden rounded-[18px] bg-[#E8ECF2]">
                <img src={profileImage} alt={profile.name} className="h-full w-full object-cover" />
              </div>

              {editing && (
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-3 right-3 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white text-[#17213F] shadow-lg transition-transform duration-300 hover:scale-105">
                  <FiCamera className="text-[15px]" />
                </button>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

            </div>


            <div className="mt-6 text-center">

              {editing ? (
                <input value={profile.name} onChange={(e) => updateField("name", e.target.value)} className="w-full border-b border-white/20 bg-transparent pb-2 text-center text-[21px] font-semibold tracking-[-0.6px] text-white outline-none" />
              ) : (
                <h2 className="text-[21px] font-semibold tracking-[-0.6px] text-white">
                  {profile.name}
                </h2>
              )}

              {editing ? (
                <input value={profile.specialization} onChange={(e) => updateField("specialization", e.target.value)} className="mt-2 w-full border-b border-white/20 bg-transparent pb-2 text-center text-[8px] font-semibold uppercase tracking-[1px] text-white/50 outline-none" />
              ) : (
                <p className="mt-2 text-[8px] font-semibold uppercase tracking-[1px] text-white/45">
                  {profile.specialization}
                </p>
              )}

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
                  <p className="mt-1 text-[9px] font-medium text-white/75">{profile.clinics.length} Active Clinics</p>
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

                  {editing && (
                    <button onClick={() => removeLanguage(language)} className="text-[#8B95A7] hover:text-[#17213F]">
                      <FiX className="text-[10px]" />
                    </button>
                  )}
                </div>
              ))}

            </div>

            {editing && (
              <div className="mt-4 flex gap-2">
                <input value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLanguage()} placeholder="Add language" className="min-w-0 flex-1 rounded-full bg-[#F5F6F8] px-4 py-2.5 text-[8px] text-[#17213F] outline-none placeholder:text-[#A0A7B3]" />
                <button onClick={addLanguage} className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#17213F] text-white">
                  <FiPlus className="text-[13px]" />
                </button>
              </div>
            )}

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

              {editing ? (
                <textarea value={profile.about} onChange={(e) => updateField("about", e.target.value)} rows={4} className="w-full resize-none rounded-[14px] bg-[#F7F8FA] p-4 text-[10px] leading-5 text-[#59657A] outline-none" />
              ) : (
                <p className="max-w-[760px] text-[11px] leading-6 text-[#667185]">
                  {profile.about}
                </p>
              )}

            </div>


            <div className="mt-7 grid grid-cols-3 gap-3">

              <div className="rounded-[14px] bg-[#F7F8FA] p-4">
                <p className="text-[7px] font-semibold uppercase tracking-[0.8px] text-[#A0A7B3]">QUALIFICATION</p>

                {editing ? (
                  <input value={profile.qualification} onChange={(e) => updateField("qualification", e.target.value)} className="mt-3 w-full border-b border-[#DDE2E9] bg-transparent pb-1 text-[11px] font-semibold text-[#17213F] outline-none" />
                ) : (
                  <p className="mt-3 text-[11px] font-semibold text-[#17213F]">{profile.qualification}</p>
                )}
              </div>

              <div className="rounded-[14px] bg-[#F7F8FA] p-4">
                <p className="text-[7px] font-semibold uppercase tracking-[0.8px] text-[#A0A7B3]">EXPERIENCE</p>
                <p className="mt-3 text-[11px] font-semibold text-[#17213F]">{profile.experience}</p>
              </div>

              <div className="rounded-[14px] bg-[#F7F8FA] p-4">
                <p className="text-[7px] font-semibold uppercase tracking-[0.8px] text-[#A0A7B3]">CONSULTATION</p>

                {editing ? (
                  <input value={profile.fee} onChange={(e) => updateField("fee", e.target.value)} className="mt-3 w-full border-b border-[#DDE2E9] bg-transparent pb-1 text-[11px] font-semibold text-[#17213F] outline-none" />
                ) : (
                  <p className="mt-3 text-[11px] font-semibold text-[#17213F]">{profile.fee}</p>
                )}
              </div>

            </div>

          </div>


          <div className="rounded-[20px] bg-white p-7">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#8B95A7]">CLINIC AFFILIATIONS</p>
                <h2 className="mt-2 text-[21px] font-semibold tracking-[-0.7px] text-[#17213F]">Where I Consult</h2>
              </div>

              <span className="text-[8px] font-semibold text-[#A0A7B3]">{profile.clinics.length} CLINICS</span>

            </div>


            <div className="mt-6 grid grid-cols-2 gap-3">

              {profile.clinics.map((clinic, index) => (
                <div key={clinic} className="flex items-center justify-between rounded-[15px] bg-[#F7F8FA] px-5 py-4">

                  <div className="flex items-center gap-3">

                    <span className="text-[9px] font-semibold text-[#9BA3B1]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <p className="text-[10px] font-semibold text-[#17213F]">{clinic}</p>
                      <p className="mt-1 text-[7px] uppercase tracking-[0.7px] text-[#A0A7B3]">
                        Active affiliation
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

              {schedule.map((item, index) => (
                <div key={item.day} className={`flex items-center justify-between py-3.5 bg-[#F7F8FA] mb-3 px-5 rounded-full`}>

                  <span className="text-[9px] font-semibold text-[#17213F]">
                    {item.day}
                  </span>

                  {editing ? (
                    <input value={item.time} onChange={(e) => setSchedule((prev) => prev.map((day) => day.day === item.day ? { ...day, time: e.target.value } : day))} className="rounded-full bg-[#F5F6F8] px-3 py-2 text-right text-[8px] font-medium text-[#202D55] outline-none" />
                  ) : (
                    <span className="rounded-full px-3 py-2 text-[8px] font-medium text-[#202D55]">
                      {item.time}
                    </span>
                  )}

                </div>
              ))}

            </div>

          </div>


          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-[20px] bg-white p-6">
              <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#A0A7B3]">EMAIL</p>

              {editing ? (
                <input value={profile.email} onChange={(e) => updateField("email", e.target.value)} className="mt-3 w-full border-b border-[#DDE2E9] bg-transparent pb-2 text-[10px] text-[#17213F] outline-none" />
              ) : (
                <p className="mt-3 truncate text-[10px] font-medium text-[#17213F]">{profile.email}</p>
              )}
            </div>

            <div className="rounded-[20px] bg-white p-6">
              <p className="text-[8px] font-semibold uppercase tracking-[1px] text-[#A0A7B3]">PHONE</p>

              {editing ? (
                <input value={profile.phone} onChange={(e) => updateField("phone", e.target.value)} className="mt-3 w-full border-b border-[#DDE2E9] bg-transparent pb-2 text-[10px] text-[#17213F] outline-none" />
              ) : (
                <p className="mt-3 text-[10px] font-medium text-[#17213F]">{profile.phone}</p>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default DoctorProfile;