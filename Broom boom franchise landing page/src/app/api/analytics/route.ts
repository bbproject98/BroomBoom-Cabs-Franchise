import { db } from "@/lib/db";
import { handleOptions, jsonResponse } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const stats = db.getAnalytics();
    return jsonResponse({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("[BACKEND ERROR] Error getting analytics:", error);
    return jsonResponse(
      { success: false, error: "Failed to generate analytics stats" },
      500
    );
  }
}
