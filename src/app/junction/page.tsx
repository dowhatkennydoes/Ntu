'use client'

import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { AppLayout } from '@/components/AppLayout'
import JunctionSemanticSearchWorkflow from '@/components/JunctionSemanticSearchWorkflow'

export default function JunctionPage() {
  return (
    <AppLayout appName="Junction">
      <JunctionSemanticSearchWorkflow />
    </AppLayout>
  )
}