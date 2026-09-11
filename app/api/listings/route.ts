import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================================================
   GET ALL LISTINGS
   Recycler uses this to see Kabadiwala listings
========================================================= */

export async function GET() {
  try {
    const listings =
      await prisma.scrapListing.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(listings);
  } catch (error) {
    console.error(
      "GET /api/listings error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load scrap listings.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CREATE LISTING
   Kabadiwala uses this when selling scrap
========================================================= */

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      material,
      quantity,
      price,
      location,
      description,
      imageName,
      status,
      kabadiwalaName,
      kabadiwalaId,
    } = body;

    /* -----------------------------------------------------
       REQUIRED FIELDS
    ----------------------------------------------------- */

    if (
      !material ||
      !quantity ||
      !price ||
      !location ||
      !kabadiwalaName
    ) {
      return NextResponse.json(
        {
          error:
            "Material, quantity, price, location and Kabadiwala name are required.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       CREATE DATABASE RECORD
    ----------------------------------------------------- */

    const listing =
      await prisma.scrapListing.create({
        data: {
          material: String(material),
          quantity: String(quantity),
          price: String(price),
          location: String(location),

          description:
            description
              ? String(description)
              : null,

          imageName:
            imageName
              ? String(imageName)
              : null,

          status:
            status === "Sold" ||
            status === "Reserved"
              ? status
              : "Available",

          kabadiwalaName:
            String(kabadiwalaName),

          kabadiwalaId:
            kabadiwalaId
              ? String(kabadiwalaId)
              : null,
        },
      });

    return NextResponse.json(
      listing,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/listings error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create scrap listing.",
      },
      {
        status: 500,
      }
    );
  }
}