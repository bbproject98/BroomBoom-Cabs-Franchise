import { db } from "@/lib/db";
import { handleOptions, jsonResponse } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lead = db.leads.getById(params.id);
    if (!lead) {
      return jsonResponse({ success: false, error: "Lead not found" }, 404);
    }
    return jsonResponse({ success: true, lead });
  } catch (error) {
    return jsonResponse(
      { success: false, error: "Error fetching lead" },
      500
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = db.leads.update(params.id, body);

    if (!updated) {
      return jsonResponse({ success: false, error: "Lead not found" }, 404);
    }

    return jsonResponse({
      success: true,
      message: "Lead updated successfully",
      lead: updated,
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: "Error updating lead" },
      500
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = db.leads.delete(params.id);
    if (!success) {
      return jsonResponse({ success: false, error: "Lead not found" }, 404);
    }

    return jsonResponse({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    return jsonResponse(
      { success: false, error: "Error deleting lead" },
      500
    );
  }
}
