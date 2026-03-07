// Next.js 16 proxy.js - 替代旧的 middleware.ts
// 认证保护路由在页面级别处理，此文件保留为空或做其他代理用途

export const config = {
  matcher: [],
}

export default function proxy() {
  // Next.js 16 中认证检查已移到页面级别的 Server Component 中
  // 使用 auth.getSession() 在每个受保护页面检查登录状态
  return new Response(null, { status: 200 })
}
