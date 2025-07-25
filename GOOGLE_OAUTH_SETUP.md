# Google OAuth Setup Guide for NTU App

## 🎯 Current Status: **Partially Configured (3/5)**

Your Google OAuth setup is **60% complete**! Here's what's working and what needs to be done:

### ✅ **What's Working:**
- Database table (`google_oauth_tokens`) exists and accessible
- All API routes are properly configured
- OAuth URL generation is functional
- Redirect URI is correctly set

### ❌ **What Needs Setup:**
- Google Cloud Console credentials (Client ID & Secret)
- OAuth consent screen configuration

---

## 🚀 **Step-by-Step Setup Guide**

### **Step 1: Google Cloud Console Setup**

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Create or Select Project**
   - Click on the project dropdown at the top
   - Click "New Project" or select existing
   - Name it something like "NTU App" or "Your App Name"

3. **Enable Google Calendar API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in required information:
     - **App name**: "NTU App" (or your preferred name)
     - **User support email**: Your email
     - **Developer contact information**: Your email
   - Click "Save and Continue"
   - On "Scopes" page, click "Save and Continue"
   - On "Test users" page, add your email address
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - **Name**: "NTU App Web Client"
   - **Authorized redirect URIs**:
     ```
     http://localhost:3002/api/google/oauth/callback
     https://yourdomain.com/api/google/oauth/callback (for production)
     ```
   - Click "Create"

6. **Copy Your Credentials**
   - You'll see a popup with your Client ID and Client Secret
   - **IMPORTANT**: Copy both values immediately (you won't see the secret again)

### **Step 2: Update Environment Variables**

1. **Open your `.env` file**
2. **Replace the placeholder values** with your real credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3002/api/google/oauth/callback

# For production (optional)
GOOGLE_CLIENT_ID_PROD=your-production-client-id
GOOGLE_CLIENT_SECRET_PROD=your-production-client-secret
GOOGLE_REDIRECT_URI_PROD=https://yourdomain.com/api/google/oauth/callback
```

### **Step 3: Test the Setup**

1. **Run the Google OAuth test:**
   ```bash
   npm run test:google
   ```

2. **Start your development server:**
   ```bash
   npm run dev
   ```

3. **Visit the test page:**
   ```
   http://localhost:3002/test
   ```

4. **Test the OAuth flow:**
   - Click "Connect Google Calendar"
   - Follow the Google OAuth flow
   - Verify you can see your calendar events

---

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"OAuth consent screen not configured"**
   - Make sure you completed Step 4 above
   - Add your email as a test user
   - Wait 5-10 minutes for changes to propagate

2. **"Redirect URI mismatch"**
   - Double-check the redirect URI in Google Cloud Console
   - Ensure it matches exactly: `http://localhost:3002/api/google/oauth/callback`
   - No trailing slashes or protocol mismatches

3. **"Invalid client ID"**
   - Verify your environment variables are set correctly
   - Restart your development server after updating `.env`
   - Check for typos in the Client ID

4. **"Calendar API not enabled"**
   - Go back to Google Cloud Console
   - Enable the Google Calendar API
   - Wait a few minutes for the changes to take effect

### **Debug Mode:**

To enable detailed logging, add this to your `.env`:
```env
DEBUG_GOOGLE_OAUTH=true
```

---

## 🎯 **What You'll Get After Setup**

Once configured, your NTU app will have:

### **✅ Google Calendar Integration**
- Automatic meeting import from Google Calendar
- Real-time calendar sync
- Meeting detection with video conferencing links
- One-click meeting joining

### **✅ OAuth Security**
- Secure token storage in Supabase
- Automatic token refresh
- User consent and permission management
- Account disconnection capability

### **✅ Meeting Intelligence**
- AI-powered meeting transcription
- Automatic meeting summaries
- Meeting analytics and insights
- Integration with Yonder voice features

---

## 🚀 **Production Deployment**

When deploying to production:

1. **Create production OAuth credentials**
   - Use a separate Client ID for production
   - Add your production domain to authorized redirect URIs
   - Configure production environment variables

2. **Update environment variables**
   ```env
   GOOGLE_CLIENT_ID_PROD=your-production-client-id
   GOOGLE_CLIENT_SECRET_PROD=your-production-client-secret
   GOOGLE_REDIRECT_URI_PROD=https://yourdomain.com/api/google/oauth/callback
   ```

3. **Configure OAuth consent screen**
   - Add your production domain
   - Submit for verification if needed
   - Configure proper privacy policy and terms of service

---

## 📞 **Need Help?**

If you encounter issues:

1. **Check the test results:**
   ```bash
   npm run test:google
   ```

2. **Review the logs:**
   - Check browser console for errors
   - Check server logs for API errors
   - Verify environment variables are loaded

3. **Common solutions:**
   - Restart your development server
   - Clear browser cache and cookies
   - Wait 5-10 minutes for Google Cloud changes to propagate

---

## 🎉 **Success Criteria**

Your Google OAuth is fully configured when:

- ✅ `npm run test:google` shows 5/5 passing tests
- ✅ You can connect your Google account in the app
- ✅ Calendar events appear in the meetings list
- ✅ OAuth flow completes without errors

**You're almost there! Just need to add those real Google credentials! 🚀** 