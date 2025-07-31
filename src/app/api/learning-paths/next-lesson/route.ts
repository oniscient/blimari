import { NextResponse } from "next/server";
import { stackServerApp } from "@/src/stack";
import { db } from "@/src/lib/database/neon";

export async function GET(request: Request) {
  try {
    const user = await stackServerApp.getUser({ or: "throw" });

    const nextLesson = await db.findNextLessonForUser(user.id);

    if (!nextLesson) {
      return NextResponse.json({ message: "No next lesson found." }, { status: 200 });
    }

    return NextResponse.json(nextLesson, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching next lesson:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}