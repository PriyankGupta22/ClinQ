import clinic from "../../assets/clinic.png";
import patient from "../../assets/patient.png";
import doctor from "../../assets/doctor.png";
import { Link } from "react-router-dom";
import DoctorSignup from "./DoctorSignup";
import PatientSignup from "./PatientSignup";
import ClinicSignup from "./ClinicSignUp";

const AudienceSection = () => {
  const cards = [
    {
      type: "FOR DOCTORS",
      image: doctor,
      color: "#070d1f",
      gradient:
        "linear-gradient(to top, rgba(7,13,31,1) 0%, rgba(7,13,31,0.96) 22%, rgba(7,13,31,0.55) 48%, rgba(7,13,31,0) 72%)",
      scale: "scale-[1.12] sm:scale-[1.16] lg:scale-[1.70]",
      imagePosition: "top-[-35px] sm:top-[-45px] lg:top-[12px]",
      login: "Doctor Login",
      link: "/doctor/signup"
    },
    {
      type: "FOR PATIENTS",
      image: patient,
      color: "#102f2b",
      gradient:
        "linear-gradient(to top, rgba(16,47,43,1) 0%, rgba(16,47,43,0.96) 22%, rgba(16,47,43,0.55) 48%, rgba(16,47,43,0) 70%)",
      scale: "scale-[1.12] sm:scale-[1.16] lg:scale-[1.5]",
      imagePosition: "top-[-10px]",
      login: "Patient Login",
      link: "/patient/signup"
    },
    {
      type: "FOR CLINICS",
      image: clinic,
      color: "#28172F",
      gradient:
  "linear-gradient(to top, rgba(40,23,47,1) 0%, rgba(40,23,47,0.96) 22%, rgba(40,23,47,0.55) 48%, rgba(40,23,47,0) 70%)",
      scale: "scale-[1.12] sm:scale-[1.16] lg:scale-[1.70]",
      imagePosition: "top-[-35px] sm:top-[-45px] lg:top-[12px]",
      login: "Clinic Admin Login",
      link: "/clinic/signup"
    },
  ];

  return (
    <section className="w-full bg-[#f7f6f2] px-5 sm:px-8 md:px-10 lg:px-14 py-20 sm:py-24 lg:py-28">

      {/* HEADING AREA */}
      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-8
          lg:gap-16
          mb-10
          sm:mb-12
          lg:mb-34
        "
      >
        {/* LEFT HEADING */}
        <div>
          <p className="text-[#8d96aa] text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase mb-3">
            FOR EVERYONE
          </p>

          <h2
            className="
              text-[#202d55]
              font-bold
              text-4xl
              sm:text-5xl
              md:text-6xl
              lg:text-[62px]
              leading-[0.95]
              tracking-[-0.055em]
            "
          >
            Built for every
            <br />
            side of healthcare.
          </h2>
        </div>

        {/* TOP RIGHT TEXT */}
        {/* TOP RIGHT TEXT */}
<div
  className="
    flex
    flex-col
    justify-start
    lg:items-end
    lg:text-right
    lg:mt-[15px]
    pt-1
    lg:pt-2
  "
>
  <p
    className="
      text-[#202d55]
      font-extrabold
      text-lg
      sm:text-xl
      lg:text-2xl
      leading-[1.05]
      tracking-[-0.025em]
      uppercase
      max-w-[380px]
    "
  >
    Who can use
    <br />
    ClinQueue?
  </p>

  <p
    className="
      mt-4
      text-[#8d96aa]
      text-[10px]
      sm:text-[11px]
      lg:text-xs
      font-semibold
      tracking-[0.14em]
      uppercase
      leading-[1.5]
      max-w-[380px]
    "
  >
    For clinics, doctors, and patients —
    <br />
    everyone gets a simple way
    <br />
    to manage or follow the queue.
  </p>
</div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">

        {cards.map((card) => (
          <div
            key={card.type}
            className="
              group
              rounded-[28px]
              min-h-[430px]
              sm:min-h-[450px]
              lg:min-h-[465px]
              overflow-visible
              relative
              bottom-0
              left-0
              right-0
              overflow-hidden
            "
            style={{
              backgroundColor: card.color,
            }}
          >

            {/* IMAGE */}
            <div
              className={`
                absolute
                left-1/2
                -translate-x-1/2
                ${card.imagePosition}
                w-full
                h-[68%]
                sm:h-[70%]
                lg:h-[72%]
                flex
                items-start
                justify-center
                pointer-events-none
                z-10
              `}
            >
              <img
                src={card.image}
                alt={card.type}
                className={`
                  w-full
                  h-full
                  object-contain
                  object-top
                  transition-transform
                  duration-700
                  ease-out
                  ${card.scale}
                `}
              />
            </div>

            {/* BOTTOM GRADIENT */}
            <div
              className="
                absolute
                inset-0
                rounded-[28px]
                pointer-events-none
                z-20
              "
              style={{
                background: card.gradient,
              }}
            />

            {/* CONTENT */}
            <div
              className="
                absolute
                inset-x-0
                bottom-0
                p-6
                sm:p-7
                lg:p-8
                text-white
                z-30
              "
            >

              {/* TYPE */}
              <h3
                className="
                  uppercase
                  font-extrabold
                  text-3xl
                  sm:text-4xl
                  lg:text-[40px]
                  leading-[0.95]
                  tracking-[-0.045em]
                "
              >
                {card.type}
              </h3>

              {/* LOGIN BUTTON */}
              <Link
                className="
                  mt-6
                  w-full
                  h-12
                  rounded-full
                  text-black
                  flex
                  items-center
                  justify-center
                  bg-white
                  font-medium
                  text-sm
                  transition-all
                  duration-300
                  hover:bg-[#f0f0ed]
                "
                to={card.link}
              >
                {card.login}
              </Link>

            </div>
          </div>
        ))}

      </div>
    </section>
  );
};

export default AudienceSection;