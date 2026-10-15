import React from "react";
import { FiArrowUpRight } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="w-full bg-[#f7f6f2] px-4 pb-4 sm:px-6 lg:-px-18">
      <div className="relative overflow-hidden rounded-[12px] bg-[#28172F] text-[#f7f6f2]">

        {/* ================= TOP ================= */}
        <div className="px-7 pt-8 sm:px-10 lg:px-14 lg:pt-10">

          {/* Logo - Top Right */}
          <div className="flex justify-end">
            <a
              href="/"
              className="
                text-[22px]
                font-semibold
                tracking-[-0.04em]
                text-[#f7f6f2]
                transition-opacity
                hover:opacity-70
              "
            >
              ClinQueue
            </a>
          </div>

          {/* ================= NAVIGATION ================= */}

          <div className="mt-20 border-t border-white/15 pt-8 pb-14">
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">

              {/* Product */}
              <div>
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c66a5d]">
                  Product
                </p>

                <div className="flex flex-col gap-3 text-[14px] text-white/65">
                  <a
                    href="#features"
                    className="transition-colors hover:text-white"
                  >
                    Features
                  </a>

                  <a
                    href="#how-it-works"
                    className="transition-colors hover:text-white"
                  >
                    How it works
                  </a>

                  <a
                    href="#faq"
                    className="transition-colors hover:text-white"
                  >
                    FAQ
                  </a>
                </div>
              </div>

              {/* Clinics */}
              <div>
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c66a5d]">
                  For Clinics
                </p>

                <div className="flex flex-col gap-3 text-[14px] text-white/65">
                  <a
                    href="/clinic/signup"
                    className="transition-colors hover:text-white"
                  >
                    Get started
                  </a>

                  <a
                    href="/clinic/login"
                    className="transition-colors hover:text-white"
                  >
                    Clinic login
                  </a>
                </div>
              </div>

              {/* Doctors */}
              <div>
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c66a5d]">
                  For Doctors
                </p>

                <div className="flex flex-col gap-3 text-[14px] text-white/65">
                  <a
                    href="/doctor/signup"
                    className="transition-colors hover:text-white"
                  >
                    Join ClinQueue
                  </a>

                  <a
                    href="/doctor/login"
                    className="transition-colors hover:text-white"
                  >
                    Doctor login
                  </a>
                </div>
              </div>

              {/* Patients */}
              <div>
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c66a5d]">
                  For Patients
                </p>

                <div className="flex flex-col gap-3 text-[14px] text-white/65">
                  <a
                    href="/patient/signup"
                    className="transition-colors hover:text-white"
                  >
                    Create account
                  </a>

                  <a
                    href="/patient/login"
                    className="transition-colors hover:text-white"
                  >
                    Patient login
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ================= CONTACT ================= */}

        <div
          id="contact"
          className="border-t border-white/15 px-7 py-14 sm:px-10 lg:px-14 lg:py-16"
        >
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">

            {/* Left */}
            <div>
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c66a5d]">
                Get in touch
              </p>

              <h3 className="max-w-[430px] text-[clamp(2.7rem,5vw,5rem)] font-semibold leading-[0.88] tracking-[-0.06em]">
                HAVE A
                <br />
                QUESTION?
              </h3>

              <p className="mt-7 max-w-[330px] text-[14px] leading-6 text-white/45">
                Have a question about ClinQueue? Send us a message and
                we'll get back to you.
              </p>
            </div>

            {/* Contact Form */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="w-full max-w-[620px]"
            >
              {/* Name + Email */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <input
                  type="text"
                  placeholder="Your name"
                  className="
                    h-14
                    w-full
                    rounded-full
                    border
                    border-white/15
                    bg-white/[0.06]
                    px-6
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/30
                    transition
                    focus:border-[#c66a5d]/70
                  "
                />

                <input
                  type="email"
                  placeholder="Email address"
                  className="
                    h-14
                    w-full
                    rounded-full
                    border
                    border-white/15
                    bg-white/[0.06]
                    px-6
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/30
                    transition
                    focus:border-[#c66a5d]/70
                  "
                />

              </div>

              {/* Message */}
              <textarea
                rows="4"
                placeholder="How can we help?"
                className="
                  mt-4
                  w-full
                  resize-none
                  rounded-[24px]
                  border
                  border-white/15
                  bg-white/[0.06]
                  px-6
                  py-5
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-white/30
                  transition
                  focus:border-[#c66a5d]/70
                "
              />

              {/* Submit */}
              <button
                type="submit"
                className="
                  group
                  mt-4
                  flex
                  h-14
                  items-center
                  gap-4
                  rounded-full
                  bg-[#f7f6f2]
                  pl-7
                  pr-2
                  text-sm
                  font-semibold
                  text-[#28172F]
                  transition-all
                  duration-300
                  hover:scale-[1.01]
                "
              >
                Send Message

                <span
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[#28172F]
                    text-white
                    transition-transform
                    duration-300
                    group-hover:rotate-45
                  "
                >
                  <FiArrowUpRight
                    size={17}
                    strokeWidth={1.8}
                  />
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* ================= BOTTOM ================= */}

        <div className="mx-7 flex flex-col gap-5 border-t border-white/15 py-7 text-[10px] uppercase tracking-[0.18em] text-white/35 sm:mx-10 sm:flex-row sm:items-center sm:justify-between lg:mx-14">

          <p>
            © {new Date().getFullYear()} ClinQueue. All rights reserved.
          </p>

          <div className="flex gap-6">
            <a
              href="/privacy"
              className="transition-colors hover:text-white/70"
            >
              Privacy
            </a>

            <a
              href="/terms"
              className="transition-colors hover:text-white/70"
            >
              Terms
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
}