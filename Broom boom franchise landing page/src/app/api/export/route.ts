import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const csvContent = db.exportLeadsToCsv();
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `broomboom-franchise-leads-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        ...corsHeaders(),
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("[BACKEND ERROR] Error exporting leads to CSV:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export leads" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
