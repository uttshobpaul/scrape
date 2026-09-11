import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.pickupRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("GET /api/pickups error:", error);

    return NextResponse.json(
      {
        error: "Unable to load pickup requests.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const customerName = String(
      body.customerName ?? "Uttshob"
    ).trim();

    const customerInitial = String(
      body.customerInitial ??
        customerName.charAt(0) ??
        "U"
    ).trim();

    const requestType = String(
      body.requestType ?? ""
    ).trim();

    const material = String(
      body.material ?? ""
    ).trim();

    const quantity = String(
      body.quantity ?? ""
    ).trim();

    const location = String(
      body.location ?? ""
    ).trim();

    const date = String(
      body.date ?? ""
    ).trim();

    const time = String(
      body.time ?? ""
    ).trim();

    const imageName = String(
      body.imageName ?? ""
    ).trim();

    if (
      !requestType ||
      !material ||
      !quantity ||
      !location ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        {
          error:
            "Required pickup information is missing.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      requestType !== "Sell Scrap" &&
      requestType !== "Pick & Dump"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid pickup request type.",
        },
        {
          status: 400,
        }
      );
    }

    const displayId = `#PK${Date.now()
      .toString()
      .slice(-6)}`;

    const pickup =
      await prisma.pickupRequest.create({
        data: {
          displayId,
          customerName,
          customerInitial:
            customerInitial || "U",
          requestType,
          material,
          quantity,
          location,
          date,
          time,
          imageName,
          status: "Pending",
          assignedKabadiwala: null,
        },
      });

    return NextResponse.json(
      pickup,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/pickups error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to save pickup request.",
      },
      {
        status: 500,
      }
    );
  }
}