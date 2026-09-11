"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* =============================================================
   SCRAPSAATHI - KABADIWALA DASHBOARD

   TWO SEPARATE FUNCTIONS:

   1. CUSTOMER PICKUP REQUESTS
      Customer → PostgreSQL (via /api/pickups)
      → Kabadiwala accepts/rejects/completes

   2. KABADIWALA BULK SCRAP SELLING
      Kabadiwala → Lists bulk scrap
      → PostgreSQL (via /api/listings) → Recycler Dashboard

   IMPORTANT:
   The Kabadiwala listing system is COMPLETELY SEPARATE
   from customer pickup requests.
============================================================= */

/* =============================================================
   STORAGE KEYS
============================================================= */

const PICKUP_REQUESTS_KEY = "scrapsaathi_pickup_requests";

const KABADIWALA_NAME = "Kabadiwala";

/* =============================================================
   TYPES
============================================================= */

type PickupStatus =
  | "Pending"
  | "Accepted"
  | "Confirmed"
  | "Completed"
  | "Rejected";

type RequestType = "Sell Scrap" | "Pick & Dump";

type PickupRequest = {
  id: string;
  displayId?: string;
  customerName: string;
  customerInitial: string;
  requestType: RequestType;
  material: string;
  quantity: string;
  location: string;
  date: string;
  time: string;
  imageName: string;
  status: PickupStatus;
  assignedKabadiwala: string | null;
  createdAt: string;
};

type ListingStatus = "Available" | "Sold" | "Reserved";

type ScrapListing = {
  id: string;
  kabadiwalaName: string;
  kabadiwalaInitial: string;
  material: string;
  quantity: string;
  price: string;
  description: string;
  location: string;
  imageName: string;
  status: ListingStatus;
  createdAt: string;
};

type ScrapOrder = {
  id: string;
  orderId: string;
  listingId: string;
  material: string;
  quantity: string;
  price: string;
  totalAmount: string;
  kabadiwalaName: string;
  kabadiwalaId: string | null;
  recyclerName: string;
  recyclerId: string | null;
  paymentStatus: "Pending" | "Success" | "Failed";
  orderStatus: "Placed" | "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
};

type TabType = "all" | "new" | "accepted" | "completed";

/* =============================================================
   LOGOUT
============================================================= */

const handleLogout = () => {
  localStorage.removeItem("scrapsaathi_user");
  window.location.href = "/";
};

/* =============================================================
   PROTOTYPE-ONLY LOCALSTORAGE HELPERS
============================================================= */

function readRequests(): PickupRequest[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(PICKUP_REQUESTS_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Unable to read pickup requests:", error);
    return [];
  }
}

function saveRequests(requests: PickupRequest[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PICKUP_REQUESTS_KEY, JSON.stringify(requests));
}

/* =============================================================
   DEMO DATE
============================================================= */

function formatDateForDemo() {
  const date = new Date();

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* =============================================================
   MAIN PAGE
============================================================= */

export default function KabadiwalaPage() {
  /* =========================================================
     PICKUP STATES
  ========================================================= */

  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("new");
  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState("All Materials");
  const [message, setMessage] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);

  /* =========================================================
     SELL SCRAP STATES
  ========================================================= */

  const [listings, setListings] = useState<ScrapListing[]>([]);
  const [scrapOrders, setScrapOrders] = useState<ScrapOrder[]>([]);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );
  const [showSellPanel, setShowSellPanel] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ScrapListing | null>(
    null
  );
  const [sellMaterial, setSellMaterial] = useState("Paper");
  const [sellQuantity, setSellQuantity] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [sellLocation, setSellLocation] = useState("Kolkata");
  const [sellDescription, setSellDescription] = useState("");
  const [sellImageName, setSellImageName] = useState("");

  /* =========================================================
     TOAST
  ========================================================= */

  const showMessage = useCallback((text: string) => {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 3500);
  }, []);

  /* =========================================================
     LOAD PICKUP REQUESTS - POSTGRESQL API
  ========================================================= */

  const refreshRequests = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setIsLoaded(false);
      }

      try {
        const response = await fetch("/api/pickups", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load pickup requests");
        }

        const data = await response.json();

        setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("refreshRequests error:", error);

        showMessage("Unable to load pickup requests from the database.");
      } finally {
        if (showLoading) {
          setIsLoaded(true);
        }
      }
    },
    [showMessage]
  );

  /* =========================================================
     LOAD LISTINGS - POSTGRESQL API
  ========================================================= */

  const refreshListings = useCallback(async () => {
    try {
      const response = await fetch("/api/listings", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load scrap listings");
      }

      const data = await response.json();

      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("refreshListings error:", error);

      showMessage("Unable to load scrap listings from the database.");
    }
  }, [showMessage]);

  /* =========================================================
     LOAD RECYCLER PURCHASE ORDERS - POSTGRESQL API
  ========================================================= */

  const refreshScrapOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/orders", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to load recycler purchase orders."
        );
      }

      setScrapOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("refreshScrapOrders error:", error);
    }
  }, []);

  /* =========================================================
     INITIAL LOAD (runs once on mount)
  ========================================================= */

  useEffect(() => {
    let isActive = true;

    const loadInitialData = async () => {
      await Promise.all([
        refreshRequests(false),
        refreshListings(),
        refreshScrapOrders(),
      ]);

      if (isActive) {
        setIsLoaded(true);
      }
    };

    loadInitialData();

    return () => {
      isActive = false;
    };
  }, [refreshRequests, refreshListings, refreshScrapOrders]);

  /* =========================================================
     PICKUP COUNTS
  ========================================================= */

  const totalRequests = requests.length;

  const newRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const acceptedRequests = requests.filter(
    (request) =>
      request.status === "Accepted" || request.status === "Confirmed"
  ).length;

  const completedRequests = requests.filter(
    (request) => request.status === "Completed"
  ).length;

  /* =========================================================
     LISTING COUNTS
  ========================================================= */

  const totalListings = listings.length;

  const availableListings = listings.filter(
    (listing) => listing.status === "Available"
  ).length;

  /* =========================================================
     FILTER PICKUP REQUESTS
  ========================================================= */

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (activeTab === "new") {
      result = result.filter((request) => request.status === "Pending");
    }

    if (activeTab === "accepted") {
      result = result.filter(
        (request) =>
          request.status === "Accepted" || request.status === "Confirmed"
      );
    }

    if (activeTab === "completed") {
      result = result.filter((request) => request.status === "Completed");
    }

    if (materialFilter !== "All Materials") {
      result = result.filter((request) => request.material === materialFilter);
    }

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter(
        (request) =>
          request.customerName?.toLowerCase().includes(searchValue) ||
          request.material?.toLowerCase().includes(searchValue) ||
          request.location?.toLowerCase().includes(searchValue) ||
          request.quantity?.toLowerCase().includes(searchValue) ||
          request.id?.toLowerCase().includes(searchValue)
      );
    }

    return result;
  }, [requests, activeTab, materialFilter, search]);

  /* =========================================================
     ACCEPT PICKUP - POSTGRESQL API
  ========================================================= */

  const acceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(
        `/api/pickups/${encodeURIComponent(requestId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Accepted",
            assignedKabadiwala: KABADIWALA_NAME,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to accept pickup request.");
      }

      setRequests((current) =>
        current.map((item) => (item.id === requestId ? data : item))
      );

      setSelectedRequest(null);

      showMessage(`✓ ${data.displayId || requestId} accepted successfully.`);

      setActiveTab("accepted");
    } catch (error) {
      console.error("acceptRequest error:", error);

      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to accept pickup request."
      );

      refreshRequests(false);
    }
  };

  /* =========================================================
     REJECT PICKUP - POSTGRESQL API
  ========================================================= */

  const rejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(
        `/api/pickups/${encodeURIComponent(requestId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Rejected",
            assignedKabadiwala: KABADIWALA_NAME,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to reject pickup request.");
      }

      setRequests((current) =>
        current.map((item) => (item.id === requestId ? data : item))
      );

      setSelectedRequest(null);

      showMessage(`Request ${data.displayId || requestId} rejected.`);
    } catch (error) {
      console.error("rejectRequest error:", error);

      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to reject pickup request."
      );

      refreshRequests(false);
    }
  };

  /* =========================================================
     COMPLETE PICKUP - POSTGRESQL API
  ========================================================= */

  const completeRequest = async (requestId: string) => {
    try {
      const request = requests.find((item) => item.id === requestId);

      if (!request) {
        showMessage("Request not found. Refreshing...");

        refreshRequests(false);
        return;
      }

      if (request.status !== "Accepted" && request.status !== "Confirmed") {
        showMessage("Only accepted pickups can be completed.");
        return;
      }

      const response = await fetch(
        `/api/pickups/${encodeURIComponent(requestId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Completed",
            assignedKabadiwala: request.assignedKabadiwala || KABADIWALA_NAME,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to complete pickup request.");
      }

      setRequests((current) =>
        current.map((item) => (item.id === requestId ? data : item))
      );

      setSelectedRequest(null);

      showMessage(`✓ Pickup ${data.displayId || requestId} completed.`);

      setActiveTab("completed");
    } catch (error) {
      console.error("completeRequest error:", error);

      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete pickup request."
      );

      refreshRequests(false);
    }
  };

  /* =========================================================
     CONFIRM PICKUP - POSTGRESQL API
  ========================================================= */

  const confirmRequest = async (requestId: string) => {
    try {
      const response = await fetch(
        `/api/pickups/${encodeURIComponent(requestId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Confirmed",
            assignedKabadiwala: KABADIWALA_NAME,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to confirm pickup request.");
      }

      setRequests((current) =>
        current.map((item) => (item.id === requestId ? data : item))
      );

      showMessage(`Pickup ${data.displayId || requestId} confirmed.`);
    } catch (error) {
      console.error("confirmRequest error:", error);

      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to confirm pickup request."
      );

      refreshRequests(false);
    }
  };

  /* =========================================================
     ACCEPT RECYCLER PURCHASE
  ========================================================= */

  const acceptScrapOrder = async (orderId: string) => {
    if (processingOrderId) return;

    const order = scrapOrders.find((item) => item.id === orderId);

    if (!order) {
      showMessage("Purchase request not found. Refreshing...");
      await refreshScrapOrders();
      return;
    }

    if (order.orderStatus !== "Placed") {
      showMessage("This purchase request has already been processed.");
      await refreshScrapOrders();
      return;
    }

    setProcessingOrderId(orderId);

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(order.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderStatus: "Confirmed" }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Unable to accept purchase request."
        );
      }

      await refreshScrapOrders();
      await refreshListings();
      showMessage(
        `✓ Order ${order.orderId} accepted. Scrap sold to ${order.recyclerName}.`
      );
    } catch (error) {
      console.error("acceptScrapOrder error:", error);
      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to accept purchase request."
      );
    } finally {
      setProcessingOrderId(null);
    }
  };

  /* =========================================================
     REJECT RECYCLER PURCHASE
  ========================================================= */

  const rejectScrapOrder = async (orderId: string) => {
    if (processingOrderId) return;

    const order = scrapOrders.find((item) => item.id === orderId);

    if (!order) {
      showMessage("Purchase request not found. Refreshing...");
      await refreshScrapOrders();
      return;
    }

    if (order.orderStatus !== "Placed") {
      showMessage("This purchase request has already been processed.");
      await refreshScrapOrders();
      return;
    }

    setProcessingOrderId(orderId);

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(order.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderStatus: "Cancelled" }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Unable to reject purchase request."
        );
      }

      await refreshScrapOrders();
      await refreshListings();
      showMessage(
        `Order ${order.orderId} rejected. The scrap is available again.`
      );
    } catch (error) {
      console.error("rejectScrapOrder error:", error);
      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to reject purchase request."
      );
    } finally {
      setProcessingOrderId(null);
    }
  };

  /* =========================================================
     CREATE DEMO PICKUP (prototype-only, localStorage)
  ========================================================= */

  const createDemoRequest = () => {
    const current = readRequests();

    const demoRequest: PickupRequest = {
      id: `#PK${Date.now().toString().slice(-6)}`,
      customerName: "Demo Customer",
      customerInitial: "D",
      requestType: "Sell Scrap",
      material: "Paper",
      quantity: "10 kg",
      location: "Salt Lake, Kolkata",
      date: formatDateForDemo(),
      time: "6:00 PM",
      imageName: "",
      status: "Pending",
      assignedKabadiwala: null,
      createdAt: new Date().toISOString(),
    };

    saveRequests([demoRequest, ...current]);

    setActiveTab("new");

    showMessage("Demo pickup request created.");
  };

  /* =========================================================
     CLEAR PICKUP REQUESTS (prototype-only, localStorage)
  ========================================================= */

  const clearAllRequests = () => {
    const confirmed = window.confirm(
      "Delete all pickup requests from this browser?"
    );

    if (!confirmed) {
      return;
    }

    saveRequests([]);

    showMessage("All pickup requests cleared.");
  };

  /* =========================================================
     ADD BULK SCRAP LISTING - POSTGRESQL
  ========================================================= */

  const addScrapListing = async () => {
    if (!sellQuantity.trim()) {
      showMessage("Please enter the scrap quantity.");
      return;
    }

    if (!sellPrice.trim()) {
      showMessage("Please enter your expected price.");
      return;
    }

    if (!sellLocation.trim()) {
      showMessage("Please enter the location.");
      return;
    }

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          material: sellMaterial,
          quantity: sellQuantity.trim(),
          price: sellPrice.trim(),
          location: sellLocation.trim(),
          description: sellDescription.trim() || null,
          imageName: sellImageName || null,
          status: "Available",
          kabadiwalaName: KABADIWALA_NAME,
          kabadiwalaId: null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Unable to create listing."
        );
      }

      setSellMaterial("Paper");
      setSellQuantity("");
      setSellPrice("");
      setSellLocation("Kolkata");
      setSellDescription("");
      setSellImageName("");
      setShowSellPanel(false);

      await refreshListings();

      showMessage("✓ Your bulk scrap has been listed for recyclers.");
    } catch (error) {
      console.error("Unable to create scrap listing:", error);
      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to create scrap listing."
      );
    }
  };

  /* =========================================================
     REMOVE LISTING - POSTGRESQL
  ========================================================= */

  const removeListing = async (listingId: string) => {
    const confirmed = window.confirm("Remove this scrap listing?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/listings/${encodeURIComponent(listingId)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Unable to remove listing."
        );
      }

      await refreshListings();
      setSelectedListing(null);
      showMessage("Scrap listing removed.");
    } catch (error) {
      console.error("Unable to remove listing:", error);
      showMessage(
        error instanceof Error ? error.message : "Unable to remove listing."
      );
    }
  };

  /* =========================================================
     MARK LISTING SOLD - POSTGRESQL
  ========================================================= */

  const markListingSold = async (listingId: string) => {
    try {
      const response = await fetch(
        `/api/listings/${encodeURIComponent(listingId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Sold",
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("MARK LISTING SOLD API ERROR:", {
          status: response.status,
          data,
        });

        throw new Error(
          data?.error ||
            data?.message ||
            `Unable to update listing. HTTP ${response.status}`
        );
      }

      await refreshListings();
      setSelectedListing(null);
      showMessage("Listing marked as sold.");
    } catch (error) {
      console.error("Unable to mark listing as sold:", error);
      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to mark listing as sold."
      );
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-center">
          <div className="text-4xl">♻️</div>

          <p className="mt-3 font-semibold text-slate-600">
            Loading Kabadiwala Dashboard...
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      {/* ===================================================
          NAVBAR
      =================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-[1500px] items-center justify-between gap-4 px-5 py-3 md:px-8">
          {/* LOGO */}

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-2xl text-white shadow-sm">
              ♻
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Scrap
                <span className="text-amber-500">Saathi</span>
              </h1>

              <p className="text-[11px] text-slate-500">
                Collection Partner
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-2 md:gap-3">
            {/* SELL SCRAP BUTTON */}

            <button
              type="button"
              onClick={() => setShowSellPanel(true)}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
            >
              <span>+</span>

              <span className="hidden sm:inline">Sell Scrap</span>

              <span className="sm:hidden">Sell</span>
            </button>

            {/* NOTIFICATION */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl hover:bg-slate-50"
                title="New pickup requests"
              >
                🔔

                {newRequests > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                    {newRequests > 99 ? "99+" : newRequests}
                  </span>
                )}
              </button>
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => refreshRequests(true)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg hover:bg-slate-50"
              title="Refresh"
            >
              ↻
            </button>

            {/* USER */}

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                KS
              </div>

              <div>
                <p className="text-sm font-bold">Kabadiwala</p>

                <p className="text-xs text-slate-500">
                  Collection Partner
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================
          TOAST
      =================================================== */}

      {message && (
        <div className="fixed right-5 top-24 z-[300] max-w-sm rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-2xl">
          {message}
        </div>
      )}

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 lg:px-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold tracking-wide text-amber-500">
              COLLECTION PARTNER DASHBOARD
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Manage Your Scrap Business
            </h2>

            <p className="mt-2 max-w-2xl text-base text-slate-500">
              Manage customer pickup requests and sell your accumulated bulk
              scrap directly to recycling companies.
            </p>
          </div>

          {/* SERVICE AREA */}

          <div className="w-fit rounded-2xl border border-green-200 bg-green-50 px-6 py-4">
            <p className="text-xs font-bold text-amber-500">SERVICE AREA</p>

            <p className="mt-1 font-bold text-green-900">📍 Kolkata</p>
          </div>
        </div>

        {/* =================================================
            SELL SCRAP QUICK CARD
        ================================================= */}

        <div className="mt-7 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-white p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-2xl text-white">
                📦
              </div>

              <div>
                <h3 className="text-lg font-bold text-green-900">
                  Have bulk scrap to sell?
                </h3>

                <p className="mt-1 max-w-2xl text-sm text-green-700">
                  List the scrap you have collected. Recycling companies can
                  discover your listing and buy directly from you.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSellPanel(true)}
              className="w-full rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 lg:w-auto"
            >
              + List Bulk Scrap
            </button>
          </div>
        </div>

        {/* =================================================
            PICKUP ALERT
        ================================================= */}

        {newRequests > 0 ? (
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className="mt-7 flex w-full items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-5 text-left transition hover:border-green-300 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                🔔
              </div>

              <div>
                <h3 className="font-bold text-green-900">
                  New pickup request
                  {newRequests !== 1 ? "s" : ""} received
                </h3>

                <p className="mt-1 text-sm text-green-700">
                  {newRequests} new request
                  {newRequests !== 1 ? "s are" : " is"} waiting for your
                  response.
                </p>
              </div>
            </div>

            <span className="font-bold text-green-700">View →</span>
          </button>
        ) : (
          <div className="mt-7 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-2xl">
              ✓
            </div>

            <div>
              <h3 className="font-bold">No new pickup requests</h3>

              <p className="mt-1 text-sm text-slate-500">
                New customer requests will automatically appear here.
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon="♻️"
            title="Pickup Requests"
            value={totalRequests}
            subtitle="Customer requests"
          />

          <StatCard
            icon="⏛"
            title="New Requests"
            value={newRequests}
            subtitle="Waiting for response"
            highlight={newRequests > 0}
          />

          <StatCard
            icon="🚲"
            title="Accepted"
            value={acceptedRequests}
            subtitle="Pickups to complete"
          />

          <StatCard
            icon="📦"
            title="My Listings"
            value={totalListings}
            subtitle="Bulk scrap listed"
          />

          <StatCard
            icon="✓"
            title="Available"
            value={availableListings}
            subtitle="Available for recyclers"
            highlight={availableListings > 0}
          />
        </div>

        {/* =================================================
            RECYCLER PURCHASE REQUESTS
        ================================================= */}
        {scrapOrders.filter((order) => order.orderStatus === "Placed").length >
          0 && (
          <section className="mt-8">
            <div className="mb-4">
              <h3 className="text-xl font-bold">
                Recycler Purchase Requests
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Recycling companies have requested to buy your listed scrap.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {scrapOrders
                .filter((order) => order.orderStatus === "Placed")
                .map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                          New Purchase Request
                        </p>
                        <h4 className="mt-1 text-lg font-bold text-slate-900">
                          {order.recyclerName}
                        </h4>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                        {order.orderId}
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Scrap
                      </p>
                      <p className="mt-1 font-bold text-slate-900">
                        {order.material}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">Quantity</p>
                          <p className="font-semibold">{order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Price</p>
                          <p className="font-semibold">
                            ₹{order.totalAmount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        disabled={processingOrderId === order.id}
                        onClick={() => acceptScrapOrder(order.id)}
                        className="flex-1 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingOrderId === order.id
                          ? "Processing..."
                          : "Accept"}
                      </button>
                      <button
                        type="button"
                        disabled={processingOrderId === order.id}
                        onClick={() => rejectScrapOrder(order.id)}
                        className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* =================================================
            MY SCRAP LISTINGS
        ================================================= */}

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold">My Bulk Scrap Listings</h3>

              <p className="mt-1 text-sm text-slate-500">
                Scrap listed here is visible to recycling companies.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSellPanel(true)}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
            >
              + Add Listing
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="text-5xl">📦</div>

              <h3 className="mt-4 text-lg font-bold">
                No bulk scrap listed yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                When you have accumulated bulk scrap, list it here so
                recycling companies can buy directly from you.
              </p>

              <button
                type="button"
                onClick={() => setShowSellPanel(true)}
                className="mt-5 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
              >
                List Your First Scrap
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onView={() => setSelectedListing(listing)}
                />
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            PICKUP REQUEST TABS
        ================================================= */}

        <div className="mt-10">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Customer Pickup Requests</h3>

            <p className="mt-1 text-sm text-slate-500">
              Manage scrap collection requests from customers.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <div className="flex min-w-max p-2">
              <TabButton
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
                label={`All Requests (${totalRequests})`}
              />

              <TabButton
                active={activeTab === "new"}
                onClick={() => setActiveTab("new")}
                label={`New (${newRequests})`}
              />

              <TabButton
                active={activeTab === "accepted"}
                onClick={() => setActiveTab("accepted")}
                label={`Accepted (${acceptedRequests})`}
              />

              <TabButton
                active={activeTab === "completed"}
                onClick={() => setActiveTab("completed")}
                label={`Completed (${completedRequests})`}
              />
            </div>
          </div>

          {/* SEARCH */}

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search material, customer, location, quantity..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-green-500"
                />
              </div>

              <select
                value={materialFilter}
                onChange={(e) => setMaterialFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-500 md:w-64"
              >
                <option>All Materials</option>
                <option>Paper</option>
                <option>Plastic</option>
                <option>Iron</option>
                <option>Copper</option>
                <option>E-Waste</option>
                <option>Aluminium</option>
                <option>Glass</option>
                <option>Other</option>
                <option>Mixed Waste</option>
              </select>
            </div>
          </div>

          {/* REQUEST LIST */}

          <div className="mt-6">
            <div className="mb-4">
              <p className="text-sm text-slate-500">
                {filteredRequests.length} request
                {filteredRequests.length !== 1 ? "s" : ""} shown
              </p>
            </div>

            {filteredRequests.length === 0 ? (
              <EmptyState
                tab={activeTab}
                totalRequests={totalRequests}
                onCreateDemo={createDemoRequest}
              />
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <PickupCard
                    key={request.id}
                    request={request}
                    onView={() => setSelectedRequest(request)}
                    onAccept={() => acceptRequest(request.id)}
                    onReject={() => rejectRequest(request.id)}
                    onConfirm={() => confirmRequest(request.id)}
                    onComplete={() => completeRequest(request.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            PROTOTYPE CONTROLS
        ================================================= */}

        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold tracking-wide text-slate-400">
                PROTOTYPE TEST CONTROLS
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Test customer pickup requests during development.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={createDemoRequest}
                className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
              >
                + Create Demo Request
              </button>

              <button
                type="button"
                onClick={clearAllRequests}
                className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
              >
                Clear Requests
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          LOGOUT
      =================================================== */}

      <button
        type="button"
        onClick={handleLogout}
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 shadow-lg transition hover:bg-red-50"
      >
        🚪 Logout
      </button>

      {/* ===================================================
          PICKUP DETAIL MODAL
      =================================================== */}

      {selectedRequest && (
        <RequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAccept={() => acceptRequest(selectedRequest.id)}
          onReject={() => rejectRequest(selectedRequest.id)}
          onConfirm={() => confirmRequest(selectedRequest.id)}
          onComplete={() => completeRequest(selectedRequest.id)}
        />
      )}

      {/* ===================================================
          SELL SCRAP MODAL
      =================================================== */}

      {showSellPanel && (
        <SellScrapModal
          material={sellMaterial}
          setMaterial={setSellMaterial}
          quantity={sellQuantity}
          setQuantity={setSellQuantity}
          price={sellPrice}
          setPrice={setSellPrice}
          location={sellLocation}
          setLocation={setSellLocation}
          description={sellDescription}
          setDescription={setSellDescription}
          imageName={sellImageName}
          setImageName={setSellImageName}
          onClose={() => setShowSellPanel(false)}
          onSubmit={addScrapListing}
        />
      )}

      {/* ===================================================
          LISTING DETAIL MODAL
      =================================================== */}

      {selectedListing && (
        <ListingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onSold={() => markListingSold(selectedListing.id)}
          onDelete={() => removeListing(selectedListing.id)}
        />
      )}
    </main>
  );
}

/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
  icon,
  title,
  value,
  subtitle,
  highlight = false,
}: {
  icon: string;
  title: string;
  value: number;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 ${
        highlight && value > 0 ? "border-green-300" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-3 text-3xl font-bold">{value}</p>

          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
            highlight && value > 0 ? "bg-green-100" : "bg-slate-50"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   TAB BUTTON
============================================================= */

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
      className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
        active
          ? "bg-amber-500 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

/* =============================================================
   PICKUP CARD
============================================================= */

function PickupCard({
  request,
  onView,
  onAccept,
  onReject,
  onConfirm,
  onComplete,
}: {
  request: PickupRequest;
  onView: () => void;
  onAccept: () => void;
  onReject: () => void;
  onConfirm: () => void;
  onComplete: () => void;
}) {
  const isPending = request.status === "Pending";

  const isAccepted =
    request.status === "Accepted" || request.status === "Confirmed";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* TOP */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-2xl">
            {request.requestType === "Sell Scrap" ? "💰" : "🚛"}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold">{request.requestType}</h3>

              <StatusBadge status={request.status} />
            </div>

            <p className="mt-1 text-sm text-slate-500">{request.id}</p>

            <p className="mt-2 text-sm font-semibold">
              Customer: {request.customerName}
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onView}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-slate-50"
          >
            View Details
          </button>

          {isPending && (
            <>
              <button
                type="button"
                onClick={onReject}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={onAccept}
                className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
              >
                Accept Pickup
              </button>
            </>
          )}

          {isAccepted && (
            <button
              type="button"
              onClick={onComplete}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
            >
              ✓ Complete Pickup
            </button>
          )}
        </div>
      </div>

      {/* DETAILS */}

      <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoItem label="Material" value={request.material} icon="♻️" />

        <InfoItem label="Quantity" value={request.quantity} icon="⚖️" />

        <InfoItem label="Date" value={request.date} icon="📅" />

        <InfoItem label="Time" value={request.time} icon="🕒" />
      </div>

      {/* LOCATION */}

      <div className="mt-4 rounded-2xl border border-slate-100 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          PICKUP LOCATION
        </p>

        <p className="mt-1 text-sm font-semibold">📍 {request.location}</p>
      </div>

      {/* ASSIGNED */}

      {request.assignedKabadiwala && (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-500">
            ASSIGNED COLLECTION PARTNER
          </p>

          <p className="mt-1 text-sm font-bold text-green-800">
            {request.assignedKabadiwala}
          </p>
        </div>
      )}
    </div>
  );
}

/* =============================================================
   INFO ITEM
============================================================= */

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>

        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-bold">{value}</p>
    </div>
  );
}

/* =============================================================
   STATUS BADGE
============================================================= */

function StatusBadge({ status }: { status: PickupStatus }) {
  let classes = "bg-slate-100 text-slate-600";

  if (status === "Pending") {
    classes = "bg-orange-50 text-orange-700";
  }

  if (status === "Accepted" || status === "Confirmed") {
    classes = "bg-green-50 text-green-700";
  }

  if (status === "Completed") {
    classes = "bg-blue-50 text-blue-700";
  }

  if (status === "Rejected") {
    classes = "bg-red-50 text-red-700";
  }

  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${classes}`}>
      {status}
    </span>
  );
}

/* =============================================================
   EMPTY STATE
============================================================= */

function EmptyState({
  tab,
  totalRequests,
  onCreateDemo,
}: {
  tab: TabType;
  totalRequests: number;
  onCreateDemo: () => void;
}) {
  let title = "No pickup requests found.";
  let description =
    "New customer requests will appear here automatically.";

  if (tab === "new") {
    title = "No new requests.";
    description =
      "When a customer creates a pickup request, it will appear here automatically.";
  }

  if (tab === "accepted") {
    title = "No accepted pickups.";
    description = "Accepted customer requests will appear here.";
  }

  if (tab === "completed") {
    title = "No completed pickups.";
    description = "Completed collections will appear here.";
  }

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="text-5xl">
        {tab === "new"
          ? "📥"
          : tab === "accepted"
            ? "🚲"
            : tab === "completed"
              ? "✓"
              : "♻️"}
      </div>

      <h3 className="mt-5 text-xl font-bold">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {totalRequests === 0 && (
        <button
          type="button"
          onClick={onCreateDemo}
          className="mt-6 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
        >
          Create Test Request
        </button>
      )}
    </div>
  );
}

/* =============================================================
   PICKUP REQUEST MODAL
============================================================= */

function RequestModal({
  request,
  onClose,
  onAccept,
  onReject,
  onConfirm,
  onComplete,
}: {
  request: PickupRequest;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  onConfirm: () => void;
  onComplete: () => void;
}) {
  const isPending = request.status === "Pending";

  const isAccepted =
    request.status === "Accepted" || request.status === "Confirmed";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-amber-500">PICKUP REQUEST</p>

            <h2 className="mt-1 text-2xl font-bold">
              {request.requestType}
            </h2>

            <p className="mt-1 text-sm text-slate-500">{request.id}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        <div className="mt-5">
          <StatusBadge status={request.status} />
        </div>

        <div className="mt-5 rounded-2xl bg-green-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-500">
            CUSTOMER
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 font-bold text-white">
              {request.customerInitial ||
                request.customerName?.charAt(0).toUpperCase() ||
                "C"}
            </div>

            <div>
              <p className="font-bold text-green-900">
                {request.customerName}
              </p>

              <p className="text-sm text-green-700">Customer</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ModalDetail label="Material" value={request.material} />

          <ModalDetail label="Quantity" value={request.quantity} />

          <ModalDetail label="Pickup Date" value={request.date} />

          <ModalDetail label="Pickup Time" value={request.time} />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            PICKUP LOCATION
          </p>

          <p className="mt-2 font-semibold">📍 {request.location}</p>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            CUSTOMER IMAGE
          </p>

          {request.imageName ? (
            <div className="mt-3 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold">
                📷 {request.imageName}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No image uploaded.</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold hover:bg-slate-50"
          >
            Close
          </button>

          {isPending && (
            <>
              <button
                type="button"
                onClick={onReject}
                className="rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={onAccept}
                className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
              >
                Accept Pickup
              </button>
            </>
          )}

          {request.status === "Accepted" && (
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
            >
              Confirm Pickup
            </button>
          )}

          {isAccepted && (
            <button
              type="button"
              onClick={onComplete}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              ✓ Mark Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   MODAL DETAIL
============================================================= */

function ModalDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-bold">{value}</p>
    </div>
  );
}

/* =============================================================
   SELL SCRAP MODAL
============================================================= */

function SellScrapModal({
  material,
  setMaterial,
  quantity,
  setQuantity,
  price,
  setPrice,
  location,
  setLocation,
  description,
  setDescription,
  imageName,
  setImageName,
  onClose,
  onSubmit,
}: {
  material: string;
  setMaterial: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  imageName: string;
  setImageName: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-xs font-bold tracking-wide text-amber-500">
              SELL BULK SCRAP
            </p>

            <h2 className="mt-1 text-2xl font-bold">List Your Scrap</h2>

            <p className="mt-1 text-sm text-slate-500">
              Your listing will be visible to recycling companies.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <div className="space-y-5 p-6">
          {/* MATERIAL */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Scrap Material
            </label>

            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-500"
            >
              <option>Paper</option>
              <option>Plastic</option>
              <option>Iron</option>
              <option>Copper</option>
              <option>Aluminium</option>
              <option>E-Waste</option>
              <option>Glass</option>
              <option>Cardboard</option>
              <option>Mixed Scrap</option>
              <option>Other</option>
            </select>
          </div>

          {/* QUANTITY + PRICE */}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold">Quantity</label>

              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500 kg"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Expected Price
              </label>

              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. ₹25,000"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* LOCATION */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Scrap Location
            </label>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Salt Lake, Kolkata"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Description
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the scrap quality, condition, packaging, etc."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          {/* IMAGE */}

          <div>
            <label className="mb-2 block text-sm font-bold">
              Scrap Image
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  setImageName(file.name);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
            />

            {imageName && (
              <p className="mt-2 text-xs text-amber-500">📷 {imageName}</p>
            )}
          </div>

          {/* INFO */}

          <div className="rounded-2xl bg-green-50 p-4">
            <p className="text-sm font-bold text-green-900">
              ♻️ How this works
            </p>

            <p className="mt-1 text-sm leading-6 text-green-700">
              Your listing will appear on the Recycler Dashboard. Recycling
              companies can filter materials and contact/buy available bulk
              scrap.
            </p>
          </div>

          {/* BUTTONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
            >
              List Scrap for Recyclers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   LISTING CARD
============================================================= */

function ListingCard({
  listing,
  onView,
}: {
  listing: ScrapListing;
  onView: () => void;
}) {
  const isAvailable = listing.status === "Available";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* TOP */}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
            📦
          </div>

          <div>
            <h4 className="font-bold">{listing.material}</h4>

            <p className="text-xs text-slate-500">{listing.id}</p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold ${
            isAvailable
              ? "bg-green-50 text-green-700"
              : listing.status === "Sold"
                ? "bg-slate-100 text-slate-600"
                : "bg-orange-50 text-orange-700"
          }`}
        >
          {listing.status}
        </span>
      </div>

      {/* DETAILS */}

      <div className="mt-5 space-y-3">
        <div className="flex justify-between rounded-xl bg-slate-50 p-3">
          <span className="text-sm text-slate-500">Quantity</span>

          <span className="text-sm font-bold">{listing.quantity}</span>
        </div>

        <div className="flex justify-between rounded-xl bg-slate-50 p-3">
          <span className="text-sm text-slate-500">Expected Price</span>

          <span className="text-sm font-bold text-green-700">
            {listing.price}
          </span>
        </div>

        <div className="flex justify-between rounded-xl bg-slate-50 p-3">
          <span className="text-sm text-slate-500">Location</span>

          <span className="max-w-[55%] text-right text-sm font-bold">
            📍 {listing.location}
          </span>
        </div>
      </div>

      {/* DESCRIPTION */}

      {listing.description && (
        <p className="mt-4 line-clamp-2 text-sm leading-5 text-slate-500">
          {listing.description}
        </p>
      )}

      {/* BUTTON */}

      <button
        type="button"
        onClick={onView}
        className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold hover:bg-slate-50"
      >
        View Listing
      </button>
    </div>
  );
}

/* =============================================================
   LISTING DETAIL MODAL
============================================================= */

function ListingModal({
  listing,
  onClose,
  onSold,
  onDelete,
}: {
  listing: ScrapListing;
  onClose: () => void;
  onSold: () => void;
  onDelete: () => void;
}) {
  const isAvailable = listing.status === "Available";

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-xs font-bold text-amber-500">
              MY SCRAP LISTING
            </p>

            <h2 className="mt-1 text-2xl font-bold">{listing.material}</h2>

            <p className="mt-1 text-sm text-slate-500">{listing.id}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}

        <div className="space-y-4 p-6">
          {/* STATUS */}

          <div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                listing.status === "Available"
                  ? "bg-green-50 text-green-700"
                  : listing.status === "Sold"
                    ? "bg-slate-100 text-slate-600"
                    : "bg-orange-50 text-orange-700"
              }`}
            >
              {listing.status}
            </span>
          </div>

          {/* MATERIAL */}

          <div className="rounded-2xl bg-green-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-500">
              SCRAP MATERIAL
            </p>

            <p className="mt-2 text-xl font-bold text-green-900">
              {listing.material}
            </p>
          </div>

          {/* DETAILS */}

          <div className="grid gap-4 sm:grid-cols-2">
            <ModalDetail label="Quantity" value={listing.quantity} />

            <ModalDetail label="Expected Price" value={listing.price} />

            <ModalDetail label="Location" value={listing.location} />

            <ModalDetail label="Seller" value={listing.kabadiwalaName} />
          </div>

          {/* DESCRIPTION */}

          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              DESCRIPTION
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {listing.description || "No description provided."}
            </p>
          </div>

          {/* IMAGE */}

          {listing.imageName && (
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                SCRAP IMAGE
              </p>

              <p className="mt-2 text-sm font-semibold">
                📷 {listing.imageName}
              </p>
            </div>
          )}

          {/* ACTIONS */}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
            >
              Delete Listing
            </button>

            {isAvailable && (
              <button
                type="button"
                onClick={onSold}
                className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
              >
                ✓ Mark as Sold
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}