import { useState } from "react";
import doctor from "../../assets/doctor.png";
import useRoleAuth from "../../hooks/useRoleAuth";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiArrowRight,
  FiCheck,
  FiBriefcase,
} from "react-icons/fi";

const DoctorSignup = () => {
  const [isLogin, setIsLogin] = useState(false);
  const { error, submitting, submit } = useRoleAuth("doctor");

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#f7f6f2] text-[#202d55]">

      {/* MAIN */}
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

        {/* =====================================================
            LEFT — SIGN UP / LOGIN
        ====================================================== */}
        <div className="relative flex flex-col px-6 sm:px-10 lg:px-16 xl:px-20 py-7 sm:py-9 lg:py-10">

          {/* TOP BAR */}
          <div className="flex items-center justify-between">

            <div className="text-[#202d55] text-[23px] sm:text-[25px] font-bold tracking-[-0.055em]">
              Clin<span className="relative">
                Q<span className="text-[#26365f]">u</span>eue
              </span>
            </div>

            <p className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d96aa]">
              FOR DOCTORS
            </p>

          </div>


          {/* =====================================================
              FORM AREA
          ====================================================== */}
          <div className="w-full max-w-[500px] mx-auto lg:mx-0 my-auto py-8">

           


            {/* HEADING */}
            <h1
              className="
                text-[#202d55]
                font-bold
                text-[42px]
                sm:text-[50px]
                lg:text-[54px]
                xl:text-[58px]
                leading-[0.94]
                tracking-[-0.055em]
              "
            >
              {isLogin ? (
                <>
                  Welcome
                  <br />
                  back, Doctor.
                </>
              ) : (
                <>
                  Create your
                  <br />
                  doctor account.
                </>
              )}
            </h1>


            {/* DESCRIPTION */}
            <p className="mt-5 text-[#69738a] text-sm sm:text-[15px] leading-6 max-w-[460px]">
              {isLogin
                ? "Login to your ClinQueue doctor account and manage your patients, appointments and queue — all in one place."
                : "Join ClinQueue and manage your patients, appointments and queue with a simpler digital workflow."}
            </p>


            {/* =====================================================
                FORM
            ====================================================== */}
            <form className="mt-8 space-y-3.5" onSubmit={(event) => submit(event, isLogin)}>

              {/* =================================================
                  SIGNUP
              ================================================== */}
              {!isLogin && (
                <>

                  {/* FULL NAME */}
                  <div className="relative">

                    <FiUser
                      className="
                        absolute
                        left-5
                        top-1/2
                        -translate-y-1/2
                        text-[#8d96aa]
                        text-[17px]
                      "
                    />

                    <input
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      className="
                        w-full
                        h-[52px]
                        rounded-full
                        border
                        border-[#dfe0dc]
                        bg-white/50
                        pl-12
                        pr-5
                        text-sm
                        text-[#202d55]
                        placeholder:text-[#9aa1ad]
                        outline-none
                        transition-all
                        focus:border-[#202d55]/30
                        focus:bg-white
                      "
                    />

                  </div>


                  {/* EMAIL */}
                  <div className="relative">

                    <FiMail
                      className="
                        absolute
                        left-5
                        top-1/2
                        -translate-y-1/2
                        text-[#8d96aa]
                        text-[17px]
                      "
                    />

                    <input
                      name="email"
                      type="email"
                      placeholder="Work Email Address"
                      className="
                        w-full
                        h-[52px]
                        rounded-full
                        border
                        border-[#dfe0dc]
                        bg-white/50
                        pl-12
                        pr-5
                        text-sm
                        text-[#202d55]
                        placeholder:text-[#9aa1ad]
                        outline-none
                        transition-all
                        focus:border-[#202d55]/30
                        focus:bg-white
                      "
                    />

                  </div>


                  {/* PASSWORD */}
                  <div className="relative">

                    <FiLock
                      className="
                        absolute
                        left-5
                        top-1/2
                        -translate-y-1/2
                        text-[#8d96aa]
                        text-[17px]
                      "
                    />

                    <input
                      name="password"
                      type="password"
                      placeholder="Create Password"
                      className="
                        w-full
                        h-[52px]
                        rounded-full
                        border
                        border-[#dfe0dc]
                        bg-white/50
                        pl-12
                        pr-12
                        text-sm
                        text-[#202d55]
                        placeholder:text-[#9aa1ad]
                        outline-none
                        transition-all
                        focus:border-[#202d55]/30
                        focus:bg-white
                      "
                    />

                    <FiEye
                      className="
                        absolute
                        right-5
                        top-1/2
                        -translate-y-1/2
                        text-[#8d96aa]
                        text-[17px]
                      "
                    />

                  </div>


                  {/* REGISTRATION NUMBER */}
                  <div className="relative">

                    <FiBriefcase
                      className="
                        absolute
                        left-5
                        top-1/2
                        -translate-y-1/2
                        text-[#8d96aa]
                        text-[17px]
                      "
                    />

                    <input
                      name="registrationNumber"
                      type="text"
                      placeholder="Medical Registration Number"
                      className="
                        w-full
                        h-[52px]
                        rounded-full
                        border
                        border-[#dfe0dc]
                        bg-white/50
                        pl-12
                        pr-5
                        text-sm
                        text-[#202d55]
                        placeholder:text-[#9aa1ad]
                        outline-none
                        transition-all
                        focus:border-[#202d55]/30
                        focus:bg-white
                      "
                    />

                  </div>


                  {/* SPECIALIZATION */}
                  <div className="relative">

                    <FiBriefcase
                      className="
                        absolute
                        left-5
                        top-1/2
                        -translate-y-1/2
                        text-[#8d96aa]
                        text-[17px]
                      "
                    />

                    <input
                      name="specialization"
                      type="text"
                      placeholder="Specialization"
                      className="
                        w-full
                        h-[52px]
                        rounded-full
                        border
                        border-[#dfe0dc]
                        bg-white/50
                        pl-12
                        pr-5
                        text-sm
                        text-[#202d55]
                        placeholder:text-[#9aa1ad]
                        outline-none
                        transition-all
                        focus:border-[#202d55]/30
                        focus:bg-white
                      "
                    />

                  </div>

                </>
              )}


              {/* =================================================
                  LOGIN
              ================================================== */}
              {isLogin && (
                <>

                  {/* EMAIL */}
                  <div className="relative">

                    <FiMail
                      className="
                        absolute
                        left-5
                        top-1/2
                        -translate-y-1/2
                        text-[#8d96aa]
                        text-[17px]
                      "
                    />

                    <input
                      name="email"
                      type="email"
                      placeholder="Work Email Address"
                      className="
                        w-full
                        h-[52px]
                        rounded-full
                        border
                        border-[#dfe0dc]
                        bg-white/50
                        pl-12
                        pr-5
                        text-sm
                        text-[#202d55]
                        placeholder:text-[#9aa1ad]
                        outline-none
                        transition-all
                        focus:border-[#202d55]/30
                        focus:bg-white
                      "
                    />

                  </div>


                  {/* PASSWORD */}
                  <div className="relative">

                    <FiLock
                      className="
                        absolute
                        left-5
                        top-1/2
                        -translate-y-1/2
                        text-[#8d96aa]
                        text-[17px]
                      "
                    />

                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      className="
                        w-full
                        h-[52px]
                        rounded-full
                        border
                        border-[#dfe0dc]
                        bg-white/50
                        pl-12
                        pr-12
                        text-sm
                        text-[#202d55]
                        placeholder:text-[#9aa1ad]
                        outline-none
                        transition-all
                        focus:border-[#202d55]/30
                        focus:bg-white
                      "
                    />

                    <FiEye
                      className="
                        absolute
                        right-5
                        top-1/2
                        -translate-y-1/2
                        text-[#8d96aa]
                        text-[17px]
                      "
                    />

                  </div>


                  {/* FORGOT PASSWORD */}
                  <div className="flex justify-end">

                    <button
                      type="button"
                      className="
                        text-[11px]
                        text-[#8d96aa]
                        hover:text-[#202d55]
                        transition-colors
                      "
                    >
                      Forgot Password?
                    </button>

                  </div>

                </>
              )}


              {/* =================================================
                  MAIN BUTTON
              ================================================== */}
              {error && <p className="text-center text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                className="
                  group
                  w-full
                  h-[54px]
                  mt-2
                  rounded-full
                  bg-[#202d55]
                  text-white
                  flex
                  items-center
                  justify-center
                  gap-3
                  text-sm
                  font-semibold
                  transition-all
                  duration-300
                  hover:bg-[#172142]
                  hover:shadow-lg
                  hover:shadow-[#202d55]/10
                "
                disabled={submitting}
              >

                {submitting ? "Please wait..." : isLogin ? "Login" : "Create Doctor Account"}

                <FiArrowRight
                  className="
                    text-base
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />

              </button>

            </form>


            {/* DIVIDER */}
            <div className="flex items-center gap-4 my-6">

              <div className="h-px flex-1 bg-[#dedfdc]" />

              <span className="text-[11px] text-[#9ba0aa]">
                Or
              </span>

              <div className="h-px flex-1 bg-[#dedfdc]" />

            </div>


            {/* GOOGLE */}
            <button
              type="button"
              className="
                w-full
                h-[52px]
                rounded-full
                border
                border-[#dedfdc]
                bg-white/40
                flex
                items-center
                justify-center
                gap-3
                text-sm
                font-medium
                text-[#586175]
                transition-all
                duration-300
                hover:bg-white
              "
            >

              <span className="font-bold text-[#4285F4] text-base">
                G
              </span>

              Continue with Google

            </button>


            {/* LOGIN / SIGNUP */}
            <p className="mt-6 text-center lg:text-left text-xs text-[#89919f]">

              {isLogin ? (
                <>
                  Don't have a doctor account?

                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="
                      ml-2
                      text-[#40577f]
                      font-semibold
                      hover:text-[#202d55]
                      transition-colors
                    "
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?

                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="
                      ml-2
                      text-[#40577f]
                      font-semibold
                      hover:text-[#202d55]
                      transition-colors
                    "
                  >
                    Login
                  </button>
                </>
              )}

            </p>

          </div>


          {/* BOTTOM LEFT */}
          <div className="hidden sm:flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-[#a1a6ae]">

            <FiCheck className="text-[#40577f]" />

            Simple queue management for modern doctors

          </div>

        </div>


        {/* =====================================================
            RIGHT — DOCTOR VISUAL
        ====================================================== */}
        <div
          className="
            relative
            hidden
            lg:flex
            min-h-screen
            bg-[#f7f6f2]
          "
        >

          {/* =================================================
              BLURRED CIRCLE — TOP RIGHT
          ================================================== */}
          <div
            className="
              absolute
              w-[720px]
              h-[720px]
              rounded-full
              bg-[#26365f]/70
              blur-[105px]
              -top-[230px]
              -right-[190px]
            "
          />


          {/* =================================================
              BLURRED CIRCLE — BOTTOM LEFT
          ================================================== */}
          <div
            className="
              absolute
              w-[730px]
              h-[730px]
              rounded-full
              bg-[#26365f]/90
              blur-[240px]
              -bottom-[220px]
              -left-[170px]
            "
          />


          {/* TOP RIGHT COPY */}
          <div className="absolute top-10 right-12 text-right z-20">

            <p className="text-[#0e1423] text-[11px] font-bold uppercase tracking-[0.18em]">
              BETTER CARE.
            </p>

            <p className="text-white/50 text-[11px] font-bold uppercase tracking-[0.18em] mt-1">
              BETTER QUEUES.
            </p>

          </div>


          {/* =================================================
              DOCTOR IMAGE
          ================================================== */}
          <div className="relative z-10 w-full flex items-end justify-center">

            <div
              className="
                relative
                w-[78%]
                max-w-[680px]
                h-[91vh]
                flex
                items-end
                justify-center
              "
            >

              <img
                src={doctor}
                alt="ClinQueue Doctor"
                className="
                  relative
                  z-10
                  w-full
                  h-full
                  object-contain
                  object-bottom
                  scale-[1.12]
                  drop-shadow-2xl
                "
              />

            </div>

          </div>


          {/* BOTTOM LEFT COPY */}
          <div className="absolute bottom-9 left-10 z-20">

            <p className="text-[#0a0e18] text-[9px] uppercase tracking-[0.18em]">
              CLINQUEUE
            </p>

            <p className="text-white/60 text-xs mt-1">
              One place for your entire patient queue.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DoctorSignup;
