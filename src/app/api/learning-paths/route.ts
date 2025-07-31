import { NextResponse } from "next/server";
import { db } from "@/src/lib/database/neon";
import { stackServerApp } from "@/src/stack";

export async function GET(request: Request) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const learningPaths = await db.getLearningPathsByUserId(user.id);

    return new NextResponse(JSON.stringify(learningPaths), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching learning paths:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
