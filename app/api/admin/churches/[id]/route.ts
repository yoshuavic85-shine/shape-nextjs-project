import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const updateData: { name?: string; description?: string | null } = {};
    
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: "Nama gereja tidak boleh kosong" }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    
    if (description !== undefined) {
      updateData.description = description || null;
    }

    const updatedChurch = await db.church.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ church: updatedChurch });
  } catch (error) {
    console.error("Error updating church:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // First, disconnect all members from this church
    await db.user.updateMany({
      where: { churchId: id },
      data: { churchId: null },
    });

    // Then delete the church
    await db.church.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting church:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

