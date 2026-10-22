import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiSearch, FiX, FiPlus, FiMinus, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import capsule from "../../assets/capsule.png"
import tablet from "../../assets/tablet.png"
import injection from "../../assets/injection.png"
import syrup from "../../assets/syrup.png"
import tube from "../../assets/tube.png"
import { useDoctorClinic, withDoctorClinic } from "./DoctorClinicContext";

const cssCapsule = "absolute top-[14px] h-[74px] w-[104px] object-contain transition duration-300 scale-150"
const capsuleGlow = "absolute inset-0 bg-gradient-to-br from-blue-100/60 via-transparent to-purple-100/50 rounded-full blur-xl"
const cssTablet = "absolute top-[15px] h-[74px] w-[104px] object-contain transition duration-300 scale-135"
const cssSuspension = "absolute top-[15px] h-[74px] w-[104px] object-contain transition duration-300 scale-170"
const cssSyrup = "absolute top-[15px] h-[74px] w-[104px] object-contain transition duration-300 scale-155"
const cssTube = "absolute top-[50px] h-[74px] w-[104px] object-contain transition duration-300 scale-245 rotate-180"


const CreatePrescriptionDetails = ({ medicines, onCreate, saving, error, success }) => {
  const [foodEnabled, setFoodEnabled] = React.useState(false);
  const [feverEnabled, setFeverEnabled] = React.useState(false);

  const [foodSearch, setFoodSearch] = React.useState("");
  const [foodDropdown, setFoodDropdown] = React.useState(false);
  const [selectedFoods, setSelectedFoods] = React.useState([]);

  const [testSearch, setTestSearch] = React.useState("");
  const [testDropdown, setTestDropdown] = React.useState(false);
  const [selectedTests, setSelectedTests] = React.useState([]);

  const [doctorNotes, setDoctorNotes] = React.useState([""]);
  const [diagnosis, setDiagnosis] = React.useState("");

  const [weekOffset, setWeekOffset] = React.useState(0);
  const [temperature, setTemperature] = React.useState({});


  const foodOptions = [
    "Light meals",
    "Soft foods",
    "High protein",
    "Iron rich",
    "High fiber",
    "Low salt",
    "Low sugar",
    "Hydration",
    "Fresh fruits",
    "Vegetables",
    "Warm fluids",
    "Easy to digest",
  ];

  const testOptions = [
    "CBC",
    "Blood Sugar",
    "Urine Test",
    "LFT",
    "KFT",
    "Lipid Profile",
    "X-Ray",
    "Ultrasound",
    "ECG",
    "CT Scan",
    "MRI",
    "Thyroid Profile",
  ];

  const timeSlots = [
    "08:00 AM",
    "12:00 PM",
    "04:00 PM",
    "08:00 PM",
  ];

  const filteredFoods = foodOptions.filter((food) =>
    food.toLowerCase().includes(foodSearch.toLowerCase())
  );

  const filteredTests = testOptions.filter((test) =>
    test.toLowerCase().includes(testSearch.toLowerCase())
  );

  const toggleFood = (food) => {
    setSelectedFoods((prev) =>
      prev.includes(food)
        ? prev.filter((item) => item !== food)
        : [...prev, food]
    );
  };

  const toggleTest = (test) => {
    setSelectedTests((prev) =>
      prev.includes(test)
        ? prev.filter((item) => item !== test)
        : [...prev, test]
    );
  };

  const addDoctorNote = () => {
    setDoctorNotes((prev) => [...prev, ""]);
  };

  const updateDoctorNote = (index, value) => {
    setDoctorNotes((prev) =>
      prev.map((note, i) => (i === index ? value : note))
    );
  };

  const removeDoctorNote = (index) => {
    if (doctorNotes.length === 1) return;

    setDoctorNotes((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const getMonday = (date) => {
    const result = new Date(date);
    const day = result.getDay();

    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);

    return result;
  };

  const getWeekDays = () => {
    const monday = getMonday(new Date());

    monday.setDate(monday.getDate() + weekOffset * 7);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      return date;
    });
  };

  const weekDays = getWeekDays();

  const getDateKey = (date) => {
    return date.toISOString().split("T")[0];
  };

  const updateTemperature = (date, time, value) => {
    const key = `${getDateKey(date)}-${time}`;

    setTemperature((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getTemperature = (date, time) => {
    const key = `${getDateKey(date)}-${time}`;

    return temperature[key] || "";
  };

  const getTemperatureStyle = (value) => {
    if (!value) {
      return "border-[#E5EBF2] bg-white text-[#71839B]";
    }

    const temp = Number(value);

    if (temp < 99) {
      return "border-[#C9E5D0] bg-[#F1FAF3] text-[#3F9B58]";
    }

    if (temp <= 100) {
      return "border-[#F0DCA8] bg-[#FFF9E9] text-[#C38A22]";
    }

    return "border-[#EFC8C8] bg-[#FFF2F2] text-[#D95353]";
  };

  const handleCreatePrescription = async () => {
    await onCreate({
      foodEnabled,
      foods: foodEnabled ? selectedFoods : [],
      feverEnabled,
      feverChart: feverEnabled ? temperature : {},
      doctorNotes: doctorNotes.filter(
        (note) => note.trim() !== ""
      ),
      diagnosis,
      tests: selectedTests,
      medicines,
    });
  };

  return (
    <div className="w-full bg-white text-[#172B55] p-6">

      {/* FOOD + FEVER */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_2fr] gap-10">

        {/* FOOD */}
        <div
          className={`p-4 transition-opacity duration-300 ${
            foodEnabled ? "opacity-100" : "opacity-75"
          }`}
        >

          <div className="flex items-start justify-between">

            <div>
              <p className="text-[18px] font-medium text-[#203A70]">
                Food & Diet
              </p>

              <p className="mt-1 text-[11px] text-[#96A4B8]">
                Select suitable food recommendations for the patient.
              </p>
            </div>

            {/* FOOD CHECKBOX */}
            <label className="relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center">

              <input
                type="checkbox"
                checked={foodEnabled}
                onChange={(e) =>
                  setFoodEnabled(e.target.checked)
                }
                className="peer absolute h-6 w-6 cursor-pointer opacity-0"
              />

              <span className="absolute inset-0 rounded-full border border-[#D9E1EB] bg-white transition-all duration-200 peer-checked:border-[#17213F] peer-checked:bg-[#17213F]" />

              <span className="relative z-10 h-2 w-2 scale-0 rounded-full bg-white transition-transform duration-200 peer-checked:scale-100" />

              <span className="pointer-events-none absolute inset-[-3px] rounded-full border border-[#17213F]/20 opacity-0 transition-all duration-300 peer-checked:animate-ping peer-checked:opacity-100" />

            </label>

          </div>


          {/* FOOD SEARCH */}
          <div className="relative mt-5">

            <div
              className={`flex h-[48px] items-center rounded-[16px] border bg-[#F8FAFD] px-4 transition ${
                foodDropdown && foodEnabled
                  ? "border-[#C9D9EE] bg-white"
                  : "border-[#E7ECF3]"
              }`}
            >

              <input
                type="text"
                disabled={!foodEnabled}
                value={foodSearch}
                onChange={(e) => {
                  setFoodSearch(e.target.value);
                  setFoodDropdown(true);
                }}
                onFocus={() => {
                  if (foodEnabled) {
                    setFoodDropdown(true);
                  }
                }}
                placeholder="Search food recommendation..."
                className="w-full bg-transparent text-[12px] text-[#172B55] outline-none placeholder:text-[#A4B0BF] disabled:cursor-not-allowed"
              />

              <button
                type="button"
                disabled={!foodEnabled}
                onClick={() =>
                  setFoodDropdown((prev) => !prev)
                }
                className="text-[16px] text-[#8292A7] disabled:cursor-not-allowed"
              >
                {foodDropdown ? "⌃" : "⌄"}
              </button>

            </div>


            {/* FOOD DROPDOWN */}
            {foodDropdown && foodEnabled && (
              <div className="absolute left-0 right-0 top-[55px] z-30 max-h-[210px] overflow-y-auto rounded-[16px] border border-[#E5EBF2] bg-white p-2 shadow-[0_12px_30px_rgba(23,43,85,0.08)]">

                {filteredFoods.length > 0 ? (
                  filteredFoods.map((food) => {
                    const selected = selectedFoods.includes(food);

                    return (
                      <button
                        key={food}
                        type="button"
                        onClick={() => {
                          toggleFood(food);
                          setFoodSearch("");
                        }}
                        className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-[11px] transition ${
                          selected
                            ? "bg-[#EEF5FF] text-[#3970C7]"
                            : "text-[#667A97] hover:bg-[#F7F9FC]"
                        }`}
                      >

                        <span>{food}</span>

                        {selected && (
                          <span className="text-[12px]">
                            ✓
                          </span>
                        )}

                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-3 text-[11px] text-[#9AA8BB]">
                    No food found.
                  </p>
                )}

              </div>
            )}

          </div>


          {/* SELECTED FOODS */}
          {selectedFoods.length > 0 && (
            <div className="mt-5">

              <p className="mb-3 text-[10px] uppercase tracking-[0.14em] text-[#9AA8BB]">
                Selected
              </p>

              <div className="flex flex-wrap gap-2">

                {selectedFoods.map((food) => (
                  <div
                    key={food}
                    className="flex items-center gap-2 rounded-full border border-[#DCE8F8] bg-[#EEF5FF] px-3 py-2 text-[10px] font-medium text-[#3970C7]"
                  >

                    <span>{food}</span>

                    <button
                      type="button"
                      onClick={() => toggleFood(food)}
                      className="text-[13px] text-[#7393BD] transition hover:text-[#3970C7]"
                    >
                      ×
                    </button>

                  </div>
                ))}

              </div>

            </div>
          )}

        </div>


        {/* FEVER CHART */}
        <div
          className={`p-4 transition-opacity duration-300  ${
            feverEnabled ? "opacity-100" : "opacity-75"
          }`}
        >

          <div className="flex items-start justify-between">

            <div>
              <p className="text-[18px] font-medium text-[#203A70]">
                Fever Chart
              </p>

              <p className="mt-1 text-[11px] text-[#96A4B8]">
                Patient can record temperature for each day.
              </p>
            </div>


            {/* FEVER CHECKBOX */}
            <label className="relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center">

              <input
                type="checkbox"
                checked={feverEnabled}
                onChange={(e) =>
                  setFeverEnabled(e.target.checked)
                }
                className="peer absolute h-6 w-6 cursor-pointer opacity-0"
              />

              <span className="absolute inset-0 rounded-full border border-[#D9E1EB] bg-white transition-all duration-200 peer-checked:border-[#17213F] peer-checked:bg-[#17213F]" />

              <span className="relative z-10 h-2 w-2 scale-0 rounded-full bg-white transition-transform duration-200 peer-checked:scale-100" />

              <span className="pointer-events-none absolute inset-[-3px] rounded-full border border-[#17213F]/20 opacity-0 transition-all duration-300 peer-checked:animate-ping peer-checked:opacity-100" />

            </label>

          </div>


          {/* WEEK HEADER */}
          <div className="mt-5 flex items-center justify-between">

            <button
              type="button"
              disabled={!feverEnabled}
              onClick={() =>
                setWeekOffset((prev) => prev - 1)
              }
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5EBF2] text-[18px] text-[#70829C] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>

            <div className="text-center">

              <p className="text-[13px] font-medium text-[#203A70]">
                {weekDays[0].toLocaleDateString("en-US", {
                  month: "long",
                })}{" "}
                {weekDays[0].getFullYear()}
              </p>

              <p className="mt-0.5 text-[9px] uppercase tracking-[0.13em] text-[#A0ACBB]">
                Week {weekOffset + 1}
              </p>

            </div>

            <button
              type="button"
              disabled={!feverEnabled}
              onClick={() =>
                setWeekOffset((prev) => prev + 1)
              }
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5EBF2] text-[18px] text-[#70829C] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ›
            </button>

          </div>


          {/* FEVER TABLE */}
          <div className="mt-4 overflow-x-auto">

            <table className="w-full min-w-[650px] border-collapse">

              <thead>

                <tr className="border-b border-[#E7ECF2]">

                  <th className="w-[78px] text-[12px] font-medium uppercase tracking-[0.1em] text-[#8998AC]">
                    Time
                  </th>

                  {weekDays.map((date, index) => (
                    <th
                      key={index}
                      className= "p-2 text-center"
                    >

                      <p className="text-[11px] font-medium uppercase text-[#7F8EA4]">
                        {date.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </p>

                      <p className="mt-1 text-[10px] text-[#A1ADBC]">
                        {date.getDate()}
                      </p>

                    </th>
                  ))}

                </tr>

              </thead>


              <tbody>

                {timeSlots.map((time) => (
                  <tr
                    key={time}
                    className="last:border-b-0"
                  >

                    <td className="px-3 py-3 text-[11px] font-medium text-[#8190A5]">
                      {time}
                    </td>

                    {weekDays.map((date, index) => {

                      const value = getTemperature(
                        date,
                        time
                      );

                      return (
                        <td
                          key={index}
                          className="p-2"
                        >

                          <input
                            type="number"
                            step="0.1"
                            disabled={!feverEnabled}
                            value={value}
                            onChange={(e) =>
                              updateTemperature(
                                date,
                                time,
                                e.target.value
                              )
                            }
                            placeholder="°F"
                            className={`h-[36px] w-full text-center text-[10px] font-medium outline-none transition disabled:cursor-not-allowed disabled:opacity-60 rounded-full ${getTemperatureStyle(
                              value
                            )}`}
                          />

                        </td>
                      );
                    })}

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* DOCTOR'S NOTE */}
      <div className=" p-4 mt-10">

        <div>
          <p className="text-[18px] font-medium text-[#203A70]">
            Doctor's Note
          </p>

          <p className="mt-1 text-[11px] text-[#96A4B8]">
            Add things the patient should keep in mind.
          </p>
        </div>


        <div className="mt-5 space-y-3">

          {doctorNotes.map((note, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
            >

              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F3F6FA] text-[10px] font-medium text-[#71839C]">
                {index + 1}
              </span>

              <input
                type="text"
                value={note}
                onChange={(e) =>
                  updateDoctorNote(
                    index,
                    e.target.value
                  )
                }
                placeholder="Write an instruction..."
                className="h-[44px] w-full rounded-full border border-[#E5EBF2] bg-[#FAFBFD] px-4 text-[11px] text-[#172B55] outline-none transition placeholder:text-[#A8B3C1] focus:border-[#C9D9EE]"
              />

              {doctorNotes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDoctorNote(index)}
                  className="text-[17px] text-[#A2AFBF] transition hover:text-[#D45B5B]"
                >
                  ×
                </button>
              )}

            </div>
          ))}

        </div>


        <button
          type="button"
          onClick={addDoctorNote}
          className="mt-4 text-[11px] font-medium text-white bg-[#2A3658] px-6 py-2 rounded-full"
        >
          Add another point
        </button>

      </div>


      {/* DIAGNOSIS + LAB TESTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">

        {/* DIAGNOSIS */}
        <div className="p-4">

          <p className="text-[18px] font-medium text-[#203A70]">
            Diagnosis
          </p>

          <p className="mt-1 text-[11px] text-[#96A4B8]">
            Enter the diagnosis after consultation.
          </p>

          <textarea
            value={diagnosis}
            onChange={(e) =>
              setDiagnosis(e.target.value)
            }
            placeholder="Enter diagnosis..."
            maxLength={500}
            className="mt-5 h-[150px] w-full resize-none rounded-[16px] border border-[#E5EBF2] bg-[#FAFBFD] p-4 text-[12px] text-[#172B55] outline-none transition placeholder:text-[#A8B3C1] focus:border-[#C9D9EE]"
          />

          <div className="mt-2 text-right text-[9px] text-[#A1ADBC]">
            {diagnosis.length}/500
          </div>

        </div>


        {/* LAB TESTS */}
        <div className="p-4">

          <p className="text-[18px] font-medium text-[#203A70]">
            Lab Tests & Investigations
          </p>

          <p className="mt-1 text-[11px] text-[#96A4B8]">
            Select investigations for the patient.
          </p>


          {/* TEST SEARCH */}
          <div className="relative mt-5">

            <div
              className={`flex h-[48px] items-center rounded-[16px] border bg-[#F8FAFD] px-4 transition ${
                testDropdown
                  ? "border-[#C9D9EE] bg-white"
                  : "border-[#E7ECF3]"
              }`}
            >

              <input
                type="text"
                value={testSearch}
                onChange={(e) => {
                  setTestSearch(e.target.value);
                  setTestDropdown(true);
                }}
                onFocus={() =>
                  setTestDropdown(true)
                }
                placeholder="Search test..."
                className="w-full bg-transparent text-[12px] text-[#172B55] outline-none placeholder:text-[#A4B0BF]"
              />

              <button
                type="button"
                onClick={() =>
                  setTestDropdown((prev) => !prev)
                }
                className="text-[16px] text-[#8292A7]"
              >
                {testDropdown ? "⌃" : "⌄"}
              </button>

            </div>


            {/* TEST DROPDOWN */}
            {testDropdown && (
              <div className="absolute left-0 right-0 top-[55px] z-30 max-h-[210px] overflow-y-auto rounded-[16px] border border-[#E5EBF2] bg-white p-2 shadow-[0_12px_30px_rgba(23,43,85,0.08)]">

                {filteredTests.length > 0 ? (
                  filteredTests.map((test) => {

                    const selected =
                      selectedTests.includes(test);

                    return (
                      <button
                        key={test}
                        type="button"
                        onClick={() => {
                          toggleTest(test);
                          setTestSearch("");
                        }}
                        className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-[11px] transition ${
                          selected
                            ? "bg-[#EEF5FF] text-[#3970C7]"
                            : "text-[#667A97] hover:bg-[#F7F9FC]"
                        }`}
                      >

                        <span>{test}</span>

                        {selected && (
                          <span>
                            ✓
                          </span>
                        )}

                      </button>
                    );

                  })
                ) : (
                  <p className="px-3 py-3 text-[11px] text-[#9AA8BB]">
                    No test found.
                  </p>
                )}

              </div>
            )}

          </div>


          {/* SELECTED TESTS */}
          {selectedTests.length > 0 && (
            <div className="mt-5">

              <p className="mb-3 text-[10px] uppercase tracking-[0.14em] text-[#9AA8BB]">
                Selected
              </p>

              <div className="flex flex-wrap gap-2">

                {selectedTests.map((test) => (
                  <div
                    key={test}
                    className="flex items-center gap-2 rounded-full border border-[#DCE8F8] bg-[#EEF5FF] px-3 py-2 text-[10px] font-medium text-[#3970C7]"
                  >

                    <span>{test}</span>

                    <button
                      type="button"
                      onClick={() => toggleTest(test)}
                      className="text-[13px] text-[#7393BD] transition hover:text-[#3970C7]"
                    >
                      ×
                    </button>

                  </div>
                ))}

              </div>

            </div>
          )}

        </div>

      </div>


      {/* CREATE PRESCRIPTION */}
      <div className="flex items-center justify-end p-4">

        {success && (
          <p className="mr-4 text-[10px] font-medium text-[#4C9B62]">
            {success}
          </p>
        )}

        {error && <p className="mr-4 text-[10px] font-medium text-[#D95353]">{error}</p>}

        <button
          type="button"
          onClick={handleCreatePrescription}
          disabled={saving}
          className="relative overflow-hidden rounded-full bg-[#17213F] px-7 py-3.5 text-[11px] font-medium text-white transition-all duration-300 hover:bg-[#203A70] hover:shadow-[0_8px_20px_rgba(23,33,63,0.14)] active:scale-[0.98]"
        >
          {saving ? "Saving…" : "Create Prescription"}
        </button>

      </div>

    </div>
  );
};

const MEDICINES = [
  { id: 1, name: "Amoxicillin", strength: "500 mg", form: "Capsule", image: capsule, css: cssCapsule },
  { id: 2, name: "Amoxicillin", strength: "250 mg", form: "Tablet", image: tablet, css: cssTablet },
  { id: 3, name: "Amoxicillin", strength: "125 mg / 5 ml", form: "Suspension", image: injection, css: cssSuspension },
  { id: 4, name: "Paracetamol", strength: "500 mg", form: "Tablet", image: syrup, css: cssSyrup },
  { id: 5, name: "Azithromycin", strength: "200 mg / 5 ml", form: "Suspension", image: injection, css: cssSuspension},
  { id: 6, name: "Cetirizine", strength: "10 mg", form: "Tablet", image: tube, css: cssTube },
];

const DEFAULT_DETAILS = {
  dose: 1,
  unit: "Capsule",
  frequency: "3 times a day",
  schedule: "Every day",
  time: "Morning",
  food: "After food",
  duration: 5,
  image: capsule
};

function Prescriptions({ request, consultation }) {
  const navigate = useNavigate();
  const [addedMedicines, setAddedMedicines] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState(consultation?.appointmentId?._id || consultation?.appointmentId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { selectedClinicId } = useDoctorClinic();

  const loadAppointments = useCallback(async () => {
    const data = await request("get", withDoctorClinic("/api/prescription/doctor/appointments", selectedClinicId));
    if (data?.success) setAppointments(data.appointments || []);
    else setError(data?.message || "Unable to load patients for prescription.");
  }, [request, selectedClinicId]);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  useEffect(() => {
    const id = consultation?.appointmentId?._id || consultation?.appointmentId;
    if (id) setAppointmentId(id);
  }, [consultation]);

  const filteredMedicines = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return MEDICINES;
    return MEDICINES.filter((medicine) => `${medicine.name} ${medicine.strength} ${medicine.form}`.toLowerCase().includes(value));
  }, [query]);

  const selectedMedicine = addedMedicines.find((medicine) => medicine.id === selectedId);

  const addMedicine = (medicine) => {
    const alreadyAdded = addedMedicines.find((item) => item.id === medicine.id);

    if (alreadyAdded) {
      setSelectedId(medicine.id);
      return;
    }

    const newMedicine = { ...medicine, details: { ...DEFAULT_DETAILS, unit: medicine.form } };
    setAddedMedicines((current) => [...current, newMedicine]);
    setSelectedId(medicine.id);
    setQuery("");
  };

  const updateDetails = (key, value) => {
    setAddedMedicines((current) =>
      current.map((medicine) =>
        medicine.id === selectedId ? { ...medicine, details: { ...medicine.details, [key]: value } } : medicine
      )
    );
  };

  const removeMedicine = (id) => {
    setAddedMedicines((current) => current.filter((medicine) => medicine.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const createPrescription = async (details) => {
    const appointment = appointments.find((item) => item._id === appointmentId) || consultation;
    const doctorId = appointment?.doctorId?._id || appointment?.doctorId;
    const userId = appointment?.userId?._id || appointment?.userId;
    const clinicId = appointment?.clinicId?._id || appointment?.clinicId;

    if (!appointmentId || !doctorId || !userId || !clinicId) {
      setError("Select the patient appointment before creating the prescription.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    const medicines = details.medicines.map((medicine) => ({
      name: medicine.name,
      dosage: `${medicine.details.dose} ${medicine.details.unit}`,
      frequency: `${medicine.details.frequency} · ${medicine.details.time}`,
      duration: `${medicine.details.duration} days`,
      instructions: medicine.details.food,
    }));
    const data = await request("post", "/api/prescription", {
      appointmentId, doctorId, userId, clinicId,
      diagnosis: details.diagnosis,
      medicines,
      tests: details.tests,
      advice: details.foods.length ? `Diet advice: ${details.foods.join(", ")}` : "",
      notes: details.doctorNotes.join("\n"),
      feverChart: details.feverChart,
    });

    if (data?.success) {
      setSuccess("Prescription saved and sent to the clinic store.");
      setAppointments((items) => items.filter((item) => item._id !== appointmentId));
      setAppointmentId("");
      setAddedMedicines([]);
      setSelectedId(null);
      window.setTimeout(() => navigate("/doctor/prescriptions"), 900);
    } else {
      setError(data?.message || "Could not save the prescription.");
    }
    setSaving(false);
  };

  const quantity = selectedMedicine
    ? selectedMedicine.details.dose * getDailyFrequency(selectedMedicine.details.frequency) * selectedMedicine.details.duration
    : 0;

  return (
    <div className="min-h-screen bg-white text-[#172B55]">
      <div className="mx-6 mt-6 rounded-[20px] border border-[#E5EBF2] bg-[#FAFBFD] px-5 py-4 md:mx-10">
        <label className="block text-[10px] font-semibold uppercase tracking-[.14em] text-[#71829D]">Patient appointment</label>
        <select value={appointmentId} onChange={(event) => { setAppointmentId(event.target.value); setError(""); setSuccess(""); }} className="mt-2 h-11 w-full max-w-xl rounded-xl border border-[#E1E7EF] bg-white px-3 text-[12px] text-[#172B55] outline-none">
          <option value="">Select patient and appointment</option>
          {appointments.map((appointment) => <option key={appointment._id} value={appointment._id}>{appointment.userId?.name || "Patient"} · {appointment.clinicId?.clinicName || "Clinic"} · {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString("en-IN") : ""}</option>)}
        </select>
      </div>
      <div className="flex min-h-screen">

        <main className="min-w-0 flex-1">
          <div className="grid min-h-[50%] grid-cols-1 xl:grid-cols-[minmax(390px,0.88fr)_minmax(560px,1.12fr)]">
            <section className="border-b border-[#F0F3F7] px-6 py-8 md:px-10 xl:border-b-0 xl:border-r">
              <div className="max-w-[620px]">
                <div>
                  <h3 className="text-[24px] font-semibold tracking-[-0.04em] text-[#172B55]">Medicine</h3>
                  <p className="mt-1 text-[13px] text-[#8C9BB3]">Search and select medicine</p>
                </div>

                <div className="relative mt-7">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[#9AABC3]" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search medicine name..." className="h-[52px] w-full rounded-full bg-[#F6F8FB] pl-12 pr-11 text-[13px] text-[#172B55] outline-none placeholder:text-[#A7B3C4] focus:bg-[#F2F6FC]" />
                  {query && <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AABC3] transition hover:text-[#172B55]"><FiX /></button>}
                </div>

                {addedMedicines.length === 0 ? (
                  <div className="mt-6 flex min-h-[290px] items-center justify-center rounded-[26px] bg-[#FBFCFE]">
                    <div className="text-center">
                      <p className="text-[17px] font-semibold text-[#7D8DA7]">No medicine added</p>
                      <p className="mt-2 max-w-[250px] text-[12px] leading-5 text-[#AFB9C8]">Search for a medicine above and select it to start the prescription.</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {addedMedicines.map((medicine) => (
                      <button key={medicine.id} onClick={() => setSelectedId(medicine.id)} className={`group flex w-full items-center gap-4 rounded-full px-4 py-3 text-left transition duration-300 ${selectedId === medicine.id ? "scale-[1.015] bg-[#F2F6FD]" : "bg-white hover:bg-[#FAFBFD]"}`}>
                        <div className={`relative flex h-[58px] w-[118px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/9 bg-white ${medicine.tint} mr-2`}>
                          <img src={medicine.image} alt="" className={medicine.css} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold text-[#203A70]">{medicine.name}</p>
                          <p className="mt-1 text-[12px] text-[#8A9AB4]">{medicine.strength} · {medicine.form}</p>
                        </div>
                        <FiChevronRight className={`mr-3 shrink-0 text-[17px] transition ${selectedId === medicine.id ? "translate-x-1 text-[#4E79C7]" : "text-[#A4B0C1]"}`} />
                      </button>
                    ))}
                  </div>
                )}

                {query && (
                  <div className="mt-5">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A2ADBD]">Search results</p>
                    <div className="space-y-2">
                      {filteredMedicines.map((medicine) => (
                        <button key={medicine.id} onClick={() => addMedicine(medicine)} className="group flex w-full items-center gap-4 rounded-full bg-[#FBFCFE] px-8 py-3 text-left transition hover:bg-[#F3F6FB]">
                          {/* <div className={`relative flex h-[54px] w-[102px] shrink-0 items-center justify-center overflow-hidden rounded-full ${medicine.tint}`}>
                            <img src={medicine.image} alt="" className={medicine.css} />
                          </div> */}
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-[#203A70]">{medicine.name}</p>
                            <p className="mt-0.5 text-[11px] text-[#8A9AB4]">{medicine.strength} · {medicine.form}</p>
                          </div>
                          <FiPlus className="text-[#7793C2] transition group-hover:scale-110" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="px-6 py-8 md:px-10">
              {!selectedMedicine ? (
                <div className="flex min-h-[520px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-[20px] font-semibold tracking-[-0.03em] text-[#A0ADBF]">No medicine selected</p>
                    <p className="mt-2 text-[12px] text-[#B5BFCD]">Select a medicine from the left to add its prescription details.</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-[760px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.17em] text-[#9AA8BB]">Selected medicine</p>
                      <h3 className="mt-1 text-[23px] font-semibold tracking-[-0.04em] text-[#172B55]">{selectedMedicine.name}</h3>
                      <p className="mt-1 text-[12px] text-[#8B9AB1]">{selectedMedicine.strength} · {selectedMedicine.form}</p>
                    </div>
                    <button onClick={() => removeMedicine(selectedMedicine.id)} className="text-[11px] font-medium text-[#A2AFC0] transition hover:text-[#D65E6B]">Remove</button>
                  </div>

                  <div className="mt-8 grid gap-8 md:grid-cols-2">
                    <OptionGroup title="Dose">
                      <div className="flex h-[54px] overflow-hidden rounded-full bg-[#F7F9FC]">
                        <input type="number" min="1" value={selectedMedicine.details.dose} onChange={(e) => updateDetails("dose", Math.max(1, Number(e.target.value)))} className="w-[72px] bg-transparent px-5 text-[15px] font-semibold text-[#172B55] outline-none" />
                        <div className="flex flex-1 items-center border-l border-[#E8EDF4] px-4 text-[12px] text-[#637895]">{selectedMedicine.details.unit}</div>
                      </div>
                    </OptionGroup>

                    <OptionGroup title="How often">
                      <div className="flex flex-wrap gap-2">
                        {["Once a day", "2 times a day", "3 times a day", "4 times a day"].map((option) => (
                          <Pill key={option} active={selectedMedicine.details.frequency === option} onClick={() => updateDetails("frequency", option)}>{option}</Pill>
                        ))}
                      </div>
                    </OptionGroup>

                    <OptionGroup title="Schedule">
                      <div className="flex flex-wrap gap-2">
                        {["Every day", "Every other day", "Custom"].map((option) => (
                          <Pill key={option} active={selectedMedicine.details.schedule === option} onClick={() => updateDetails("schedule", option)}>{option}</Pill>
                        ))}
                      </div>
                    </OptionGroup>

                    <OptionGroup title="When">
                      <div className="flex flex-wrap gap-2">
                        {["Morning", "Afternoon", "Night"].map((option) => (
                          <Pill key={option} active={selectedMedicine.details.time === option} onClick={() => updateDetails("time", option)}>{option}</Pill>
                        ))}
                      </div>
                    </OptionGroup>

                    <OptionGroup title="Food">
                      <div className="flex flex-wrap gap-2">
                        {["Before food", "With food", "After food", "Empty stomach"].map((option) => (
                          <Pill key={option} active={selectedMedicine.details.food === option} onClick={() => updateDetails("food", option)}>{option}</Pill>
                        ))}
                      </div>
                    </OptionGroup>

                    <OptionGroup title="Course duration">
  <div className="flex h-[150px] w-[150px] flex-col items-center justify-center overflow-hidden rounded-[26px] border border-[#E8EDF4] bg-white">
    <div className="flex items-center gap-3">
      <button
        onClick={() => updateDetails("duration", Math.max(1, selectedMedicine.details.duration - 1))}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17213F] text-white transition hover:scale-105"
      >
        <FiMinus />
      </button>

      <div className="w-[45px] text-center">
        <p className="text-[40px] font-semibold leading-none tracking-[-0.06em] text-[#172B55]">
          {selectedMedicine.details.duration}
        </p>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6D83A5]">
          Days
        </p>
      </div>

      <button
        onClick={() => updateDetails("duration", selectedMedicine.details.duration + 1)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17213F] text-white transition hover:scale-105"
      >
        <FiPlus />
      </button>
    </div>
  </div>
</OptionGroup>
                  </div>

                  <div className="mt-9 flex items-center justify-between rounded-full bg-[#F8FAFD] px-10 py-4 relative overflow-hidden border border-black/7">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#9BA9BC]">Total quantity</p>
                      <p className="mt-1 text-[13px] text-[#6F809A]">{selectedMedicine.details.dose} {selectedMedicine.details.unit.toLowerCase()} × {getDailyFrequency(selectedMedicine.details.frequency)} × {selectedMedicine.details.duration} days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[28px] font-semibold leading-none tracking-[-0.05em] text-[#172B55]">{quantity}</p>
                      <p className="mt-1 text-[10px] text-[#8A9AB0]">{selectedMedicine.details.unit.toLowerCase()}s</p>
                      
                    </div>
                    <img src = {selectedMedicine.details.image} className = "h-[130px] absolute right-[90px] rotate-7 top-0 " />
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
      <CreatePrescriptionDetails medicines={addedMedicines} onCreate={createPrescription} saving={saving} error={error} success={success} />
    </div>
  );
}

function getDailyFrequency(value) {
  if (value === "Once a day") return 1;
  if (value === "2 times a day") return 2;
  if (value === "3 times a day") return 3;
  if (value === "4 times a day") return 4;
  return 1;
}

function OptionGroup({ title, children }) {
  return (
    <div>
      <p className="mb-3 text-[12px] font-semibold text-[#5E718F]">{title}</p>
      {children}
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-3 text-[9px] font-medium transition duration-200 border border-black/5 ${active ? "bg-[#EAF2FF] text-[#3970C7]" : "bg-[#F7F9FC] text-[#71829D] hover:bg-[#F0F4FA]"}`}>{children}</button>;
}

export default Prescriptions;
