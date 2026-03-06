'use server'

import { getSql } from '@/lib/db'
import { redirect } from 'next/navigation'

export async function submitRequirements(formData: FormData) {
  const orderId = formData.get('orderId') as string
  const projectName = formData.get('projectName') as string
  const description = formData.get('description') as string
  const targetUsers = formData.get('targetUsers') as string
  const coreFeatures = formData.get('coreFeatures') as string
  const techPreferences = formData.get('techPreferences') as string
  const deadline = formData.get('deadline') as string
  const contactEmail = formData.get('contactEmail') as string

  if (!orderId || !description || !contactEmail) {
    throw new Error('缺少必填字段')
  }

  await getSql()`
    UPDATE orders
    SET
      requirements = ${JSON.stringify({
        projectName,
        description,
        targetUsers,
        coreFeatures,
        techPreferences,
        deadline,
        contactEmail,
      })},
      status = 'processing',
      updated_at = NOW()
    WHERE id = ${orderId}
  `

  redirect(`/dashboard/orders`)
}
