import { NextRequest, NextResponse } from 'next/server'
import { getQueueStats } from '@/lib/redis'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const jobType = searchParams.get('jobType')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get queue statistics (BD25)
    const queueStats = await getQueueStats()

    // Get job logs from database
    let queryBuilder = supabase
      .from('job_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      queryBuilder = queryBuilder.eq('user_id', userId)
    }

    if (jobType) {
      queryBuilder = queryBuilder.eq('job_type', jobType)
    }

    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: jobLogs, error, count } = await queryBuilder

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch job logs', details: error.message },
        { status: 500 }
      )
    }

    // Calculate system metrics
    const totalJobs = jobLogs?.length || 0
    const failedJobs = jobLogs?.filter(job => job.status === 'failed').length || 0
    const successRate = totalJobs > 0 ? ((totalJobs - failedJobs) / totalJobs) * 100 : 0

    // Get average processing times by job type
    const avgProcessingTimes = jobLogs?.reduce((acc, job: any) => {
      if (!acc[job.job_type]) {
        acc[job.job_type] = { total: 0, count: 0 }
      }
      acc[job.job_type].total += job.duration_ms || 0
      acc[job.job_type].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>) || {}

    const avgTimes = Object.entries(avgProcessingTimes).map(([type, data]: [string, any]) => ({
      job_type: type,
      avg_duration_ms: Math.round(data.total / data.count),
      total_jobs: data.count,
    }))

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      system_metrics: {
        total_jobs: totalJobs,
        failed_jobs: failedJobs,
        success_rate: Math.round(successRate * 100) / 100,
        avg_processing_times: avgTimes,
      },
      queue_stats: queueStats,
      job_logs: jobLogs,
      pagination: {
        limit,
        offset,
        total: count || jobLogs?.length || 0,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const jobType = searchParams.get('jobType')

    if (!jobId && !jobType) {
      return NextResponse.json(
        { error: 'jobId or jobType is required' },
        { status: 400 }
      )
    }

    let queryBuilder = supabase
      .from('job_logs')
      .delete()

    if (jobId) {
      queryBuilder = queryBuilder.eq('job_id', jobId)
    }

    if (jobType) {
      queryBuilder = queryBuilder.eq('job_type', jobType)
    }

    const { error } = await queryBuilder

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete job logs', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job logs deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 