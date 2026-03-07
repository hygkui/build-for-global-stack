import { PRODUCTS } from '@/lib/products'
import PricingCards from '@/components/pricing-cards'

export const metadata = {
  title: '定价 - 出海黄金组合',
  description: '选择适合你的方案，从免费提示词到完整 MVP 外包开发。',
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      {/* 标题区 */}
      <section className="text-center px-4 mb-16">
        <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
          定价方案
        </p>
        <h1 className="text-4xl md:text-5xl font-bold font-sans text-foreground text-balance mb-5">
          按需选择，灵活起步
        </h1>
        <p className="text-muted max-w-xl mx-auto text-lg leading-relaxed">
          从免费生成提示词，到 $20 下载可运行代码，再到 $200 让我们帮你完成完整 MVP。
        </p>
      </section>

      {/* 定价卡片 */}
      <section className="max-w-5xl mx-auto px-4">
        <PricingCards products={PRODUCTS} />
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 mt-20">
        <h2 className="text-2xl font-bold font-sans text-foreground text-center mb-10">
          常见问题
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
              <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

const faqs = [
  {
    q: '免费功能有什么限制？',
    a: '免费功能完全开放，你可以无限次选择技术栈、生成提示词，并复制到任意 AI 工具使用。无需信用卡。',
  },
  {
    q: '$20 的模板代码包含哪些内容？',
    a: '根据你选择的技术栈，生成完整可运行的项目代码，包含所有配置文件、环境变量说明和部署文档。下载即可启动开发。',
  },
  {
    q: '$200 MVP 服务的交付周期是多久？',
    a: '支付后我们会在 24 小时内联系你确认需求，通常 7-14 个工作日完成交付，具体周期视项目复杂度而定。',
  },
  {
    q: '支持退款吗？',
    a: '$20 模板代码为数字产品，一经下载不支持退款。$200 MVP 服务在需求确认前可全额退款，开发启动后不支持退款。',
  },
]
