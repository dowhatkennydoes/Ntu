# Google OAuth Setup Guide for NTU App

## 🚨 **Current Issue**: Google OAuth Not Configured

The error you're seeing when clicking "Continue with Google" means Google OAuth isn't set up in your Supabase project yet.

## 🔧 **Step-by-Step Fix**

### **1. Set Up Google Cloud Console**

#### A. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it something like "NTU-App" or "Neural-Task-Universe"

#### B. Enable Required APIs
1. Go to **APIs & Services** → **Library**
2. Enable these APIs:
   - **Google Calendar API**
   - **Google+ API** (for OAuth)
   - **People API** (for profile info)

#### C. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
3. Configure consent screen first if prompted:
   - **User Type**: External
   - **App name**: NTU - Neural Task Universe
   - **User support email**: Your email
   - **Developer contact**: Your email
   - **Scopes**: Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `../auth/calendar`
     - `../auth/calendar.events`

4. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: NTU App OAuth
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://chtzfqiigqaterznidnp.supabase.co`
   - **Authorized redirect URIs**:
     - `https://chtzfqiigqaterznidnp.supabase.co/auth/v1/callback`

5. **Save** and copy:
   - **Client ID** 
   - **Client Secret**

### **2. Configure Supabase**

#### A. Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your project: `chtzfqiigqaterznidnp`

#### B. Enable Google OAuth
1. Go to **Authentication** → **Providers**
2. Find **Google** in the list
3. **Enable** the toggle
4. Enter your credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
5. **Add these scopes** in the additional scopes field:
   ```
   https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events
   ```
6. **Save**

### **3. Update Environment Variables**

Update your `.env` file with the Google credentials:

```env
# Add these lines to your .env file
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/oauth/callback
```

### **4. Test the Setup**

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Go to**: http://localhost:3000
3. **Click**: "Continue with Google"
4. **Should redirect** to Google OAuth consent screen

## 🔍 **Troubleshooting Common Issues**

### Issue 1: "redirect_uri_mismatch"
**Fix**: Make sure the redirect URI in Google Cloud Console exactly matches:
```
https://chtzfqiigqaterznidnp.supabase.co/auth/v1/callback
```

### Issue 2: "invalid_client"
**Fix**: Double-check Client ID and Client Secret in Supabase dashboard

### Issue 3: "access_blocked"
**Fix**: 
- Make sure OAuth consent screen is published
- Add your email to test users if app is in testing mode

### Issue 4: Calendar permissions not requested
**Fix**: Add calendar scopes in Supabase provider settings:
```
https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events
```

## 🎯 **Quick Setup Checklist**

- [ ] Google Cloud project created
- [ ] Calendar API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth Client ID created with correct redirect URIs
- [ ] Supabase Google provider enabled
- [ ] Client ID/Secret added to Supabase
- [ ] Calendar scopes added to Supabase
- [ ] Environment variables updated
- [ ] Dev server restarted

## 🆘 **Still Having Issues?**

If you're still getting errors:

1. **Check browser console** for specific error messages
2. **Check Supabase logs**: Dashboard → Logs → Auth logs
3. **Verify redirect URI** matches exactly (no trailing slashes)
4. **Make sure** Google Cloud Console project has billing enabled
5. **Try incognito mode** to avoid cached auth states

## 📞 **Next Steps After Setup**

Once Google OAuth is working:

1. Test login with your Google account
2. Check that calendar permissions are requested
3. Verify tokens are stored in database
4. Test calendar connection status in sidebar
5. Explore calendar-aware features in Yonder, Punctual, etc.

The setup might seem complex, but once configured, you'll have seamless Google Calendar integration across the entire NTU app! 🚀