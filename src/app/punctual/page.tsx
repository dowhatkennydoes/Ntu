import PunctualTaskManager from '@/components/PunctualTaskManager'
import { AppLayout } from '@/components/AppLayout'

export default function PunctualPage() {
  return (
    <AppLayout appName="Punctual">
      <PunctualTaskManager />
    </AppLayout>
  )
}