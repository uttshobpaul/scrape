"use client";

import { useState, type ChangeEvent } from "react";

/* =============================================================
   TYPES
============================================================= */

type CustomerView =
  | "overview"
  | "sell"
  | "dump"
  | "nearest"
  | "pickups"
  | "transactions";

type Material = {
  name: string;
  icon: string;
  description: string;
};

type Pickup = {
  id: string;
  type: string;
  date: string;
  time: string;
  location: string;
  status: "Confirmed" | "Pending" | "Completed";
};

type Transaction = {
  id: string;
  type: string;
  material: string;
  amount: string;
  date: string;
  status: "Completed" | "Pending";
};

/* =============================================================
   MATERIALS
============================================================= */

const materials: Material[] = [
  {
    name: "Paper",
    icon: "📄",
    description: "Newspaper, books, cardboard",
  },
  {
    name: "Plastic",
    icon: "🧴",
    description: "Bottles, containers and plastic",
  },
  {
    name: "Iron",
    icon: "🔩",
    description: "Iron, steel and metal items",
  },
  {
    name: "Copper",
    icon: "🔶",
    description: "Copper wires and items",
  },
  {
    name: "E-Waste",
    icon: "💻",
    description: "Electronics, cables and devices",
  },
  {
    name: "Other",
    icon: "♻️",
    description: "Other recyclable materials",
  },
];

/* =============================================================
   DEMO DATA
============================================================= */

const demoPickups: Pickup[] = [
  {
    id: "#PK1024",
    type: "Sell Scrap",
    date: "12 September 2026",
    time: "4:00 PM – 6:00 PM",
    location: "Salt Lake, Kolkata",
    status: "Confirmed",
  },
  {
    id: "#PK1023",
    type: "Pick & Dump",
    date: "10 September 2026",
    time: "7:30 PM",
    location: "Salt Lake, Kolkata",
    status: "Pending",
  },
  {
    id: "#PK1019",
    type: "Sell Scrap",
    date: "5 September 2026",
    time: "11:00 AM – 1:00 PM",
    location: "Salt Lake, Kolkata",
    status: "Completed",
  },
];

const demoTransactions: Transaction[] = [
  {
    id: "#TX2041",
    type: "Scrap Sale",
    material: "Paper",
    amount: "₹450",
    date: "5 September 2026",
    status: "Completed",
  },
  {
    id: "#TX2039",
    type: "Scrap Sale",
    material: "Iron",
    amount: "₹820",
    date: "2 September 2026",
    status: "Completed",
  },
  {
    id: "#TX2035",
    type: "Scrap Sale",
    material: "Copper",
    amount: "₹1,180",
    date: "28 August 2026",
    status: "Completed",
  },
];

/* =============================================================
   MAIN CUSTOMER PAGE
============================================================= */

export default function CustomerPage() {
  const [view, setView] = useState<CustomerView>("overview");

  const [selectedMaterial, setSelectedMaterial] =
    useState("Paper");

  const [quantity, setQuantity] = useState("");

  const [location, setLocation] =
    useState("Salt Lake, Kolkata");

  const [message, setMessage] = useState("");

  const [imageName, setImageName] = useState("");

  /* DATE */
  const [pickupDate, setPickupDate] = useState(
    getTodayDate()
  );

  /* TIME */
  const [pickupTime, setPickupTime] = useState("18:00");

  /* =========================================================
     TOAST
  ========================================================= */

  const showMessage = (text: string) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  /* =========================================================
     IMAGE
  ========================================================= */

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageName(file.name);
  };

  /* =========================================================
     LOCATION
  ========================================================= */

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showMessage(
        "Location is not supported by this browser."
      );
      return;
    }

    showMessage("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude.toFixed(4);

        const longitude =
          position.coords.longitude.toFixed(4);

        setLocation(
          `Current Location (${latitude}, ${longitude})`
        );

        showMessage(
          "Location detected successfully."
        );
      },
      () => {
        showMessage(
          "Unable to detect location. Please enter it manually."
        );
      }
    );
  };

  /* =========================================================
     SELL SUBMIT
  ========================================================= */

  const submitSell = () => {
    if (!quantity.trim()) {
      showMessage(
        "Please enter the approximate quantity."
      );
      return;
    }

    if (!location.trim()) {
      showMessage(
        "Please enter your pickup location."
      );
      return;
    }

    if (!pickupDate) {
      showMessage("Please select a pickup date.");
      return;
    }

    if (!pickupTime) {
      showMessage("Please select a pickup time.");
      return;
    }

    showMessage(
      "Scrap pickup request created successfully!"
    );
  };

  /* =========================================================
     DUMP SUBMIT
  ========================================================= */

  const submitDump = () => {
    if (!location.trim()) {
      showMessage(
        "Please enter your pickup location."
      );
      return;
    }

    if (!pickupDate) {
      showMessage("Please select a pickup date.");
      return;
    }

    if (!pickupTime) {
      showMessage("Please select a pickup time.");
      return;
    }

    showMessage(
      "Quick waste pickup requested! A collection partner will be assigned."
    );
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goTo = (nextView: CustomerView) => {
    setView(nextView);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">

      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-6">

          {/* LOGO */}

          <button
            type="button"
            onClick={() => goTo("overview")}
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-2xl text-white shadow-sm">
              ♻
            </div>

            <div className="text-left">

              <h1 className="text-xl font-bold tracking-tight">
                Scrap
                <span className="text-green-600">
                  Saathi
                </span>
              </h1>

              <p className="text-[11px] text-slate-500">
                Smart Waste. Better Future.
              </p>

            </div>

          </button>

          {/* USER */}

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-bold">
                Welcome back!
              </p>

              <p className="text-xs text-slate-500">
                Customer
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
              U
            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          TOAST MESSAGE
      ===================================================== */}

      {message && (
        <div className="fixed right-5 top-20 z-[100] max-w-sm rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          ✓ {message}
        </div>
      )}


      {/* =====================================================
          PAGE LAYOUT
      ===================================================== */}

      <div className="mx-auto flex max-w-[1500px]">


        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="hidden min-h-[calc(100vh-72px)] w-[250px] shrink-0 border-r border-slate-200 bg-white lg:block">

          <div className="p-5">

            <p className="px-3 text-xs font-bold tracking-wider text-slate-400">
              CUSTOMER MENU
            </p>


            <nav className="mt-5 space-y-2">

              {/* OVERVIEW */}

              <SidebarButton
                active={view === "overview"}
                icon="⌂"
                label="Overview"
                onClick={() => goTo("overview")}
              />


              {/* SELL */}

              <SidebarButton
                active={view === "sell"}
                icon="💰"
                label="Sell Scrap"
                onClick={() => goTo("sell")}
              />


              {/* PICK & DUMP */}

              <SidebarButton
                active={view === "dump"}
                icon="🚛"
                label="Pick & Dump"
                onClick={() => goTo("dump")}
              />


              {/* NEAREST KABADI */}

              <SidebarButton
                active={view === "nearest"}
                icon="📍"
                label="Nearest Kabadiwala"
                onClick={() => goTo("nearest")}
              />


              {/* MY PICKUPS */}

              <SidebarButton
                active={view === "pickups"}
                icon="📅"
                label="My Pickups"
                onClick={() => goTo("pickups")}
              />


              {/* TRANSACTIONS */}

              <SidebarButton
                active={view === "transactions"}
                icon="💳"
                label="Transactions"
                onClick={() =>
                  goTo("transactions")
                }
              />

            </nav>


            {/* SIDEBAR INFO */}

            <div className="mt-10 rounded-2xl bg-green-50 p-5">

              <div className="text-2xl">
                ♻️
              </div>

              <h3 className="mt-3 font-bold text-green-800">
                Recycle smarter
              </h3>

              <p className="mt-2 text-sm leading-6 text-green-700">
                Sell recyclable scrap or get unwanted
                waste picked up from your doorstep.
              </p>

            </div>

          </div>

        </aside>


        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <section className="min-w-0 flex-1">

          <div className="px-5 py-8 md:px-8 lg:px-10">


            {/* OVERVIEW */}

            {view === "overview" && (
              <Overview
                onSell={() => goTo("sell")}
                onDump={() => goTo("dump")}
                onNearest={() =>
                  goTo("nearest")
                }
              />
            )}


            {/* SELL */}

            {view === "sell" && (
              <SellScrap
                selectedMaterial={selectedMaterial}
                setSelectedMaterial={
                  setSelectedMaterial
                }
                quantity={quantity}
                setQuantity={setQuantity}
                location={location}
                setLocation={setLocation}
                pickupDate={pickupDate}
                setPickupDate={setPickupDate}
                pickupTime={pickupTime}
                setPickupTime={setPickupTime}
                imageName={imageName}
                handleImageChange={
                  handleImageChange
                }
                detectLocation={detectLocation}
                onSubmit={submitSell}
                onBack={() => goTo("overview")}
              />
            )}


            {/* PICK & DUMP */}

            {view === "dump" && (
              <PickAndDump
                quantity={quantity}
                setQuantity={setQuantity}
                location={location}
                setLocation={setLocation}
                pickupDate={pickupDate}
                setPickupDate={setPickupDate}
                pickupTime={pickupTime}
                setPickupTime={setPickupTime}
                imageName={imageName}
                handleImageChange={
                  handleImageChange
                }
                detectLocation={detectLocation}
                onSubmit={submitDump}
                onBack={() => goTo("overview")}
              />
            )}


            {/* NEAREST KABADIWALA */}

            {view === "nearest" && (
              <NearestKabadi
                location={location}
                setLocation={setLocation}
                detectLocation={detectLocation}
                onBack={() => goTo("overview")}
                onSell={() => goTo("sell")}
              />
            )}


            {/* MY PICKUPS */}

            {view === "pickups" && (
              <MyPickups
                onBack={() => goTo("overview")}
              />
            )}


            {/* TRANSACTIONS */}

            {view === "transactions" && (
              <Transactions
                onBack={() => goTo("overview")}
              />
            )}

          </div>

        </section>

      </div>

    </main>
  );
}


/* =============================================================
   OVERVIEW
============================================================= */

function Overview({
  onSell,
  onDump,
  onNearest,
}: {
  onSell: () => void;
  onDump: () => void;
  onNearest: () => void;
}) {
  return (
    <div>

      {/* HEADER */}

      <div>

        <p className="text-sm font-bold tracking-wide text-green-600">
          CUSTOMER DASHBOARD
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Manage your waste easily.
        </h2>

        <p className="mt-2 max-w-2xl text-base text-slate-500">
          Sell your scrap or get unwanted waste picked
          up from your doorstep.
        </p>

      </div>


      {/* =====================================================
          TWO MAIN ACTIONS
      ===================================================== */}

      <div className="mt-9">

        <h3 className="text-xl font-bold">
          What do you want to do?
        </h3>


        <div className="mt-5 grid gap-5 xl:grid-cols-2">


          {/* SELL SCRAP */}

          <button
            type="button"
            onClick={onSell}
            className="group rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-green-300 hover:shadow-lg"
          >

            <div className="flex items-start justify-between">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
                💰
              </div>

              <span className="text-2xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-green-500">
                →
              </span>

            </div>


            <div className="mt-7">

              <div className="flex flex-wrap items-center gap-3">

                <h3 className="text-2xl font-bold">
                  Sell Scrap
                </h3>

                <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-700">
                  EARN MONEY
                </span>

              </div>

              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                Sell paper, plastic, iron, copper,
                aluminium, e-waste and other recyclable
                materials to a nearby Kabadiwala.
              </p>

            </div>


            <div className="mt-7 flex flex-wrap gap-2">

              <SmallTag text="📄 Paper" />
              <SmallTag text="🧴 Plastic" />
              <SmallTag text="🔩 Metal" />
              <SmallTag text="💻 E-Waste" />

            </div>


            <div className="mt-7 inline-flex rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition group-hover:bg-green-700">
              Sell My Scrap →
            </div>

          </button>


          {/* PICK & DUMP */}

          <button
            type="button"
            onClick={onDump}
            className="group rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
          >

            <div className="flex items-start justify-between">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
                🚛
              </div>

              <span className="text-2xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-500">
                →
              </span>

            </div>


            <div className="mt-7">

              <div className="flex flex-wrap items-center gap-3">

                <h3 className="text-2xl font-bold">
                  Pick & Dump
                </h3>

                <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-700">
                  IN 10 MINUTES
                </span>

              </div>

              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                Don't want to sell the waste? Request a
                quick doorstep pickup and our collection
                partner will take it for proper disposal.
              </p>

            </div>


            <div className="mt-7 flex flex-wrap gap-2">

              <SmallTag text="⚡ Quick Pickup" />
              <SmallTag text="🏠 Doorstep" />
              <SmallTag text="♻️ Responsible Disposal" />

            </div>


            <div className="mt-7 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition group-hover:bg-orange-600">
              Pick & Dump Now →
            </div>

          </button>

        </div>

      </div>


      {/* =====================================================
          QUICK ACCESS
      ===================================================== */}

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <button
          type="button"
          onClick={onNearest}
          className="rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:border-blue-300 hover:shadow-md"
        >

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              📍
            </div>

            <div>

              <h3 className="font-bold">
                Find Nearest Kabadiwala
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Find local collection partners near you.
              </p>

            </div>

          </div>

        </button>


        <div className="rounded-3xl border border-slate-200 bg-white p-6">

          <p className="text-xs font-bold tracking-wide text-green-600">
            HOW SCRAPSAATHI WORKS
          </p>

          <h3 className="mt-2 text-lg font-bold">
            One platform. Two simple choices.
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sell your recyclable materials or request
            doorstep waste collection.
          </p>

        </div>

      </div>

    </div>
  );
}


/* =============================================================
   SELL SCRAP
============================================================= */

function SellScrap({
  selectedMaterial,
  setSelectedMaterial,
  quantity,
  setQuantity,
  location,
  setLocation,
  pickupDate,
  setPickupDate,
  pickupTime,
  setPickupTime,
  imageName,
  handleImageChange,
  detectLocation,
  onSubmit,
  onBack,
}: {
  selectedMaterial: string;
  setSelectedMaterial: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  pickupDate: string;
  setPickupDate: (value: string) => void;
  pickupTime: string;
  setPickupTime: (value: string) => void;
  imageName: string;
  handleImageChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  detectLocation: () => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div>

      <BackButton onClick={onBack} />

      <div className="mt-5">

        <p className="text-sm font-bold text-green-600">
          SELL SCRAP
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Sell your recyclable scrap.
        </h2>

        <p className="mt-2 text-slate-500">
          Tell us what you have and we'll arrange a
          pickup from your location.
        </p>

      </div>


      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_360px]">


        {/* FORM */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6">

          {/* MATERIAL */}

          <label className="text-sm font-bold">
            Select Scrap Type
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">

            {materials.map((material) => (

              <button
                key={material.name}
                type="button"
                onClick={() =>
                  setSelectedMaterial(material.name)
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedMaterial === material.name
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 hover:border-green-300"
                }`}
              >

                <div className="flex items-center gap-3">

                  <span className="text-3xl">
                    {material.icon}
                  </span>

                  <div>

                    <p className="font-bold">
                      {material.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {material.description}
                    </p>

                  </div>

                </div>

              </button>

            ))}

          </div>


          {/* IMAGE */}

          <div className="mt-6">

            <label className="text-sm font-bold">
              Upload Scrap Image
            </label>

            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-7 text-center hover:border-green-400">

              <div>

                <div className="text-3xl">
                  📷
                </div>

                <p className="mt-2 text-sm font-bold">
                  {imageName ||
                    "Click to upload an image"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  JPG, PNG or WEBP
                </p>

              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

            </label>

          </div>


          {/* QUANTITY */}

          <div className="mt-6">

            <label className="text-sm font-bold">
              Approximate Quantity
            </label>

            <div className="mt-2 flex">

              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="Example: 10"
                className="w-full rounded-l-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
              />

              <div className="flex items-center rounded-r-xl border border-l-0 border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
                kg
              </div>

            </div>

          </div>


          {/* LOCATION */}

          <div className="mt-6">

            <div className="flex items-center justify-between">

              <label className="text-sm font-bold">
                Pickup Location
              </label>

              <button
                type="button"
                onClick={detectLocation}
                className="text-xs font-bold text-green-600"
              >
                📍 Use My Location
              </button>

            </div>

            <input
              type="text"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              placeholder="Enter pickup location"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
            />

          </div>


          {/* =================================================
              CALENDAR
          ================================================= */}

          <DateTimePicker
            date={pickupDate}
            setDate={setPickupDate}
            time={pickupTime}
            setTime={setPickupTime}
            accent="green"
            title="Preferred Pickup Date & Time"
          />


          {/* BUTTON */}

          <button
            type="button"
            onClick={onSubmit}
            className="mt-7 w-full rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white hover:bg-green-700"
          >
            ♻️ Request Scrap Pickup
          </button>

        </div>


        {/* SUMMARY */}

        <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6">

          <p className="text-xs font-bold text-green-600">
            SELLING SUMMARY
          </p>

          <h3 className="mt-2 text-xl font-bold">
            Your Scrap
          </h3>

          <div className="mt-5 space-y-4">

            <SummaryItem
              label="Material"
              value={selectedMaterial}
            />

            <SummaryItem
              label="Quantity"
              value={
                quantity
                  ? `${quantity} kg`
                  : "Not specified"
              }
            />

            <SummaryItem
              label="Location"
              value={location}
            />

            <SummaryItem
              label="Pickup Date"
              value={formatDate(pickupDate)}
            />

            <SummaryItem
              label="Pickup Time"
              value={formatTime(pickupTime)}
            />

          </div>

          <div className="mt-6 rounded-xl bg-green-50 p-4">

            <p className="text-sm leading-6 text-green-800">
              💡 Final price depends on the actual
              material type, quality and weight.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =============================================================
   PICK & DUMP
============================================================= */

function PickAndDump({
  quantity,
  setQuantity,
  location,
  setLocation,
  pickupDate,
  setPickupDate,
  pickupTime,
  setPickupTime,
  imageName,
  handleImageChange,
  detectLocation,
  onSubmit,
  onBack,
}: {
  quantity: string;
  setQuantity: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  pickupDate: string;
  setPickupDate: (value: string) => void;
  pickupTime: string;
  setPickupTime: (value: string) => void;
  imageName: string;
  handleImageChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  detectLocation: () => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div>

      <BackButton onClick={onBack} />

      <div className="mt-5">

        <div className="flex flex-wrap items-center gap-3">

          <p className="text-sm font-bold text-orange-600">
            QUICK WASTE COLLECTION
          </p>

          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
            ⚡ IN 10 MINUTES
          </span>

        </div>

        <h2 className="mt-2 text-3xl font-bold">
          Pick & Dump your waste.
        </h2>

        <p className="mt-2 max-w-2xl text-slate-500">
          Don't want to sell your waste? Request a
          quick doorstep collection and we'll take it
          for proper disposal.
        </p>

      </div>


      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_360px]">


        {/* FORM */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6">


          {/* QUICK INFO */}

          <div className="rounded-2xl bg-orange-50 p-5">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl">
                ⚡
              </div>

              <div>

                <h3 className="font-bold text-orange-900">
                  Fast doorstep pickup
                </h3>

                <p className="mt-1 text-sm leading-6 text-orange-800">
                  Give us your location and waste
                  details. We'll try to assign a nearby
                  collection partner quickly.
                </p>

              </div>

            </div>

          </div>


          {/* QUANTITY */}

          <div className="mt-6">

            <label className="text-sm font-bold">
              Approximate Waste Quantity
            </label>

            <div className="mt-2 flex">

              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="Example: 5"
                className="w-full rounded-l-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
              />

              <div className="flex items-center rounded-r-xl border border-l-0 border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
                kg
              </div>

            </div>

          </div>


          {/* IMAGE */}

          <div className="mt-6">

            <label className="text-sm font-bold">
              Waste Image
              <span className="ml-2 font-normal text-slate-400">
                Optional
              </span>
            </label>

            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-7 text-center hover:border-orange-400">

              <div>

                <div className="text-3xl">
                  🗑️
                </div>

                <p className="mt-2 text-sm font-bold">
                  {imageName ||
                    "Upload waste image"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Helps the collection partner understand
                  the waste.
                </p>

              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

            </label>

          </div>


          {/* LOCATION */}

          <div className="mt-6">

            <div className="flex items-center justify-between">

              <label className="text-sm font-bold">
                Pickup Location
              </label>

              <button
                type="button"
                onClick={detectLocation}
                className="text-xs font-bold text-orange-600"
              >
                📍 Use My Location
              </button>

            </div>

            <input
              type="text"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              placeholder="Enter pickup location"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
            />

          </div>


          {/* CALENDAR */}

          <DateTimePicker
            date={pickupDate}
            setDate={setPickupDate}
            time={pickupTime}
            setTime={setPickupTime}
            accent="orange"
            title="Pickup Date & Time"
          />


          {/* BUTTON */}

          <button
            type="button"
            onClick={onSubmit}
            className="mt-7 w-full rounded-xl bg-orange-500 px-5 py-3.5 font-bold text-white hover:bg-orange-600"
          >
            ⚡ Request Pickup Now
          </button>

        </div>


        {/* SUMMARY */}

        <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6">

          <p className="text-xs font-bold text-orange-600">
            PICKUP SUMMARY
          </p>

          <h3 className="mt-2 text-xl font-bold">
            Pick & Dump
          </h3>

          <div className="mt-5 space-y-4">

            <SummaryItem
              label="Service"
              value="Doorstep Waste Collection"
            />

            <SummaryItem
              label="Quantity"
              value={
                quantity
                  ? `${quantity} kg`
                  : "Not specified"
              }
            />

            <SummaryItem
              label="Location"
              value={location}
            />

            <SummaryItem
              label="Pickup Date"
              value={formatDate(pickupDate)}
            />

            <SummaryItem
              label="Pickup Time"
              value={formatTime(pickupTime)}
            />

          </div>

          <div className="mt-6 rounded-xl bg-orange-50 p-4">

            <p className="text-sm leading-6 text-orange-800">
              ⚡ We will try to assign the nearest
              available collection partner for your
              request.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =============================================================
   DATE + TIME PICKER
============================================================= */

function DateTimePicker({
  date,
  setDate,
  time,
  setTime,
  accent,
  title,
}: {
  date: string;
  setDate: (value: string) => void;
  time: string;
  setTime: (value: string) => void;
  accent: "green" | "orange";
  title: string;
}) {
  const borderColor =
    accent === "green"
      ? "focus:border-green-500"
      : "focus:border-orange-500";

  const labelColor =
    accent === "green"
      ? "text-green-600"
      : "text-orange-600";

  return (
    <div className="mt-6">

      <div className="flex items-center justify-between">

        <label className="text-sm font-bold">
          {title}
        </label>

        <span className={`text-xs font-bold ${labelColor}`}>
          📅 Choose your own
        </span>

      </div>


      <div className="mt-3 grid gap-4 sm:grid-cols-2">


        {/* DATE */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

          <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Select Date
          </label>

          <div className="mt-2">

            <input
              type="date"
              value={date}
              min={getTodayDate()}
              onChange={(e) =>
                setDate(e.target.value)
              }
              className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none ${borderColor}`}
            />

          </div>

          <p className="mt-2 text-xs text-slate-400">
            Click the calendar icon to choose a date.
          </p>

        </div>


        {/* TIME */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

          <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Select Time
          </label>

          <div className="mt-2">

            <input
              type="time"
              value={time}
              onChange={(e) =>
                setTime(e.target.value)
              }
              className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none ${borderColor}`}
            />

          </div>

          <p className="mt-2 text-xs text-slate-400">
            Choose any available time that works for you.
          </p>

        </div>

      </div>


      {/* SELECTED PREVIEW */}

      <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">

        <span className="text-lg">
          📅
        </span>

        <div>

          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Selected Pickup
          </p>

          <p className="text-sm font-bold">
            {formatDate(date)} at {formatTime(time)}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =============================================================
   NEAREST KABADIWALA
============================================================= */

function NearestKabadi({
  location,
  setLocation,
  detectLocation,
  onBack,
  onSell,
}: {
  location: string;
  setLocation: (value: string) => void;
  detectLocation: () => void;
  onBack: () => void;
  onSell: () => void;
}) {
  const kabadiwalas = [
    {
      name: "Green Scrap Centre",
      distance: "0.8 km away",
      rating: "4.8",
      phone: "+91 98765 43210",
    },
    {
      name: "Kolkata Recycle Hub",
      distance: "1.4 km away",
      rating: "4.7",
      phone: "+91 98300 12345",
    },
    {
      name: "Eco Scrap Point",
      distance: "2.1 km away",
      rating: "4.6",
      phone: "+91 90070 56789",
    },
  ];

  return (
    <div>

      <BackButton onClick={onBack} />

      <div className="mt-5">

        <p className="text-sm font-bold text-blue-600">
          NEARBY KABADIWALA
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Find a nearby collection partner.
        </h2>

        <p className="mt-2 max-w-2xl text-slate-500">
          Find local Kabadiwalas near your location
          and choose where you want to sell your scrap.
        </p>

      </div>


      {/* LOCATION SEARCH */}

      <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-6">

        <label className="text-sm font-bold">
          Your Location
        </label>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">

          <input
            type="text"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Enter your location"
          />

          <button
            type="button"
            onClick={detectLocation}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
          >
            📍 Detect Location
          </button>

        </div>

      </div>


      {/* RESULTS */}

      <div className="mt-6">

        <div className="mb-4 flex items-center justify-between">

          <h3 className="text-xl font-bold">
            Nearby Kabadiwalas
          </h3>

          <span className="text-sm text-slate-400">
            3 found
          </span>

        </div>


        <div className="grid gap-4">

          {kabadiwalas.map((kabadi) => (

            <div
              key={kabadi.name}
              className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-green-300 hover:shadow-md"
            >

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-2xl">
                    ♻️
                  </div>

                  <div>

                    <h4 className="font-bold">
                      {kabadi.name}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      📍 {kabadi.distance}
                    </p>

                    <p className="mt-1 text-sm">
                      ⭐ {kabadi.rating}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {kabadi.phone}
                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={onSell}
                  className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
                >
                  Sell Scrap →
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}


/* =============================================================
   MY PICKUPS
============================================================= */

function MyPickups({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <div>

      <BackButton onClick={onBack} />

      <div className="mt-5">

        <p className="text-sm font-bold text-green-600">
          MY PICKUPS
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Your pickup activity.
        </h2>

        <p className="mt-2 text-slate-500">
          Track upcoming and previous waste collection
          requests from one place.
        </p>

      </div>


      <div className="mt-7 space-y-4">

        {demoPickups.map((pickup) => (

          <div
            key={pickup.id}
            className="rounded-3xl border border-slate-200 bg-white p-6"
          >

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
                  {pickup.type === "Sell Scrap"
                    ? "💰"
                    : "🚛"}
                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h3 className="font-bold">
                      {pickup.type}
                    </h3>

                    <StatusBadge
                      status={pickup.status}
                    />

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {pickup.id}
                  </p>

                </div>

              </div>


              <div className="grid gap-3 text-sm sm:grid-cols-3">

                <div>
                  <p className="text-xs font-bold text-slate-400">
                    DATE
                  </p>
                  <p className="mt-1 font-semibold">
                    {pickup.date}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400">
                    TIME
                  </p>
                  <p className="mt-1 font-semibold">
                    {pickup.time}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400">
                    LOCATION
                  </p>
                  <p className="mt-1 font-semibold">
                    {pickup.location}
                  </p>
                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}


/* =============================================================
   TRANSACTIONS
============================================================= */

function Transactions({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <div>

      <BackButton onClick={onBack} />

      <div className="mt-5">

        <p className="text-sm font-bold text-green-600">
          TRANSACTIONS
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Your earnings & transactions.
        </h2>

        <p className="mt-2 text-slate-500">
          Keep track of money earned from selling your
          recyclable materials.
        </p>

      </div>


      {/* EARNINGS */}

      <div className="mt-7 grid gap-5 md:grid-cols-3">

        <StatCard
          title="Total Earnings"
          value="₹2,450"
          subtitle="+12% this month"
          icon="₹"
        />

        <StatCard
          title="Scrap Sold"
          value="86 kg"
          subtitle="This month"
          icon="♻️"
        />

        <StatCard
          title="Transactions"
          value="24"
          subtitle="All time"
          icon="💳"
        />

      </div>


      {/* TRANSACTION LIST */}

      <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-6">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-bold text-green-600">
              RECENT ACTIVITY
            </p>

            <h3 className="mt-1 text-xl font-bold">
              Transaction History
            </h3>

          </div>

        </div>


        <div className="mt-6 divide-y divide-slate-100">

          {demoTransactions.map(
            (transaction) => (

              <div
                key={transaction.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                    ♻️
                  </div>

                  <div>

                    <p className="font-bold">
                      {transaction.type}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {transaction.material} •{" "}
                      {transaction.date}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {transaction.id}
                    </p>

                  </div>

                </div>


                <div className="text-left sm:text-right">

                  <p className="text-lg font-bold text-green-600">
                    +{transaction.amount}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {transaction.status}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}


/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 font-bold text-green-600">
          {icon}
        </div>

      </div>

    </div>
  );
}


/* =============================================================
   SIDEBAR BUTTON
============================================================= */

function SidebarButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition ${
        active
          ? "bg-green-50 text-green-700"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >

      <span className="flex w-6 justify-center text-lg">
        {icon}
      </span>

      <span>
        {label}
      </span>

    </button>
  );
}


/* =============================================================
   SMALL TAG
============================================================= */

function SmallTag({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
      {text}
    </span>
  );
}


/* =============================================================
   SUMMARY ITEM
============================================================= */

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-100 pb-3">

      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold">
        {value}
      </p>

    </div>
  );
}


/* =============================================================
   STATUS BADGE
============================================================= */

function StatusBadge({
  status,
}: {
  status: "Confirmed" | "Pending" | "Completed";
}) {
  const classes =
    status === "Confirmed"
      ? "bg-green-50 text-green-700"
      : status === "Pending"
        ? "bg-orange-50 text-orange-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold ${classes}`}
    >
      {status}
    </span>
  );
}


/* =============================================================
   BACK BUTTON
============================================================= */

function BackButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900"
    >
      ← Back to Dashboard
    </button>
  );
}


/* =============================================================
   DATE HELPERS
============================================================= */

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =============================================================
   FORMAT DATE
============================================================= */

function formatDate(dateString: string) {
  if (!dateString) {
    return "Not selected";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


/* =============================================================
   FORMAT TIME
============================================================= */

function formatTime(timeString: string) {
  if (!timeString) {
    return "Not selected";
  }

  const [hourString, minute] =
    timeString.split(":");

  let hour = Number(hourString);

  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${period}`;
}