export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  deliveryType: "automatic" | "manual"
  features: string[]
  cta: string
  badge?: string
}

export const PRODUCTS: Product[] = [
  {
    id: "template-code",
    name: "模板代码包",
    description: "根据你选择的技术栈，生成完整可运行的项目代码，下载即可部署。",
    priceInCents: 2000, // $20
    deliveryType: "automatic",
    badge: "最受欢迎",
    features: [
      "根据技术栈精准生成",
      "完整可运行的项目代码",
      "一键下载 ZIP 压缩包",
      "包含环境变量配置说明",
      "含部署到 Vercel 指南",
      "基础 README 文档",
    ],
    cta: "立即购买 $20",
  },
  {
    id: "mvp-service",
    name: "MVP 外包开发",
    description: "专业团队 1 对 1 为你打造完整 MVP，从需求到上线全程负责。",
    priceInCents: 20000, // $200
    deliveryType: "manual",
    features: [
      "1 对 1 需求沟通",
      "完整 MVP 功能开发",
      "数据库 + API 全栈实现",
      "部署上线全程支持",
      "7 天售后支持",
      "最多 3 次修改机会",
    ],
    cta: "立即购买 $200",
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}
