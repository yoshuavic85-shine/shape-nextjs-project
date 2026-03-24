import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Berhasil logout" });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith("https") ?? false,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
