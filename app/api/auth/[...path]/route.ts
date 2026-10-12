import { auth } from "@/lib/auth/server"

type RouteContext = { params: Promise<Record<string, string | string[]>> }
type RouteHandler = (request: Request, context: RouteContext) => Promise<Response>

function method(name: "GET" | "POST"): RouteHandler {
  return (request, context) => {
    const handlers = auth.handler() as unknown as Record<"GET" | "POST", RouteHandler>
    return handlers[name](request, context)
  }
}

export const GET = method("GET")
export const POST = method("POST")
