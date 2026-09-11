import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================================================
   GET /api/orders
   Returns all orders, newest first.
========================================================= */

export async function GET() {
  try {
    const orders = await prisma.scrapOrder.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      {
        error: "Unable to load orders.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST /api/orders
   Creates a new order and reserves the listing
   in a single transaction.
========================================================= */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    /* -------------------------------------------------------
       Accept listingId from multiple possible field names
    ------------------------------------------------------- */

    const listingId = String(
      body.listingId ??
        body.scrapListingId ??
        body.listing_id ??
        ""
    ).trim();

    /* -------------------------------------------------------
       Accept buyer/recycler name from multiple field names.

       The Recycler page sends `buyerName`.
       The Kabadiwala page may send `recyclerName`.
    ------------------------------------------------------- */

    const recyclerName = String(
      body.buyerName ??
        body.recyclerName ??
        body.buyer ??
        "Recycler Company"
    ).trim();

    /* -------------------------------------------------------
       Optional recycler ID
    ------------------------------------------------------- */

    const recyclerId =
      body.recyclerId !== undefined &&
      body.recyclerId !== null &&
      String(body.recyclerId).trim() !== ""
        ? String(body.recyclerId).trim()
        : null;

    /* -------------------------------------------------------
       Validate listingId
    ------------------------------------------------------- */

    if (!listingId) {
      return NextResponse.json(
        {
          error: "Listing ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* -------------------------------------------------------
       Find the original Kabadiwala listing in PostgreSQL.
    ------------------------------------------------------- */

    const listing = await prisma.scrapListing.findUnique({
      where: {
        id: listingId,
      },
    });

    if (!listing) {
      return NextResponse.json(
        {
          error: "Scrap listing not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* -------------------------------------------------------
       Don't allow buying an already sold or reserved listing.
    ------------------------------------------------------- */

    if (listing.status !== "Available") {
      return NextResponse.json(
        {
          error:
            "This scrap listing is no longer available.",
        },
        {
          status: 409,
        }
      );
    }

    /* -------------------------------------------------------
       Generate a unique order ID.
    ------------------------------------------------------- */

    const orderId = `ORD${Date.now().toString().slice(-8)}`;

    /* -------------------------------------------------------
       Create the order and reserve the listing
       in the same transaction.
    ------------------------------------------------------- */

    const result = await prisma.$transaction(async (tx) => {
      /* ---------------------------------------------------
         1. Create the order
      --------------------------------------------------- */

      const order = await tx.scrapOrder.create({
        data: {
          orderId,

          listingId: listing.id,

          material: listing.material,
          quantity: listing.quantity,
          price: listing.price,
          totalAmount: listing.price,

          kabadiwalaName: listing.kabadiwalaName,
          kabadiwalaId: listing.kabadiwalaId,

          recyclerName,
          recyclerId,

          paymentStatus: "Pending",

          /*
            Use "Placed" for new orders.
            Your Prisma schema defines orderStatus
            as a string, so this is flexible.
          */
          orderStatus: "Placed",
        },
      });

      /* ---------------------------------------------------
         2. Reserve the listing so it can't be bought twice
      --------------------------------------------------- */

      await tx.scrapListing.update({
        where: {
          id: listing.id,
        },
        data: {
          status: "Reserved",
          buyerName: recyclerName,
        },
      });

      return order;
    });

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/orders error:", error);

    return NextResponse.json(
      {
        error: "Unable to create order.",
      },
      {
        status: 500,
      }
    );
  }
}