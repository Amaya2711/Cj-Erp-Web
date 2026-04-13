import { NextResponse } from "next/server";

import { clearAuthSession } from "@/services/auth/session";

export async function POST() {
  const response = NextResponse.json({ message: "Sesion cerrada" }, { status: 200 });
  clearAuthSession(response);
  return response;
}
