import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================================================
   GET ONE LISTING
========================================================= */

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const listing = await prisma.scrapListing.findUnique({
      where: {
        id,
      },
    });

    if (!listing) {
      return NextResponse.json(
        {
          error: "Listing not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error(
      "GET /api/listings/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load listing.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PUT - UPDATE LISTING
========================================================= */

export async function PUT(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

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
      buyerName,
    } = body;

    const existingListing =
      await prisma.scrapListing.findUnique({
        where: {
          id,
        },
      });

    if (!existingListing) {
      return NextResponse.json(
        {
          error: "Listing not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updatedListing =
      await prisma.scrapListing.update({
        where: {
          id,
        },

        data: {
          ...(material !== undefined && {
            material: String(material),
          }),

          ...(quantity !== undefined && {
            quantity: String(quantity),
          }),

          ...(price !== undefined && {
            price: String(price),
          }),

          ...(location !== undefined && {
            location: String(location),
          }),

          ...(description !== undefined && {
            description: description
              ? String(description)
              : null,
          }),

          ...(imageName !== undefined && {
            imageName: imageName
              ? String(imageName)
              : null,
          }),

          ...(status !== undefined && {
            status:
              status === "Sold" ||
              status === "Reserved"
                ? status
                : "Available",
          }),

          ...(kabadiwalaName !== undefined && {
            kabadiwalaName:
              String(kabadiwalaName),
          }),

          ...(kabadiwalaId !== undefined && {
            kabadiwalaId: kabadiwalaId
              ? String(kabadiwalaId)
              : null,
          }),

          ...(buyerName !== undefined && {
            buyerName: buyerName
              ? String(buyerName)
              : null,
          }),
        },
      });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error(
      "PUT /api/listings/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to update listing.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PATCH - PARTIAL UPDATE LISTING
   Used by Kabadiwala page to mark listing as Sold/Reserved
========================================================= */

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const status = body.status;

    /* -------------------------------------------------------
       Find listing
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
          error: "Listing not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* -------------------------------------------------------
       Validate status
    ------------------------------------------------------- */

    if (
      status !== undefined &&
      status !== "Available" &&
      status !== "Sold" &&
      status !== "Reserved"
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
      status?: "Available" | "Sold" | "Reserved";
      buyerName?: string | null;
      kabadiwalaName?: string;
      kabadiwalaId?: string | null;
    } = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (body.buyerName !== undefined) {
      updateData.buyerName =
        body.buyerName
          ? String(body.buyerName)
          : null;
    }

    if (body.kabadiwalaName !== undefined) {
      updateData.kabadiwalaName =
        String(body.kabadiwalaName);
    }

    if (body.kabadiwalaId !== undefined) {
      updateData.kabadiwalaId =
        body.kabadiwalaId
          ? String(body.kabadiwalaId)
          : null;
    }

    /* -------------------------------------------------------
       Update PostgreSQL
    ------------------------------------------------------- */

    const updatedListing =
      await prisma.scrapListing.update({
        where: {
          id,
        },
        data: updateData,
      });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error(
      "PATCH /api/listings/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to update listing.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE LISTING
========================================================= */

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const existingListing =
      await prisma.scrapListing.findUnique({
        where: {
          id,
        },
      });

    if (!existingListing) {
      return NextResponse.json(
        {
          error: "Listing not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.scrapListing.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/listings/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to delete listing.",
      },
      {
        status: 500,
      }
    );
  }
}