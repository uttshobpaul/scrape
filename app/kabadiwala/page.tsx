"use client";

import { useEffect, useMemo, useState } from "react";

type RequestStatus =
  | "Waiting"
  | "Accepted"
  | "Rejected"
  | "Completed";

type ScrapRequest = {
  id: number;
  type: "Sell" | "Dump";
  material: string;
  quantity: string;
  pickupTime: string;
  location: string;
  status: RequestStatus;
  image?: string;
  createdAt: string;
};

const STORAGE_KEY = "scrapsaathi_requests";

const materials = [
  { name: "Paper", icon: "📄" },
  { name: "Plastic", icon: "🧴" },
  { name: "Iron", icon: "🔩" },
  { name: "Copper", icon: "🔶" },
  { name: "E-Waste", icon: "💻" },
  { name: "Other", icon: "♻️" },
];

export default function KabadiwalaPage() {
  const [requests, setRequests] = useState<ScrapRequest[]>([]);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "waiting" | "accepted" | "completed"
  >("dashboard");

  const [selectedRequest, setSelectedRequest] =
    useState<ScrapRequest | null>(null);

  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const [filterMaterial, setFilterMaterial] =
    useState("All");

  /*
   * LOAD REQUESTS
   */

  useEffect(() => {
    loadRequests();

    const handleStorage = () => {
      loadRequests();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  /*
   * LOAD FROM LOCAL STORAGE
   */

  const loadRequests = () => {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      setRequests([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setRequests(parsed);
      }
    } catch {
      setRequests([]);
    }
  };

  /*
   * SAVE
   */

  const saveRequests = (
    updatedRequests: ScrapRequest[]
  ) => {
    setRequests(updatedRequests);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedRequests)
    );
  };

  /*
   * MESSAGE
   */

  const showMessage = (text: string) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  /*
   * ACCEPT
   */

  const acceptRequest = (id: number) => {
    const updated = requests.map((request) =>
      request.id === id
        ? {
            ...request,
            status: "Accepted" as RequestStatus,
          }
        : request
    );

    saveRequests(updated);

    setSelectedRequest(null);

    showMessage(
      "Request accepted successfully."
    );
  };

  /*
   * REJECT
   */

  const rejectRequest = (id: number) => {
    const updated = requests.map((request) =>
      request.id === id
        ? {
            ...request,
            status: "Rejected" as RequestStatus,
          }
        : request
    );

    saveRequests(updated);

    setSelectedRequest(null);

    showMessage(
      "Request rejected."
    );
  };

  /*
   * COMPLETE
   */

  const completeRequest = (id: number) => {
    const updated = requests.map((request) =>
      request.id === id
        ? {
            ...request,
            status: "Completed" as RequestStatus,
          }
        : request
    );

    saveRequests(updated);

    setSelectedRequest(null);

    showMessage(
      "Pickup marked as completed."
    );
  };

  /*
   * REFRESH
   */

  const refreshRequests = () => {
    loadRequests();

    showMessage(
      "Requests refreshed."
    );
  };

  /*
   * COUNTS
   */

  const totalCount = requests.length;

  const waitingCount = requests.filter(
    (request) =>
      request.status === "Waiting"
  ).length;

  const acceptedCount = requests.filter(
    (request) =>
      request.status === "Accepted"
  ).length;

  const completedCount = requests.filter(
    (request) =>
      request.status === "Completed"
  ).length;

  /*
   * FILTER REQUESTS
   */

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    /*
     * TAB FILTER
     */

    if (activeTab === "waiting") {
      result = result.filter(
        (request) =>
          request.status === "Waiting"
      );
    }

    if (activeTab === "accepted") {
      result = result.filter(
        (request) =>
          request.status === "Accepted"
      );
    }

    if (activeTab === "completed") {
      result = result.filter(
        (request) =>
          request.status === "Completed"
      );
    }

    /*
     * MATERIAL FILTER
     */

    if (filterMaterial !== "All") {
      result = result.filter(
        (request) =>
          request.material === filterMaterial
      );
    }

    /*
     * SEARCH
     */

    if (search.trim()) {
      const query =
        search.toLowerCase();

      result = result.filter(
        (request) =>
          request.material
            .toLowerCase()
            .includes(query) ||
          request.location
            .toLowerCase()
            .includes(query) ||
          request.quantity
            .toLowerCase()
            .includes(query) ||
          request.type
            .toLowerCase()
            .includes(query)
      );
    }

    return result;
  }, [
    requests,
    activeTab,
    filterMaterial,
    search,
  ]);

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
                Collection Partner
              </p>

            </div>

          </a>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={refreshRequests}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg hover:bg-slate-50"
              title="Refresh"
            >
              ↻
            </button>

            <div className="hidden items-center gap-2 sm:flex">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                KS
              </div>

              <div>

                <p className="text-sm font-bold">
                  Kabadiwala
                </p>

                <p className="text-[10px] text-slate-400">
                  Collection Partner
                </p>

              </div>

            </div>

          </div>

        </div>

      </header>


      {/* ================= MESSAGE ================= */}

      {message && (

        <div className="fixed right-5 top-20 z-[100] rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">

          ✓ {message}

        </div>

      )}


      {/* ================= MAIN ================= */}

      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="text-sm font-bold text-green-600">
              COLLECTION PARTNER DASHBOARD
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Manage Pickup Requests
            </h2>

            <p className="mt-2 max-w-2xl text-slate-500">
              View nearby scrap requests, accept
              pickups and complete collections.
            </p>

          </div>


          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4">

            <p className="text-xs font-bold text-green-600">
              SERVICE AREA
            </p>

            <p className="mt-1 font-bold text-green-900">
              📍 Kolkata
            </p>

          </div>

        </div>


        {/* ================= STATS ================= */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon="♻️"
            title="Total Requests"
            value={String(totalCount)}
            subtitle="All pickup requests"
          />

          <StatCard
            icon="⏳"
            title="New Requests"
            value={String(waitingCount)}
            subtitle="Waiting for response"
          />

          <StatCard
            icon="🚲"
            title="Accepted"
            value={String(acceptedCount)}
            subtitle="Pickups to complete"
          />

          <StatCard
            icon="✓"
            title="Completed"
            value={String(completedCount)}
            subtitle="Successfully collected"
          />

        </div>


        {/* ================= TABS ================= */}

        <div className="mt-7 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">

          <Tab
            active={
              activeTab === "dashboard"
            }
            label="All Requests"
            onClick={() =>
              setActiveTab("dashboard")
            }
          />

          <Tab
            active={
              activeTab === "waiting"
            }
            label={`New (${waitingCount})`}
            onClick={() =>
              setActiveTab("waiting")
            }
          />

          <Tab
            active={
              activeTab === "accepted"
            }
            label={`Accepted (${acceptedCount})`}
            onClick={() =>
              setActiveTab("accepted")
            }
          />

          <Tab
            active={
              activeTab === "completed"
            }
            label={`Completed (${completedCount})`}
            onClick={() =>
              setActiveTab("completed")
            }
          />

        </div>


        {/* ================= SEARCH ================= */}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">

          <div className="grid gap-3 md:grid-cols-[1fr_220px]">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search material, location, quantity..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
            />

            <select
              value={filterMaterial}
              onChange={(event) =>
                setFilterMaterial(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
            >

              <option value="All">
                All Materials
              </option>

              {materials.map(
                (material) => (
                  <option
                    key={material.name}
                    value={material.name}
                  >
                    {material.name}
                  </option>
                )
              )}

            </select>

          </div>

        </div>


        {/* ================= REQUEST LIST ================= */}

        <section className="mt-6">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h3 className="text-xl font-bold">
                Pickup Requests
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {filteredRequests.length} request
                {filteredRequests.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

            <button
              type="button"
              onClick={refreshRequests}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50"
            >
              ↻ Refresh
            </button>

          </div>


          <div className="space-y-4">

            {filteredRequests.map(
              (request) => (

                <PartnerRequestCard
                  key={request.id}
                  request={request}
                  onDetails={
                    setSelectedRequest
                  }
                  onAccept={
                    acceptRequest
                  }
                  onReject={
                    rejectRequest
                  }
                  onComplete={
                    completeRequest
                  }
                />

              )
            )}


            {filteredRequests.length === 0 && (

              <EmptyState
                icon="📭"
                title="No requests found"
                text="There are no pickup requests matching your current filter."
              />

            )}

          </div>

        </section>

      </div>


      {/* ================= DETAILS MODAL ================= */}

      {selectedRequest && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-5">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold text-green-600">
                  PICKUP REQUEST
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {selectedRequest.material}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRequest(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200"
              >
                ✕
              </button>

            </div>


            {/* DETAILS */}

            <div className="mt-5 grid grid-cols-2 gap-3">

              <Detail
                label="TYPE"
                value={
                  selectedRequest.type
                }
              />

              <Detail
                label="STATUS"
                value={
                  selectedRequest.status
                }
              />

              <Detail
                label="QUANTITY"
                value={
                  selectedRequest.quantity
                }
              />

              <Detail
                label="PICKUP"
                value={
                  selectedRequest.pickupTime
                }
              />

              <Detail
                label="LOCATION"
                value={
                  selectedRequest.location
                }
              />

              <Detail
                label="IMAGE"
                value={
                  selectedRequest.image
                    ? selectedRequest.image
                    : "Not uploaded"
                }
              />

            </div>


            {/* LOCATION */}

            <div className="mt-4 rounded-2xl bg-green-50 p-4">

              <p className="text-xs font-bold text-green-600">
                PICKUP LOCATION
              </p>

              <p className="mt-1 font-bold text-green-900">
                📍 {selectedRequest.location}
              </p>

            </div>


            {/* IMAGE */}

            {selectedRequest.image && (

              <div className="mt-4 rounded-xl bg-slate-50 p-4">

                <p className="text-xs font-bold text-slate-400">
                  UPLOADED IMAGE
                </p>

                <p className="mt-1 text-sm font-semibold">
                  📷{" "}
                  {selectedRequest.image}
                </p>

              </div>

            )}


            {/* ACTIONS */}

            {selectedRequest.status ===
              "Waiting" && (

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    rejectRequest(
                      selectedRequest.id
                    )
                  }
                  className="rounded-xl border border-red-200 px-4 py-3 font-bold text-red-600 hover:bg-red-50"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() =>
                    acceptRequest(
                      selectedRequest.id
                    )
                  }
                  className="rounded-xl bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
                >
                  ✓ Accept Pickup
                </button>

              </div>

            )}


            {selectedRequest.status ===
              "Accepted" && (

              <button
                type="button"
                onClick={() =>
                  completeRequest(
                    selectedRequest.id
                  )
                }
                className="mt-5 w-full rounded-xl bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
              >
                ✓ Mark Pickup Completed
              </button>

            )}

          </div>

        </div>

      )}

    </main>
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

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
          {icon}
        </div>

        <span className="text-2xl font-bold">
          {value}
        </span>

      </div>

      <p className="mt-4 text-sm font-bold">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}


/* =====================================================
   TAB
===================================================== */

function Tab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold ${
        active
          ? "bg-green-600 text-white"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}


/* =====================================================
   REQUEST CARD
===================================================== */

function PartnerRequestCard({
  request,
  onDetails,
  onAccept,
  onReject,
  onComplete,
}: {
  request: ScrapRequest;
  onDetails: (
    request: ScrapRequest
  ) => void;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onComplete: (id: number) => void;
}) {
  const statusClass =
    request.status === "Waiting"
      ? "bg-yellow-50 text-yellow-700"
      : request.status === "Accepted"
      ? "bg-blue-50 text-blue-700"
      : request.status === "Completed"
      ? "bg-green-50 text-green-700"
      : "bg-red-50 text-red-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

        {/* ICON */}

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-3xl">

          {request.type === "Dump"
            ? "🗑️"
            : getMaterialIcon(
                request.material
              )}

        </div>


        {/* INFO */}

        <div className="flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="font-bold">
              {request.material}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${statusClass}`}
            >
              {request.status.toUpperCase()}
            </span>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            {request.type} •{" "}
            {request.quantity}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            📍 {request.location}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            🕐 {request.pickupTime}
          </p>

        </div>


        {/* ACTIONS */}

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              onDetails(request)
            }
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold hover:bg-slate-50"
          >
            View Details
          </button>


          {request.status ===
            "Waiting" && (

            <>
              <button
                type="button"
                onClick={() =>
                  onReject(request.id)
                }
                className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={() =>
                  onAccept(request.id)
                }
                className="rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-700"
              >
                Accept
              </button>
            </>

          )}


          {request.status ===
            "Accepted" && (

            <button
              type="button"
              onClick={() =>
                onComplete(request.id)
              }
              className="rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-700"
            >
              ✓ Complete
            </button>

          )}

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   MATERIAL ICON
===================================================== */

function getMaterialIcon(
  material: string
) {
  const item = materials.find(
    (m) => m.name === material
  );

  return item?.icon || "♻️";
}


/* =====================================================
   DETAIL
===================================================== */

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">

      <p className="text-[9px] font-bold text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold">
        {value}
      </p>

    </div>
  );
}


/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

      <div className="text-5xl">
        {icon}
      </div>

      <h3 className="mt-4 font-bold">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {text}
      </p>

    </div>
  );
}