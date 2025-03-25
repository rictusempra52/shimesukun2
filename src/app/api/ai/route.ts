import { NextRequest, NextResponse } from "next/server";
import { fetchDifyResponse } from "../../../lib/dify";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  try {
    const response = await fetchDifyResponse(query);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Dify API request failed" },
      { status: 500 }
    );
  }
}
