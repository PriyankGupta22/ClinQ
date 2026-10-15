import { useState } from "react";
import clinic from "../../assets/clinic.png";
import {
  FiMail,
  FiLock,
  FiMapPin,
  FiEye,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { readApiError, request } from "../../api/client";

const ClinicSignup = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({ clinicName: "", email: "", password: "", phone: "", description: "", location: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const body = isLogin
        ? { email: form.email, password: form.password }
        : {
            clinicName: form.clinicName,
            email: form.email,
            password: form.password,
            phone: form.phone,
            description: form.description,
            address: { street: form.location },
          };
      const result = await request("post", `/api/cliniAuthRoutes/${isLogin ? "login" : "register"}`, body);
      const token = result?.accessToken || result?.token || result?.accesstoken;
      if (!token) throw new Error("No access token was returned.");
      localStorage.setItem("clinicAccessToken", token);
      if (result?.refreshToken) localStorage.setItem("clinicRefreshToken", result.refreshToken);
      localStorage.setItem("healioIdentity", "clinic");
      if (onLogin) onLogin(token, "clinic");
      else window.location.assign("/clinic/dashboard");
    } catch (requestError) {
      setError(readApiError(requestError)?.message || "Unable to continue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f6f2] text-[#202d55] overflow-hidden">

      {/* MAIN */}
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

        {/* =====================================================
            LEFT — SIGN UP / LOGIN
        ====================================================== */}
        <div className="relative flex flex-col px-6 sm:px-10 lg:px-16 xl:px-20 py-7 sm:py-9 lg:py-10">

          {/* TOP BAR */}
          <div className="flex items-center justify-between">
            <div className="text-[#202d55] text-[23px] sm:text-[25px] font-bold tracking-[-0.055em]">
              Clin<span className="relative">Q<span className="text-[#28172F]">u</span>eue</span>
            </div>

            <p className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d96aa]">
              FOR CLINICS
            </p>
          </div>


          {/* FORM AREA */}
          <div className="w-full max-w-[500px] mx-auto lg:mx-0 my-auto py-8">

            


            {/* HEADING */}
            <h1
              className="
                text-[#28172F]
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
                  clinic account.
                </>
              )}
            </h1>


            {/* DESCRIPTION */}
            <p className="mt-5 text-[#69738a] text-sm sm:text-[15px] leading-6 max-w-[460px]">
              {isLogin
                ? "Login to your ClinQueue clinic account and continue managing your appointments, queues and patients."
                : "Get started with ClinQueue and manage your appointments, queues and patients — all in one place."}
            </p>


            {/* =====================================================
                FORM
            ====================================================== */}
            <form className="mt-8 space-y-3.5" onSubmit={submit}>


              {/* =================================================
                  SIGNUP FIELDS
              ================================================== */}
              {!isLogin && (
                <>

                  {/* CLINIC NAME */}
                  <div className="relative">

                    <input
                      name="clinicName"
                      value={form.clinicName}
                      onChange={updateField}
                      required
                      type="text"
                      placeholder="Clinic / Hospital Name"
                      className="
                        w-full
                        h-[52px]
                        rounded-full
                        border
                        border-[#dfe0dc]
                        bg-white/50
                        pl-6
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
                      value={form.email}
                      onChange={updateField}
                      required
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
                      value={form.password}
                      onChange={updateField}
                      required
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


                  {/* LOCATION */}
                  <div className="relative">

                    <FiMapPin
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
                      name="location"
                      value={form.location}
                      onChange={updateField}
                      required
                      type="text"
                      placeholder="Clinic Location"
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

                  <input name="phone" value={form.phone} onChange={updateField} required type="tel" placeholder="Clinic Phone Number" className="w-full h-[52px] rounded-full border border-[#dfe0dc] bg-white/50 px-6 text-sm text-[#202d55] placeholder:text-[#9aa1ad] outline-none transition-all focus:border-[#202d55]/30 focus:bg-white" />
                  <input name="description" value={form.description} onChange={updateField} required type="text" placeholder="Brief Clinic Description" className="w-full h-[52px] rounded-full border border-[#dfe0dc] bg-white/50 px-6 text-sm text-[#202d55] placeholder:text-[#9aa1ad] outline-none transition-all focus:border-[#202d55]/30 focus:bg-white" />

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
                      value={form.email}
                      onChange={updateField}
                      required
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
                      value={form.password}
                      onChange={updateField}
                      required
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
                  <div className="flex justify-end pt-0.5">

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
              {notice && <p className="text-center text-xs text-green-700">{notice}</p>}

              <button
                type="submit"
                className="
                  group
                  w-full
                  h-[54px]
                  mt-2
                  rounded-full
                  bg-[#28172F]
                  text-white
                  flex
                  items-center
                  justify-center
                  gap-3
                  text-sm
                  font-semibold
                  transition-all
                  duration-300
                  hover:bg-[#28172F]
                  hover:shadow-lg
                  hover:shadow-[#202d55]/10
                "
                disabled={submitting}
              >

                {submitting ? "Please wait..." : isLogin ? "Login" : "Create Account"}

                

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


            {/* LOGIN / SIGNUP TOGGLE */}
            <p className="mt-6 text-center lg:text-left text-xs text-[#89919f]">

              {isLogin ? (
                <>
                  Don't have a clinic account?

                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="
                      ml-2
                      text-[#b48a1c]
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
                      text-[#28172F]
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


          {/* BOTTOM LEFT TEXT */}
          <div className="hidden sm:flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-[#a1a6ae]">

            <FiCheck className="text-[#b28b22]" />

            Simple queue management for modern clinics

          </div>

        </div>


        {/* =====================================================
            RIGHT — CLINQUEUE VISUAL
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
              bg-[#28172F]/70
              blur-[105px]
              -top-[200px]
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
              bg-[#28172F]/90
              blur-[220px]
              -bottom-[220px]
              -left-[170px]
            "
          />


          {/* TOP RIGHT BRAND COPY */}
          <div className="absolute top-10 right-12 text-right z-20">

            <p className="text-[#28172F] text-[11px] font-bold uppercase tracking-[0.18em]">
              BETTER QUEUES.
            </p>

            <p className="text-white/50 text-[11px] font-bold uppercase tracking-[0.18em] mt-1">
              HAPPIER CLINICS.
            </p>

          </div>


          {/* =================================================
              MAIN IMAGE
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
                src={clinic}
                alt="ClinQueue clinic"
                className="
                  relative
                  z-10
                  w-full
                  h-full
                  object-contain
                  object-bottom
                  scale-[1.08]
                  drop-shadow-2xl
                "
              />

            </div>

          </div>


          {/* BOTTOM LEFT TEXT */}
          <div className="absolute bottom-9 left-10 z-20">

            <p className="text-black/90 text-[9px] uppercase tracking-[0.18em]">
              CLINQUEUE
            </p>

            <p className="text-white/60 text-xs mt-1">
              One place for your entire clinic queue.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ClinicSignup;
