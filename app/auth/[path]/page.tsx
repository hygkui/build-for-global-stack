import { AuthView } from "@neondatabase/auth/react"

export const dynamicParams = false

export function generateStaticParams() {
  return [
    { path: "sign-in" },
    { path: "sign-up" },
    { path: "sign-out" },
    { path: "forgot-password" },
  ]
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>
}) {
  const { path } = await params

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <AuthView path={path} />
    </main>
  )
}
