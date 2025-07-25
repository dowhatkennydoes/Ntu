-- Migration: Add utility functions and enhancements

-- Function to get user's memory count
CREATE OR REPLACE FUNCTION get_user_memory_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM memories WHERE user_id = target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's storage usage in bytes
CREATE OR REPLACE FUNCTION get_user_storage_usage(target_user_id UUID)
RETURNS BIGINT AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(file_size) FROM files WHERE user_id = target_user_id),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's token usage
CREATE OR REPLACE FUNCTION get_user_token_usage(target_user_id UUID, days INTEGER DEFAULT 30)
RETURNS TABLE(
    input_tokens BIGINT,
    output_tokens BIGINT,
    total_tokens BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(s.input_tokens), 0) as input_tokens,
        COALESCE(SUM(s.output_tokens), 0) as output_tokens,
        COALESCE(SUM(s.input_tokens + s.output_tokens), 0) as total_tokens
    FROM summaries s
    WHERE s.user_id = target_user_id
    AND s.created_at >= NOW() - INTERVAL '1 day' * days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old job logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_job_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM job_logs 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('completed', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's recent activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(target_user_id UUID, days INTEGER DEFAULT 7)
RETURNS TABLE(
    memories_created INTEGER,
    transcripts_created INTEGER,
    summaries_created INTEGER,
    meetings_attended INTEGER,
    chat_messages INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM memories 
         WHERE user_id = target_user_id 
         AND created_at >= NOW() - INTERVAL '1 day' * days) as memories_created,
        
        (SELECT COUNT(*)::INTEGER FROM transcripts 
         WHERE user_id = target_user_id 
         AND created_at >= NOW() - INTERVAL '1 day' * days) as transcripts_created,
        
        (SELECT COUNT(*)::INTEGER FROM summaries 
         WHERE user_id = target_user_id 
         AND created_at >= NOW() - INTERVAL '1 day' * days) as summaries_created,
        
        (SELECT COUNT(*)::INTEGER FROM meeting_participants 
         WHERE user_id = target_user_id 
         AND attendance_status = 'attended'
         AND created_at >= NOW() - INTERVAL '1 day' * days) as meetings_attended,
        
        (SELECT COUNT(*)::INTEGER FROM chat_messages 
         WHERE user_id = target_user_id 
         AND created_at >= NOW() - INTERVAL '1 day' * days) as chat_messages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
    target_user_id UUID,
    action_name TEXT,
    resource_type TEXT,
    resource_id TEXT DEFAULT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    session_id TEXT DEFAULT NULL,
    status TEXT DEFAULT 'success'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, details,
        ip_address, user_agent, session_id, status
    ) VALUES (
        target_user_id, action_name, resource_type, resource_id, details,
        ip_address, user_agent, session_id, status
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM notifications 
        WHERE user_id = target_user_id 
        AND is_read = false 
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = true, read_at = NOW()
    WHERE id = notification_id 
    AND user_id = target_user_id 
    AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
    target_user_id UUID,
    notification_type TEXT,
    title TEXT,
    message TEXT,
    data JSONB DEFAULT '{}',
    priority TEXT DEFAULT 'medium',
    expires_hours INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    expires_at_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
    IF expires_hours IS NOT NULL THEN
        expires_at_timestamp := NOW() + INTERVAL '1 hour' * expires_hours;
    END IF;
    
    INSERT INTO notifications (
        user_id, type, title, message, data, priority, expires_at
    ) VALUES (
        target_user_id, notification_type, title, message, data, priority, expires_at_timestamp
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user dashboard stats
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(target_user_id UUID)
RETURNS TABLE(
    total_memories INTEGER,
    total_transcripts INTEGER,
    total_meetings INTEGER,
    storage_used_mb NUMERIC,
    unread_notifications INTEGER,
    active_jobs INTEGER,
    recent_activity JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        get_user_memory_count(target_user_id) as total_memories,
        
        (SELECT COUNT(*)::INTEGER FROM transcripts WHERE user_id = target_user_id) as total_transcripts,
        
        (SELECT COUNT(*)::INTEGER FROM meetings WHERE user_id = target_user_id) as total_meetings,
        
        ROUND((get_user_storage_usage(target_user_id)::NUMERIC / 1024 / 1024), 2) as storage_used_mb,
        
        get_unread_notification_count(target_user_id) as unread_notifications,
        
        (SELECT COUNT(*)::INTEGER FROM job_logs 
         WHERE user_id = target_user_id 
         AND status IN ('pending', 'active')) as active_jobs,
        
        (SELECT row_to_json(activity.*) FROM get_user_activity_summary(target_user_id) activity) as recent_activity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add some helpful views for common queries

-- View for recent user activity
CREATE OR REPLACE VIEW user_recent_activity AS
SELECT 
    u.id as user_id,
    u.email,
    'memory' as activity_type,
    m.id as resource_id,
    LEFT(m.content, 100) as preview,
    m.source_app,
    m.created_at
FROM users u
JOIN memories m ON u.id = m.user_id
WHERE m.created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
    u.id as user_id,
    u.email,
    'transcript' as activity_type,
    t.id as resource_id,
    LEFT(t.content, 100) as preview,
    'transcription' as source_app,
    t.created_at
FROM users u
JOIN transcripts t ON u.id = t.user_id
WHERE t.created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
    u.id as user_id,
    u.email,
    'meeting' as activity_type,
    m.id as resource_id,
    m.title as preview,
    'meetings' as source_app,
    m.created_at
FROM users u
JOIN meetings m ON u.id = m.user_id
WHERE m.created_at >= NOW() - INTERVAL '7 days'

ORDER BY created_at DESC;

-- View for job status summary
CREATE OR REPLACE VIEW job_status_summary AS
SELECT 
    user_id,
    job_type,
    status,
    COUNT(*) as count,
    AVG(duration_ms) as avg_duration_ms,
    MAX(created_at) as last_run
FROM job_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY user_id, job_type, status;

-- Add comment to tables for documentation
COMMENT ON TABLE files IS 'Stores uploaded file metadata and tracking information';
COMMENT ON TABLE job_logs IS 'Tracks background job execution and status';
COMMENT ON TABLE audit_logs IS 'Security and compliance audit trail';
COMMENT ON TABLE notifications IS 'User notification system';
COMMENT ON TABLE api_keys IS 'External API integration keys';
COMMENT ON TABLE webhooks IS 'Webhook configuration for external integrations';