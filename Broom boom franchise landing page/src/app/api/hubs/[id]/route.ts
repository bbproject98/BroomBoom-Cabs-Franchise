import { db } from "@/lib/db";
import { handleOptions, jsonResponse } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = db.hubs.update(params.id, body);

    if (!updated) {
      return jsonResponse({ success: false, error: "Hub not found" }, 404);
    }

    return jsonResponse({
      success: true,
      message: "Hub updated successfully",
      hub: updated,
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: "Failed to update hub" },
      500
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = db.hubs.delete(params.id);

    if (!success) {
      return jsonResponse({ success: false, error: "Hub not found" }, 404);
    }

    return jsonResponse({
      success: true,
      message: "Hub deleted successfully",
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: "Failed to delete hub" },
      500
    );
  }
}
