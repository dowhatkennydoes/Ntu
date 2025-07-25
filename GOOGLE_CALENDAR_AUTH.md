# Google Calendar Authentication Setup

This document explains how to use the enhanced Google OAuth authentication that includes Google Calendar access in the NTU app.

## 🔐 What Permissions Are Requested

When you click "Continue with Google" on the login page, NTU will request the following permissions:

### Basic Authentication
- `openid` - Identity verification
- `email` - Your email address  
- `profile` - Basic profile information

### Google Calendar Access
- `https://www.googleapis.com/auth/calendar.readonly` - Read your calendar events
- `https://www.googleapis.com/auth/calendar.events` - Create, edit, and delete calendar events
- `https://www.googleapis.com/auth/calendar.events.readonly` - Read calendar event details

## 🚀 How to Authenticate with Google Calendar Access

### Step 1: Start OAuth Flow
1. Go to http://localhost:3000
2. Click "Continue with Google" on the login page
3. You'll see a notice about Google Calendar access being requested

### Step 2: Google Consent Screen
When redirected to Google, you'll see:
- **Account selection** (if multiple Google accounts)
- **Permission consent screen** showing:
  - Basic profile access
  - Google Calendar read access
  - Google Calendar write access
- Click "Allow" to grant permissions

### Step 3: Automatic Setup
After granting permissions:
- You'll be redirected to the callback page
- The system will automatically:
  - Store your Google OAuth tokens securely
  - Set up Calendar API access
  - Display "Google Calendar access configured successfully!"
- You'll be redirected to the main NTU dashboard

## 📊 Calendar Connection Status

After authentication, you can check your Google Calendar connection status:

1. **In the Sidebar**: Look for the Google Calendar status widget
   - ✅ **Connected**: Shows your Google email and connection date
   - ⚠️ **Not Connected**: Shows "Connect now" link

2. **Connection Details**:
   - Connected email address
   - Connection date
   - Real-time status checking

## 🔧 What This Enables in NTU

With Google Calendar access, NTU can now:

### Meeting Management
- **Yonder** (Voice Intelligence): Sync meeting recordings with calendar events
- **Automatic transcription** of scheduled meetings
- **Meeting context** for better AI analysis

### Intelligent Scheduling  
- **Punctual** (Task Management): Consider calendar availability
- **Smart scheduling** suggestions
- **Conflict detection** for tasks and meetings

### Workflow Automation
- **Marathon** (Workflow Builder): Calendar-triggered workflows
- **Automatic meeting prep** workflows
- **Follow-up task** creation from meetings

### AI Memory Integration
- **Mere** (AI Assistant): Context from calendar events
- **Meeting-aware** responses and suggestions
- **Schedule-based** memory organization

## 🔄 Token Management

The system automatically handles:

- **Token refresh**: Automatically refreshes expired tokens
- **Secure storage**: Tokens encrypted in Supabase database
- **One account per user**: Ensures clean connection state
- **Revocation handling**: Graceful handling if access is revoked

## 🛠️ Technical Implementation

### OAuth Scopes Used
```typescript
scopes: [
  'openid',
  'email', 
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.events.readonly'
].join(' ')
```

### Database Tables
- `google_oauth_tokens` - Secure token storage
- `meetings` - Calendar event sync
- `audit_logs` - Authentication logging

### API Endpoints
- `/api/google/oauth/store-tokens` - Token storage
- `/api/google/accounts` - Connection status
- `/api/google/calendar` - Calendar operations

## 🔒 Security & Privacy

### Data Protection
- All tokens encrypted in database
- No calendar data stored unnecessarily  
- User controls all access permissions
- Can revoke access anytime via Google Account settings

### Minimal Access
- Only requests necessary permissions
- Calendar data used only for features you enable
- No data shared with third parties
- Audit logging for all token operations

## 🆘 Troubleshooting

### Connection Issues
If Calendar status shows "Not connected":

1. **Check Google permissions**: Visit [Google Account](https://myaccount.google.com/permissions)
2. **Reconnect**: Click "Connect now" in the sidebar
3. **Browser issues**: Clear cookies and try again
4. **Account mismatch**: Ensure same Google account used

### Permission Errors
If you see permission errors:

1. **Re-authenticate**: Sign out and sign in with Google again
2. **Grant all permissions**: Ensure all calendar scopes are approved
3. **Account admin**: Check if calendar access is restricted by organization

### Token Expiration
The system handles this automatically, but if issues persist:

1. **Force refresh**: Sign out and back in
2. **Clear browser data**: Reset auth state
3. **Check API limits**: Google Calendar API has usage limits

## 📞 Support

For issues with Google Calendar integration:

1. Check the browser console for error messages
2. Verify your Google account has calendar access
3. Ensure you granted all requested permissions during OAuth
4. Try the authentication flow again if tokens seem stale

The integration is designed to be seamless and secure while providing powerful calendar-aware features across all NTU applications.