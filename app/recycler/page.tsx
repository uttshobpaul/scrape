"use client";

import { useState } from "react";

type MaterialLot = {
  id: number;
  material: string;
  icon: string;
  quantity: string;
  seller: string;
  location: string;
  distance: string;
  price: string;
  total: string;
  condition: string;
  posted: string;
  verified: boolean;
  status: "Available" | "Requested";
};

const initialLots: MaterialLot[] = [
  {
    id: 1,
    material: "Copper",
    icon: "🔶",
    quantity: "82 kg",
    seller: "Maa Tara Scrap Center",
    location: "Salt Lake",
    distance: "3.2 km",
    price: "₹700",
    total: "₹57,400",
    condition: "Good",
    posted: "20 min ago",
    verified: true,
    status: "Available",
  },
  {
    id: 2,
    material: "Aluminium",
    icon: "🥫",
    quantity: "95 kg",
    seller: "Green Scrap Hub",
    location: "New Town",
    distance: "5.1 km",
    price: "₹180",
    total: "₹17,100",
    condition: "Mixed",
    posted: "45 min ago",
    verified: true,
    status: "Available",
  },
  {
    id: 3,
    material: "E-Waste",
    icon: "💻",
    quantity: "45 kg",
    seller: "Raju Kabadiwala",
    location: "Rajarhat",
    distance: "6.4 km",
    price: "₹120",
    total: "₹5,400",
    condition: "Sorted",
    posted: "1 hour ago",
    verified: true,
    status: "Available",
  },
  {
    id: 4,
    material: "Iron",
    icon: "🔩",
    quantity: "340 kg",
    seller: "Bapi Scrap Collection",
    location: "Dum Dum",
    distance: "8.2 km",
    price: "₹38",
    total: "₹12,920",
    condition: "Mixed",
    posted: "2 hours ago",
    verified: true,
    status: "Available",
  },
  {
    id: 5,
    material: "Copper Cable",
    icon: "🔌",
    quantity: "120 kg",
    seller: "City Scrap Point",
    location: "Howrah",
    distance: "11.5 km",
    price: "₹680",
    total: "₹81,600",
    condition: "Sorted",
    posted: "3 hours ago",
    verified: true,
    status: "Available",
  },
];

export default function RecyclerPage() {
  const [lots, setLots] = useState<MaterialLot[]>(initialLots);

  const [activeTab, setActiveTab] = useState<
    "marketplace" | "requirements" | "purchases"
  >("marketplace");

  const [selectedMaterial, setSelectedMaterial] = useState("All");

  const [selectedLot, setSelectedLot] =
    useState<MaterialLot | null>(null);

  const [notification, setNotification] = useState("");

  const materials = [
    "All",
    "Copper",
    "Aluminium",
    "E-Waste",
    "Iron",
    "Copper Cable",
  ];

  const filteredLots =
    selectedMaterial === "All"
      ? lots
      : lots.filter(
          (lot) => lot.material === selectedMaterial
        );

  const showNotification = (message: string) => {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  const requestPurchase = (id: number) => {
    const lot = lots.find((item) => item.id === id);

    if (!lot) return;

    if (lot.status === "Requested") {
      return;
    }

    setLots((currentLots) =>
      currentLots.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Requested",
            }
          : item
      )
    );

    showNotification(
      `Purchase request sent to ${lot.seller}.`
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= NAVBAR ================= */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

          <a
            href="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-xl text-white">
              ♻
            </div>

            <div>
              <h1 className="text-lg font-bold">
                Scrap
                <span className="text-green-600">
                  Saathi
                </span>
              </h1>

              <p className="text-[10px] text-slate-500">
                Recycler Partner
              </p>
            </div>

          </a>

          <div className="flex items-center gap-3">

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              🔔
            </button>

            <div className="hidden items-center gap-2 sm:flex">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                ER
              </div>

              <div>

                <p className="text-sm font-bold">
                  EcoRecycle Industries
                </p>

                <p className="text-[10px] text-slate-400">
                  Verified Recycler
                </p>

              </div>

            </div>

          </div>

        </div>

      </header>


      {/* ================= NOTIFICATION ================= */}

      {notification && (
        <div className="fixed right-5 top-20 z-[100] rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          ✓ {notification}
        </div>
      )}


      {/* ================= MAIN ================= */}

      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* PAGE HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="text-sm font-bold text-blue-600">
              RECYCLER MARKETPLACE
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Find the materials you need
            </h2>

            <p className="mt-2 max-w-2xl text-slate-500">
              Buy recyclable materials directly from
              verified kabadiwalas near your facility.
            </p>

          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3">

            <p className="text-xs font-bold text-blue-600">
              YOUR FACILITY
            </p>

            <p className="mt-1 text-sm font-bold text-blue-900">
              📍 Kolkata Industrial Area
            </p>

          </div>

        </div>


        {/* ================= STATS ================= */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon="📦"
            title="Available Lots"
            value={String(lots.length)}
            subtitle="Near your facility"
          />

          <StatCard
            icon="🔶"
            title="Copper Available"
            value="202 kg"
            subtitle="Across 2 sellers"
          />

          <StatCard
            icon="🤝"
            title="Active Suppliers"
            value="18"
            subtitle="Verified partners"
          />

          <StatCard
            icon="♻️"
            title="This Month"
            value="2.4 T"
            subtitle="Materials purchased"
          />

        </div>


        {/* ================= TABS ================= */}

        <div className="mt-8 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">

          <TabButton
            active={activeTab === "marketplace"}
            onClick={() => setActiveTab("marketplace")}
            label="Material Marketplace"
          />

          <TabButton
            active={activeTab === "requirements"}
            onClick={() => setActiveTab("requirements")}
            label="My Requirements"
          />

          <TabButton
            active={activeTab === "purchases"}
            onClick={() => setActiveTab("purchases")}
            label="Purchase Requests"
          />

        </div>


        {/* ================= MARKETPLACE ================= */}

        {activeTab === "marketplace" && (

          <section className="mt-5">

            {/* FILTER */}

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">

              <div>

                <h3 className="font-bold">
                  Available Materials
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Fresh listings from kabadiwala partners
                </p>

              </div>

              <div className="flex gap-2 overflow-x-auto">

                {materials.map((material) => (

                  <button
                    key={material}
                    type="button"
                    onClick={() =>
                      setSelectedMaterial(material)
                    }
                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold ${
                      selectedMaterial === material
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {material}
                  </button>

                ))}

              </div>

            </div>


            {/* MATERIAL CARDS */}

            <div className="mt-5 grid gap-4 lg:grid-cols-2">

              {filteredLots.map((lot) => (

                <MaterialCard
                  key={lot.id}
                  lot={lot}
                  onPurchase={() =>
                    requestPurchase(lot.id)
                  }
                  onViewDetails={() =>
                    setSelectedLot(lot)
                  }
                />

              ))}

            </div>


            {filteredLots.length === 0 && (

              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

                <div className="text-4xl">
                  📦
                </div>

                <h3 className="mt-3 font-bold">
                  No materials found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try another material category.
                </p>

              </div>

            )}

          </section>

        )}


        {/* ================= REQUIREMENTS ================= */}

        {activeTab === "requirements" && (
          <Requirements />
        )}


        {/* ================= PURCHASES ================= */}

        {activeTab === "purchases" && (
          <Purchases lots={lots} />
        )}

      </div>


      {/* ================= DETAILS MODAL ================= */}

      {selectedLot && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
          onClick={() => setSelectedLot(null)}
        >

          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                  {selectedLot.icon}
                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-2xl font-bold">
                      {selectedLot.material}
                    </h2>

                    {selectedLot.verified && (

                      <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">
                        ✓ VERIFIED
                      </span>

                    )}

                  </div>

                  <p className="mt-1 text-sm text-slate-400">
                    Posted {selectedLot.posted}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => setSelectedLot(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>

            </div>


            {/* PRICE */}

            <div className="mt-6 rounded-2xl bg-blue-50 p-5">

              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                Asking Price
              </p>

              <div className="mt-1 flex items-end justify-between gap-3">

                <div>

                  <span className="text-3xl font-bold text-blue-700">
                    {selectedLot.price}
                  </span>

                  <span className="ml-1 text-sm text-blue-500">
                    / kg
                  </span>

                </div>

                <div className="text-right">

                  <p className="text-xs text-blue-500">
                    Total Value
                  </p>

                  <p className="font-bold text-blue-700">
                    {selectedLot.total}
                  </p>

                </div>

              </div>

            </div>


            {/* DETAILS */}

            <div className="mt-5 grid grid-cols-2 gap-3">

              <DetailBox
                label="Quantity"
                value={selectedLot.quantity}
              />

              <DetailBox
                label="Condition"
                value={selectedLot.condition}
              />

              <DetailBox
                label="Location"
                value={selectedLot.location}
              />

              <DetailBox
                label="Distance"
                value={selectedLot.distance}
              />

            </div>


            {/* SELLER */}

            <div className="mt-5 rounded-2xl border border-slate-200 p-4">

              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Seller
              </p>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="font-bold">
                    {selectedLot.seller}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    📍 {selectedLot.location}
                  </p>

                </div>

                <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold text-green-700">
                  ✓ VERIFIED
                </span>

              </div>

            </div>


            {/* ACTION BUTTONS */}

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={() => setSelectedLot(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold hover:bg-slate-50"
              >
                Close
              </button>

              <button
                type="button"
                disabled={
                  selectedLot.status === "Requested"
                }
                onClick={() => {

                  requestPurchase(
                    selectedLot.id
                  );

                  setSelectedLot(null);

                }}
                className={`flex-[1.5] rounded-xl px-4 py-3 text-sm font-bold text-white ${
                  selectedLot.status === "Requested"
                    ? "cursor-not-allowed bg-slate-300"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >

                {selectedLot.status === "Requested"
                  ? "✓ Request Sent"
                  : "Buy / Request Lot"}

              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}


/* =====================================================
   MATERIAL CARD
===================================================== */

function MaterialCard({
  lot,
  onPurchase,
  onViewDetails,
}: {
  lot: MaterialLot;
  onPurchase: () => void;
  onViewDetails: () => void;
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md">

      {/* TOP */}

      <div className="flex gap-4">

        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-4xl">
          {lot.icon}
        </div>


        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-2">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="font-bold">
                  {lot.material}
                </h3>

                {lot.verified && (

                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">
                    ✓ VERIFIED
                  </span>

                )}

              </div>

              <p className="mt-1 text-xs text-slate-400">
                Posted {lot.posted}
              </p>

            </div>


            <span
              className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                lot.status === "Available"
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {lot.status === "Available"
                ? "AVAILABLE"
                : "REQUESTED"}
            </span>

          </div>


          <div className="mt-3 grid grid-cols-2 gap-2">

            <div>

              <p className="text-[9px] font-bold uppercase text-slate-400">
                Quantity
              </p>

              <p className="mt-1 text-sm font-bold">
                {lot.quantity}
              </p>

            </div>


            <div>

              <p className="text-[9px] font-bold uppercase text-slate-400">
                Condition
              </p>

              <p className="mt-1 text-sm font-semibold">
                {lot.condition}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* SELLER */}

      <div className="mt-5 rounded-xl bg-slate-50 p-4">

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              SELLER
            </p>

            <p className="mt-1 text-sm font-bold">
              {lot.seller}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              📍 {lot.location} • {lot.distance}
            </p>

          </div>


          <div className="text-left sm:text-right">

            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              ASKING PRICE
            </p>

            <p className="mt-1 text-xl font-bold text-blue-700">
              {lot.price}
              <span className="ml-1 text-xs font-normal">
                /kg
              </span>
            </p>

            <p className="text-xs text-slate-400">
              Total: {lot.total}
            </p>

          </div>

        </div>

      </div>


      {/* BUTTONS */}

      <div className="mt-4 flex gap-3">

        {/* VIEW DETAILS */}

        <button
          type="button"
          onClick={onViewDetails}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          View Details
        </button>


        {/* BUY */}

        <button
          type="button"
          onClick={onPurchase}
          disabled={lot.status === "Requested"}
          className={`flex-[1.5] rounded-xl px-4 py-3 text-sm font-bold text-white ${
            lot.status === "Requested"
              ? "cursor-not-allowed bg-slate-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {lot.status === "Requested"
            ? "✓ Request Sent"
            : "Buy / Request Lot"}
        </button>

      </div>

    </div>
  );
}


/* =====================================================
   REQUIREMENTS
===================================================== */

function Requirements() {

  const requirements = [
    {
      material: "Copper",
      icon: "🔶",
      needed: "500 kg",
      current: "202 kg",
      deadline: "15 Sep 2026",
      priority: "High",
    },
    {
      material: "E-Waste",
      icon: "💻",
      needed: "200 kg",
      current: "45 kg",
      deadline: "20 Sep 2026",
      priority: "High",
    },
    {
      material: "Aluminium",
      icon: "🥫",
      needed: "300 kg",
      current: "95 kg",
      deadline: "30 Sep 2026",
      priority: "Medium",
    },
  ];

  return (

    <section className="mt-5">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>

          <h3 className="text-xl font-bold">
            Material Requirements
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Tell kabadiwalas what materials your company needs.
          </p>

        </div>


        <button
          type="button"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          + Add Requirement
        </button>

      </div>


      <div className="mt-5 space-y-4">

        {requirements.map((item) => (

          <div
            key={item.material}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >

            <div className="flex flex-col gap-5 md:flex-row md:items-center">

              <div className="flex flex-1 items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                  {item.icon}
                </div>

                <div>

                  <div className="flex items-center gap-2">

                    <h4 className="font-bold">
                      {item.material}
                    </h4>

                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                        item.priority === "High"
                          ? "bg-red-50 text-red-600"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {item.priority} Priority
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Need by {item.deadline}
                  </p>

                </div>

              </div>


              <div>

                <p className="text-xs text-slate-400">
                  REQUIRED
                </p>

                <p className="font-bold">
                  {item.needed}
                </p>

              </div>


              <div>

                <p className="text-xs text-slate-400">
                  AVAILABLE
                </p>

                <p className="font-bold text-green-600">
                  {item.current}
                </p>

              </div>


              <button
                type="button"
                className="rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                Edit
              </button>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}


/* =====================================================
   PURCHASES
===================================================== */

function Purchases({
  lots,
}: {
  lots: MaterialLot[];
}) {

  const requested = lots.filter(
    (lot) => lot.status === "Requested"
  );

  return (

    <section className="mt-5">

      <h3 className="text-xl font-bold">
        Purchase Requests
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Track material requests sent to kabadiwala partners.
      </p>


      <div className="mt-5 space-y-4">

        {requested.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <div className="text-4xl">
              🤝
            </div>

            <h3 className="mt-3 font-bold">
              No active purchase requests
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your requested material lots will appear here.
            </p>

          </div>

        ) : (

          requested.map((lot) => (

            <div
              key={lot.id}
              className="rounded-2xl border border-yellow-200 bg-white p-5"
            >

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-2xl">
                  {lot.icon}
                </div>

                <div className="flex-1">

                  <h4 className="font-bold">
                    {lot.material} • {lot.quantity}
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Seller: {lot.seller}
                  </p>

                </div>

                <span className="w-fit rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-700">
                  ⏳ Awaiting Response
                </span>

              </div>

            </div>

          ))

        )}

      </div>

    </section>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
        {icon}
      </div>

      <p className="mt-4 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}


/* =====================================================
   TAB BUTTON
===================================================== */

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>

  );
}


/* =====================================================
   DETAIL BOX
===================================================== */

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>

  );
}