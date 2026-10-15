import { FiArrowUpRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="px-3 sm:px-5 md:px-7 lg:px-8">
      <div
        className="
          mt-[10px]
          relative
          overflow-hidden
          w-full
          min-h-[500px]
          sm:min-h-[560px]
          md:min-h-[620px]
          lg:min-h-[700px]
          rounded-[28px]
          sm:rounded-[32px]
          bg-[#3a120b]
        "
      >
        
        <div
          className="
            absolute
            top-[35px]
            sm:top-[42px]
            md:top-[45px]
            lg:top-[25px]
            left-0
            w-full
            px-5
            sm:px-7
            md:px-10
            lg:px-11
            z-10
          "
        >
          <h1
            className="
              text-[#bb5c52]
              font-extrabold
              tracking-[-0.065em]
              leading-[0.82]
              text-[clamp(4.8rem,19vw,21rem)]
              whitespace-nowrap
            "
          >
            ClinQueue
          </h1>
        </div>

        <div
          className="
            absolute
            top-[185px]
            sm:top-[205px]
            md:top-[220px]
            lg:top-[305px]
            right-6
            sm:right-9
            md:right-12
            lg:right-14
            w-[280px]
            sm:w-[330px]
            md:w-[380px]
            lg:w-[410px]
            z-10
          "
        >
          <p
  className="
    text-[#bb5c52]
    font-bold
    text-sm
    sm:text-base
    md:text-lg
    lg:text-[19px]
    leading-[1.25]
  "
>
  MANAGE PATIENT QUEUES WITH EASE
  <br />
  REDUCE LONG WAITING TIMES
  <br />
  AND GIVE PATIENTS A BETTER EXPERIENCE.
</p>
        </div>

        <div
          className="
            absolute
            left-6
            sm:left-8
            md:left-10
            lg:left-11
            bottom-8
            sm:bottom-10
            md:bottom-12
            lg:bottom-10
            max-w-[290px]
            sm:max-w-[350px]
            md:max-w-[400px]
            lg:max-w-[430px]
            z-10
          "
        >
          <p
  className="
    text-[#bb5c52]
    uppercase
    font-bold
    tracking-[0.01em]
    leading-[1.25]
    text-[10px]
    sm:text-xs
    md:text-sm
    lg:text-[19px]
  "
>
  DIGITALIZE YOUR CLINIC QUEUE
  <br />
  MAKE PATIENT MANAGEMENT SIMPLE
  <br />
  AND KEEP YOUR CLINIC RUNNING SMOOTHLY.
</p>
        </div>

        <div
          className="
            absolute
            right-6
            sm:right-8
            md:right-10
            lg:right-11
            bottom-8
            sm:bottom-10
            md:bottom-12
            lg:bottom-10
            z-10
          "
        >
          <Link
            className="
              group
              flex
              items-center
              gap-3
              rounded-full
              bg-white
              text-[#3a120b]
              pl-6
              pr-2
              py-2
              sm:pl-7
              sm:pr-2.5
              sm:py-2.5
              md:pl-8
              md:pr-3
              md:py-3
              font-extrabold
              text-sm
              sm:text-base
              md:text-lg
              transition-all
              duration-300
              h-[60px]
            "
            to="/patient/signup"
          >
            <span className="whitespace-nowrap font-extrabold">
              Book Appointment
            </span>

            <span
              className="
                flex
                items-center
                justify-center
                w-9
                h-9
                sm:w-10
                sm:h-10
                md:w-11
                md:h-11
                rounded-full
                bg-[#3a120b]
                text-white
                group-hover:rotate-45
                transition-transform
                duration-300
              "
            >
              <FiArrowUpRight className="text-lg sm:text-xl" />
            </span>
          </Link>
        </div>

        <div
          className="
            hidden
            max-[639px]:block
            absolute
            bottom-0
            left-0
            w-full
            h-36
            bg-gradient-to-t
            from-[#292E69]/40
            to-transparent
            pointer-events-none
          "
        />
      </div>
    </section>
  );
};

export default Hero;