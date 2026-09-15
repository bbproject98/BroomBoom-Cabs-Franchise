import { db } from "@/lib/db";
import { handleOptions, jsonResponse } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const hubs = db.hubs.getAll(activeOnly);

    return jsonResponse({
      success: true,
      total: hubs.length,
      hubs,
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: "Failed to fetch franchise hubs" },
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.city || !body.state || !body.address) {
      return jsonResponse(
        { success: false, error: "City, State, and Address are required." },
        400
      );
    }

    const newHub = db.hubs.create({
      city: body.city.trim(),
      state: body.state.trim(),
      type: body.type || "District Fleet Hub",
      tier: body.tier || "Gold",
      address: body.address.trim(),
      phone: body.phone || "1800-BROOM-BOOM",
      openHours: body.openHours || "9:00 AM - 8:00 PM",
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return jsonResponse({
      success: true,
      message: "Franchise hub added successfully",
      hub: newHub,
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: "Error adding franchise hub" },
      500
    );
  }
}
