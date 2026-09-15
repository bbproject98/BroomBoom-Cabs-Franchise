import { db } from "@/lib/db";
import { handleOptions, jsonResponse } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const list = db.brochures.getAll();
    return jsonResponse({
      success: true,
      total: list.length,
      brochures: list,
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: "Failed to fetch brochure requests" },
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.mobile) {
      return jsonResponse(
        { success: false, error: "Name and Mobile number are required." },
        400
      );
    }

    const item = db.brochures.create({
      name: body.name.trim(),
      mobile: body.mobile.trim(),
      city: body.city?.trim() || "Not specified",
    });

    console.log(`[BACKEND] Brochure Download Logged: ${item.name} (${item.city}, ${item.mobile})`);

    return jsonResponse({
      success: true,
      message: "Brochure request recorded successfully",
      data: item,
    });
  } catch (error) {
    console.error("[BACKEND ERROR] Error recording brochure request:", error);
    return jsonResponse(
      { success: false, error: "Internal server error" },
      500
    );
  }
}
