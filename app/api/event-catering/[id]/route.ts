import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "@/lib/session";

export const GET = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Unauthorized - User not authenticated",
          toast: {
            title: 'Authentication Required',
            message: 'Please sign in to view this event catering request',
            variant: 'error',
          },
        },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid event catering ID",
          toast: {
            title: 'Invalid Request',
            message: 'The provided event catering ID is not valid',
            variant: 'error',
          },
        },
        { status: 400 }
      );
    }

    const cateringRequest = await prisma.cateringrequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!cateringRequest) {
      return NextResponse.json(
        { 
          success: false,
          error: "Event catering request not found",
          toast: {
            title: 'Not Found',
            message: 'The requested event catering could not be found',
            variant: 'error',
          },
        },
        { status: 404 }
      );
    }

    // Verify the requesting user has permission to view this request
    if (cateringRequest.userId !== session.userId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Forbidden - You don't have permission to view this request",
          toast: {
            title: 'Access Denied',
            message: 'You do not have permission to view this event catering request',
            variant: 'error',
          },
        },
        { status: 403 }
      );
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...cateringRequest,
        eventDate: cateringRequest.eventDate.toISOString(), // Convert Date to string
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("Error fetching event catering request:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch event catering request",
      details: error instanceof Error ? error.message : "Unknown error",
      toast: {
        title: 'Error',
        message: 'Failed to load event catering details. Please try again.',
        variant: 'error',
      },
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
