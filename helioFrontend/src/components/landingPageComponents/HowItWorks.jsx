const HowItWorks = () => {
  return (
    <section className="w-full bg-[#f7f6f2] px-5 sm:px-8 md:px-10 lg:px-14 py-20 sm:py-24 md:py-28">

      {/* HEADER */}
      <div className="mb-10 sm:mb-12 lg:mb-14">
        <p
          className="
            text-[#E45742]
            text-[10px]
            sm:text-xs
            font-bold
            tracking-[0.18em]
            uppercase
            mb-2
          "
        >
          HOW IT WORKS
        </p>

        <h2
          className="
            text-[#171719]
            font-bold
            text-4xl
            sm:text-5xl
            md:text-6xl
            lg:text-[68px]
            xl:text-[76px]
            leading-[0.92]
            tracking-[-0.06em]
            max-w-[850px]
          "
        >
          From appointment
          <br />
          time to arrival time.
        </h2>
      </div>


      {/* MAIN GRID */}
      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-[0.82fr_1.45fr_0.82fr]
          gap-2
          sm:gap-3
        "
      >

        {/* =========================
            STEP 01
        ========================= */}
        <div
          className="
            min-h-[420px]
            sm:min-h-[460px]
            lg:min-h-[520px]
            rounded-[22px]
            bg-[#242b60]
            p-6
            sm:p-8
            lg:p-9
            flex
            flex-col
            justify-between
            overflow-hidden
          "
        >
          <div>

            <p
              className="
                text-white
                text-5xl
                sm:text-6xl
                lg:text-7xl
                font-bold
                tracking-[-0.06em]
                leading-none
              "
            >
              01
            </p>

            <p
              className="
                mt-5
                text-[#a7accc]
                text-[10px]
                sm:text-xs
                font-bold
                tracking-[0.18em]
                uppercase
              "
            >
              BOOK
            </p>

            <h3
              className="
                mt-2
                text-white
                text-3xl
                sm:text-4xl
                lg:text-[38px]
                font-bold
                leading-[0.98]
                tracking-[-0.045em]
                max-w-[320px]
              "
            >
              Choose your
              <br />
              doctor and time.
            </h3>

            <p
              className="
                mt-5
                text-[#a7accc]
                text-sm
                sm:text-[15px]
                leading-[1.4]
                max-w-[300px]
              "
            >
              Book an appointment with your
              preferred doctor, clinic, date
              and time.
            </p>

          </div>


          {/* BOOKING PREVIEW */}
          {/* <div
            className="
              mt-8
              rounded-[16px]
              bg-[#4a160f]
              p-4
              sm:p-5
            "
          >
            <p
              className="
                text-[#E45742]
                text-[9px]
                font-bold
                uppercase
                tracking-[0.14em]
              "
            >
              APPOINTMENT
            </p>

            <p
              className="
                mt-2
                text-[#f7f6f2]
                text-lg
                sm:text-xl
                font-semibold
              "
            >
              Dr. Priya Sharma
            </p>

            <div className="mt-4 flex justify-between border-t border-white/15 pt-3">
              <span className="text-white/60 text-xs">
                Today
              </span>

              <span className="text-white text-xs font-semibold">
                4:00 PM
              </span>
            </div>
          </div> */}

        </div>


        {/* =========================
            MIDDLE COLUMN
        ========================= */}
        <div
          className="
            grid
            grid-cols-1
            gap-2
            sm:gap-3
          "
        >

          {/* STEP 02 */}
          <div
            className="
              min-h-[260px]
              sm:min-h-[290px]
              rounded-[22px]
              bg-[#063B00]
              p-6
              sm:p-8
              lg:p-9
              relative
              overflow-hidden
            "
          >

            <p
              className="
                text-white
                text-5xl
                sm:text-6xl
                lg:text-7xl
                font-bold
                tracking-[-0.06em]
                leading-none
              "
            >
              02
            </p>

            <p
              className="
                mt-4
                text-[#88b19c]
                text-[10px]
                sm:text-xs
                font-bold
                tracking-[0.18em]
                uppercase
              "
            >
              TRACK
            </p>

            <h3
              className="
                mt-2
                text-white
                text-3xl
                sm:text-4xl
                lg:text-[40px]
                font-bold
                leading-[0.98]
                tracking-[-0.045em]
              "
            >
              See your live
              <br />
              queue position.
            </h3>

            <p
              className="
                mt-4
                text-[#88b19c]
                text-sm
                sm:text-[15px]
                max-w-[330px]
                leading-[1.4]
              "
            >
              Track your position in real time
              and know exactly how many
              patients are ahead of you.
            </p>


            {/* QUEUE PREVIEW */}
            {/* <div
              className="
                hidden
                sm:block
                absolute
                right-7
                bottom-7
                w-[190px]
                rounded-[18px]
                bg-[#4a160f]
                p-5
              "
            >
              <p className="text-white/60 text-[9px] uppercase tracking-[0.12em]">
                YOUR POSITION
              </p>

              <p className="mt-1 text-[#E45742] text-4xl font-bold">
                05
              </p>

              <p className="mt-1 text-white text-xs">
                patients ahead
              </p>

              <div className="mt-4 h-[1px] bg-white/15" />

              <p className="mt-3 text-white/60 text-[9px] uppercase tracking-[0.1em]">
                EST. WAIT
              </p>

              <p className="text-white text-lg font-semibold">
                32 min
              </p>
            </div> */}

          </div>


          {/* STEP 03 */}
          <div
            className="
              min-h-[260px]
              sm:min-h-[290px]
              rounded-[22px]
              bg-[#8B1E2D]
              p-6
              sm:p-8
              lg:p-9
              relative
              overflow-hidden
            "
          >

            <p
              className="
                text-white
                text-5xl
                sm:text-6xl
                lg:text-7xl
                font-bold
                tracking-[-0.06em]
                leading-none
              "
            >
              03
            </p>

            <p
              className="
                mt-4
                text-[#daa299]
                text-[10px]
                sm:text-xs
                font-bold
                tracking-[0.18em]
                uppercase
              "
            >
              PREDICT
            </p>

            <h3
              className="
                mt-2
                text-white
                text-3xl
                sm:text-4xl
                lg:text-[40px]
                font-bold
                leading-[0.98]
                tracking-[-0.045em]
              "
            >
              Get a smart
              <br />
              recommendation.
            </h3>

            <p
              className="
                mt-4
                text-[#daa299]
                text-sm
                sm:text-[15px]
                max-w-[330px]
                leading-[1.4]
              "
            >
              ClinQueue combines queue time,
              consultation time and travel
              time to find your best time to leave.
            </p>


            {/* PREDICTION PREVIEW */}
            {/* <div
              className="
                hidden
                sm:block
                absolute
                right-7
                bottom-7
                w-[210px]
                rounded-[18px]
                bg-[#4a160f]
                p-5
              "
            >

              <p className="text-[#E45742] text-[9px] uppercase tracking-[0.12em]">
                RECOMMENDED
              </p>

              <p className="mt-2 text-white text-2xl font-bold">
                Leave by
              </p>

              <p className="text-[#E45742] text-3xl font-bold">
                3:05 PM
              </p>

              <div className="mt-4 border-t border-white/15 pt-3">
                <p className="text-white/60 text-[9px] uppercase tracking-[0.1em]">
                  TOTAL WAIT
                </p>

                <p className="text-white text-lg font-semibold">
                  50 min
                </p>
              </div>

            </div> */}

          </div>

        </div>


        {/* =========================
            STEP 04
        ========================= */}
        <div
          className="
            min-h-[420px]
            sm:min-h-[460px]
            lg:min-h-[520px]
            rounded-[22px]
            bg-[#FFB900]
            p-6
            sm:p-8
            lg:p-9
            flex
            flex-col
            justify-between
            overflow-hidden
          "
        >

          <div>

            <p
              className="
                text-black
                text-5xl
                sm:text-6xl
                lg:text-7xl
                font-bold
                tracking-[-0.06em]
                leading-none
              "
            >
              04
            </p>

            <p
              className="
                mt-5
                text-black
                text-[10px]
                sm:text-xs
                font-bold
                tracking-[0.18em]
                uppercase
              "
            >
              LEAVE
            </p>

            <h3
              className="
                mt-2
                text-black
                text-3xl
                sm:text-4xl
                lg:text-[38px]
                font-bold
                leading-[0.98]
                tracking-[-0.045em]
                max-w-[320px]
              "
            >
              Arrive when
              <br />
              it matters.
            </h3>

            <p
              className="
                mt-5
                text-black
                text-sm
                sm:text-[15px]
                leading-[1.4]
                max-w-[300px]
              "
            >
              Get your personalized “Leave by”
              recommendation and arrive at the
              clinic at the right time.
            </p>

          </div>


          {/* LEAVE PREVIEW */}
          {/* <div
            className="
              mt-8
              rounded-[16px]
              bg-[#4a160f]
              p-5
            "
          >

            <p
              className="
                text-[#E45742]
                text-[9px]
                font-bold
                uppercase
                tracking-[0.14em]
              "
            >
              LEAVE BY
            </p>

            <p
              className="
                mt-1
                text-[#f7f6f2]
                text-3xl
                sm:text-4xl
                font-bold
                tracking-[-0.04em]
              "
            >
              3:05 PM
            </p>

            <div className="mt-4 border-t border-white/15 pt-3">
              <p className="text-white/60 text-[9px] uppercase tracking-[0.1em]">
                TRAVEL TO CLINIC
              </p>

              <p className="mt-1 text-white text-sm font-semibold">
                18 min
              </p>
            </div>

          </div> */}

        </div>

      </div>
    </section>
  );
};

export default HowItWorks;