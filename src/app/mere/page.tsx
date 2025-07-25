'use client'

import { AppLayout } from '@/components/AppLayout'
import { MereChat } from '@/components/mere/mere-chat'

export default function MerePage() {
  return (
    <AppLayout>
      <MereChat sessionId="main" />
    </AppLayout>
  )
}