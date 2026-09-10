"use client";

import { useState } from "react";

const materials = [
  {
    name: "Iron",
    icon: "🔩",
    rate: 38,
    unit: "kg",
  },
  {
    name: "Copper",
    icon: "🔶",
    rate: 720,
    unit: "kg",
  },
  {
    name: "Aluminium",
    icon: "🥫",
    rate: 185,
    unit: "kg",
  },
  {
    name: "Newspaper",
    icon: "📰",
    rate: 28,
    unit: "kg",
  },
  {
    name: "Cardboard",
    icon: "📦",
    rate: 15,
    unit: "kg",
  },
  {
    name: "E-Waste",
    icon: "💻",
    rate: 120,
    unit: "kg",
  },
];

export default function SellScrapPage() {
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [imageName, setImageName] = useState("");
const [address, setAddress] = useState("");
const [locationStatus, setLocationStatus] = useState("");
const [coordinates, setCoordinates] = useState<{
  latitude: number;
  longitude: number;
} | null>(null);
const [submitted, setSubmitted] = useState(false);
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    setLocationStatus("Location is not supported by this browser.");
    return;
  }

  setLocationStatus("Detecting your location...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setCoordinates({
        latitude,
        longitude,
      });

      setLocationStatus("Location detected successfully.");
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        setLocationStatus(
          "Location permission was denied. Please allow location access."
        );
      } else {
        setLocationStatus(
          "Unable to detect location. Please try again."
        );
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
};

  const selected = materials.find(
    (material) => material.name === selectedMaterial
  );

  const estimatedValue =
    selected && weight
      ? Math.round(selected.rate * Number(weight))
      : 0;

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

      <div className="mx-auto max-w-6xl px-5 py-10">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-bold text-green-600">
            SELL YOUR SCRAP
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Turn your scrap into cash
          </h2>

          <p className="mt-2 max-w-2xl text-slate-500">
            Tell us what you have. We'll help you find a nearby
            kabadiwala who can pick it up from your home.
          </p>

        </div>


        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT FORM */}

          <div className="space-y-6 lg:col-span-2">


            {/* MATERIAL */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <div>

                <h3 className="text-lg font-bold">
                  1. What do you want to sell?
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Select the type of scrap you have.
                </p>

              </div>


              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

                {materials.map((material) => (

                  <button
                    key={material.name}
                    type="button"
                    onClick={() =>
                      setSelectedMaterial(material.name)
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedMaterial === material.name
                        ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                        : "border-slate-200 hover:border-green-300"
                    }`}
                  >

                    <div className="text-3xl">
                      {material.icon}
                    </div>

                    <p className="mt-3 text-sm font-bold">
                      {material.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      ~₹{material.rate}/{material.unit}
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
                A photo helps the kabadiwala understand what you have.
              </p>


              <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-green-400 hover:bg-green-50">

                <div className="text-4xl">
                  📷
                </div>

                <p className="mt-3 font-semibold">
                  {imageName || "Upload scrap photo"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  JPG, PNG or WEBP
                </p>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {

                    const file = event.target.files?.[0];

                    if (file) {
                      setImageName(file.name);
                    }

                  }}
                />

              </label>

            </section>


            {/* WEIGHT */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h3 className="text-lg font-bold">
                3. Approximate weight
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Don't worry if you don't know the exact weight.
              </p>


              <div className="mt-5 flex max-w-sm items-center gap-3">

                <input
                  type="number"
                  min="0"
                  placeholder="Enter weight"
                  value={weight}
                  onChange={(event) =>
                    setWeight(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

                <span className="rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-600">
                  kg
                </span>

              </div>


              <div className="mt-4 flex flex-wrap gap-2">

                {[5, 10, 25, 50].map((value) => (

                  <button
                    key={value}
                    type="button"
                    onClick={() => setWeight(String(value))}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold hover:border-green-300 hover:bg-green-50"
                  >
                    {value} kg
                  </button>

                ))}

              </div>

            </section>


            {/* PICKUP */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h3 className="text-lg font-bold">
                4. Choose pickup time
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Choose a time when you will be available at home.
              </p>


              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Pickup date
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Preferred time
                  </label>

                  <select
                    value={time}
                    onChange={(event) =>
                      setTime(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
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
                    5. Pickup location
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Where should the kabadiwala come?
                  </p>

                </div>

                <div className="text-2xl">
                  📍
                </div>

              </div>


              <textarea
                rows={4}
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="Enter your complete address..."
                className="mt-5 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />


<button
  type="button"
  onClick={getCurrentLocation}
  className="mt-3 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold transition hover:bg-green-50 hover:text-green-700"
>
  📍 Use my current location
</button>

{locationStatus && (
  <div
    className={`mt-3 rounded-xl p-3 text-sm ${
      coordinates
        ? "bg-green-50 text-green-700"
        : "bg-slate-50 text-slate-500"
    }`}
  >
    {coordinates ? "✓ " : "📍 "}
    {locationStatus}
  </div>
)}

{coordinates && (
  <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
    <p>
      Latitude:{" "}
      <span className="font-semibold text-slate-700">
        {coordinates.latitude.toFixed(6)}
      </span>
    </p>

    <p className="mt-1">
      Longitude:{" "}
      <span className="font-semibold text-slate-700">
        {coordinates.longitude.toFixed(6)}
      </span>
    </p>
  </div>
)}

            </section>

          </div>


          {/* SUMMARY */}

          <aside>

            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="text-lg font-bold">
                Scrap summary
              </h3>


              {/* MATERIAL */}

              <div className="mt-5 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
                  {selected?.icon || "♻️"}
                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    MATERIAL
                  </p>

                  <p className="font-bold">
                    {selectedMaterial || "Not selected"}
                  </p>

                </div>

              </div>


              <div className="my-5 border-t border-slate-200" />


              <div className="space-y-4">

                <SummaryRow
                  label="Weight"
                  value={weight ? `${weight} kg` : "Not entered"}
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


              {/* ESTIMATE */}

              <div className="my-6 rounded-2xl bg-green-50 p-5">

                <p className="text-xs font-semibold text-green-700">
                  ESTIMATED SCRAP VALUE
                </p>

                <p className="mt-1 text-3xl font-bold text-green-700">
                  ₹{estimatedValue.toLocaleString("en-IN")}
                </p>

                {selected && (
                  <p className="mt-1 text-xs text-green-600">
                    Based on approximately ₹{selected.rate}/kg
                  </p>
                )}

                {!selected && (
                  <p className="mt-1 text-xs text-green-600">
                    Select material and weight to calculate.
                  </p>
                )}

              </div>


              {/* REQUEST BUTTON */}

              {!submitted ? (

                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="w-full rounded-xl bg-green-600 py-3.5 font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
                >
                  Find Kabadiwala →
                </button>

              ) : (

                <div className="rounded-2xl bg-green-50 p-5 text-center">

                  <div className="text-4xl">
                    🎉
                  </div>

                  <p className="mt-2 font-bold text-green-700">
                    Request created!
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-600">
                    We're finding a suitable kabadiwala near your
                    location.
                  </p>

                </div>

              )}


              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                Final price will be confirmed after the scrap is
                physically weighed.
              </p>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}


/* =========================================
   SUMMARY ROW
========================================= */

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