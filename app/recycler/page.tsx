"use client";

import { useEffect, useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type ListingStatus = "Available" | "Sold" | "Reserved";

type ScrapListing = {
  id: string;
  material: string;
  quantity: string;
  price: string;
  location: string;
  description?: string;
  imageName?: string;
  imageUrl?: string;
  status: ListingStatus;
  kabadiwalaName: string;
  createdAt?: string;
  buyerName?: string;
};

type FilterMaterial =
  | "All Materials"
  | "Paper"
  | "Plastic"
  | "Iron"
  | "Copper"
  | "Aluminium"
  | "E-Waste"
  | "Glass"
  | "Cardboard"
  | "Mixed Scrap"
  | "Other";

type SortOption =
  | "Newest"
  | "Price Low to High"
  | "Price High to Low";

/*
  This is the original expected key.

  The code below ALSO scans LocalStorage for other arrays
  containing Kabadiwala-style listings.
*/
const STORAGE_KEY = "scrapsaathi_scrap_listings";

const POSSIBLE_STORAGE_KEYS = [
  "scrapsaathi_scrap_listings",
  "scrapsaathi_kabadiwala_listings",
  "kabadiwala_scrap_listings",
  "kabadiwalaListings",
  "scrapListings",
  "scrap_listings",
  "sellListings",
  "kabadiwalaSellListings",
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function RecyclerPage() {
  const [listings, setListings] = useState<ScrapListing[]>([]);

  const [search, setSearch] = useState("");

  const [materialFilter, setMaterialFilter] =
    useState<FilterMaterial>("All Materials");

  const [locationFilter, setLocationFilter] =
    useState("All Locations");

  const [sortBy, setSortBy] =
    useState<SortOption>("Newest");

  const [selectedListing, setSelectedListing] =
    useState<ScrapListing | null>(null);

  const [message, setMessage] = useState("");

  const [showBought, setShowBought] =
    useState(false);

  /* =========================================================
     LOAD LISTINGS ON PAGE LOAD
  ========================================================= */

  useEffect(() => {
    loadListings();

    /*
      Listen for changes from another tab/window.
    */
    const handleStorage = () => {
      loadListings();
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    /*
      BroadcastChannel allows the Kabadiwala page
      and Recycler page to communicate if they are
      open in different tabs.
    */
    let channel: BroadcastChannel | null = null;

    try {
      channel = new BroadcastChannel(
        "scrapsaathi_updates"
      );

      channel.onmessage = () => {
        loadListings();
      };
    } catch {
      channel = null;
    }

    /*
      Extra refresh.

      This is useful when both pages are open
      in the same browser.
    */
    const interval = setInterval(() => {
      loadListings();
    }, 1000);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      if (channel) {
        channel.close();
      }

      clearInterval(interval);
    };
  }, []);

  /* =========================================================
     LOAD ALL KABADIWALA LISTINGS
  ========================================================= */

  function loadListings() {
    try {
      const foundListings: ScrapListing[] = [];

      /*
        -------------------------------------------------------
        1. FIRST CHECK THE EXPECTED KEY
        -------------------------------------------------------
      */

      for (const key of POSSIBLE_STORAGE_KEYS) {
        const raw = localStorage.getItem(key);

        if (!raw) {
          continue;
        }

        try {
          const parsed = JSON.parse(raw);

          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              const normalized =
                normalizeListing(item);

              if (normalized) {
                foundListings.push(normalized);
              }
            }
          }
        } catch {
          /*
            Ignore invalid JSON in one key.
          */
        }
      }

      /*
        -------------------------------------------------------
        2. SCAN OTHER LOCALSTORAGE KEYS
        -------------------------------------------------------

        This is the important part.

        If your Kabadiwala page uses a key that is
        NOT included above, this scanner can still
        find it when the stored value is an array
        containing listing-like objects.
      */

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (!key) {
          continue;
        }

        /*
          We already checked these keys.
        */
        if (
          POSSIBLE_STORAGE_KEYS.includes(
            key
          )
        ) {
          continue;
        }

        /*
          Ignore obviously unrelated application
          storage.
        */
        const lowerKey =
          key.toLowerCase();

        const looksRelevant =
          lowerKey.includes("scrap") ||
          lowerKey.includes("kabadi") ||
          lowerKey.includes("sell") ||
          lowerKey.includes("listing") ||
          lowerKey.includes("waste");

        if (!looksRelevant) {
          continue;
        }

        const raw =
          localStorage.getItem(key);

        if (!raw) {
          continue;
        }

        try {
          const parsed = JSON.parse(raw);

          if (!Array.isArray(parsed)) {
            continue;
          }

          for (const item of parsed) {
            const normalized =
              normalizeListing(item);

            if (normalized) {
              foundListings.push(normalized);
            }
          }
        } catch {
          /*
            Ignore invalid values.
          */
        }
      }

      /*
        -------------------------------------------------------
        3. REMOVE DUPLICATES
        -------------------------------------------------------
      */

      const uniqueListings =
        removeDuplicateListings(
          foundListings
        );

      /*
        -------------------------------------------------------
        4. SORT BY NEWEST
        -------------------------------------------------------
      */

      uniqueListings.sort(
        (a, b) => {
          const dateA =
            a.createdAt
              ? new Date(
                  a.createdAt
                ).getTime()
              : 0;

          const dateB =
            b.createdAt
              ? new Date(
                  b.createdAt
                ).getTime()
              : 0;

          return dateB - dateA;
        }
      );

      setListings(uniqueListings);
    } catch (error) {
      console.error(
        "Unable to load Kabadiwala listings:",
        error
      );

      setListings([]);
    }
  }

  /* =========================================================
     NORMALIZE LISTING
  ========================================================= */

  function normalizeListing(
    item: any
  ): ScrapListing | null {
    if (
      !item ||
      typeof item !== "object"
    ) {
      return null;
    }

    /*
      Different pages may use different property names.

      Example:
      material / category / type
      quantity / weight / amount
      price / expectedPrice / amount
      location / city / area
      name / kabadiwalaName / sellerName
    */

    const material =
      firstString(
        item.material,
        item.category,
        item.scrapType,
        item.type,
        item.product,
        item.materialType
      );

    const quantity =
      firstString(
        item.quantity,
        item.weight,
        item.qty,
        item.amount,
        item.quantityValue
      );

    const price =
      firstString(
        item.price,
        item.expectedPrice,
        item.sellingPrice,
        item.rate,
        item.totalPrice
      );

    const location =
      firstString(
        item.location,
        item.area,
        item.city,
        item.address,
        item.pickupLocation
      );

    const kabadiwalaName =
      firstString(
        item.kabadiwalaName,
        item.kabadiwala,
        item.sellerName,
        item.seller,
        item.ownerName,
        item.userName,
        item.name,
        "Local Kabadiwala"
      );

    /*
      A real listing should contain at least
      material + quantity + price.

      This prevents unrelated LocalStorage
      arrays from appearing.
    */

    if (
      !material &&
      !quantity &&
      !price
    ) {
      return null;
    }

    const id =
      firstString(
        item.id,
        item.listingId,
        item.scrapId,
        item.productId
      ) ||
      generateListingId();

    const status =
      normalizeStatus(
        firstString(
          item.status,
          item.listingStatus,
          item.availability
        )
      );

    const description =
      firstString(
        item.description,
        item.details,
        item.notes,
        item.remark
      );

    const imageName =
      firstString(
        item.imageName,
        item.fileName,
        item.image,
        item.photoName
      );

    const imageUrl =
      firstString(
        item.imageUrl,
        item.photoUrl,
        item.imageSrc,
        item.imageBase64
      );

    const createdAt =
      firstString(
        item.createdAt,
        item.created_at,
        item.date,
        item.timestamp,
        item.listedAt
      );

    return {
      id,
      material:
        material || "Mixed Scrap",
      quantity:
        quantity || "Not specified",
      price:
        price || "Price not specified",
      location:
        location || "Location not specified",
      description,
      imageName,
      imageUrl,
      status,
      kabadiwalaName,
      createdAt,
      buyerName:
        firstString(
          item.buyerName,
          item.buyer
        ),
    };
  }

  /* =========================================================
     SAVE UPDATED LISTINGS
  ========================================================= */

  function saveListings(
    updatedListings: ScrapListing[]
  ) {
    /*
      Save the marketplace state to the
      main marketplace key.
    */

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedListings)
    );

    setListings(updatedListings);

    /*
      Tell other pages/tabs that listings changed.
    */

    try {
      const channel =
        new BroadcastChannel(
          "scrapsaathi_updates"
        );

      channel.postMessage({
        type: "LISTINGS_UPDATED",
      });

      channel.close();
    } catch {
      /*
        BroadcastChannel unavailable.
      */
    }
  }

  /* =========================================================
     BUY LISTING
  ========================================================= */

  function buyListing(
    listingId: string
  ) {
    const listing =
      listings.find(
        (item) =>
          item.id === listingId
      );

    if (!listing) {
      return;
    }

    if (
      listing.status !==
      "Available"
    ) {
      showMessage(
        "This scrap listing is no longer available."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Buy ${listing.material} (${listing.quantity}) from ${listing.kabadiwalaName} for ${listing.price}?`
      );

    if (!confirmed) {
      return;
    }

    const updatedListings =
      listings.map(
        (item) =>
          item.id === listingId
            ? {
                ...item,
                status:
                  "Sold" as ListingStatus,
                buyerName:
                  "Recycler Company",
              }
            : item
      );

    saveListings(
      updatedListings
    );

    setSelectedListing(null);

    showMessage(
      `Purchase successful. ${listing.material} has been bought from ${listing.kabadiwalaName}.`
    );
  }

  /* =========================================================
     MESSAGE
  ========================================================= */

  function showMessage(
    text: string
  ) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3500);
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  function handleLogout() {
    const confirmed =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmed) {
      return;
    }

    window.location.href = "/";
  }

  /* =========================================================
     LOCATIONS
  ========================================================= */

  const locations =
    useMemo(() => {
      const unique =
        Array.from(
          new Set(
            listings
              .map(
                (listing) =>
                  listing.location
              )
              .filter(Boolean)
          )
        );

      return unique;
    }, [listings]);

  /* =========================================================
     FILTERED LISTINGS
  ========================================================= */

  const filteredListings =
    useMemo(() => {
      let result =
        listings.filter(
          (listing) => {
            const searchText =
              search
                .toLowerCase()
                .trim();

            const matchesSearch =
              !searchText ||
              listing.material
                .toLowerCase()
                .includes(searchText) ||
              listing.quantity
                .toLowerCase()
                .includes(searchText) ||
              listing.location
                .toLowerCase()
                .includes(searchText) ||
              listing.kabadiwalaName
                .toLowerCase()
                .includes(searchText) ||
              (
                listing.description ||
                ""
              )
                .toLowerCase()
                .includes(searchText);

            const matchesMaterial =
              materialFilter ===
                "All Materials" ||
              normalizeMaterial(
                listing.material
              ) ===
                normalizeMaterial(
                  materialFilter
                );

            const matchesLocation =
              locationFilter ===
                "All Locations" ||
              listing.location ===
                locationFilter;

            return (
              matchesSearch &&
              matchesMaterial &&
              matchesLocation
            );
          }
        );

      /*
        PRICE LOW TO HIGH
      */

      if (
        sortBy ===
        "Price Low to High"
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            extractPrice(
              a.price
            ) -
            extractPrice(
              b.price
            )
        );
      }

      /*
        PRICE HIGH TO LOW
      */

      if (
        sortBy ===
        "Price High to Low"
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            extractPrice(
              b.price
            ) -
            extractPrice(
              a.price
            )
        );
      }

      /*
        NEWEST
      */

      if (
        sortBy ===
        "Newest"
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) => {
            const dateA =
              a.createdAt
                ? new Date(
                    a.createdAt
                  ).getTime()
                : 0;

            const dateB =
              b.createdAt
                ? new Date(
                    b.createdAt
                  ).getTime()
                : 0;

            return dateB - dateA;
          }
        );
      }

      return result;
    }, [
      listings,
      search,
      materialFilter,
      locationFilter,
      sortBy,
    ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalListings =
    listings.length;

  const availableListings =
    listings.filter(
      (listing) =>
        listing.status ===
        "Available"
    ).length;

  const soldListings =
    listings.filter(
      (listing) =>
        listing.status ===
        "Sold"
    ).length;

  const totalKabadiwalas =
    new Set(
      listings.map(
        (listing) =>
          listing.kabadiwalaName
      )
    ).size;

  /*
    By default only Available listings are shown.
  */

  const visibleListings =
    showBought
      ? filteredListings
      : filteredListings.filter(
          (listing) =>
            listing.status ===
            "Available"
        );

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  function resetFilters() {
    setSearch("");

    setMaterialFilter(
      "All Materials"
    );

    setLocationFilter(
      "All Locations"
    );

    setSortBy("Newest");
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-slate-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white">

        <div className="mx-auto flex min-h-[72px] max-w-[1500px] items-center justify-between gap-4 px-5 py-3 md:px-8">

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white shadow-sm">
              ♻
            </div>

            <div>

              <h1 className="text-xl font-bold tracking-tight">

                Scrap
                <span className="text-blue-600">
                  Saathi
                </span>

              </h1>

              <p className="text-[11px] text-slate-500">
                Recycler Marketplace
              </p>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-2 md:gap-3">

            <button
              type="button"
              onClick={() =>
                loadListings()
              }
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg hover:bg-blue-50"
              title="Refresh listings"
            >
              ↻
            </button>

            <div className="hidden items-center gap-3 sm:flex">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                RC
              </div>

              <div>

                <p className="text-sm font-bold">
                  Recycler Company
                </p>

                <p className="text-xs text-slate-500">
                  Recycling Partner
                </p>

              </div>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          TOAST
      ===================================================== */}

      {message && (
        <div className="fixed right-5 top-24 z-[300] max-w-sm rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-2xl">
          {message}
        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 lg:px-10">

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          <div>

            <p className="text-sm font-bold tracking-wide text-blue-600">
              RECYCLER MARKETPLACE
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Buy Bulk Scrap Directly
            </h2>

            <p className="mt-2 max-w-2xl text-base text-slate-500">
              Discover bulk scrap listed by
              local Kabadiwalas and buy
              directly through Scrap Saathi.
            </p>

          </div>

          <div className="w-fit rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4">

            <p className="text-xs font-bold text-blue-600">
              MARKETPLACE
            </p>

            <p className="mt-1 font-bold text-blue-900">
              📍 Kolkata
            </p>

          </div>

        </div>

        {/* ===================================================
            INFO CARD
        =================================================== */}

        <div className="mt-7 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
                📦
              </div>

              <div>

                <h3 className="text-lg font-bold text-blue-900">
                  Bulk scrap from local Kabadiwalas
                </h3>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-blue-700">
                  Kabadiwalas can list the bulk
                  scrap they have collected.
                  Recycler companies can discover
                  available material, compare
                  listings and buy directly from
                  the Kabadiwala.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon="📦"
            title="Total Listings"
            value={totalListings}
            subtitle="All Kabadiwala listings"
          />

          <StatCard
            icon="✓"
            title="Available"
            value={availableListings}
            subtitle="Ready to purchase"
            highlight={
              availableListings > 0
            }
          />

          <StatCard
            icon="🏪"
            title="Kabadiwalas"
            value={totalKabadiwalas}
            subtitle="Collection partners"
          />

          <StatCard
            icon="🤝"
            title="Purchased"
            value={soldListings}
            subtitle="Listings already sold"
          />

        </div>

        {/* ===================================================
            MARKETPLACE
        =================================================== */}

        <section className="mt-10">

          <div className="mb-5">

            <h3 className="text-2xl font-bold">
              Bulk Scrap Marketplace
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Browse bulk scrap currently
              listed by Kabadiwalas.
            </p>

          </div>

          {/* =================================================
              FILTER BOX
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_220px]">

              {/* SEARCH */}

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search material, Kabadiwala, location..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* MATERIAL */}

              <select
                value={
                  materialFilter
                }
                onChange={(event) =>
                  setMaterialFilter(
                    event.target
                      .value as FilterMaterial
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >

                <option>
                  All Materials
                </option>

                <option>
                  Paper
                </option>

                <option>
                  Plastic
                </option>

                <option>
                  Iron
                </option>

                <option>
                  Copper
                </option>

                <option>
                  Aluminium
                </option>

                <option>
                  E-Waste
                </option>

                <option>
                  Glass
                </option>

                <option>
                  Cardboard
                </option>

                <option>
                  Mixed Scrap
                </option>

                <option>
                  Other
                </option>

              </select>

              {/* LOCATION */}

              <select
                value={
                  locationFilter
                }
                onChange={(event) =>
                  setLocationFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >

                <option>
                  All Locations
                </option>

                {locations.map(
                  (location) => (
                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>
                  )
                )}

              </select>

              {/* SORT */}

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target
                      .value as SortOption
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >

                <option>
                  Newest
                </option>

                <option>
                  Price Low to High
                </option>

                <option>
                  Price High to Low
                </option>

              </select>

            </div>

            {/* FILTER FOOTER */}

            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-slate-500">

                <span className="font-bold text-slate-900">
                  {visibleListings.length}
                </span>{" "}

                listing
                {visibleListings.length !==
                1
                  ? "s"
                  : ""}{" "}

                found

              </p>

              <div className="flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowBought(
                      !showBought
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    showBought
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >

                  {showBought
                    ? "Showing All"
                    : "Available Only"}

                </button>

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-slate-50"
                >
                  Reset Filters
                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              LISTINGS
          ================================================= */}

          <div className="mt-6">

            {visibleListings.length ===
            0 ? (
              <EmptyMarketplace
                hasListings={
                  listings.length > 0
                }
                onReset={
                  resetFilters
                }
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {visibleListings.map(
                  (listing) => (
                    <RecyclerListingCard
                      key={
                        listing.id
                      }
                      listing={
                        listing
                      }
                      onView={() =>
                        setSelectedListing(
                          listing
                        )
                      }
                    />
                  )
                )}

              </div>
            )}

          </div>

        </section>

        {/* ===================================================
            HOW IT WORKS
        =================================================== */}

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">

          <div className="mb-6">

            <p className="text-xs font-bold tracking-wide text-blue-600">
              SIMPLE MARKETPLACE
            </p>

            <h3 className="mt-1 text-xl font-bold">
              How Scrap Saathi works
            </h3>

          </div>

          <div className="grid gap-5 md:grid-cols-3">

            <StepCard
              number="1"
              icon="📦"
              title="Kabadiwala lists scrap"
              description="The Kabadiwala lists accumulated bulk scrap with material, quantity, price and location."
            />

            <StepCard
              number="2"
              icon="🔎"
              title="Recycler discovers"
              description="Recycler companies search and filter available bulk scrap from local Kabadiwalas."
            />

            <StepCard
              number="3"
              icon="🤝"
              title="Buy directly"
              description="The Recycler selects an available listing and purchases the bulk scrap directly from the Kabadiwala."
            />

          </div>

        </section>

        {/* ===================================================
            FOOTER NOTE
        =================================================== */}

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex items-start gap-3">

            <span className="text-xl">
              ℹ️
            </span>

            <div>

              <p className="font-bold text-blue-900">
                Recycler Marketplace
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                This marketplace contains bulk
                scrap listings created by
                Kabadiwalas. Customer pickup
                requests are completely separate
                and are not shown here.
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <button
        type="button"
        onClick={
          handleLogout
        }
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 shadow-lg transition hover:bg-red-50"
      >
        🚪 Logout
      </button>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedListing && (
        <RecyclerListingModal
          listing={
            selectedListing
          }
          onClose={() =>
            setSelectedListing(
              null
            )
          }
          onBuy={() =>
            buyListing(
              selectedListing.id
            )
          }
        />
      )}

    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

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
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        highlight && value > 0
          ? "border-blue-300"
          : "border-slate-200"
      }`}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
            highlight &&
            value > 0
              ? "bg-blue-100"
              : "bg-slate-50"
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   LISTING CARD
========================================================= */

function RecyclerListingCard({
  listing,
  onView,
}: {
  listing: ScrapListing;
  onView: () => void;
}) {
  const isAvailable =
    listing.status ===
    "Available";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      {/* TOP */}

      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
            📦
          </div>

          <div>

            <h4 className="font-bold">
              {listing.material}
            </h4>

            <p className="text-xs text-slate-500">
              {listing.id}
            </p>

          </div>

        </div>

        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold ${
            isAvailable
              ? "bg-blue-50 text-blue-700"
              : listing.status ===
                  "Sold"
                ? "bg-slate-100 text-slate-600"
                : "bg-orange-50 text-orange-700"
          }`}
        >
          {listing.status}
        </span>

      </div>

      {/* KABADIWALA */}

      <div className="mt-4 rounded-xl bg-blue-50 p-3">

        <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500">
          LISTED BY
        </p>

        <p className="mt-1 font-bold text-blue-900">
          🏪 {listing.kabadiwalaName}
        </p>

      </div>

      {/* DETAILS */}

      <div className="mt-4 space-y-3">

        <div className="flex justify-between rounded-xl bg-slate-50 p-3">

          <span className="text-sm text-slate-500">
            Quantity
          </span>

          <span className="text-right text-sm font-bold">
            {listing.quantity}
          </span>

        </div>

        <div className="flex justify-between rounded-xl bg-slate-50 p-3">

          <span className="text-sm text-slate-500">
            Expected Price
          </span>

          <span className="text-right text-sm font-bold text-blue-700">
            {listing.price}
          </span>

        </div>

        <div className="flex justify-between rounded-xl bg-slate-50 p-3">

          <span className="text-sm text-slate-500">
            Location
          </span>

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

      {/* IMAGE */}

      {listing.imageUrl && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">

          <img
            src={listing.imageUrl}
            alt={listing.material}
            className="h-40 w-full object-cover"
          />

        </div>
      )}

      {/* VIEW */}

      <button
        type="button"
        onClick={onView}
        className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
      >
        View Listing
      </button>

    </div>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function RecyclerListingModal({
  listing,
  onClose,
  onBuy,
}: {
  listing: ScrapListing;
  onClose: () => void;
  onBuy: () => void;
}) {
  const isAvailable =
    listing.status ===
    "Available";

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 p-5"
      onClick={onClose}
    >

      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-slate-100 p-6">

          <div>

            <p className="text-xs font-bold tracking-wide text-blue-600">
              BULK SCRAP LISTING
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {listing.material}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {listing.id}
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

        {/* CONTENT */}

        <div className="space-y-5 p-6">

          {/* STATUS */}

          <div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                listing.status ===
                "Available"
                  ? "bg-blue-50 text-blue-700"
                  : listing.status ===
                      "Sold"
                    ? "bg-slate-100 text-slate-600"
                    : "bg-orange-50 text-orange-700"
              }`}
            >
              {listing.status}
            </span>

          </div>

          {/* MATERIAL */}

          <div className="rounded-2xl bg-blue-50 p-5">

            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              SCRAP MATERIAL
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-900">
              {listing.material}
            </p>

          </div>

          {/* SELLER */}

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              KABADIWALA
            </p>

            <div className="mt-3 flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                {getInitials(
                  listing.kabadiwalaName
                )}
              </div>

              <div>

                <p className="font-bold text-blue-900">
                  {listing.kabadiwalaName}
                </p>

                <p className="text-sm text-blue-700">
                  Local Collection Partner
                </p>

              </div>

            </div>

          </div>

          {/* DETAILS */}

          <div className="grid gap-4 sm:grid-cols-2">

            <ModalDetail
              label="Quantity"
              value={
                listing.quantity
              }
            />

            <ModalDetail
              label="Expected Price"
              value={
                listing.price
              }
            />

            <ModalDetail
              label="Location"
              value={
                listing.location
              }
            />

            <ModalDetail
              label="Listing ID"
              value={
                listing.id
              }
            />

          </div>

          {/* DESCRIPTION */}

          <div className="rounded-2xl border border-slate-200 p-5">

            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              DESCRIPTION
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {listing.description ||
                "No description provided."}
            </p>

          </div>

          {/* IMAGE */}

          {listing.imageUrl ? (
            <div className="rounded-2xl border border-slate-200 p-5">

              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                SCRAP IMAGE
              </p>

              <img
                src={listing.imageUrl}
                alt={listing.material}
                className="mt-3 max-h-80 w-full rounded-xl object-cover"
              />

            </div>
          ) : listing.imageName ? (
            <div className="rounded-2xl border border-slate-200 p-5">

              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                SCRAP IMAGE
              </p>

              <div className="mt-3 rounded-xl bg-slate-50 p-4">

                <p className="text-sm font-semibold">
                  📷 {listing.imageName}
                </p>

              </div>

            </div>
          ) : null}

          {/* PURCHASE INFO */}

          {isAvailable && (
            <div className="rounded-2xl bg-blue-50 p-5">

              <p className="font-bold text-blue-900">
                🤝 Direct purchase
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                You are purchasing this bulk
                scrap directly from the listed
                Kabadiwala through Scrap Saathi.
              </p>

            </div>
          )}

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold hover:bg-slate-50"
            >
              Close
            </button>

            {isAvailable && (
              <button
                type="button"
                onClick={onBuy}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                🤝 Buy This Scrap
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   MODAL DETAIL
========================================================= */

function ModalDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-bold">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   EMPTY MARKETPLACE
========================================================= */

function EmptyMarketplace({
  hasListings,
  onReset,
}: {
  hasListings: boolean;
  onReset: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">

      <div className="text-6xl">
        {hasListings
          ? "🔎"
          : "📦"}
      </div>

      <h3 className="mt-5 text-xl font-bold">

        {hasListings
          ? "No matching listings"
          : "No bulk scrap listed yet"}

      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

        {hasListings
          ? "Try changing your search or filters to find available scrap."
          : "When Kabadiwalas list bulk scrap, their available listings will appear here."}

      </p>

      {hasListings && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Clear Filters
        </button>
      )}

    </div>
  );
}

/* =========================================================
   STEP CARD
========================================================= */

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
          {number}
        </div>

        <div>

          <div className="text-2xl">
            {icon}
          </div>

          <h4 className="mt-2 font-bold">
            {title}
          </h4>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

/*
  Get the first usable string.
*/

function firstString(
  ...values: any[]
): string {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null
    ) {
      const text =
        String(value).trim();

      if (text.length > 0) {
        return text;
      }
    }
  }

  return "";
}

/*
  Generate ID if Kabadiwala listing
  doesn't have one.
*/

function generateListingId(): string {
  return (
    "SCRAP-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()
  );
}

/*
  Normalize status.
*/

function normalizeStatus(
  value: string
): ListingStatus {
  const status =
    value
      .toLowerCase()
      .trim();

  if (
    status === "sold" ||
    status === "sold out" ||
    status === "completed"
  ) {
    return "Sold";
  }

  if (
    status === "reserved" ||
    status === "booked"
  ) {
    return "Reserved";
  }

  /*
    Empty status means available.

    This is important because some
    Kabadiwala listing forms may not
    save status at all.
  */

  return "Available";
}

/*
  Normalize material names so filters
  work with slightly different names.
*/

function normalizeMaterial(
  value: string
): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, " ");
}

/*
  Extract numeric price.

  Examples:
  ₹25,000
  Rs 25000
  25000
  ₹25/kg
*/

function extractPrice(
  value: string
): number {
  if (!value) {
    return 0;
  }

  const cleaned =
    value
      .replace(/,/g, "")
      .replace(/[^\d.]/g, "");

  const number =
    parseFloat(cleaned);

  return Number.isNaN(number)
    ? 0
    : number;
}

/*
  Remove duplicate listings.

  This is necessary because the code checks
  multiple possible LocalStorage keys.
*/

function removeDuplicateListings(
  listings: ScrapListing[]
): ScrapListing[] {
  const map =
    new Map<
      string,
      ScrapListing
    >();

  for (const listing of listings) {
    const uniqueKey =
      [
        listing.id,
        listing.material,
        listing.quantity,
        listing.price,
        listing.location,
        listing.kabadiwalaName,
      ]
        .join("|")
        .toLowerCase();

    if (
      !map.has(uniqueKey)
    ) {
      map.set(
        uniqueKey,
        listing
      );
    }
  }

  return Array.from(
    map.values()
  );
}

/*
  Get initials for Kabadiwala.
*/

function getInitials(
  name: string
): string {
  if (!name) {
    return "K";
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 1
  ) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
}