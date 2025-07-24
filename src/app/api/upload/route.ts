import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { transcriptionQueue } from '@/lib/redis'

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '104857600') // 100MB
const ALLOWED_FORMATS = (process.env.ALLOWED_AUDIO_FORMATS || 'wav,mp3,m4a').split(',')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const sourceApp = formData.get('sourceApp') as string || 'yonder'

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, userId' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      )
    }

    // Validate file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !ALLOWED_FORMATS.includes(fileExtension)) {
      return NextResponse.json(
        { error: `File format not supported. Allowed formats: ${ALLOWED_FORMATS.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${userId}/${timestamp}-${file.name}`
    const filePath = `uploads/${fileName}`

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filePath)

    // Store file metadata in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        filename: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        source_app: sourceApp,
        public_url: publicUrl,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to store file metadata', details: dbError.message },
        { status: 500 }
      )
    }

    // Queue transcription job
    await transcriptionQueue.add('transcribe-audio', {
      fileId: fileRecord.id,
      userId,
      filePath,
      language: 'auto', // Will be detected by Whisper
    })

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        name: file.name,
        size: file.size,
        url: publicUrl,
        status: 'uploaded',
      },
      message: 'File uploaded and transcription queued',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const sourceApp = searchParams.get('sourceApp')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    let queryBuilder = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (sourceApp) {
      queryBuilder = queryBuilder.eq('source_app', sourceApp)
    }

    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: files, error, count } = await queryBuilder

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch files', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      files,
      pagination: {
        limit,
        offset,
        total: count || files.length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 