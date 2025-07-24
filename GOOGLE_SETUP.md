# Google Calendar Integration Setup

## Overview
This guide will help you set up Google Calendar integration for the Yonder application, allowing you to connect your Google Calendar and automatically import meetings.

## Prerequisites
- Google Cloud Console account
- Google Calendar with meetings
- Environment variables configured

## Step 1: Google Cloud Console Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/google/oauth/callback` (for development)
   - `https://yourdomain.com/api/google/oauth/callback` (for production)
5. Note down your Client ID and Client Secret

## Step 2: Environment Variables

Create or update your `.env.local` file with the following variables:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/oauth/callback

# Supabase Configuration (if using database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Database Setup (Optional)

If you want to store OAuth tokens securely, you'll need to set up a database table:

```sql
-- Create Google OAuth tokens table
CREATE TABLE google_oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  google_user_id TEXT NOT NULL,
  google_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_google_oauth_tokens_user_id ON google_oauth_tokens(user_id);
CREATE INDEX idx_google_oauth_tokens_active ON google_oauth_tokens(is_active);
```

## Step 4: Testing the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Yonder application:
   ```
   http://localhost:3000/yonder
   ```

3. Go to the "Meetings" tab and click "Connect Google Calendar"

4. Follow the OAuth flow to authorize the application

5. Your Google Calendar meetings should now appear in the meetings list

## Features

### What the integration provides:
- **Automatic Meeting Import**: Fetches upcoming meetings from your Google Calendar
- **Video Conference Detection**: Automatically detects Google Meet links
- **One-Click Joining**: Join meetings directly from the Yonder interface
- **Real-time Updates**: Refresh to get the latest calendar events
- **Multiple Account Support**: Connect multiple Google accounts if needed

### Supported Meeting Types:
- Google Meet video conferences
- Meetings with "meeting" in the title or description
- Events with video conferencing links

## Troubleshooting

### Common Issues:

1. **"OAuth consent screen not configured"**
   - Go to Google Cloud Console > APIs & Services > OAuth consent screen
   - Configure the consent screen with your app information

2. **"Redirect URI mismatch"**
   - Ensure the redirect URI in your OAuth credentials matches exactly
   - Check for trailing slashes or protocol mismatches

3. **"Calendar API not enabled"**
   - Enable the Google Calendar API in Google Cloud Console
   - Wait a few minutes for the changes to propagate

4. **"Invalid client ID"**
   - Verify your environment variables are set correctly
   - Restart your development server after changing environment variables

### Debug Mode:
To enable debug logging, add this to your environment:
```bash
DEBUG_GOOGLE_OAUTH=true
```

## Security Considerations

- **Token Storage**: OAuth tokens are encrypted and stored securely
- **Scope Limitation**: Only requests necessary calendar permissions
- **Token Refresh**: Automatically refreshes expired tokens
- **Account Disconnection**: Users can disconnect accounts at any time

## Production Deployment

For production deployment:

1. Update the redirect URI to your production domain
2. Configure proper environment variables
3. Set up a production database
4. Enable HTTPS for secure OAuth flow
5. Configure proper CORS settings

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Google Cloud Console configuration
3. Ensure all environment variables are set correctly
4. Check the application logs for detailed error information 