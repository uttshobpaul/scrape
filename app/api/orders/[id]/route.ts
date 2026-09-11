import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================================
   GET /api/orders/[id]

   Finds an order using either:
   - Prisma database id
   - Public orderId
========================================================= */

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const order =
      await prisma.scrapOrder.findFirst({
        where: {
          OR: [
            {
              id,
            },
            {
              orderId: id,
            },
          ],
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(
      "GET /api/orders/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load order.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PATCH /api/orders/[id]

   Used for:

   1. Kabadiwala accepts order
      orderStatus = Confirmed
      listingStatus = Sold

   2. Kabadiwala rejects order
      orderStatus = Cancelled
      listingStatus = Available

   3. Recycler payment succeeds
      paymentStatus = Success

   4. Order completed
      orderStatus = Completed
      listingStatus = Sold
========================================================= */

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    /* -------------------------------------------------------
       Find order by database id OR public orderId
    ------------------------------------------------------- */

    const order =
      await prisma.scrapOrder.findFirst({
        where: {
          OR: [
            {
              id,
            },
            {
              orderId: id,
            },
          ],
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* -------------------------------------------------------
       Read requested changes
    ------------------------------------------------------- */

    const requestedPaymentStatus =
      body.paymentStatus !== undefined
        ? String(body.paymentStatus).trim()
        : undefined;

    const requestedOrderStatus =
      body.orderStatus !== undefined
        ? String(body.orderStatus).trim()
        : undefined;

    /* -------------------------------------------------------
       Validate PaymentStatus
    ------------------------------------------------------- */

    const allowedPaymentStatuses = [
      "Pending",
      "Success",
      "Failed",
    ];

    if (
      requestedPaymentStatus !== undefined &&
      !allowedPaymentStatuses.includes(
        requestedPaymentStatus
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid payment status.",
        },
        {
          status: 400,
        }
      );
    }

    /* -------------------------------------------------------
       Validate OrderStatus
    ------------------------------------------------------- */

    const allowedOrderStatuses = [
      "Placed",
      "Confirmed",
      "Completed",
      "Cancelled",
    ];

    if (
      requestedOrderStatus !== undefined &&
      !allowedOrderStatuses.includes(
        requestedOrderStatus
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid order status.",
        },
        {
          status: 400,
        }
      );
    }

    /* -------------------------------------------------------
       Nothing to update
    ------------------------------------------------------- */

    if (
      requestedPaymentStatus === undefined &&
      requestedOrderStatus === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "No order status or payment status provided.",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================================
       IMPORTANT WORKFLOW RULES
    ======================================================= */

    /* -------------------------------------------------------
       REJECTED ORDER

       Kabadiwala rejects the Recycler's purchase request.

       Order:
       Cancelled

       Listing:
       Available again

       This allows other Recycler companies to see/buy it.
    ------------------------------------------------------- */

    if (
      requestedOrderStatus ===
      "Cancelled"
    ) {
      const result =
        await prisma.$transaction(
          async (tx) => {
            const updatedOrder =
              await tx.scrapOrder.update({
                where: {
                  id: order.id,
                },
                data: {
                  orderStatus: "Cancelled",
                },
              });

            await tx.scrapListing.update({
              where: {
                id: order.listingId,
              },
              data: {
                status: "Available",
                buyerName: null,
              },
            });

            return updatedOrder;
          }
        );

      return NextResponse.json(result);
    }

    /* -------------------------------------------------------
       ACCEPTED ORDER

       Kabadiwala accepts the Recycler's purchase request.

       Order:
       Confirmed

       Listing:
       Sold

       Buyer:
       Recycler company
    ------------------------------------------------------- */

    if (
      requestedOrderStatus ===
      "Confirmed"
    ) {
      const result =
        await prisma.$transaction(
          async (tx) => {
            const updatedOrder =
              await tx.scrapOrder.update({
                where: {
                  id: order.id,
                },
                data: {
                  orderStatus: "Confirmed",
                },
              });

            await tx.scrapListing.update({
              where: {
                id: order.listingId,
              },
              data: {
                status: "Sold",
                buyerName:
                  order.recyclerName,
              },
            });

            return updatedOrder;
          }
        );

      return NextResponse.json(result);
    }

    /* -------------------------------------------------------
       PAYMENT SUCCESS

       Payment is successful.

       We DO NOT need to change the listing here because
       the listing was already marked Sold when Kabadiwala
       accepted the order.
    ------------------------------------------------------- */

    if (
      requestedPaymentStatus ===
      "Success"
    ) {
      const updatedOrder =
        await prisma.scrapOrder.update({
          where: {
            id: order.id,
          },
          data: {
            paymentStatus: "Success",
          },
        });

      return NextResponse.json(
        updatedOrder
      );
    }

    /* -------------------------------------------------------
       PAYMENT FAILED

       Listing remains unchanged.

       The order remains in its current order status.
    ------------------------------------------------------- */

    if (
      requestedPaymentStatus ===
      "Failed"
    ) {
      const updatedOrder =
        await prisma.scrapOrder.update({
          where: {
            id: order.id,
          },
          data: {
            paymentStatus: "Failed",
          },
        });

      return NextResponse.json(
        updatedOrder
      );
    }

    /* -------------------------------------------------------
       PAYMENT RESET / PENDING
    ------------------------------------------------------- */

    if (
      requestedPaymentStatus ===
      "Pending"
    ) {
      const updatedOrder =
        await prisma.scrapOrder.update({
          where: {
            id: order.id,
          },
          data: {
            paymentStatus: "Pending",
          },
        });

      return NextResponse.json(
        updatedOrder
      );
    }

    /* -------------------------------------------------------
       ORDER COMPLETED

       Keep the listing Sold.
    ------------------------------------------------------- */

    if (
      requestedOrderStatus ===
      "Completed"
    ) {
      const result =
        await prisma.$transaction(
          async (tx) => {
            const updatedOrder =
              await tx.scrapOrder.update({
                where: {
                  id: order.id,
                },
                data: {
                  orderStatus: "Completed",
                },
              });

            await tx.scrapListing.update({
              where: {
                id: order.listingId,
              },
              data: {
                status: "Sold",
                buyerName:
                  order.recyclerName,
              },
            });

            return updatedOrder;
          }
        );

      return NextResponse.json(result);
    }

    /* -------------------------------------------------------
       NORMAL ORDER STATUS UPDATE

       Currently useful for Placed.
    ------------------------------------------------------- */

    if (
      requestedOrderStatus ===
      "Placed"
    ) {
      const updatedOrder =
        await prisma.scrapOrder.update({
          where: {
            id: order.id,
          },
          data: {
            orderStatus: "Placed",
          },
        });

      return NextResponse.json(
        updatedOrder
      );
    }

    return NextResponse.json(
      {
        error:
          "No valid order update was performed.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "PATCH /api/orders/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update order.",
      },
      {
        status: 500,
      }
    );
  }
}