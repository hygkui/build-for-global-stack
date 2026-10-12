import { createNeonAuth } from "@neondatabase/auth/next/server"

type NeonAuth = ReturnType<typeof createNeonAuth>

function createAuth(): NeonAuth {
  const baseUrl = process.env.NEON_AUTH_BASE_URL
  const secret = process.env.NEON_AUTH_COOKIE_SECRET
  if (!baseUrl || !secret) {
    throw new Error("NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET must be set")
  }
  return createNeonAuth({
    baseUrl,
    cookies: { secret },
  })
}

let authInstance: NeonAuth | undefined

function getAuth(): NeonAuth {
  if (!authInstance) authInstance = createAuth()
  return authInstance
}

export const auth: NeonAuth = new Proxy({} as NeonAuth, {
  get(_target, prop, receiver) {
    const instance = getAuth()
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === "function" ? value.bind(instance) : value
  },
})
