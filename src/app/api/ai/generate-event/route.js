import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { generateEventContent } from "@/lib/gemini";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/generate-event
 * Generates structured event details using Google Gemini AI for authorized organizers
 */
export async function POST(request) {
  try {
    // 1. Authenticate user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in to access the AI assistant.",
        },
        { status: 401 }
      );
    }

    // 2. Authorize role: Only organizers can use the AI assistant
    if (session.user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. Only event organizers can access the AI assistant.",
        },
        { status: 403 }
      );
    }

    // 3. Parse and validate request payload
    const body = await request.json().catch(() => ({}));
    const { idea } = body;

    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide an event idea or brief description.",
        },
        { status: 400 }
      );
    }

    // 4. Generate structured content with Gemini
    const data = await generateEventContent(idea);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("AI Generate Event API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "AI generation failed",
      },
      { status: 500 }
    );
  }
}
