import { useState } from "react";
import patient from "../../assets/patient.png";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiArrowRight,
  FiCheck,
  FiPhone,
} from "react-icons/fi";
import useRoleAuth from "../../hooks/useRoleAuth";

const PatientSignup = () => {
  const [isLogin, setIsLogin] = useState(false);
  const { error, submitting, submit } = useRoleAuth("patient");

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
                Q<span className="text-[#244d49]">u</span>eue
              </span>
            </div>

            <p className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d96aa]">
              FOR PATIENTS
            </p>

          </div>


          {/* =====================================================
              FORM AREA
          ====================================================== */}
          <div className="w-full max-w-[500px] mx-auto lg:mx-0 my-auto py-8">

            


            {/* HEADING */}
            <h1
              className="
                text-[#244d49]
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
                  back.
                </>
              ) : (
                <>
                  Create your
                  <br />
                  patient account.
                </>
              )}
            </h1>


            {/* DESCRIPTION */}
            <p className="mt-5 text-[#69738a] text-sm sm:text-[15px] leading-6 max-w-[460px]">
              {isLogin
                ? "Login to your ClinQueue patient account and keep track of your appointments, queue position and visits."
                : "Create your ClinQueue account and make clinic visits easier with simple appointments and queue tracking."}
            </p>


            {/* =====================================================
                FORM
            ====================================================== */}
            <form className="mt-8 space-y-3.5" onSubmit={(event) => submit(event, isLogin)}>

              {/* =================================================
                  SIGNUP FIELDS
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
                        focus:border-[#315e59]/30
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
                      placeholder="Email Address"
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
                        focus:border-[#315e59]/30
                        focus:bg-white
                      "
                    />

                  </div>


                  {/* PHONE */}
                  <div className="relative">

                    <FiPhone
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
                      name="phone"
                      type="tel"
                      placeholder="Phone Number"
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
                        focus:border-[#315e59]/30
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
                        focus:border-[#315e59]/30
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

                </>
              )}


              {/* =================================================
                  LOGIN FIELDS
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
                      placeholder="Email Address"
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
                        focus:border-[#315e59]/30
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
                        focus:border-[#315e59]/30
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
                        hover:text-[#315e59]
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
                disabled={submitting}
                className="
                  group
                  w-full
                  h-[54px]
                  mt-2
                  rounded-full
                  bg-[#315e59]
                  text-white
                  flex
                  items-center
                  justify-center
                  gap-3
                  text-sm
                  font-semibold
                  transition-all
                  duration-300
                  hover:bg-[#244d49]
                  hover:shadow-lg
                  hover:shadow-[#315e59]/10
                "
              >

                {submitting ? "Please wait..." : isLogin ? "Login" : "Create Patient Account"}


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
                  Don't have a patient account?

                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="
                      ml-2
                      text-[#315e59]
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
                      text-[#315e59]
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

            <FiCheck className="text-[#315e59]" />

            Simple queue management for easier clinic visits

          </div>

        </div>


        {/* =====================================================
            RIGHT — PATIENT VISUAL
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
              bg-[#244d49]/80
              blur-[115px]
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
              w-[630px]
              h-[630px]
              rounded-full
              bg-[#244d49]
              blur-[220px]
              -bottom-[220px]
              -left-[170px]
            "
          />


          {/* TOP RIGHT COPY */}
          <div className="absolute top-10 right-12 text-right z-20">

            <p className="text-[#17312e] text-[11px] font-bold uppercase tracking-[0.18em]">
              SIMPLE VISITS.
            </p>

            <p className="text-white/50 text-[11px] font-bold uppercase tracking-[0.18em] mt-1">
              LESS WAITING.
            </p>

          </div>


          {/* =================================================
              PATIENT IMAGE
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
                src={patient}
                alt="ClinQueue Patient"
                className="
                  relative
                  z-10
                  w-full
                  h-full
                  object-contain
                  object-bottom
                  scale-[1.04]
                  drop-shadow-2xl
                "
              />

            </div>

          </div>


          {/* BOTTOM LEFT COPY */}
          <div className="absolute bottom-9 left-10 z-20">

            <p className="text-[#0c1a18] text-[9px] uppercase tracking-[0.18em]">
              CLINQUEUE
            </p>

            <p className="text-white/60 text-xs mt-1">
              Know your place. Know your time.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientSignup;
