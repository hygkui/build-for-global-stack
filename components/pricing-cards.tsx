'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/products'

interface PricingCardsProps {
  products: Product[]
}

export default function PricingCards({ products }: PricingCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      {/* 免费档 */}
      <div className="flex flex-col rounded-2xl border border-border bg-card p-8">
        <div className="mb-6">
          <p className="text-sm font-mono text-muted uppercase tracking-widest mb-3">免费</p>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-4xl font-bold text-foreground">$0</span>
          </div>
          <p className="text-muted text-sm leading-relaxed">
            技术栈选择 + 提示词生成，立即开始使用
          </p>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          {freeFeatures.map(f => (
            <li key={f} className="flex items-start gap-3 text-sm text-muted">
              <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link href="/#generator">
          <Button variant="outline" className="w-full">
            免费开始
          </Button>
        </Link>
      </div>

      {/* 付费档：动态渲染 */}
      {products.map((product, i) => (
        <div
          key={product.id}
          className={`flex flex-col rounded-2xl border p-8 relative ${
            product.id === 'template-code'
              ? 'border-accent bg-card'
              : 'border-border bg-card'
          }`}
        >
          {product.id === 'template-code' && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                最受欢迎
              </span>
            </div>
          )}
          <div className="mb-6">
            <p className="text-sm font-mono text-muted uppercase tracking-widest mb-3">
              {product.id === 'template-code' ? '基础版' : '专业版'}
            </p>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-4xl font-bold text-foreground">
                ${product.priceInCents / 100}
              </span>
              <span className="text-muted text-sm mb-1">/ 次</span>
            </div>
            <p className="text-muted text-sm leading-relaxed">{product.description}</p>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {product.features.map(f => (
              <li key={f} className="flex items-start gap-3 text-sm text-muted">
                <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link href={`/checkout?product=${product.id}`}>
            <Button
              className="w-full"
              variant={product.id === 'template-code' ? 'default' : 'outline'}
            >
              立即购买
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}

const freeFeatures = [
  '可视化技术栈选择器',
  '智能提示词生成',
  '支持复制到 v0、Cursor 等工具',
  '无限次使用',
  '无需信用卡',
]
