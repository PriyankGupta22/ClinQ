import React, { useState } from "react";
import { FiPlus, FiArrowUpRight } from "react-icons/fi";

const faqs = [
  {
    question: "What is ClinQueue?",
    answer:
      "ClinQueue is a digital clinic platform that connects appointments, live queues, patient records, consultation workflows and clinic management in one place.",
  },
  {
    question: "Who can use ClinQueue?",
    answer:
      "ClinQueue is designed for clinics, doctors and patients. Each gets a workflow tailored to what they need during a clinic visit.",
  },
  {
    question: "Can patients track their queue position?",
    answer:
      "Yes. Patients can see their current queue position and estimated waiting time, helping them know when it is actually worth leaving for the clinic.",
  },
  {
    question: "Can ClinQueue replace paper parchi and registers?",
    answer:
      "ClinQueue is designed to move everyday clinic workflows from paper-based records into structured digital patient records and connected clinic workflows.",
  },
  {
    question: "Can clinics manage appointments and queues together?",
    answer:
      "Yes. Appointments and the live queue work together, allowing clinics to manage patients from booking through consultation.",
  },
  {
    question: "Does ClinQueue make medical decisions for doctors?",
    answer:
      "No. ClinQueue can provide clinical decision-support and assisted recommendations, but the doctor remains responsible for reviewing the information and making the final clinical decision.",
  },
  {
    question: "Will patient history be available during consultation?",
    answer:
      "Yes. The platform is designed to keep a patient's relevant visit history, prescriptions and records connected so doctors can access the information they need during consultation.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#f7f6f2] text-[#202d55]">
      <div className="mx-auto max-w-[1500px] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">

        {/* Top heading */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.7fr] lg:gap-24">

          {/* LEFT */}
          <div className="lg:pt-4">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#9ba8c2]" />

              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#8d9bb7]">
                COMMON QUESTIONS
              </span>
            </div>

            <h2 className="max-w-[520px] text-[clamp(3rem,6vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.065em]">
              CLEAR
              <br />
              <span className="text-[#8d9bb7]">ANSWERS.</span>
            </h2>

            <p className="mt-8 max-w-[360px] text-[15px] leading-7 text-[#71809d]">
              Everything you need to know before bringing your clinic,
              doctors and patients into one connected system.
            </p>

            {/* Small editorial marker */}
            <div className="mt-14 hidden items-center gap-4 lg:flex">
              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#9aa6bd]">
                CLINQUEUE / FAQ
              </span>

              <span className="h-[1px] w-16 bg-[#cbd1dc]" />
            </div>
          </div>

          {/* RIGHT */}
          <div className="border-t border-[#cfd3d9]">

            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className="border-b border-[#cfd3d9]"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="group flex w-full items-start justify-between gap-8 py-7 text-left sm:py-8"
                    aria-expanded={isOpen}
                  >
                    <div className="flex gap-5 sm:gap-8">

                      {/* Number */}
                      <span
                        className={`pt-1 text-[10px] font-semibold tracking-[0.18em] transition-colors duration-300 ${
                          isOpen
                            ? "text-[#40577f]"
                            : "text-[#a5adba]"
                        }`}
                      >
                        0{index + 1}
                      </span>

                      {/* Question */}
                      <span
                        className={`text-[19px] leading-7 tracking-[-0.02em] transition-colors duration-300 sm:text-[22px] ${
                          isOpen
                            ? "text-[#202d55]"
                            : "text-[#4d5b76] group-hover:text-[#202d55]"
                        }`}
                      >
                        {faq.question}
                      </span>
                    </div>

                    {/* Plus */}
                    <span
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? "rotate-45 border-[#40577f] bg-[#40577f] text-white"
                          : "border-[#c5cad3] text-[#66748e] group-hover:border-[#40577f] group-hover:text-[#40577f]"
                      }`}
                    >
                      <FiPlus size={15} strokeWidth={1.7} />
                    </span>
                  </button>

                  {/* Answer */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr]"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pb-8 pl-[42px] pr-12 sm:pl-[58px] sm:pr-16">
                        <p className="max-w-[650px] text-[14px] leading-7 text-[#71809d] sm:text-[15px]">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-20 flex flex-col gap-5 border-t border-[#cfd3d9] pt-7 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9aa6bd]">
            STILL HAVE A QUESTION?
          </p>

          <button className="group flex w-fit items-center gap-3 text-sm font-semibold text-[#202d55]">
            Talk to ClinQueue

            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#bfc6d2] transition-all duration-300 group-hover:border-[#202d55] group-hover:bg-[#202d55] group-hover:text-white">
              <FiArrowUpRight size={15} />
            </span>
          </button>
        </div>

      </div>
    </section>
  );
}