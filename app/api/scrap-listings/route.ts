import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================================================
   GET /api/scrap-listings
   Returns all Kabadiwala scrap listings, newest first.
========================================================= */

export async function GET() {
  try {
const listings = await prisma.scrapListing.findMany({
  where: {
    status: "Available",
  },
  orderBy: {
    createdAt: "desc",
  },
});

    /*
      Return both shapes so any frontend works:

      - raw array (if some code expects an array)
      - { listings: [...] } (if other code expects an object)
    */
    return NextResponse.json({
      listings,
    });
  } catch (error) {
    console.error("GET /api/scrap-listings error:", error);

    return NextResponse.json(
      {
        error: "Unable to load scrap listings.",
        listings: [],
      },
      {
        status: 500,
      }
    );
  }
}