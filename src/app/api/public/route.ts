import { NextRequest, NextResponse } from "next/server";

export const GET = (req: NextRequest) => {
  // Only available in development - prevents information disclosure in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Hello World", headers: req.headers });
};
