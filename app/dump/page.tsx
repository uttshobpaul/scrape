"use client";

import { useState } from "react";

export default function DumpWastePage() {
  const [wasteType, setWasteType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [imageName, setImageName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const wasteTypes = [
    ["🛋️", "Furniture"],
    ["🧱", "Construction"],
    ["📦", "Household"],
    ["💻", "E-Waste"],
    ["🌿", "Garden Waste"],
    ["🗑️", "Mixed Waste"],
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* NAVBAR */}
      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

          <a href="/" className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-xl text-white">
              ♻
            </div>

            <div>
              <h1 className="text-lg font-bold">
                Scrap<span className="text-green-600">Saathi</span>
              </h1>

              <p className="text-[10px] text-slate-500">
                Smart Waste. Better Future.
              </p>
            </div>

          </a>

          <a
            href="/customer"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            ← Dashboard
          </a>

        </div>

      </header>


      {/* PAGE */}
      <div className="mx-auto max-w-5xl px-5 py-10">

        {/* HEADER */}
        <div className="mb-8">

          <p className="text-sm font-semibold text-blue-600">
            WASTE DISPOSAL
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Get your waste picked up
          </h2>

          <p className="mt-2 max-w-2xl text-slate-500">
            Don't have time to dispose of unwanted waste?
            Schedule a doorstep pickup at a convenient time.
          </p>

        </div>


        <div className="grid gap-6 lg:grid-cols-3">

          {/* FORM */}
          <div className="space-y-6 lg:col-span-2">

            {/* WASTE TYPE */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h3 className="text-lg font-bold">
                1. What do you want to dispose?
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Select the type of waste.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

                {wasteTypes.map(([icon, name]) => (

                  <button
                    key={name}
                    type="button"
                    onClick={() => setWasteType(name)}
                    className={`rounded-xl border p-4 text-left transition ${
                      wasteType === name
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >

                    <div className="text-2xl">
                      {icon}
                    </div>

                    <p className="mt-2 text-sm font-semibold">
                      {name}
                    </p>

                  </button>

                ))}

              </div>

            </section>


            {/* PHOTO */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h3 className="text-lg font-bold">
                2. Add a photo
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Upload a photo so the pickup partner can estimate the
                size of the waste.
              </p>

              <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-blue-400 hover:bg-blue-50">

                <div className="text-4xl">
                  📷
                </div>

                <p className="mt-3 font-semibold">
                  {imageName || "Click to upload waste photo"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  JPG, PNG or WEBP
                </p>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {

                    const file = e.target.files?.[0];

                    if (file) {
                      setImageName(file.name);
                    }

                  }}
                />

              </label>

            </section>


            {/* SIZE */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h3 className="text-lg font-bold">
                3. Approximate waste size
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                This helps us estimate the pickup charge.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3">

                <button
                  type="button"
                  className="rounded-xl border border-slate-200 p-4 text-center hover:border-blue-300"
                >
                  <p className="text-2xl">
                    📦
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    Small
                  </p>

                  <p className="text-xs text-slate-400">
                    1–2 bags
                  </p>
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-slate-200 p-4 text-center hover:border-blue-300"
                >
                  <p className="text-2xl">
                    📦📦
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    Medium
                  </p>

                  <p className="text-xs text-slate-400">
                    3–5 bags
                  </p>
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-slate-200 p-4 text-center hover:border-blue-300"
                >
                  <p className="text-2xl">
                    🚛
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    Large
                  </p>

                  <p className="text-xs text-slate-400">
                    Vehicle needed
                  </p>
                </button>

              </div>

            </section>


            {/* SCHEDULE */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h3 className="text-lg font-bold">
                4. Choose pickup time
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Pick a time when someone will be available at home.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Time
                  </label>

                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select time
                    </option>

                    <option>
                      8:00 AM - 10:00 AM
                    </option>

                    <option>
                      10:00 AM - 12:00 PM
                    </option>

                    <option>
                      12:00 PM - 2:00 PM
                    </option>

                    <option>
                      2:00 PM - 4:00 PM
                    </option>

                    <option>
                      4:00 PM - 6:00 PM
                    </option>

                    <option>
                      6:00 PM - 8:00 PM
                    </option>

                  </select>

                </div>

              </div>

            </section>


            {/* ADDRESS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <div className="flex items-start justify-between">

                <div>

                  <h3 className="text-lg font-bold">
                    5. Pickup address
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Where should the pickup partner come?
                  </p>

                </div>

                <span className="text-2xl">
                  📍
                </span>

              </div>

              <textarea
                rows={4}
                placeholder="Enter your complete address..."
                className="mt-5 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                className="mt-3 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold hover:bg-slate-200"
              >
                📍 Use my current location
              </button>

            </section>

          </div>


          {/* SUMMARY */}
          <aside>

            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-bold">
                Disposal summary
              </h3>

              <div className="mt-5 space-y-4">

                <SummaryRow
                  label="Waste type"
                  value={wasteType || "Not selected"}
                />

                <SummaryRow
                  label="Pickup date"
                  value={date || "Not selected"}
                />

                <SummaryRow
                  label="Pickup time"
                  value={time || "Not selected"}
                />

              </div>


              <div className="my-6 border-t border-slate-200" />


              {/* CHARGE */}
              <div className="rounded-xl bg-blue-50 p-4">

                <p className="text-xs text-blue-700">
                  Estimated service charge
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-700">
                  ₹49
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-600">
                  Final charge may change depending on waste quantity
                  and vehicle requirement.
                </p>

              </div>


              {!submitted ? (

                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="mt-5 w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Request Pickup →
                </button>

              ) : (

                <div className="mt-5 rounded-xl bg-green-50 p-4 text-center">

                  <div className="text-3xl">
                    ✅
                  </div>

                  <p className="mt-2 font-bold text-green-700">
                    Pickup requested!
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    A pickup partner will contact you shortly.
                  </p>

                </div>

              )}


              <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                Payment can be made after the pickup is completed.
              </p>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}


/* SUMMARY ROW */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold">
        {value}
      </span>

    </div>
  );
}