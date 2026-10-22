import { useMemo, useState } from "react";

const slots = ["08:00 AM", "12:00 PM", "04:00 PM", "08:00 PM"];

export default function FeverChartEditor({ value = {}, onSave, saving = false }) {
  const [chart, setChart] = useState(() => ({ ...value }));
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  }), []);

  const keyFor = (date, slot) => `${date.toISOString().slice(0, 10)}-${slot}`;
  const update = (key, next) => setChart((current) => ({ ...current, [key]: next }));

  return (
    <div className="rounded-2xl border border-[#E5EBF2] bg-[#F8FAFD] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div><p className="text-[10px] font-semibold uppercase tracking-[.8px] text-[#526785]">Fever chart</p><p className="mt-1 text-[10px] text-[#8B9AB0]">Record temperature in °F.</p></div>
        <button type="button" disabled={saving} onClick={() => onSave(chart)} className="rounded-full bg-[#17213F] px-4 py-2 text-[9px] font-semibold uppercase tracking-[.6px] text-white disabled:opacity-50">{saving ? "Saving..." : "Save chart"}</button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {days.map((date) => <div key={date.toISOString()} className="rounded-xl bg-white p-2"><p className="mb-2 text-center text-[9px] font-semibold text-[#526785]">{date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}</p>{slots.map((slot) => { const key = keyFor(date, slot); return <input key={key} type="number" step="0.1" placeholder={slot} value={chart[key] ?? ""} onChange={(event) => update(key, event.target.value === "" ? "" : Number(event.target.value))} className="mb-1 h-8 w-full rounded-lg border border-[#E5EBF2] px-2 text-[9px] text-[#17213F] outline-none last:mb-0" />; })}</div>)}
      </div>
    </div>
  );
}
