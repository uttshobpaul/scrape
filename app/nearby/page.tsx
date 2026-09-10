"use client";

import { useState } from "react";

const kabadiwalas = [
  {
    id: 1,
    name: "Maa Tara Scrap Center",
    distance: "1.2 km",
    rating: "4.8",
    reviews: "124",
    phone: "+91 98765 43210",
    location: "Sector V, Salt Lake",
    materials: ["Iron", "Copper", "Aluminium", "Paper"],
    copperRate: "₹700/kg",
    pickup: true,
    verified: true,
    open: true,
    initials: "MT",
  },
  {
    id: 2,
    name: "Green Scrap Hub",
    distance: "2.4 km",
    rating: "4.7",
    reviews: "89",
    phone: "+91 91234 56789",
    location: "New Town",
    materials: ["Iron", "Copper", "E-Waste", "Plastic"],
    copperRate: "₹690/kg",
    pickup: true,
    verified: true,
    open: true,
    initials: "GS",
  },
  {
    id: 3,
    name: "Bapi Scrap Collection",
    distance: "3.8 km",
    rating: "4.5",
    reviews: "67",
    phone: "+91 99887 76655",
    location: "Dum Dum",
    materials: ["Iron", "Aluminium", "Paper", "Cardboard"],
    copperRate: "₹680/kg",
    pickup: true,
    verified: true,
    open: false,
    initials: "BS",
  },
  {
    id: 4,
    name: "Raju Kabadiwala",
    distance: "4.6 km",
    rating: "4.6",
    reviews: "51",
    phone: "+91 90000 12345",
    location: "Rajarhat",
    materials: ["Iron", "Copper", "Plastic", "E-Waste"],
    copperRate: "₹675/kg",
    pickup: false,
    verified: true,
    open: true,
    initials: "RK",
  },
];

export default function NearbyPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pickupOnly, setPickupOnly] = useState(false);
  const [sortBy, setSortBy] = useState("distance");

  const filteredKabadiwalas = kabadiwalas
    .filter((person) => (pickupOnly ? person.pickup : true))
    .sort((a, b) => {
      if (sortBy === "rating") {
        return Number(b.rating) - Number(a.rating);
      }

      return (
        parseFloat(a.distance) -
        parseFloat(b.distance)
      );
    });

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
            href="/sell"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            ← Back to Sell
          </a>

        </div>

      </header>


      {/* MAIN */}

      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="text-sm font-bold text-green-600">
              NEARBY KABADIWALAS
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Choose your scrap partner
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">

              <span>
                📍 Your current location
              </span>

              <span className="text-slate-300">
                •
              </span>

              <span>
                {filteredKabadiwalas.length} partners found
              </span>

            </div>

          </div>


          {/* LOCATION STATUS */}

          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3">

            <p className="text-xs font-semibold text-green-600">
              LOCATION DETECTED
            </p>

            <p className="mt-1 text-sm font-bold text-green-800">
              📍 Within your area
            </p>

          </div>

        </div>


        {/* FILTER BAR */}

        <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">

            <button
              onClick={() => setPickupOnly(!pickupOnly)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                pickupOnly
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              🚚 Pickup available
            </button>

            <span className="hidden text-sm text-slate-400 sm:inline">
              Filter
            </span>

          </div>


          <div className="flex items-center gap-2">

            <span className="text-sm text-slate-500">
              Sort:
            </span>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              <option value="distance">
                Nearest
              </option>

              <option value="rating">
                Highest rated
              </option>

            </select>

          </div>

        </div>


        {/* CONTENT */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* KABADIWALA LIST */}

          <div className="space-y-4 lg:col-span-2">

            {filteredKabadiwalas.map((person) => (

              <div
                key={person.id}
                className={`rounded-2xl border bg-white p-5 transition ${
                  selectedId === person.id
                    ? "border-green-500 ring-2 ring-green-100"
                    : "border-slate-200 hover:border-green-300 hover:shadow-md"
                }`}
              >

                {/* TOP */}

                <div className="flex gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 font-bold text-green-700">
                    {person.initials}
                  </div>


                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-bold">
                        {person.name}
                      </h3>

                      {person.verified && (
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                          ✓ VERIFIED
                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      📍 {person.location}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">

                      <span className="font-bold text-yellow-600">
                        ⭐ {person.rating}
                      </span>

                      <span className="text-slate-400">
                        ({person.reviews} reviews)
                      </span>

                      <span className="font-semibold text-green-600">
                        📍 {person.distance}
                      </span>

                    </div>

                  </div>


                  <div className="text-right">

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        person.open
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {person.open ? "● OPEN" : "CLOSED"}
                    </span>

                  </div>

                </div>


                {/* RATE */}

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-green-50 p-4">

                    <p className="text-[10px] font-bold uppercase tracking-wide text-green-600">
                      Copper buying rate
                    </p>

                    <p className="mt-1 text-xl font-bold text-green-700">
                      {person.copperRate}
                    </p>

                  </div>


                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Materials accepted
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {person.materials.slice(0, 3).join(" • ")}
                    </p>

                  </div>

                </div>


                {/* MATERIAL TAGS */}

                <div className="mt-4 flex flex-wrap gap-2">

                  {person.materials.map((material) => (

                    <span
                      key={material}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                    >
                      ♻️ {material}
                    </span>

                  ))}

                </div>


                {/* PICKUP */}

                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                  <div className="flex items-center gap-2">

                    <span className="text-lg">
                      {person.pickup ? "🚚" : "🏪"}
                    </span>

                    <div>

                      <p className="text-sm font-semibold">
                        {person.pickup
                          ? "Home pickup available"
                          : "Visit collection center"}
                      </p>

                      <p className="text-xs text-slate-400">
                        {person.pickup
                          ? "They can collect scrap from your address"
                          : "You can visit their scrap center"}
                      </p>

                    </div>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                  <a
                    href={`tel:${person.phone}`}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold hover:bg-slate-50"
                  >
                    📞 Call
                  </a>


                  <button
                    onClick={() => setSelectedId(person.id)}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white ${
                      selectedId === person.id
                        ? "bg-green-400"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {selectedId === person.id
                      ? "✓ Selected"
                      : "Select Kabadiwala"}
                  </button>

                </div>

              </div>

            ))}


            {filteredKabadiwalas.length === 0 && (

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

                <div className="text-4xl">
                  🚚
                </div>

                <h3 className="mt-3 font-bold">
                  No pickup partners found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try turning off the pickup filter.
                </p>

              </div>

            )}

          </div>


          {/* MAP PLACEHOLDER */}

          <aside>

            <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white">

              <div className="border-b border-slate-200 p-5">

                <h3 className="font-bold">
                  Nearby area
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Your location and available partners
                </p>

              </div>


              {/* MAP */}

              <div className="relative h-[430px] overflow-hidden bg-green-50">

                {/* Decorative map grid */}

                <div className="absolute inset-0 opacity-40">

                  <div className="absolute left-[20%] top-0 h-full w-px bg-green-200" />

                  <div className="absolute left-[45%] top-0 h-full w-px rotate-12 bg-green-200" />

                  <div className="absolute left-[70%] top-0 h-full w-px -rotate-12 bg-green-200" />

                  <div className="absolute top-[25%] left-0 h-px w-full rotate-6 bg-green-200" />

                  <div className="absolute top-[55%] left-0 h-px w-full -rotate-3 bg-green-200" />

                  <div className="absolute top-[80%] left-0 h-px w-full rotate-3 bg-green-200" />

                </div>


                {/* Roads */}

                <div className="absolute left-0 top-[45%] h-3 w-full rotate-6 bg-white" />

                <div className="absolute left-[55%] top-0 h-full w-3 -rotate-12 bg-white" />


                {/* CUSTOMER */}

                <div className="absolute left-[47%] top-[48%]">

                  <div className="relative">

                    <div className="absolute -inset-3 animate-ping rounded-full bg-blue-300 opacity-30" />

                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-lg shadow-lg">
                      📍
                    </div>

                  </div>

                  <div className="mt-2 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-center text-[10px] font-bold shadow">
                    You are here
                  </div>

                </div>


                {/* KABADIWALA MARKERS */}

                {filteredKabadiwalas.map((person, index) => {

                  const positions = [
                    "left-[18%] top-[25%]",
                    "left-[75%] top-[20%]",
                    "left-[25%] top-[72%]",
                    "left-[78%] top-[68%]",
                  ];

                  return (

                    <button
                      key={person.id}
                      onClick={() => setSelectedId(person.id)}
                      className={`absolute ${positions[index]} flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-sm shadow-lg transition hover:scale-110 ${
                        selectedId === person.id
                          ? "bg-green-700 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      ♻
                    </button>

                  );

                })}


                {/* MAP LABEL */}

                <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-2 shadow">

                  <p className="text-[10px] font-bold text-slate-500">
                    SEARCH RADIUS
                  </p>

                  <p className="text-sm font-bold">
                    Within 10 km
                  </p>

                </div>

              </div>


              {/* MAP FOOTER */}

              <div className="border-t border-slate-200 p-4">

                <div className="flex items-center gap-2 text-xs text-slate-500">

                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />

                  Your location

                  <span className="ml-3 h-2.5 w-2.5 rounded-full bg-green-600" />

                  Kabadiwala

                </div>

              </div>

            </div>

          </aside>

        </div>


        {/* SELECTED PARTNER */}

        {selectedId && (

          <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-green-200 bg-white p-4 shadow-2xl">

            {(() => {

              const selected = kabadiwalas.find(
                (person) => person.id === selectedId
              );

              if (!selected) return null;

              return (

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 font-bold text-green-700">
                    {selected.initials}
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-xs text-green-600">
                      SELECTED PARTNER
                    </p>

                    <p className="truncate font-bold">
                      {selected.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {selected.distance} away • {selected.copperRate}
                    </p>

                  </div>

                  <button
                    onClick={() => {
                      alert(
                        `Pickup request sent to ${selected.name}!`
                      );
                    }}
                    className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700"
                  >
                    Request Pickup
                  </button>

                </div>

              );

            })()}

          </div>

        )}

      </div>

    </main>
  );
}