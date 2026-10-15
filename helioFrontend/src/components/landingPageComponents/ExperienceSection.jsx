const ExperienceSection = () => {
  return (
    <section className="w-full bg-[#f7f6f2] px-5 sm:px-8 md:px-10 lg:px-14 py-20 sm:py-24 md:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.7fr] gap-12 lg:gap-20">

        {/* LEFT SIDE */}
        <div className="pt-1">
          <h2
            className="
              text-[#171719]
              text-2xl
              sm:text-3xl
              md:text-4xl
              lg:text-[20px]
              xl:text-[34px]
              font-semibold
              leading-[1.1]
              tracking-[-0.025em]
              lg:w-[525px]
            "
          >
            YOUR CLINIC QUEUE HAS A TIME.
            <br />
            YOUR WAITING TIME DOESN’T.           
          </h2>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col">

          {/* MAIN TEXT */}
          <div>
            <h3
              className="
                text-[#171719]
                font-bold
                text-3xl
                sm:text-4xl
                md:text-5xl
                lg:text-[52px]
                xl:text-[58px]
                leading-[1.03]
                tracking-[-0.055em]
                max-w-[850px]
              "
            >
              Doctors can run late. Walk-ins 
              <br />

              can change the queue. A 
              <br />

              consultation can take longer
              <br />

              than expected. Your{" "}
              

              
              <span className="text-[#bb5c52]">
                4:00 PM
              </span>{" "}
              appointment doesn’t
              <br />

              necessarily mean you’ll be
              <br />

              seen at 4:00 PM.
            </h3>
          </div>

         

        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;