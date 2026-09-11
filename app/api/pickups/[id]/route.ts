import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const status = String(
      body.status ?? ""
    ).trim();

    const allowedStatuses = [
      "Pending",
      "Accepted",
      "Confirmed",
      "Completed",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid pickup status.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * The Kabadiwala page may send either:
     *
     * Prisma id:
     * cmtwu9l530000cou90znxivl6
     *
     * OR displayId:
     * #PK051240
     *
     * So we search using BOTH.
     */

    const pickup = await prisma.pickupRequest.findFirst({
      where: {
        OR: [
          {
            id: id,
          },
          {
            displayId: id,
          },
        ],
      },
    });

    if (!pickup) {
      return NextResponse.json(
        {
          error: "Pickup request not found.",
        },
        {
          status: 404,
        }
      );
    }

    const assignedKabadiwala =
      body.assignedKabadiwala !== undefined
        ? body.assignedKabadiwala
        : undefined;

    const updatedPickup =
      await prisma.pickupRequest.update({
        where: {
          id: pickup.id,
        },

        data: {
          status: status as
            | "Pending"
            | "Accepted"
            | "Confirmed"
            | "Completed"
            | "Rejected",

          ...(assignedKabadiwala !== undefined
            ? {
                assignedKabadiwala:
                  assignedKabadiwala
                    ? String(
                        assignedKabadiwala
                      )
                    : null,
              }
            : {}),
        },
      });

    return NextResponse.json(
      updatedPickup
    );
  } catch (error) {
    console.error(
      "PATCH /api/pickups/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update pickup request.",
      },
      {
        status: 500,
      }
    );
  }
}