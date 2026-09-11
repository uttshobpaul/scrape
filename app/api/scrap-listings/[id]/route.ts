import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================================
   PATCH /api/scrap-listings/[id]

   Used when the Recycler/Kabadiwala updates a scrap listing.

   Supported fields:
   - status
   - buyerName
========================================================= */

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const status =
      body.status !== undefined
        ? String(body.status).trim()
        : undefined;

    const buyerName =
      body.buyerName !== undefined
        ? body.buyerName
          ? String(body.buyerName).trim()
          : null
        : undefined;

    /* -------------------------------------------------------
       Validate listing ID
    ------------------------------------------------------- */

    if (!id) {
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
       Check that listing exists
    ------------------------------------------------------- */

    const existingListing =
      await prisma.scrapListing.findUnique({
        where: {
          id,
        },
      });

    if (!existingListing) {
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
       Allowed listing statuses
    ------------------------------------------------------- */

    const allowedStatuses = [
      "Available",
      "Reserved",
      "Sold",
    ];

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          error: "Invalid listing status.",
        },
        {
          status: 400,
        }
      );
    }

    /* -------------------------------------------------------
       Build update data
    ------------------------------------------------------- */

    const updateData: {
      status?: "Available" | "Reserved" | "Sold";
      buyerName?: string | null;
    } = {};

    if (status !== undefined) {
      updateData.status =
        status as
          | "Available"
          | "Reserved"
          | "Sold";
    }

    if (buyerName !== undefined) {
      updateData.buyerName = buyerName;
    }

    /* -------------------------------------------------------
       Nothing to update
    ------------------------------------------------------- */

    if (
      Object.keys(updateData).length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No valid listing fields were provided.",
        },
        {
          status: 400,
        }
      );
    }

    /* -------------------------------------------------------
       Update PostgreSQL
    ------------------------------------------------------- */

    const updated =
      await prisma.scrapListing.update({
        where: {
          id,
        },
        data: updateData,
      });

    return NextResponse.json({
      listing: updated,
    });
  } catch (error) {
    console.error(
      "PATCH /api/scrap-listings/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update scrap listing.",
      },
      {
        status: 500,
      }
    );
  }
}