'use client'

import { useRef, useState } from 'react'
import { submitRequirements } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'

interface RequirementsFormProps {
  orderId: string
}

export default function RequirementsForm({ orderId }: RequirementsFormProps) {
  const [pending, setPending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    try {
      await submitRequirements(formData)
    } catch {
      setPending(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="orderId" value={orderId} />

      <div className="space-y-5 border border-border rounded-2xl bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground">项目基本信息</h2>

        <div>
          <label className="block text-sm text-muted mb-1.5" htmlFor="projectName">
            项目名称
          </label>
          <input
            id="projectName"
            name="projectName"
            type="text"
            placeholder="例如：全球短视频 SaaS 平台"
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1.5" htmlFor="description">
            项目描述 <span className="text-accent">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="请描述你的产品是什么、解决什么问题、目标用户是谁..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1.5" htmlFor="targetUsers">
            目标用户
          </label>
          <input
            id="targetUsers"
            name="targetUsers"
            type="text"
            placeholder="例如：北美独立开发者、欧洲中小企业..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
      </div>

      <div className="space-y-5 border border-border rounded-2xl bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground">功能与技术要求</h2>

        <div>
          <label className="block text-sm text-muted mb-1.5" htmlFor="coreFeatures">
            核心功能列表
          </label>
          <textarea
            id="coreFeatures"
            name="coreFeatures"
            rows={4}
            placeholder="请列出 MVP 必须包含的核心功能，每行一条：&#10;- 用户注册登录&#10;- 支付收款&#10;- 数据看板..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1.5" htmlFor="techPreferences">
            技术偏好（可选）
          </label>
          <input
            id="techPreferences"
            name="techPreferences"
            type="text"
            placeholder="例如：Next.js + Supabase + Stripe，或不限"
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1.5" htmlFor="deadline">
            期望交付时间（可选）
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
      </div>

      <div className="border border-border rounded-2xl bg-card p-6">
        <label className="block text-sm text-muted mb-1.5" htmlFor="contactEmail">
          联系邮箱 <span className="text-accent">*</span>
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          required
          placeholder="your@email.com"
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
        <p className="text-xs text-muted mt-2">
          我们会在 24 小时内通过此邮箱与你取得联系。
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '提交中...' : '提交需求'}
      </Button>
    </form>
  )
}
