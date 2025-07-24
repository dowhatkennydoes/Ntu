import { NextRequest, NextResponse } from 'next/server'
import { 
  performAdvancedNLU,
  analyzeMultiModalContent,
  predictMeetingOutcome,
  optimizeMeeting,
  generateSchedulingRecommendations,
  assessSecurityCompliance,
  analyzeTeamCollaboration,
  createCustomAIModel,
  generateAdvancedReport,
  setupEnterpriseIntegration
} from '@/lib/advanced-ai-analysis'
import { supabase } from '@/lib/supabase-meetings'

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case 'advanced_nlu':
        const nluResult = await performAdvancedNLU(data.transcript)
        return NextResponse.json({ success: true, result: nluResult })

      case 'multi_modal_analysis':
        const modalResult = await analyzeMultiModalContent(data.audioData, data.videoData)
        return NextResponse.json({ success: true, result: modalResult })

      case 'predict_outcome':
        const prediction = await predictMeetingOutcome(data.meetingData)
        return NextResponse.json({ success: true, result: prediction })

      case 'optimize_meeting':
        const optimization = await optimizeMeeting(data.meetingId, data.userId)
        return NextResponse.json({ success: true, result: optimization })

      case 'scheduling_recommendations':
        const scheduling = await generateSchedulingRecommendations(
          data.participants,
          data.meetingType,
          data.urgency,
          data.timezone
        )
        return NextResponse.json({ success: true, result: scheduling })

      case 'security_compliance':
        const compliance = await assessSecurityCompliance(data.meetingData, data.organization)
        return NextResponse.json({ success: true, result: compliance })

      case 'team_collaboration':
        const collaboration = await analyzeTeamCollaboration(data.meetings, data.teamMembers)
        return NextResponse.json({ success: true, result: collaboration })

      case 'create_custom_model':
        const model = await createCustomAIModel(data.userId, data.modelConfig)
        return NextResponse.json({ success: true, result: model })

      case 'generate_report':
        const report = await generateAdvancedReport(data.userId, data.reportConfig)
        return NextResponse.json({ success: true, result: report })

      case 'setup_integration':
        const integration = await setupEnterpriseIntegration(data.userId, data.integrationConfig)
        return NextResponse.json({ success: true, result: integration })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Advanced AI analysis failed:', error)
    return NextResponse.json(
      { 
        error: 'Advanced AI analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'custom_models':
        // Get user's custom AI models
        const { data: models, error: modelsError } = await supabase
          .from('custom_ai_models')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (modelsError) {
          throw new Error(`Failed to fetch custom models: ${modelsError.message}`)
        }

        return NextResponse.json({
          success: true,
          models: models || [],
        })

      case 'enterprise_integrations':
        // Get user's enterprise integrations
        const { data: integrations, error: integrationsError } = await supabase
          .from('enterprise_integrations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (integrationsError) {
          throw new Error(`Failed to fetch integrations: ${integrationsError.message}`)
        }

        return NextResponse.json({
          success: true,
          integrations: integrations || [],
        })

      case 'advanced_reports':
        // Get user's advanced reports
        const { data: reports, error: reportsError } = await supabase
          .from('advanced_reports')
          .select('*')
          .eq('user_id', userId)
          .order('generated_at', { ascending: false })

        if (reportsError) {
          throw new Error(`Failed to fetch reports: ${reportsError.message}`)
        }

        return NextResponse.json({
          success: true,
          reports: reports || [],
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Advanced AI data retrieval failed:', error)
    return NextResponse.json(
      { 
        error: 'Advanced AI data retrieval failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 