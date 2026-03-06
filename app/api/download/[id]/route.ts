import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { auth } from "@/lib/auth/server"
import { generateTemplateFiles, type TechStack } from "@/lib/template-generator"
import { generateAgentsMd } from "@/lib/agents-md"
import { zipSync, strToU8 } from "fflate"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // 验证登录
  const { data: session } = await auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
  }

  // 查询订单：必须属于当前用户、产品为 template-code、状态为 completed
  const rows = await sql`
    SELECT id, product_id, status, tech_stack
    FROM orders
    WHERE id = ${id}
      AND user_id = ${session.user.id}
      AND product_id = 'template-code'
      AND status = 'completed'
    LIMIT 1
  `

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Order not found or not eligible for download" },
      { status: 404 }
    )
  }

  const order = rows[0]

  // 解析 tech_stack（数据库中存储为 JSON 字符串或对象）
  let techStack: TechStack = {}
  if (order.tech_stack) {
    try {
      techStack =
        typeof order.tech_stack === "string"
          ? JSON.parse(order.tech_stack)
          : (order.tech_stack as TechStack)
    } catch {
      techStack = {}
    }
  }

  // 生成所有项目文件
  const projectFiles = generateTemplateFiles(techStack)

  // 生成 AGENTS.md（已有的提示词生成器复用）
  projectFiles["AGENTS.md"] = generateAgentsMd(techStack)

  // 将所有文件编码为 Uint8Array 并打包成 ZIP
  const zipInput: Record<string, Uint8Array> = {}
  for (const [filePath, content] of Object.entries(projectFiles)) {
    zipInput[filePath] = strToU8(content)
  }

  const zipped = zipSync(zipInput, { level: 6 })

  return new NextResponse(Buffer.from(zipped), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="saas-template-${id.slice(0, 8)}.zip"`,
      "Content-Length": String(zipped.byteLength),
      "Cache-Control": "private, no-store",
    },
  })
}
