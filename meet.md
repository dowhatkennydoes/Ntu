# Google Meet Integration Tasks for Yonder

## Overview
This document tracks Acceptance Criteria (ACs) for connecting Yonder (AI-powered transcription and summarization app within Ntu) to Google Meet as a real-time or post-meeting notetaker bot. This includes authentication, calendar sync, meeting detection, transcription capture, summarization, memory storage, and integration with the broader Ntu architecture (e.g., Mere, Junction).

**Status:** 0 Completed, 0 In Progress, 100 Pending

---

## 🔐 GOOGLE AUTHENTICATION & OAUTH INTEGRATION (1–20)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| MEET1 | Users must authenticate with their Google account via OAuth 2.0 | ⏳ Pending | High | Authentication |
| MEET2 | Yonder must request scopes for https://www.googleapis.com/auth/calendar.readonly | ⏳ Pending | High | Authentication |
| MEET3 | Yonder must request scopes for https://www.googleapis.com/auth/calendar.events | ⏳ Pending | High | Authentication |
| MEET4 | Yonder must request scopes for https://www.googleapis.com/auth/meetings.space.readonly (when available) | ⏳ Pending | Medium | Authentication |
| MEET5 | Google auth tokens must be securely stored with refresh support | ⏳ Pending | High | Authentication |
| MEET6 | Token expiration must be tracked and auto-refreshed as needed | ⏳ Pending | High | Authentication |
| MEET7 | The system must alert the user if reauthentication is required | ⏳ Pending | High | Authentication |
| MEET8 | Authentication must log the google_user_id and account email | ⏳ Pending | High | Authentication |
| MEET9 | User must see a list of connected accounts | ⏳ Pending | Medium | Authentication |
| MEET10 | Each connected Google account must be scoped to one Ntu user | ⏳ Pending | High | Authentication |
| MEET11 | OAuth flow must redirect back to Yonder's secure callback URL | ⏳ Pending | High | Authentication |
| MEET12 | All API calls to Google must include proper bearer token headers | ⏳ Pending | High | Authentication |
| MEET13 | Authentication errors must be logged and presented to the user clearly | ⏳ Pending | High | Authentication |
| MEET14 | Access revocation from Google must trigger deactivation in Yonder | ⏳ Pending | High | Authentication |
| MEET15 | Users must be able to disconnect their Google account | ⏳ Pending | Medium | Authentication |
| MEET16 | Token logs must be encrypted in the database | ⏳ Pending | High | Security |
| MEET17 | A system admin must be able to trigger global reauthentication | ⏳ Pending | Medium | Authentication |
| MEET18 | Only verified users may initiate OAuth connection | ⏳ Pending | High | Security |
| MEET19 | OAuth config must support staging vs production environments | ⏳ Pending | Medium | Authentication |
| MEET20 | Audit logs must include token creation and expiration events | ⏳ Pending | Medium | Audit |

---

## 📅 GOOGLE CALENDAR SYNC & MEET LINK DETECTION (21–40)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| MEET21 | Yonder must fetch the next 50 events from Google Calendar | ⏳ Pending | High | Calendar |
| MEET22 | Calendar fetch must include start, end, summary, location, and hangoutLink | ⏳ Pending | High | Calendar |
| MEET23 | Only events with a hangoutLink (Google Meet link) are eligible | ⏳ Pending | High | Calendar |
| MEET24 | Yonder must detect recurring meetings | ⏳ Pending | Medium | Calendar |
| MEET25 | Events must be saved into a meetings table in Postgres | ⏳ Pending | High | Database |
| MEET26 | Users must see a calendar of upcoming meetings in Yonder | ⏳ Pending | High | UI |
| MEET27 | Yonder must refresh meetings every 15 minutes | ⏳ Pending | Medium | Calendar |
| MEET28 | Events without a Meet link must be ignored unless flagged manually | ⏳ Pending | Medium | Calendar |
| MEET29 | A scheduled job must check for active meetings in real-time | ⏳ Pending | High | Calendar |
| MEET30 | Events must be color-coded in the UI based on status: upcoming, live, past | ⏳ Pending | Medium | UI |
| MEET31 | Only future events are shown unless user selects "Show Past" | ⏳ Pending | Medium | UI |
| MEET32 | Canceled events must be removed from local sync | ⏳ Pending | Medium | Calendar |
| MEET33 | Users must be able to select meetings for Yonder to transcribe | ⏳ Pending | High | UI |
| MEET34 | A toggle must allow auto-transcription of all Google Meet events | ⏳ Pending | Medium | UI |
| MEET35 | The app must notify Mere when a meeting is about to start | ⏳ Pending | High | Integration |
| MEET36 | Users must be able to tag synced meetings with custom labels | ⏳ Pending | Medium | UI |
| MEET37 | Yonder must prevent duplicate imports of recurring meetings | ⏳ Pending | Medium | Calendar |
| MEET38 | Meeting metadata must include calendar ID and creator email | ⏳ Pending | Medium | Database |
| MEET39 | Time zone discrepancies must be resolved automatically | ⏳ Pending | Medium | Calendar |
| MEET40 | Yonder must notify users if no events with Meet links are found | ⏳ Pending | Medium | UI |

---

## 🎙️ LIVE MEETING JOINING & TRANSCRIPTION INITIATION (41–60)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| MEET41 | Yonder must optionally join meetings using a bot or shadow user | ⏳ Pending | High | Transcription |
| MEET42 | Yonder's bot must be invited via email address (if bot join is enabled) | ⏳ Pending | High | Transcription |
| MEET43 | The bot must only join meetings where user is host or participant | ⏳ Pending | High | Security |
| MEET44 | Bot join requests must respect the meeting lobby/waiting room logic | ⏳ Pending | Medium | Transcription |
| MEET45 | Upon joining, Yonder must begin audio capture locally or via browser tab | ⏳ Pending | High | Transcription |
| MEET46 | A Chrome extension must be available for user-side capture (if needed) | ⏳ Pending | Medium | Transcription |
| MEET47 | Meeting participants must be informed that Yonder is recording | ⏳ Pending | High | Privacy |
| MEET48 | Audio must be streamed to Whisper.cpp or stored for post-processing | ⏳ Pending | High | Transcription |
| MEET49 | Transcription must include speaker tags where possible | ⏳ Pending | Medium | Transcription |
| MEET50 | Audio buffers must be chunked into intervals for live transcription | ⏳ Pending | Medium | Transcription |
| MEET51 | Yonder must show real-time transcription during the meeting | ⏳ Pending | High | UI |
| MEET52 | Errors in live transcription must fall back to post-meeting summarization | ⏳ Pending | Medium | Transcription |
| MEET53 | Meeting duration must be logged alongside transcription metadata | ⏳ Pending | Medium | Database |
| MEET54 | A transcript session ID must be created for each meeting | ⏳ Pending | High | Database |
| MEET55 | Yonder must record join time, leave time, and delay if any | ⏳ Pending | Medium | Database |
| MEET56 | Meetings must support multi-lingual audio detection | ⏳ Pending | Medium | Transcription |
| MEET57 | Each transcription block must include timestamps | ⏳ Pending | High | Transcription |
| MEET58 | Whisper latency must be less than 5 seconds for near-live use | ⏳ Pending | High | Performance |
| MEET59 | User must be able to stop transcription at any point | ⏳ Pending | Medium | UI |
| MEET60 | Yonder must disconnect from Meet when the meeting ends or user exits | ⏳ Pending | High | Transcription |

---

## 📄 TRANSCRIPT HANDLING, SUMMARIZATION, AND STORAGE (61–80)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| MEET61 | After a meeting ends, a full transcript must be saved to the database | ⏳ Pending | High | Database |
| MEET62 | The transcript must be chunked by sentence, speaker, and time window | ⏳ Pending | High | Database |
| MEET63 | Summarization jobs must be triggered automatically | ⏳ Pending | High | Summarization |
| MEET64 | Summary must include: agenda, key takeaways, action items, participants | ⏳ Pending | High | Summarization |
| MEET65 | Users must be able to edit summaries | ⏳ Pending | Medium | UI |
| MEET66 | All summaries must be embedded in pgvector | ⏳ Pending | High | Database |
| MEET67 | Summary must link to transcript blocks and source audio | ⏳ Pending | Medium | Database |
| MEET68 | Users must be able to search meetings by topic, speaker, or time | ⏳ Pending | High | Search |
| MEET69 | Users must be able to replay the meeting in text chunks | ⏳ Pending | Medium | UI |
| MEET70 | Transcripts must be linkable to Junction notes | ⏳ Pending | High | Integration |
| MEET71 | Summaries must support export to .docx or .pdf | ⏳ Pending | Medium | Export |
| MEET72 | Action items must be stored in Punctual's task module | ⏳ Pending | High | Integration |
| MEET73 | Each summary must include the LLM and model used | ⏳ Pending | Medium | Database |
| MEET74 | Long meetings must be summarized in sections | ⏳ Pending | Medium | Summarization |
| MEET75 | User must be able to regenerate summary if needed | ⏳ Pending | Medium | UI |
| MEET76 | Summary jobs must support Claude, GPT, or Ollama | ⏳ Pending | High | Summarization |
| MEET77 | Transcript must include a confidence score for each line | ⏳ Pending | Medium | Database |
| MEET78 | Users must receive an email or app notification when summary is ready | ⏳ Pending | Medium | Notifications |
| MEET79 | Raw transcripts must be editable in the interface | ⏳ Pending | Medium | UI |
| MEET80 | Deleted meetings must remove transcript associations | ⏳ Pending | Medium | Database |

---

## 🔍 MERE INTEGRATION, NAVIGATION, AND UX (81–100)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| MEET81 | Mere must alert user 5 minutes before a Google Meet is scheduled | ⏳ Pending | High | Integration |
| MEET82 | Mere must ask "Would you like me to transcribe this meeting with Yonder?" | ⏳ Pending | High | Integration |
| MEET83 | User must be able to say "Yes this time," "Always do this," or "Never ask again" | ⏳ Pending | High | Integration |
| MEET84 | Mere must show meeting summaries when asked "What was the meeting about?" | ⏳ Pending | High | Integration |
| MEET85 | Mere must link users to the full Yonder summary via deep link | ⏳ Pending | High | Integration |
| MEET86 | Mere must be able to search across all meeting memories | ⏳ Pending | High | Search |
| MEET87 | Users must be able to use chat to ask: "What did Sarah say about pricing?" | ⏳ Pending | High | Search |
| MEET88 | Mere must notify users if a meeting is missed | ⏳ Pending | Medium | Notifications |
| MEET89 | A dashboard must show "Meetings captured this week" | ⏳ Pending | Medium | UI |
| MEET90 | Yonder must tag memories with source: google_meet | ⏳ Pending | High | Database |
| MEET91 | Meeting summaries must be available in Junction with rich context | ⏳ Pending | High | Integration |
| MEET92 | Meeting names must be auto-titled from event summary | ⏳ Pending | Medium | UI |
| MEET93 | Mere must support follow-up actions (e.g., "Make this a task") | ⏳ Pending | High | Integration |
| MEET94 | Calendar sync must run every 5–10 min in the background | ⏳ Pending | Medium | Calendar |
| MEET95 | Yonder must show meetings with "Pending transcription" or "Completed" | ⏳ Pending | Medium | UI |
| MEET96 | Failed bot joins must generate alerts and fallback flows | ⏳ Pending | Medium | Error Handling |
| MEET97 | OAuth disconnect must remove all synced calendar data | ⏳ Pending | High | Data Management |
| MEET98 | Users must be able to manually add a Meet link | ⏳ Pending | Medium | UI |
| MEET99 | Users must be able to share summaries via URL | ⏳ Pending | Medium | Sharing |
| MEET100 | Summary exports must include source link, participant list, and app logo | ⏳ Pending | Medium | Export |

---

## 📍 UI PLACEMENT & DISPLAY (101–120)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| MEET101 | The sidebar must display a fixed section at the bottom titled "Upcoming Meetings" | ⏳ Pending | High | UI |
| MEET102 | The section must visually mirror Mere's Sessions style: compact, clean, scrollable if needed | ⏳ Pending | Medium | UI |
| MEET103 | A maximum of 5 upcoming Google Meet events must be shown | ⏳ Pending | Medium | UI |
| MEET104 | Each meeting card must show: Event title, Start time, Status dot (e.g., green = live, gray = upcoming) | ⏳ Pending | High | UI |
| MEET105 | Events must be sorted by ascending start time | ⏳ Pending | Medium | UI |
| MEET106 | The section must auto-hide if no upcoming events exist | ⏳ Pending | Medium | UI |
| MEET107 | Section must collapse/expand with a toggle chevron | ⏳ Pending | Medium | UI |
| MEET108 | Hovering on a meeting reveals full details in a tooltip or popover | ⏳ Pending | Medium | UI |
| MEET109 | Each meeting entry must use a rounded card or row with hover effects | ⏳ Pending | Medium | UI |
| MEET110 | The sidebar must update in real-time as meetings start or finish | ⏳ Pending | High | UI |
| MEET111 | Clicking a meeting opens the full transcript/summary page (if available) | ⏳ Pending | High | UI |
| MEET112 | Clicking a live meeting shows "Join bot" or "Begin transcription" | ⏳ Pending | High | UI |
| MEET113 | Event cards must be keyboard navigable (tab focus) | ⏳ Pending | Medium | Accessibility |
| MEET114 | Meeting start time must be relative (e.g., "in 5 min" or "just now") | ⏳ Pending | Medium | UI |
| MEET115 | If the meeting is currently active, show a flashing "LIVE" badge | ⏳ Pending | Medium | UI |
| MEET116 | Missed meetings should fade or gray out once expired | ⏳ Pending | Medium | UI |
| MEET117 | Events with the same time slot must show stacked or aligned | ⏳ Pending | Medium | UI |
| MEET118 | The component must adapt to dark/light themes | ⏳ Pending | Medium | UI |
| MEET119 | Mobile sidebar view must collapse meetings into a drawer or swipe panel | ⏳ Pending | Medium | Mobile |
| MEET120 | Transcription status icon must display: pending / transcribing / completed | ⏳ Pending | High | UI |

---

## 🔄 SYNCING WITH GOOGLE CALENDAR (121–140)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| MEET121 | Meetings must come from Google Calendar after OAuth connection | ⏳ Pending | High | Calendar |
| MEET122 | Only events with a Google Meet link (hangoutLink) are shown | ⏳ Pending | High | Calendar |
| MEET123 | Calendar sync must run every 10 minutes or on refresh | ⏳ Pending | Medium | Calendar |
| MEET124 | Events must be filtered to only show those in the next 24 hours | ⏳ Pending | Medium | Calendar |
| MEET125 | Cancelled events must be automatically removed | ⏳ Pending | Medium | Calendar |
| MEET126 | Only events on the user's primary calendar are used unless configured otherwise | ⏳ Pending | Medium | Calendar |
| MEET127 | Recurring events are supported and display as independent instances | ⏳ Pending | Medium | Calendar |
| MEET128 | Meeting metadata must be stored in a meetings table | ⏳ Pending | High | Database |
| MEET129 | Conflicting events must be sorted by start time then alphabetically | ⏳ Pending | Medium | Calendar |
| MEET130 | Events must be shown in the user's local time zone | ⏳ Pending | Medium | Calendar |
| MEET131 | Google Meet link must be parsed from event location or hangoutLink field | ⏳ Pending | High | Calendar |
| MEET132 | Events with no title must show "(No Title)" fallback | ⏳ Pending | Medium | UI |
| MEET133 | Calendar errors must be caught and logged without UI crash | ⏳ Pending | Medium | Error Handling |
| MEET134 | A spinner must show while meetings are being fetched | ⏳ Pending | Medium | UI |
| MEET135 | A "Refresh" button must allow manual sync | ⏳ Pending | Medium | UI |
| MEET136 | Users must be alerted if their Google session expires | ⏳ Pending | Medium | Notifications |
| MEET137 | A placeholder must show if no meetings are found | ⏳ Pending | Medium | UI |
| MEET138 | A separate API route must expose /meetings/next5 | ⏳ Pending | High | API |
| MEET139 | Meeting summary must be cached for sidebar access | ⏳ Pending | Medium | Performance |
| MEET140 | The component must respect Supabase RLS for visibility | ⏳ Pending | High | Security |

---

## 📄 TRANSCRIPTION & SUMMARIZATION INTEGRATION (141–160)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| MEET141 | Each meeting entry must link to the corresponding transcript (if exists) | ⏳ Pending | High | UI |
| MEET142 | If transcription is ongoing, display "Transcribing…" label | ⏳ Pending | Medium | UI |
| MEET143 | If completed, show "Summary available" indicator | ⏳ Pending | Medium | UI |
| MEET144 | Clicking a summary link must open the summary in Yonder's main view | ⏳ Pending | High | UI |
| MEET145 | Transcription must begin automatically if auto-capture is enabled | ⏳ Pending | High | Transcription |
| MEET146 | Manual capture must be available via a "Begin Transcription" button | ⏳ Pending | Medium | UI |
| MEET147 | A summary icon must be clickable for quick preview | ⏳ Pending | Medium | UI |
| MEET148 | Each event must store transcription state (not_started, in_progress, done) | ⏳ Pending | High | Database |
| MEET149 | Live meetings must be prioritized in polling logic | ⏳ Pending | Medium | Calendar |
| MEET150 | If summary generation fails, show a retry icon | ⏳ Pending | Medium | UI |
| MEET151 | Only the most recent instance of a recurring meeting is shown | ⏳ Pending | Medium | Calendar |
| MEET152 | Events must flag whether a bot join occurred | ⏳ Pending | Medium | Database |
| MEET153 | The summary icon must be hidden if transcription hasn't started | ⏳ Pending | Medium | UI |
| MEET154 | Transcripts must be accessible even if the calendar sync fails later | ⏳ Pending | Medium | Resilience |
| MEET155 | Clicking "Join bot" must initiate a job in the job queue | ⏳ Pending | High | Job Queues |
| MEET156 | Summarization requests must be linked to meeting_id | ⏳ Pending | High | Database |
| MEET157 | If the transcript is partial, display a "Partial" label | ⏳ Pending | Medium | UI |
| MEET158 | Summaries must be re-generated on manual trigger | ⏳ Pending | Medium | UI |
| MEET159 | Each summary must show its source LLM | ⏳ Pending | Medium | UI |
| MEET160 | Transcripts must be exportable via right-click dropdown | ⏳ Pending | Medium | Export |

---

## 🧠 MERE + AI CONTEXT SUPPORT (161–180)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| MEET161 | Mere must be able to query and display the 5 upcoming meetings | ⏳ Pending | High | Integration |
| MEET162 | Mere must respond to "What meetings do I have today?" with the list | ⏳ Pending | High | Integration |
| MEET163 | Clicking a meeting via Mere opens the sidebar highlight | ⏳ Pending | Medium | UI |
| MEET164 | Mere must suggest: "Should I transcribe this meeting?" | ⏳ Pending | High | Integration |
| MEET165 | If the user says "Yes," a transcription job is queued | ⏳ Pending | High | Integration |
| MEET166 | If user says "Never ask," the meeting is skipped permanently | ⏳ Pending | Medium | Integration |
| MEET167 | Mere must log which meeting it reminded the user about | ⏳ Pending | Medium | Database |
| MEET168 | Mere must differentiate between meeting types: calendar vs AI-created | ⏳ Pending | Medium | Integration |
| MEET169 | If a meeting is missed, Mere may suggest a follow-up | ⏳ Pending | Medium | Integration |
| MEET170 | Mere must show live countdown: "Next meeting starts in 3 min" | ⏳ Pending | Medium | UI |
| MEET171 | Meeting summaries must be searchable by Mere | ⏳ Pending | High | Search |
| MEET172 | AI can summarize all 5 upcoming meeting titles if asked | ⏳ Pending | Medium | Integration |
| MEET173 | User can tell Mere "Summarize that meeting with Sarah" — Yonder opens | ⏳ Pending | High | Integration |
| MEET174 | Mere must have access to meeting id, title, start_time, meet_link | ⏳ Pending | High | Integration |
| MEET175 | Yonder must notify Mere when a summary is ready | ⏳ Pending | High | Integration |
| MEET176 | If user types "join upcoming meeting," Mere triggers bot join | ⏳ Pending | High | Integration |
| MEET177 | Mere can show status icons inline with chat responses | ⏳ Pending | Medium | UI |
| MEET178 | "Open meeting notes" must deep link into Yonder's detail page | ⏳ Pending | High | Integration |
| MEET179 | Mere must auto-update UI if calendar changes | ⏳ Pending | Medium | UI |
| MEET180 | Mere must store user preferences for how meeting info is displayed | ⏳ Pending | Medium | Database |

---

## 🛠️ BACKEND, JOBS & RESILIENCE (181–200)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| MEET181 | Meetings must be stored in a Supabase meetings table with user_id, title, start, end, hangoutLink | ⏳ Pending | High | Database |
| MEET182 | Events must be deduplicated by google_event_id | ⏳ Pending | High | Database |
| MEET183 | Bot join jobs must queue in BullMQ with metadata | ⏳ Pending | High | Job Queues |
| MEET184 | Meetings with missing metadata must be skipped | ⏳ Pending | Medium | Error Handling |
| MEET185 | Summaries must be stored in a summaries table with meeting_id | ⏳ Pending | High | Database |
| MEET186 | Failed syncs must retry 3x before failing silently | ⏳ Pending | Medium | Resilience |
| MEET187 | Sidebar must show placeholder during loading state | ⏳ Pending | Medium | UI |
| MEET188 | Meetings must update if event details change | ⏳ Pending | Medium | Calendar |
| MEET189 | Transcripts must be soft-deletable but persist in the database | ⏳ Pending | Medium | Database |
| MEET190 | A Redis cache may store next 5 meetings per user for speed | ⏳ Pending | Medium | Performance |
| MEET191 | Summarization tasks must retry with a fallback model if the primary fails | ⏳ Pending | Medium | Resilience |
| MEET192 | A job status API must return transcription state for sidebar refresh | ⏳ Pending | High | API |
| MEET193 | All queries must be scoped by authenticated user_id | ⏳ Pending | High | Security |
| MEET194 | Transcripts and summaries must log creation time, LLM used, and source | ⏳ Pending | Medium | Database |
| MEET195 | Meeting attendance status must be recorded per event | ⏳ Pending | Medium | Database |
| MEET196 | If user revokes Google permissions, meetings must be cleared | ⏳ Pending | High | Data Management |
| MEET197 | Developer logs must include calendar sync events and errors | ⏳ Pending | Medium | Logging |
| MEET198 | System-wide setting must control auto-transcription default | ⏳ Pending | Medium | Configuration |
| MEET199 | Sidebar must support skeleton loaders on initial load | ⏳ Pending | Medium | UI |
| MEET200 | The sidebar meeting section must be extensible to show more than 5 via scroll or "Show More" | ⏳ Pending | Medium | UI |

---

## 📊 Development Phases

### **Phase 1: Foundation (Tasks 1-40)**
- Google OAuth integration
- Calendar sync and meeting detection
- Basic database schema
- Authentication and security

### **Phase 2: Core Features (Tasks 41-100)**
- Live meeting joining and transcription
- Transcript handling and summarization
- Mere integration and UX
- Basic UI components

### **Phase 3: Advanced Features (Tasks 101-160)**
- Sidebar UI and calendar display
- Transcription status and management
- Advanced Mere integration
- Export and sharing features

### **Phase 4: Polish & Resilience (Tasks 161-200)**
- AI context support
- Backend optimization
- Error handling and resilience
- Performance improvements

---

## 🔧 Technical Requirements

### **Database Schema**
- `meetings` table for Google Calendar events
- `meeting_transcripts` table for audio transcripts
- `meeting_summaries` table for AI-generated summaries
- `google_oauth_tokens` table for authentication
- `meeting_participants` table for attendance tracking

### **API Endpoints**
- `/api/google/oauth` - OAuth flow management
- `/api/meetings/sync` - Calendar synchronization
- `/api/meetings/next5` - Upcoming meetings for sidebar
- `/api/meetings/{id}/transcribe` - Transcription initiation
- `/api/meetings/{id}/summary` - Summary generation
- `/api/meetings/{id}/join` - Bot join functionality

### **Job Queues**
- `calendar-sync` - Periodic calendar synchronization
- `meeting-transcribe` - Audio transcription processing
- `meeting-summarize` - Summary generation
- `bot-join` - Meeting bot joining

### **External Integrations**
- Google Calendar API
- Google Meet API (when available)
- Whisper.cpp for transcription
- LLM services for summarization

---

*Last Updated: $(date)*
*Next Review: After completing Phase 1 foundation tasks* 