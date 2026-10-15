import { useEffect, useState } from "react";
import { FiLogIn } from "react-icons/fi";

const Navbar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();

  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";

  return (
    <nav className="w-full px-3 sm:px-5 md:px-8 pt-3">
      <div
        className="
          w-full
          h-[64px] sm:h-[68px] md:h-[72px]
          rounded-2xl
          border border-white
          flex items-center
          justify-between
          px-4 sm:px-6 md:px-8
        "
      >
        <div className="flex items-center shrink-0">
          <h1
            className="
              text-[#25224a]
              text-xl sm:text-2xl md:text-[27px]
              font-bold
              tracking-[-0.03em]
            "
          >
            Clin<span className="text-[#4b477c]">Queue</span>
          </h1>
        </div>

        <div
          className="
            absolute
            left-1/2
            -translate-x-1/2
            flex
            items-baseline
            text-[#c0a9a6]
            bg-[#3a120b]
            px-14
            rounded-full
            lg:h-[40px]
            lg:mt-[93px]
            z-10
            flex items-center justify-center
          "
        >
          <span
            className="
              text-2xl sm:text-3xl md:text-4xl lg:text-[22px]
              font-extrabold
              tracking-wider
            "
          >
            {formattedHours}:{formattedMinutes}
          </span>

          
        </div>

        <button
          className="
            flex items-center gap-1.5 sm:gap-2
            text-[#25224a]
            text-sm sm:text-base
            font-extrabold
            hover:opacity-70
            transition-opacity
            shrink-0
          "
          
        >
          <span className = "font-extrabold text-[12px] lg:text-[20px]">Login</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;