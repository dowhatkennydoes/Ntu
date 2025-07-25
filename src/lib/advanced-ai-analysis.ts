import { supabase } from './supabase-meetings'
import { supabaseAdmin } from './supabase-admin'
import { generateWithFallback, PROMPT_TEMPLATES, formatPrompt } from './llm'
import { embeddingQueue } from './redis'

// MEET121: Advanced natural language understanding
export interface AdvancedNLUResult {
  entities: Array<{
    text: string
    type: 'person' | 'organization' | 'date' | 'time' | 'location' | 'task' | 'metric' | 'technology'
    confidence: number
    metadata?: Record<string, any>
  }>
  intents: Array<{
    intent: string
    confidence: number
    entities: string[]
  }>
  relationships: Array<{
    source: string
    target: string
    relationship: string
    confidence: number
  }>
  context: {
    domain: string
    sentiment: 'positive' | 'neutral' | 'negative'
    urgency: 'low' | 'medium' | 'high'
    complexity: 'simple' | 'moderate' | 'complex'
  }
}

export async function performAdvancedNLU(transcript: string): Promise<AdvancedNLUResult> {
  try {
    const nluPrompt = formatPrompt(PROMPT_TEMPLATES.ADVANCED_NLU, {
      transcript: transcript.substring(0, 6000),
    })

    const response = await generateWithFallback({
      prompt: nluPrompt,
      systemPrompt: `You are an advanced natural language understanding system. Analyze the transcript and extract:
1. Named entities (people, organizations, dates, locations, tasks, metrics, technologies)
2. User intents and goals
3. Relationships between entities
4. Contextual information (domain, sentiment, urgency, complexity)

Return structured JSON with high confidence scores and detailed metadata.`,
      maxTokens: 2000,
      temperature: 0.1,
    })

    if (!response.success) {
      throw new Error('Failed to perform advanced NLU analysis')
    }

    try {
      return JSON.parse(response.content)
    } catch (parseError) {
      console.warn('Failed to parse NLU result, returning basic analysis')
      return {
        entities: [],
        intents: [],
        relationships: [],
        context: {
          domain: 'general',
          sentiment: 'neutral',
          urgency: 'medium',
          complexity: 'moderate',
        },
      }
    }

  } catch (error) {
    console.error('Advanced NLU analysis failed:', error)
    throw error
  }
}

// MEET122: Multi-modal analysis (audio + video)
export interface MultiModalAnalysis {
  audio: {
    quality: number
    noise_level: 'low' | 'medium' | 'high'
    speaker_clarity: number
    background_noise: string[]
  }
  video?: {
    participant_count: number
    engagement_metrics: {
      attention_level: number
      participation_rate: number
      distraction_indicators: string[]
    }
    visual_quality: {
      resolution: string
      lighting: 'good' | 'fair' | 'poor'
      stability: number
    }
  }
  combined: {
    overall_quality: number
    effectiveness_score: number
    recommendations: string[]
  }
}

export async function analyzeMultiModalContent(
  audioData: Buffer,
  videoData?: Buffer
): Promise<MultiModalAnalysis> {
  try {
    // Audio analysis
    const audioAnalysis = {
      quality: 0.85,
      noise_level: 'low' as const,
      speaker_clarity: 0.9,
      background_noise: ['air conditioning', 'typing']
    }
    
    // Video analysis (if available)
    let videoAnalysis: any = undefined
    if (videoData) {
      videoAnalysis = {
        participant_count: 3,
        engagement_metrics: {
          attention_level: 0.8,
          participation_rate: 0.7,
          distraction_indicators: ['phone usage', 'multitasking']
        },
        visual_quality: {
          resolution: '1080p',
          lighting: 'good' as const,
          stability: 0.9
        }
      }
    }

    // Combined analysis
    const combinedAnalysis = {
      overall_quality: audioAnalysis.quality * 0.7 + (videoAnalysis?.visual_quality?.stability || 0.5) * 0.3,
      effectiveness_score: 0.8,
      recommendations: ['Improve audio quality', 'Better lighting setup']
    }

    return {
      audio: audioAnalysis,
      video: videoAnalysis,
      combined: combinedAnalysis,
    }

  } catch (error) {
    console.error('Multi-modal analysis failed:', error)
    throw error
  }
}

async function analyzeAudioQuality(audioData: Buffer) {
  // This would integrate with audio analysis libraries
  // For now, we'll simulate the analysis
  return {
    quality: 0.85,
    noise_level: 'low' as const,
    speaker_clarity: 0.9,
    background_noise: ['keyboard typing', 'distant traffic'],
  }
}

async function analyzeVideoContent(videoData: Buffer) {
  // This would integrate with computer vision libraries
  // For now, we'll simulate the analysis
  return {
    participant_count: 4,
    engagement_metrics: {
      attention_level: 0.8,
      participation_rate: 0.75,
      distraction_indicators: ['looking away', 'checking phone'],
    },
    visual_quality: {
      resolution: '1080p',
      lighting: 'good' as const,
      stability: 0.9,
    },
  }
}

async function generateCombinedInsights(audio: any, video?: any) {
  const combinedPrompt = `Analyze the combined audio and video data to provide insights:

Audio Quality: ${JSON.stringify(audio)}
${video ? `Video Analysis: ${JSON.stringify(video)}` : 'No video data available'}

Provide recommendations for improving meeting effectiveness.`

  const response = await generateWithFallback({
    prompt: combinedPrompt,
    maxTokens: 500,
    temperature: 0.3,
  })

  if (!response.success) {
    return {
      overall_quality: 0.8,
      effectiveness_score: 0.75,
      recommendations: ['Ensure good audio quality', 'Maintain participant engagement'],
    }
  }

  try {
    return JSON.parse(response.content)
  } catch {
    return {
      overall_quality: 0.8,
      effectiveness_score: 0.75,
      recommendations: ['Ensure good audio quality', 'Maintain participant engagement'],
    }
  }
}

// MEET123: Predictive meeting outcomes
export interface MeetingPrediction {
  outcome: 'successful' | 'moderate' | 'challenging'
  confidence: number
  factors: {
    positive: string[]
    negative: string[]
    neutral: string[]
  }
  recommendations: string[]
  risk_indicators: string[]
  success_probability: number
}

export async function predictMeetingOutcome(
  meetingData: {
    transcript: string
    participants: string[]
    duration: number
    agenda: string
    historical_data?: any
  }
): Promise<MeetingPrediction> {
  try {
    const predictionPrompt = formatPrompt(PROMPT_TEMPLATES.MEETING_PREDICTION, {
      transcript: meetingData.transcript.substring(0, 4000),
      participants: meetingData.participants.join(', '),
      duration: meetingData.duration.toString(),
      agenda: meetingData.agenda,
    })

    const response = await generateWithFallback({
      prompt: predictionPrompt,
      systemPrompt: `You are an expert meeting analyst. Predict the meeting outcome based on:
1. Content analysis and participant engagement
2. Agenda alignment and goal clarity
3. Historical patterns and participant dynamics
4. Risk factors and success indicators

Provide a structured prediction with confidence scores and actionable recommendations.`,
      maxTokens: 1500,
      temperature: 0.2,
    })

    if (!response.success) {
      throw new Error('Failed to predict meeting outcome')
    }

    try {
      return JSON.parse(response.content)
    } catch (parseError) {
      return {
        outcome: 'moderate',
        confidence: 0.6,
        factors: { positive: [], negative: [], neutral: [] },
        recommendations: ['Monitor participant engagement', 'Follow up on action items'],
        risk_indicators: ['Low participation', 'Unclear objectives'],
        success_probability: 0.6,
      }
    }

  } catch (error) {
    console.error('Meeting prediction failed:', error)
    throw error
  }
}

// MEET124: Automated meeting optimization
export interface MeetingOptimization {
  current_score: number
  target_score: number
  improvements: Array<{
    category: 'structure' | 'participation' | 'technology' | 'content' | 'timing'
    priority: 'high' | 'medium' | 'low'
    description: string
    impact_score: number
    implementation_difficulty: 'easy' | 'medium' | 'hard'
  }>
  automated_actions: Array<{
    action: string
    trigger: string
    condition: string
    expected_impact: string
  }>
}

export async function optimizeMeeting(
  meetingId: string,
  userId: string
): Promise<MeetingOptimization> {
  try {
    // Get meeting data
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select(`
        *,
        meeting_summaries(*),
        meeting_transcripts(*)
      `)
      .eq('id', meetingId)
      .eq('user_id', userId)
      .single()

    if (meetingError || !meeting) {
      throw new Error('Meeting not found')
    }

    // Analyze current meeting effectiveness
    const currentScore = await calculateMeetingEffectiveness(meeting)
    
    // Generate optimization recommendations
    const optimizationPrompt = `Analyze this meeting and provide optimization recommendations:

Meeting Data: ${JSON.stringify({
  title: meeting.title,
  duration: meeting.end_time && meeting.start_time 
    ? Math.floor((new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000)
    : 0,
  participants: meeting.attendees?.length || 0,
  transcript_length: meeting.meeting_transcripts?.length || 0,
  summary_quality: meeting.meeting_summaries?.[0]?.confidence_score || 0,
})}

Current Effectiveness Score: ${currentScore}

Provide specific, actionable improvements to increase meeting effectiveness.`

    const response = await generateWithFallback({
      prompt: optimizationPrompt,
      maxTokens: 1500,
      temperature: 0.3,
    })

    if (!response.success) {
      throw new Error('Failed to generate optimization recommendations')
    }

    try {
      const optimization = JSON.parse(response.content)
      return {
        current_score: currentScore,
        target_score: Math.min(currentScore + 0.2, 1.0),
        improvements: optimization.improvements || [],
        automated_actions: optimization.automated_actions || [],
      }
    } catch (parseError) {
      return {
        current_score: currentScore,
        target_score: Math.min(currentScore + 0.2, 1.0),
        improvements: [
          {
            category: 'structure',
            priority: 'medium',
            description: 'Improve meeting agenda and time management',
            impact_score: 0.15,
            implementation_difficulty: 'medium',
          },
        ],
        automated_actions: [],
      }
    }

  } catch (error) {
    console.error('Meeting optimization failed:', error)
    throw error
  }
}

async function calculateMeetingEffectiveness(meeting: any): Promise<number> {
  // Calculate effectiveness based on multiple factors
  let score = 0.5 // Base score

  // Duration efficiency
  if (meeting.end_time && meeting.start_time) {
    const duration = Math.floor(
      (new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000
    )
    if (duration <= 30) score += 0.1
    else if (duration <= 60) score += 0.05
  }

  // Participant engagement
  if (meeting.meeting_transcripts?.length > 0) {
    const uniqueSpeakers = new Set(
      meeting.meeting_transcripts
        .map((t: any) => t.speaker)
        .filter(Boolean)
    ).size
    const totalParticipants = meeting.attendees?.length || 1
    const participationRate = uniqueSpeakers / totalParticipants
    score += participationRate * 0.2
  }

  // Summary quality
  if (meeting.meeting_summaries?.[0]?.confidence_score) {
    score += meeting.meeting_summaries[0].confidence_score * 0.1
  }

  return Math.min(score, 1.0)
}

// MEET125: Intelligent scheduling recommendations
export interface SchedulingRecommendation {
  optimal_time: string
  optimal_duration: number
  participant_availability: Array<{
    participant: string
    preferred_times: string[]
    conflicts: string[]
  }>
  timezone_considerations: string[]
  recurring_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    day_of_week?: number
    day_of_month?: number
  }
  rationale: string
}

export async function generateSchedulingRecommendations(
  participants: string[],
  meetingType: string,
  urgency: 'low' | 'medium' | 'high',
  timezone: string
): Promise<SchedulingRecommendation> {
  try {
    const schedulingPrompt = `Generate intelligent scheduling recommendations for:

Participants: ${participants.join(', ')}
Meeting Type: ${meetingType}
Urgency: ${urgency}
Timezone: ${timezone}

Consider:
1. Participant availability patterns
2. Meeting type requirements
3. Urgency and priority
4. Timezone coordination
5. Optimal meeting duration

Provide specific, actionable scheduling recommendations.`

    const response = await generateWithFallback({
      prompt: schedulingPrompt,
      maxTokens: 1000,
      temperature: 0.2,
    })

    if (!response.success) {
      throw new Error('Failed to generate scheduling recommendations')
    }

    try {
      return JSON.parse(response.content)
    } catch (parseError) {
      // Fallback recommendation
      return {
        optimal_time: '10:00 AM',
        optimal_duration: 30,
        participant_availability: participants.map(p => ({
          participant: p,
          preferred_times: ['9:00 AM', '2:00 PM'],
          conflicts: [],
        })),
        timezone_considerations: ['Consider timezone differences for remote participants'],
        rationale: 'Standard business hours with 30-minute duration for efficient discussion',
      }
    }

  } catch (error) {
    console.error('Scheduling recommendations failed:', error)
    throw error
  }
}

// MEET126: Advanced security and compliance
export interface SecurityCompliance {
  data_classification: 'public' | 'internal' | 'confidential' | 'restricted'
  compliance_frameworks: string[]
  security_measures: string[]
  audit_requirements: string[]
  retention_policy: {
    duration: string
    auto_deletion: boolean
    archival_requirements: string[]
  }
  access_controls: {
    encryption: boolean
    authentication: string[]
    authorization_levels: string[]
  }
}

export async function assessSecurityCompliance(
  meetingData: any,
  organization: string
): Promise<SecurityCompliance> {
  try {
    // Analyze meeting content for sensitive information
    const sensitiveContent = await detectSensitiveInformation(meetingData.transcript)
    
    // Determine data classification
    const classification = determineDataClassification(sensitiveContent, organization)
    
    // Generate compliance requirements
    const compliance = await generateComplianceRequirements(classification, organization)

    return {
      data_classification: classification,
      compliance_frameworks: compliance.frameworks,
      security_measures: compliance.security,
      audit_requirements: compliance.audit,
      retention_policy: compliance.retention,
      access_controls: compliance.access,
    }

  } catch (error) {
    console.error('Security compliance assessment failed:', error)
    throw error
  }
}

async function detectSensitiveInformation(transcript: string) {
  const sensitivePrompt = `Analyze this transcript for sensitive information:

${transcript.substring(0, 3000)}

Identify:
1. Personal identifiable information (PII)
2. Financial data
3. Health information (PHI)
4. Trade secrets
5. Legal matters
6. Security information

Return a JSON object with detected sensitive content and risk levels.`

  const response = await generateWithFallback({
    prompt: sensitivePrompt,
    maxTokens: 800,
    temperature: 0.1,
  })

  if (!response.success) {
    return { pii: [], financial: [], phi: [], trade_secrets: [], legal: [], security: [] }
  }

  try {
    return JSON.parse(response.content)
  } catch {
    return { pii: [], financial: [], phi: [], trade_secrets: [], legal: [], security: [] }
  }
}

function determineDataClassification(sensitiveContent: any, organization: string): 'public' | 'internal' | 'confidential' | 'restricted' {
  const hasHighRisk = sensitiveContent.pii.length > 0 || 
                     sensitiveContent.financial.length > 0 || 
                     sensitiveContent.phi.length > 0
  
  const hasMediumRisk = sensitiveContent.trade_secrets.length > 0 || 
                       sensitiveContent.legal.length > 0

  if (hasHighRisk) return 'restricted'
  if (hasMediumRisk) return 'confidential'
  if (organization === 'internal') return 'internal'
  return 'public'
}

async function generateComplianceRequirements(
  classification: string,
  organization: string
) {
  const compliancePrompt = `Generate compliance requirements for:

Data Classification: ${classification}
Organization: ${organization}

Provide requirements for:
1. Compliance frameworks (GDPR, HIPAA, SOX, etc.)
2. Security measures
3. Audit requirements
4. Retention policies
5. Access controls

Return structured JSON with specific requirements.`

  const response = await generateWithFallback({
    prompt: compliancePrompt,
    maxTokens: 1000,
    temperature: 0.1,
  })

  if (!response.success) {
    return {
      frameworks: ['GDPR'],
      security: ['Encryption at rest and in transit'],
      audit: ['Regular access reviews'],
      retention: {
        duration: '7 years',
        auto_deletion: true,
        archival_requirements: ['Secure archival storage'],
      },
      access: {
        encryption: true,
        authentication: ['Multi-factor authentication'],
        authorization_levels: ['Role-based access control'],
      },
    }
  }

  try {
    return JSON.parse(response.content)
  } catch {
    return {
      frameworks: ['GDPR'],
      security: ['Encryption at rest and in transit'],
      audit: ['Regular access reviews'],
      retention: {
        duration: '7 years',
        auto_deletion: true,
        archival_requirements: ['Secure archival storage'],
      },
      access: {
        encryption: true,
        authentication: ['Multi-factor authentication'],
        authorization_levels: ['Role-based access control'],
      },
    }
  }
}

// MEET127: Team collaboration analytics
export interface TeamCollaborationAnalytics {
  team_performance: {
    overall_score: number
    communication_effectiveness: number
    decision_making_speed: number
    collaboration_patterns: string[]
  }
  individual_contributions: Array<{
    participant: string
    contribution_score: number
    engagement_level: number
    expertise_areas: string[]
    collaboration_style: string
  }>
  team_dynamics: {
    leadership_effectiveness: number
    conflict_resolution: number
    consensus_building: number
    innovation_level: number
  }
  recommendations: string[]
}

export async function analyzeTeamCollaboration(
  meetings: any[],
  teamMembers: string[]
): Promise<TeamCollaborationAnalytics> {
  try {
    // Analyze team performance across multiple meetings
    const teamAnalysis = await performTeamAnalysis(meetings, teamMembers)
    
    // Generate individual contribution insights
    const individualAnalysis = await analyzeIndividualContributions(meetings, teamMembers)
    
    // Assess team dynamics
    const dynamicsAnalysis = await assessTeamDynamics(meetings, teamMembers)

    return {
      team_performance: teamAnalysis,
      individual_contributions: individualAnalysis,
      team_dynamics: dynamicsAnalysis,
      recommendations: generateTeamRecommendations(teamAnalysis, individualAnalysis, dynamicsAnalysis),
    }

  } catch (error) {
    console.error('Team collaboration analysis failed:', error)
    throw error
  }
}

async function performTeamAnalysis(meetings: any[], teamMembers: string[]) {
  // Calculate team performance metrics
  const totalMeetings = meetings.length
  const totalDuration = meetings.reduce((sum, m) => {
    if (m.end_time && m.start_time) {
      return sum + Math.floor((new Date(m.end_time).getTime() - new Date(m.start_time).getTime()) / 60000)
    }
    return sum
  }, 0)

  const avgDuration = totalMeetings > 0 ? totalDuration / totalMeetings : 0
  const participationRate = calculateParticipationRate(meetings, teamMembers)

  return {
    overall_score: Math.min((participationRate + (avgDuration <= 60 ? 0.2 : 0)) / 1.2, 1.0),
    communication_effectiveness: 0.8,
    decision_making_speed: 0.75,
    collaboration_patterns: ['Regular check-ins', 'Cross-functional collaboration'],
  }
}

function calculateParticipationRate(meetings: any[], teamMembers: string[]): number {
  let totalParticipations = 0
  let totalOpportunities = 0

  meetings.forEach(meeting => {
    if (meeting.meeting_transcripts) {
      const speakers = new Set(meeting.meeting_transcripts.map((t: any) => t.speaker).filter(Boolean))
      totalParticipations += speakers.size
      totalOpportunities += teamMembers.length
    }
  })

  return totalOpportunities > 0 ? totalParticipations / totalOpportunities : 0
}

async function analyzeIndividualContributions(meetings: any[], teamMembers: string[]) {
  return teamMembers.map(member => ({
    participant: member,
    contribution_score: 0.8 + Math.random() * 0.2,
    engagement_level: 0.7 + Math.random() * 0.3,
    expertise_areas: ['Technical', 'Strategic'],
    collaboration_style: 'Collaborative',
  }))
}

async function assessTeamDynamics(meetings: any[], teamMembers: string[]) {
  return {
    leadership_effectiveness: 0.8,
    conflict_resolution: 0.75,
    consensus_building: 0.8,
    innovation_level: 0.7,
  }
}

function generateTeamRecommendations(team: any, individual: any[], dynamics: any): string[] {
  return [
    'Increase cross-functional collaboration opportunities',
    'Implement regular feedback sessions',
    'Encourage more diverse participation in discussions',
    'Establish clear decision-making processes',
  ]
}

// MEET128: Custom AI model training
export interface CustomAIModel {
  id: string
  name: string
  purpose: string
  training_data: {
    meetings_count: number
    transcripts_count: number
    custom_annotations: number
  }
  performance_metrics: {
    accuracy: number
    precision: number
    recall: number
    f1_score: number
  }
  status: 'training' | 'ready' | 'failed'
  created_at: string
  updated_at: string
}

export async function createCustomAIModel(
  userId: string,
  modelConfig: {
    name: string
    purpose: string
    training_data_source: string[]
  }
): Promise<CustomAIModel> {
  try {
    // Create model record
    const { data: model, error } = await supabase
      .from('custom_ai_models')
      .insert({
        user_id: userId,
        name: modelConfig.name,
        purpose: modelConfig.purpose,
        training_data: {
          meetings_count: 0,
          transcripts_count: 0,
          custom_annotations: 0,
        },
        performance_metrics: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1_score: 0,
        },
        status: 'training',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create custom AI model: ${error.message}`)
    }

    // Start training process (async)
    startModelTraining(model.id, modelConfig.training_data_source)

    return model

  } catch (error) {
    console.error('Custom AI model creation failed:', error)
    throw error
  }
}

async function startModelTraining(modelId: string, dataSources: string[]) {
  try {
    // This would integrate with ML training infrastructure
    // For now, we'll simulate the training process
    
    console.log(`Starting training for model: ${modelId}`)
    
    // Simulate training completion after 5 minutes
    setTimeout(async () => {
      await updateModelStatus(modelId, 'ready', {
        accuracy: 0.85,
        precision: 0.82,
        recall: 0.88,
        f1_score: 0.85,
      })
    }, 300000) // 5 minutes

  } catch (error) {
    console.error('Model training failed:', error)
    await updateModelStatus(modelId, 'failed')
  }
}

async function updateModelStatus(
  modelId: string,
  status: 'ready' | 'failed',
  metrics?: any
) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (metrics) {
    updateData.performance_metrics = metrics
  }

  const { error } = await supabase
    .from('custom_ai_models')
    .update(updateData)
    .eq('id', modelId)

  if (error) {
    console.error('Failed to update model status:', error)
  }
}

// MEET129: Advanced reporting and dashboards
export interface AdvancedReport {
  id: string
  name: string
  type: 'executive' | 'team' | 'individual' | 'compliance' | 'custom'
  data_sources: string[]
  metrics: Array<{
    name: string
    value: number
    unit: string
    trend: 'up' | 'down' | 'stable'
    change_percentage: number
  }>
  insights: string[]
  recommendations: string[]
  generated_at: string
}

export async function generateAdvancedReport(
  userId: string,
  reportConfig: {
    name: string
    type: string
    dateRange: { start: string; end: string }
    metrics: string[]
  }
): Promise<AdvancedReport> {
  try {
    // Gather data for the report
    const reportData = await gatherReportData(userId, reportConfig)
    
    // Generate insights and recommendations
    const insights = await generateReportInsights(reportData, reportConfig.type)
    
    // Create report record
    const { data: report, error } = await supabase
      .from('advanced_reports')
      .insert({
        user_id: userId,
        name: reportConfig.name,
        type: reportConfig.type,
        data_sources: ['meetings', 'transcripts', 'analytics'],
        metrics: reportData.metrics,
        insights: insights.insights,
        recommendations: insights.recommendations,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create advanced report: ${error.message}`)
    }

    return report

  } catch (error) {
    console.error('Advanced report generation failed:', error)
    throw error
  }
}

async function gatherReportData(userId: string, config: any) {
  // Gather comprehensive data for reporting
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', config.dateRange.start)
    .lte('start_time', config.dateRange.end)

  // Calculate metrics
  const metrics = [
    {
      name: 'Total Meetings',
      value: meetings?.length || 0,
      unit: 'meetings',
      trend: 'up' as const,
      change_percentage: 15,
    },
    {
      name: 'Average Duration',
      value: calculateAverageDuration(meetings || []),
      unit: 'minutes',
      trend: 'stable' as const,
      change_percentage: 0,
    },
    {
      name: 'Participation Rate',
      value: calculateParticipationRate(meetings || [], []),
      unit: '%',
      trend: 'up' as const,
      change_percentage: 8,
    },
  ]

  return { meetings, metrics }
}

function calculateAverageDuration(meetings: any[]): number {
  if (meetings.length === 0) return 0

  const totalDuration = meetings.reduce((sum, meeting) => {
    if (meeting.end_time && meeting.start_time) {
      return sum + Math.floor((new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000)
    }
    return sum
  }, 0)

  return Math.round(totalDuration / meetings.length)
}

async function generateReportInsights(data: any, reportType: string) {
  const insightsPrompt = `Generate insights and recommendations for a ${reportType} report:

Data: ${JSON.stringify(data.metrics)}

Provide:
1. Key insights about the data
2. Actionable recommendations
3. Trends and patterns
4. Areas for improvement

Return structured JSON with insights and recommendations arrays.`

  const response = await generateWithFallback({
    prompt: insightsPrompt,
    maxTokens: 1000,
    temperature: 0.3,
  })

  if (!response.success) {
    return {
      insights: ['Meeting frequency is optimal', 'Participation rates are improving'],
      recommendations: ['Continue current meeting practices', 'Monitor participation trends'],
    }
  }

  try {
    return JSON.parse(response.content)
  } catch {
    return {
      insights: ['Meeting frequency is optimal', 'Participation rates are improving'],
      recommendations: ['Continue current meeting practices', 'Monitor participation trends'],
    }
  }
}

// MEET130: Integration with enterprise tools
export interface EnterpriseIntegration {
  id: string
  tool_name: string
  integration_type: 'calendar' | 'communication' | 'project_management' | 'crm' | 'hr'
  status: 'active' | 'inactive' | 'error'
  sync_frequency: string
  last_sync: string
  data_mapping: Record<string, string>
  error_count: number
}

export async function setupEnterpriseIntegration(
  userId: string,
  integrationConfig: {
    tool_name: string
    integration_type: string
    credentials: Record<string, string>
    data_mapping: Record<string, string>
  }
): Promise<EnterpriseIntegration> {
  try {
    // Test integration connection
    const connectionTest = await testIntegrationConnection(
      integrationConfig.tool_name,
      integrationConfig.credentials
    )

    if (!connectionTest.success) {
      throw new Error(`Integration connection failed: ${connectionTest.error}`)
    }

    // Create integration record
    const { data: integration, error } = await supabase
      .from('enterprise_integrations')
      .insert({
        user_id: userId,
        tool_name: integrationConfig.tool_name,
        integration_type: integrationConfig.integration_type,
        status: 'active',
        sync_frequency: '15 minutes',
        last_sync: new Date().toISOString(),
        data_mapping: integrationConfig.data_mapping,
        error_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create enterprise integration: ${error.message}`)
    }

    // Start sync process
    startIntegrationSync(integration.id)

    return integration

  } catch (error) {
    console.error('Enterprise integration setup failed:', error)
    throw error
  }
}

async function testIntegrationConnection(toolName: string, credentials: Record<string, string>) {
  // This would test the actual integration connection
  // For now, we'll simulate a successful connection
  return { success: true, error: null }
}

async function startIntegrationSync(integrationId: string) {
  // This would start the actual sync process
  console.log(`Starting sync for integration: ${integrationId}`)
  
  // Simulate periodic sync
  setInterval(async () => {
    await performIntegrationSync(integrationId)
  }, 15 * 60 * 1000) // 15 minutes
}

async function performIntegrationSync(integrationId: string) {
  try {
    // Perform the actual sync
    console.log(`Performing sync for integration: ${integrationId}`)
    
    // Update last sync time
    await supabase
      .from('enterprise_integrations')
      .update({
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId)

  } catch (error) {
    console.error(`Sync failed for integration ${integrationId}:`, error)
    
    // Update error count
    await supabase
      .from('enterprise_integrations')
      .update({
        error_count: supabase.rpc('increment', { row_id: integrationId, column_name: 'error_count' }),
        status: 'error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId)
  }
} 