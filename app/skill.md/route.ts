import { NextResponse } from "next/server"
import { SKILL_MD } from "@/lib/agent-skill"

export async function GET() {
  return new NextResponse(SKILL_MD, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
  })
}
