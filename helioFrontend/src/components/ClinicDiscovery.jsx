import { useEffect, useState } from "react";
import {
  FiSearch,
  FiMapPin,
  FiStar,
  FiUsers,
  FiChevronRight,
  FiSliders,
  FiClock,
  FiBell,
  FiCalendar,
  FiArrowUpRight,
  FiHeart,
} from "react-icons/fi";

export default function ClinicDiscovery({ request, setPage, logout }) {
  const [clinics, setClinics] = useState([]);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    specialty: "",
    distance: "",
    rating: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH CLINICS
  // =====================================================

  const getClinics = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (filters.specialty) {
        params.append("specialty", filters.specialty);
      }

      if (filters.distance) {
        params.append("distance", filters.distance);
      }

      if (filters.rating) {
        params.append("rating", filters.rating);
      }

      const query = params.toString();

      const result = await request(
        "get",
        `/api/clinic/search${query ? `?${query}` : ""}`,
      );

      if (result?.clinics) {
        setClinics(result.clinics);
      } else {
        setClinics([]);
      }
    } catch (error) {
      console.log("Error fetching clinics:", error);

      setError("Unable to load clinics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD + SEARCH
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      getClinics();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, filters]);

  // =====================================================
  // QUICK SEARCH
  // =====================================================

  const quickSearch = (value) => {
    setSearch(value);
  };

  // =====================================================
  // FILTER CHANGE
  // =====================================================

  const changeFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#f6f6f9] text-[#15171a]">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="sticky top-0 z-50 border-b border-black/[0.05] bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* ---------------- LOGO ---------------- */}

          <div className="flex items-center gap-3">

            <span className="text-xl font-black tracking-[-0.03em]">
              Healio
            </span>

          </div>

          {/* ---------------- RIGHT ---------------- */}

          <div className="flex items-center gap-7">

            <button
              onClick={() => setPage("profile")}
              className="
                text-sm font-medium text-gray-600
                transition hover:text-black
              "
            >
              Profile
            </button>

            <button
              onClick={logout}
              className="
                rounded-full bg-[#2474e8]
                px-5 py-1.5
                text-sm font-medium text-white
                transition hover:bg-black
              "
            >
              Sign out
            </button>

          </div>

        </div>

      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="mb-12">

          <div className="max-w-3xl">

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Healthcare, simplified
            </p>

            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#111827] sm:text-5xl lg:text-[58px]">

              Find the right care
              <br />

              <span className="text-gray-400">
                for you.
              </span>

            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Discover trusted clinics, experienced doctors and
              specialists that match your healthcare needs.
            </p>

          </div>

          {/* ================================================= */}
          {/* BIG SEARCH BAR */}
          {/* ================================================= */}

          <div className="mt-8 max-w-[94vw] mb-8">

            <div
              className="
                flex min-h-[76px] items-center
                rounded-[20px]
                border border-black/[0.08]
                bg-white
                px-5
                transition
                focus-within:border-black/[0.15]
              "
            >

              <FiSearch
                size={23}
                className="mr-4 shrink-0 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search clinics, doctors or specialists..."
                className="
                  min-w-0 flex-1
                  bg-transparent
                  text-base
                  text-gray-800
                  outline-none
                  placeholder:text-gray-400
                  sm:text-lg
                "
              />

              <button
                onClick={getClinics}
                className="
                  hidden rounded-xl
                  bg-[#111827]
                  px-6 py-3
                  text-sm font-medium
                  text-white
                  transition
                  hover:bg-black
                  sm:block
                "
              >
                Search
              </button>

            </div>

          </div>

          {/* ================================================= */}
          {/* POPULAR SEARCH */}
          {/* ================================================= */}

          <div className="mt-4 flex flex-wrap items-center gap-2">

            <span className="mr-1 text-xs font-medium text-gray-400">
              Popular:
            </span>

            {[
              "Cardiologist",
              "Dermatologist",
              "Dentist",
              "General Physician",
            ].map((item) => (

              <button
                key={item}
                onClick={() => quickSearch(item)}
                className="
                  rounded-full
                  border border-black/[0.07]
                  bg-white
                  px-3.5 py-2
                  text-xs font-medium
                  text-gray-500
                  transition
                  hover:border-black/[0.15]
                  hover:bg-gray-50
                "
              >
                {item}
              </button>

            ))}

          </div>

        </section>

        {/* ================================================= */}
        {/* RESULTS */}
        {/* ================================================= */}

        <section>

          {/* ---------------- RESULTS HEADER ---------------- */}

          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-gray-400">

                {search
                  ? `Results for "${search}"`
                  : "Discover healthcare"}

              </p>

              <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                {search
                  ? "Matching clinics"
                  : "Explore clinics"}
              </h2>

            </div>

            {/* ---------------- FILTERS ---------------- */}

            <div className="flex flex-wrap gap-2">

              <FilterSelect
                value={filters.specialty}
                onChange={(value) =>
                  changeFilter("specialty", value)
                }
                options={[
                  ["", "Specialty"],
                  ["cardiology", "Cardiology"],
                  ["dermatology", "Dermatology"],
                  ["dentist", "Dentist"],
                  ["orthopedics", "Orthopedics"],
                  ["general medicine", "General Medicine"],
                ]}
              />

              <FilterSelect
                value={filters.distance}
                onChange={(value) =>
                  changeFilter("distance", value)
                }
                options={[
                  ["", "Distance"],
                  ["5", "Within 5 km"],
                  ["10", "Within 10 km"],
                  ["25", "Within 25 km"],
                ]}
              />

              <FilterSelect
                value={filters.rating}
                onChange={(value) =>
                  changeFilter("rating", value)
                }
                options={[
                  ["", "Rating"],
                  ["4", "4+ stars"],
                  ["4.5", "4.5+ stars"],
                ]}
              />

              <button
                className="
                  flex items-center gap-2
                  rounded-xl
                  border border-black/[0.08]
                  bg-white
                  px-4 py-2.5
                  text-sm font-medium
                  text-gray-500
                  transition
                  hover:bg-gray-50
                "
              >
                <FiSliders size={15} />
                Filters
              </button>

            </div>

          </div>

          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {loading && (

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {[1, 2, 3].map((item) => (
                <ClinicSkeleton key={item} />
              ))}

            </div>

          )}

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {!loading && error && (

            <div className="rounded-[24px] border border-red-100 bg-red-50 p-10 text-center">

              <p className="text-sm font-medium text-red-600">
                {error}
              </p>

              <button
                onClick={getClinics}
                className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white"
              >
                Try again
              </button>

            </div>

          )}

          {/* ================================================= */}
          {/* CLINIC GRID */}
          {/* ================================================= */}

          {!loading &&
            !error &&
            clinics.length > 0 && (

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {clinics.map((clinic) => (
                  <ClinicCard
                    key={clinic._id}
                    clinic={clinic}
                    setPage={setPage}
                  />
                ))}

              </div>

            )}

          {/* ================================================= */}
          {/* EMPTY */}
          {/* ================================================= */}

          {!loading &&
            !error &&
            clinics.length === 0 && (

              <EmptyState
                search={search}
                clearSearch={() => {
                  setSearch("");
                  setFilters({
                    specialty: "",
                    distance: "",
                    rating: "",
                  });
                }}
              />

            )}

        </section>

      </main>

    </div>
  );
}


// =====================================================
// CLINIC CARD
// =====================================================

function ClinicCard({ clinic, setPage }) {

  const doctors = clinic.doctors || [];

  const specialists =
    clinic.specialists ||
    clinic.specialties ||
    [];

  const clinicName =
    clinic.clinicName ||
    clinic.name ||
    "Clinic";

  const location =
    clinic.address?.city ||
    clinic.city ||
    clinic.address ||
    "Location unavailable";

  return (

    <article
      className="
        group overflow-hidden
        rounded-[8px]
        border border-black/[0.06]
        bg-white
      "
    >

      {/* ================================================= */}
      {/* CARD CONTENT */}
      {/* ================================================= */}

      <div className="p-8">

        {/* ---------------- NAME ---------------- */}

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <h3 className="truncate text-xl font-extrabold tracking-[-0.025em]">
              {clinicName}
            </h3>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">

              <FiMapPin size={12} />

              <span className="truncate">
                {location}
              </span>

            </div>

            {/* LIVE QUEUE WIDGET */}

            {clinic.liveQueue && (
              <div
                className="
                  mt-4
                  inline-flex items-center gap-2
                  rounded-full
                  bg-[#f4f7fb]
                  px-3 py-1.5
                  text-xs font-medium
                  shadow-sm
                  border border-black/[0.05]
                "
              >
                <div className="flex items-end gap-[2.5px] h-3.5 mb-0.5">
                  <div className="w-[3.5px] bg-[#89bdf5] h-1.5 rounded-sm"></div>
                  <div className="w-[3.5px] bg-[#66a3f5] h-2.5 rounded-sm"></div>
                  <div className="w-[3.5px] bg-[#4383f0] h-3 rounded-sm"></div>
                  <div className="w-[3.5px] bg-[#225de3] h-full rounded-sm"></div>
                  <div className="w-[3.5px] bg-[#89bdf5] h-1.5 rounded-sm"></div>
                </div>

                <span className="text-[#5a6676]">
                  Live Queue: <span className="font-semibold text-[#0a1b39]">{clinic.liveQueue.patients} Patients</span>
                  <span className="text-[#849ec4] ml-1.5 font-normal">(~{clinic.liveQueue.waitTime} min wait)</span>
                </span>
              </div>
            )}

          </div>

          <button
            onClick={() => setPage("clinics", { state: { clinicId: clinic._id } })}
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-full
              border border-black/[0.08]
              text-gray-500
              transition
              group-hover:bg-gray-50
            "
          >
            <FiArrowUpRight size={16} />
          </button>

        </div>

        {/* ---------------- DESCRIPTION ---------------- */}

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">

          {clinic.description ||
            "A trusted healthcare clinic providing quality medical care with experienced doctors and specialists."}

        </p>

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <div className="mt-5 grid grid-cols-2 gap-2">

          <div className="rounded-xl bg-[#f7f8fa] px-5 py-3">

            <div className="flex items-center gap-2 text-gray-400">

              <FiUsers size={15} />

              <span className="text-xs">
                Doctors
              </span>

            </div>

            <strong className="mt-1 block text-sm text-gray-800">

              {clinic.doctorCount ??
                doctors.length ??
                0}

            </strong>

          </div>

          <div className="rounded-xl bg-[#f7f8fa] px-5 py-3">

            <div className="flex items-center gap-2 text-gray-400">

              <FiClock size={15} />

              <span className="text-xs">
                Experience
              </span>

            </div>

            <strong className="mt-1 block text-sm text-gray-800">

              {clinic.experience ||
                "Multi-specialty"}

            </strong>

          </div>

        </div>

        {/* ================================================= */}
        {/* SPECIALISTS */}
        {/* ================================================= */}

        {specialists.length > 0 && (

          <div className="mt-5">

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              Specialists
            </p>

            <div className="flex flex-wrap gap-2">

              {specialists
                .slice(0, 3)
                .map((specialist, index) => {

                  const name =
                    typeof specialist === "string"
                      ? specialist
                      : specialist.name ||
                        specialist.specialization ||
                        specialist.specialty;

                  return (

                    <span
                      key={index}
                      className="
                        rounded-full
                        bg-gray-100
                        px-3 py-1.5
                        text-xs font-medium
                        text-gray-600
                      "
                    >
                      {name}
                    </span>

                  );
                })}

              {specialists.length > 3 && (

                <span
                  className="
                    rounded-full
                    bg-gray-100
                    px-3 py-1.5
                    text-xs font-medium
                    text-gray-400
                  "
                >
                  +{specialists.length - 3}
                </span>

              )}

            </div>

          </div>

        )}

        {/* ================================================= */}
        {/* DOCTORS */}
        {/* ================================================= */}

        {doctors.length > 0 && (

          <div className="mt-5 border-t border-black/[0.05] pt-4">

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              Our specialists
            </p>

            <div className="space-y-3">

              {doctors.slice(0, 2).map((doctor) => (

                <div
                  key={doctor._id}
                  className="flex items-center gap-5 border border-gray-200 py-3 px-3 rounded-full"
                >

                  {/* DOCTOR IMAGE */}

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">

                    {doctor.image ||
                    doctor.profileImage ? (

                      <img
                        src={
                          doctor.image ||
                          doctor.profileImage
                        }
                        alt={doctor.name}
                        className="h-full w-full object-cover"
                      />

                    ) : (

                      <FiUsers
                        size={15}
                        className="text-gray-400"
                      />

                    )}

                  </div>

                  {/* DOCTOR DETAILS */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-medium text-gray-800">

                      {doctor.name ||
                        "Doctor"}

                    </p>

                    <p className="truncate text-xs text-gray-400">

                      {doctor.specialization ||
                        doctor.specialty ||
                        "Specialist"}

                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="mt-5 flex items-center justify-between border-t border-black/[0.05] pt-4">

          {/* DISTANCE */}

          <div className="flex items-center gap-1.5 text-xs text-gray-400">

            <FiMapPin size={13} />

            {clinic.distance != null
              ? `${clinic.distance} km away`
              : "Nearby"}

          </div>

          {/* VIEW CLINIC */}

          <button
            onClick={() => setPage("clinics", { state: { clinicId: clinic._id } })}
            className="
              flex items-center gap-1
              text-sm font-semibold
              text-[#111827]
              transition
              group-hover:gap-2
            "
          >

            View clinic

            <FiChevronRight size={15} />

          </button>

        </div>

      </div>

    </article>
  );
}


// =====================================================
// NAV ITEM
// =====================================================

function NavItem({ children, active }) {

  return (

    <button
      className={`
        text-sm font-medium transition
        ${
          active
            ? "text-[#111827]"
            : "text-gray-500 hover:text-[#111827]"
        }
      `}
    >
      {children}
    </button>

  );
}


// =====================================================
// FILTER SELECT
// =====================================================

function FilterSelect({
  value,
  onChange,
  options,
}) {

  return (

    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="
        rounded-xl
        border border-black/[0.08]
        bg-white
        px-4 py-2.5
        text-sm font-medium
        text-gray-500
        outline-none
        transition
        focus:border-black/[0.18]
      "
    >

      {options.map(([optionValue, label]) => (

        <option
          key={optionValue}
          value={optionValue}
        >
          {label}
        </option>

      ))}

    </select>

  );
}


// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({
  search,
  clearSearch,
}) {

  return (

    <div
      className="
        rounded-[28px]
        border border-black/[0.05]
        bg-white
        px-6 py-20
        text-center
      "
    >

      <div
        className="
          mx-auto mb-5
          flex h-14 w-14
          items-center justify-center
          rounded-2xl
          bg-gray-100
        "
      >

        <FiSearch
          size={22}
          className="text-gray-400"
        />

      </div>

      <h3 className="text-xl font-semibold tracking-tight">

        {search
          ? "No matching clinics"
          : "No clinics available"}

      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">

        {search
          ? "Try searching with another clinic name, doctor name or specialist."
          : "There are currently no clinics available to display."}

      </p>

      {search && (

        <button
          onClick={clearSearch}
          className="
            mt-5
            rounded-xl
            bg-[#111827]
            px-5 py-2.5
            text-sm font-medium
            text-white
            transition
            hover:bg-black
          "
        >
          Clear search
        </button>

      )}

    </div>

  );
}


// =====================================================
// SKELETON
// =====================================================

function ClinicSkeleton() {

  return (

    <div
      className="
        overflow-hidden
        rounded-[24px]
        border border-black/[0.05]
        bg-white
      "
    >

      <div className="h-[215px] animate-pulse bg-gray-200" />

      <div className="space-y-4 p-5">

        <div className="h-6 w-2/3 animate-pulse rounded-lg bg-gray-200" />

        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />

        <div className="h-10 animate-pulse rounded-xl bg-gray-100" />

        <div className="grid grid-cols-2 gap-2">

          <div className="h-16 animate-pulse rounded-xl bg-gray-100" />

          <div className="h-16 animate-pulse rounded-xl bg-gray-100" />

        </div>

        <div className="h-10 animate-pulse rounded-xl bg-gray-100" />

      </div>

    </div>

  );
}


// =====================================================
// CLINIC IMAGE FALLBACK ICON
// =====================================================

function BuildingIcon() {

  return (

    <div
      className="
        flex h-16 w-16
        items-center justify-center
        rounded-2xl
        bg-white
        text-gray-400
        shadow-sm
      "
    >

      <FiHeart size={27} />

    </div>

  );
}
