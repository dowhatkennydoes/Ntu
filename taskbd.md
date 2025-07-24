# Ntu Backend Development Tasks

## Overview
This document tracks Acceptance Criteria (ACs) for the Ntu backend stack built on:
- **Next.js API Routes or Fastify**
- **Supabase (Postgres + Auth + pgvector)**
- **Whisper.cpp**
- **Ollama + Claude/GPT**
- **BullMQ + Redis**
- **pgvector or Chroma**
- **Hosted on Vercel, Supabase, Render (Free Tiers)**

**Status:** 15 Completed, 0 In Progress, 185 Pending

---

## 🧠 MEMORY & SEMANTIC INTELLIGENCE (1–20)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| BD1 | Embeddings must include source_app, user_id, and snapshot_id metadata | ⏳ Pending | High | Memory intelligence |
| BD2 | Every AI interaction must be optionally saved as a memory entry | ⏳ Pending | High | Memory intelligence |
| BD3 | Memory objects must include confidence_score and intent_label | ⏳ Pending | High | Memory intelligence |
| BD4 | Memories created by agents must log the originating LLM and prompt | ⏳ Pending | High | Memory intelligence |
| BD5 | Embeddings must support tagging by topic or persona | ⏳ Pending | High | Memory intelligence |
| BD6 | Vector records must support a usage_type field (e.g., "note", "transcript", "flashcard") | ⏳ Pending | High | Memory intelligence |
| BD7 | All memories must be linkable to sessions in Mere | ⏳ Pending | High | Memory intelligence |
| BD8 | Search queries must return contextual chunks, not just matches | ⏳ Pending | High | Memory intelligence |
| BD9 | Semantic recall must support a "show reasoning chain" option | ⏳ Pending | Medium | Memory intelligence |
| BD10 | Similarity queries must return cosine similarity threshold value | ⏳ Pending | Medium | Memory intelligence |
| BD11 | Memory records must support pin and snooze statuses | ⏳ Pending | Medium | Memory intelligence |
| BD12 | User-facing memory results must be sorted by relevance, not recency | ⏳ Pending | Medium | Memory intelligence |
| BD13 | Agent-created memory must be editable before it's finalized | ⏳ Pending | Medium | Memory intelligence |
| BD14 | Vector update jobs must only re-embed if content changed | ⏳ Pending | High | Memory intelligence |
| BD15 | All app embeddings must be scoped by app namespace | ⏳ Pending | High | Memory intelligence |
| BD16 | Embedding pipeline must log tokens used for LLM fallback | ⏳ Pending | Medium | Memory intelligence |
| BD17 | Memory type must be classified as "fact", "task", "insight", or "irrelevant" | ⏳ Pending | Medium | Memory intelligence |
| BD18 | Replay mode must only pull memories with replayable = true | ⏳ Pending | Medium | Memory intelligence |
| BD19 | Vector queries must run in under 300ms for <100k records | ⏳ Pending | High | Performance |
| BD20 | Chroma-based fallback search must return match explanation | ⏳ Pending | Medium | Memory intelligence |

---

## 🔁 JOB QUEUES & ORCHESTRATION (21–40)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| BD21 | Queue retries must back off exponentially up to 3x | ⏳ Pending | High | Job queues |
| BD22 | Dead-lettered jobs must notify an admin email | ⏳ Pending | Medium | Job queues |
| BD23 | Job logs must include job_type, duration_ms, status | ⏳ Pending | High | Job queues |
| BD24 | Embedding jobs must mark status = pending, status = complete | ⏳ Pending | High | Job queues |
| BD25 | BullMQ dashboard must show active, delayed, failed job counts | ⏳ Pending | Medium | Job queues |
| BD26 | Cron jobs must run nightly to re-index stale vectors | ⏳ Pending | Medium | Job queues |
| BD27 | Transcription jobs must fail gracefully if audio format unsupported | ⏳ Pending | High | Job queues |
| BD28 | A universal job dispatcher must handle job handoff between apps | ⏳ Pending | High | Job queues |
| BD29 | Jobs must be tied to user ID and app context | ⏳ Pending | High | Job queues |
| BD30 | Failed jobs must be visible in a /api/debug/jobs route | ⏳ Pending | Medium | Job queues |
| BD31 | Each app must have its own worker queue prefix | ⏳ Pending | High | Job queues |
| BD32 | Repeated failures must be auto-muted after 3 attempts | ⏳ Pending | Medium | Job queues |
| BD33 | BullMQ Redis TTL must purge completed jobs after 1 week | ⏳ Pending | Medium | Job queues |
| BD34 | Summarization jobs must split input if token count exceeds limit | ⏳ Pending | High | Job queues |
| BD35 | Jobs must batch writes in chunks of 10 or more | ⏳ Pending | High | Job queues |
| BD36 | Audio file jobs must queue upload + transcript + embed | ⏳ Pending | High | Job queues |
| BD37 | Task chaining must allow job A to trigger job B conditionally | ⏳ Pending | Medium | Job queues |
| BD38 | Each job queue must log its average processing time | ⏳ Pending | Medium | Job queues |
| BD39 | Claude/GPT fallback jobs must log API latency and response status | ⏳ Pending | Medium | Job queues |
| BD40 | Whisper job output must include word count and speaker labels | ⏳ Pending | High | Job queues |

---

## 🔒 SECURITY & AUDITABILITY (41–60)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| BD41 | All API routes must validate JWT on entry | ⏳ Pending | High | Security |
| BD42 | Sensitive routes must check for role = admin | ⏳ Pending | High | Security |
| BD43 | Logs must omit sensitive tokens or vector content | ⏳ Pending | High | Security |
| BD44 | Memory records must be encrypted at rest (Supabase optional) | ⏳ Pending | Medium | Security |
| BD45 | Webhooks must validate source signature before processing | ⏳ Pending | High | Security |
| BD46 | Agent-generated content must include user confirmation before saving | ⏳ Pending | Medium | Security |
| BD47 | API rate-limiting must prevent abuse from a single IP | ⏳ Pending | High | Security |
| BD48 | Each memory item must include audit log metadata | ⏳ Pending | High | Audit |
| BD49 | Logs must record who accessed what memory when | ⏳ Pending | High | Audit |
| BD50 | Memory replay mode must redact PII before replaying | ⏳ Pending | Medium | Security |
| BD51 | File uploads must be scanned before storage | ⏳ Pending | High | Security |
| BD52 | Notes must sanitize HTML and script tags on input | ⏳ Pending | High | Security |
| BD53 | JWTs must expire within 1 hour by default | ⏳ Pending | High | Security |
| BD54 | OAuth tokens must be stored encrypted if used | ⏳ Pending | Medium | Security |
| BD55 | Vector queries must be restricted by user ID | ⏳ Pending | High | Security |
| BD56 | Admin overrides must be logged separately in audit table | ⏳ Pending | Medium | Audit |
| BD57 | Worker crashes must log reason and payload safely | ⏳ Pending | Medium | Audit |
| BD58 | Auth tokens must rotate every 24h (if refresh tokens enabled) | ⏳ Pending | Medium | Security |
| BD59 | Uploads must only be accepted if under 10MB | ⏳ Pending | High | Security |
| BD60 | Whisper input must strip metadata unless flagged | ⏳ Pending | Medium | Security |

---

## 🧠 LLM FALLBACK, PROMPTING, & CONTEXT ROUTING (61–80)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| BD61 | Prompt templates must be versioned | ⏳ Pending | High | LLM |
| BD62 | LLM fallbacks must retry once per vendor (Ollama → Claude → GPT) | ⏳ Pending | High | LLM |
| BD63 | Claude requests must respect user's memory scope | ⏳ Pending | High | LLM |
| BD64 | Prompts must include app name, persona tag, and recent notes | ⏳ Pending | High | LLM |
| BD65 | Ollama must be used by default for summarization | ⏳ Pending | Medium | LLM |
| BD66 | Claude fallback must be used for complex analysis | ⏳ Pending | Medium | LLM |
| BD67 | Prompt logs must include total token count and output length | ⏳ Pending | Medium | LLM |
| BD68 | Prompt injection attempts must be detected and redacted | ⏳ Pending | High | Security |
| BD69 | All prompts must be templated with {{input}}, {{context}}, {{user_name}} | ⏳ Pending | High | LLM |
| BD70 | LLM responses must return alongside the prompt that generated them | ⏳ Pending | Medium | LLM |
| BD71 | Failed LLM calls must not block the app flow | ⏳ Pending | High | LLM |
| BD72 | System prompts must be unique per app | ⏳ Pending | High | LLM |
| BD73 | LLM responses must be cached for repeat queries | ⏳ Pending | Medium | LLM |
| BD74 | A test route /api/debug/llm must simulate a dummy prompt | ⏳ Pending | Medium | LLM |
| BD75 | Long responses must be chunked and streamed to UI | ⏳ Pending | Medium | LLM |
| BD76 | Claude/GPT requests must honor retry limits | ⏳ Pending | Medium | LLM |
| BD77 | Prompt context must include app summary and memory excerpt | ⏳ Pending | High | LLM |
| BD78 | App-specific routing must override default fallback path | ⏳ Pending | Medium | LLM |
| BD79 | LLM config must support streaming vs. non-streaming toggles | ⏳ Pending | Medium | LLM |
| BD80 | Prompt responses must trigger downstream job queues if required | ⏳ Pending | Medium | LLM |

---

## 📦 API STABILITY, VERSIONING, AND MONITORING (81–100)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| BD81 | API version must be included in all route URLs (e.g., /api/v1/...) | ⏳ Pending | High | API |
| BD82 | Breaking API changes must include changelog in dev logs | ⏳ Pending | Medium | API |
| BD83 | API health route must return uptime, env, and status | ⏳ Pending | High | Monitoring |
| BD84 | Liveness and readiness probes must be available for containerization | ⏳ Pending | Medium | Monitoring |
| BD85 | API must emit custom headers like X-Ntu-App-Context | ⏳ Pending | Medium | API |
| BD86 | Each API route must log execution time in ms | ⏳ Pending | High | Monitoring |
| BD87 | API error logs must be structured (code, message, path, user_id) | ⏳ Pending | High | Monitoring |
| BD88 | Test coverage must exceed 80% for all major routes | ⏳ Pending | High | Testing |
| BD89 | Supabase logs must capture slow queries >500ms | ⏳ Pending | Medium | Monitoring |
| BD90 | API limits (e.g., 10MB uploads, 50 results) must return 413 or 429 | ⏳ Pending | High | API |
| BD91 | Swagger or OpenAPI docs must be autogenerated in dev mode | ⏳ Pending | Medium | API |
| BD92 | Public API keys (if used) must be tracked with usage stats | ⏳ Pending | Medium | Monitoring |
| BD93 | Job queue metrics must report queue depth in /metrics | ⏳ Pending | Medium | Monitoring |
| BD94 | Redis uptime must be monitored using PING checks | ⏳ Pending | Medium | Monitoring |
| BD95 | Rate-limiting thresholds must return Retry-After headers | ⏳ Pending | Medium | API |
| BD96 | Feature flags must toggle endpoints by env or user role | ⏳ Pending | Medium | API |
| BD97 | Caching layer must use etag and cache-control headers | ⏳ Pending | Medium | API |
| BD98 | API route tests must simulate expired tokens and invalid roles | ⏳ Pending | High | Testing |
| BD99 | Cron-based self-check must ensure queue latency < 1s | ⏳ Pending | Medium | Monitoring |
| BD100 | Environment logs must rotate daily and store for 14 days max | ⏳ Pending | Medium | Monitoring |

---

## 📁 FILE UPLOADS, TRANSCRIPTION & STORAGE (101–120)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| BD101 | Audio files uploaded from Yonder must be stored in Supabase Storage | ⏳ Pending | High | File storage |
| BD102 | File metadata (filename, duration, speaker_count) must be stored in Postgres | ⏳ Pending | High | File storage |
| BD103 | Whisper.cpp must transcribe files and store transcript text in the transcripts table | ⏳ Pending | High | Transcription |
| BD104 | Each transcript must be linked to a memory_id | ⏳ Pending | High | Transcription |
| BD105 | Transcription jobs must auto-run when audio is uploaded | ⏳ Pending | High | Transcription |
| BD106 | Errors in Whisper must fallback to Claude/GPT summarization of audio | ⏳ Pending | High | Transcription |
| BD107 | Uploaded files must be virus-scanned or validated before storage | ⏳ Pending | High | Security |
| BD108 | Only .wav, .mp3, and .m4a formats are accepted | ⏳ Pending | High | File storage |
| BD109 | Transcription must support diarization or include speaker metadata | ⏳ Pending | Medium | Transcription |
| BD110 | Whisper jobs must emit progress updates via WebSocket or polling | ⏳ Pending | Medium | Transcription |
| BD111 | A unique job_id must track each transcription | ⏳ Pending | High | Transcription |
| BD112 | Transcripts must be chunked and stored with token count | ⏳ Pending | High | Transcription |
| BD113 | Transcripts must be auto-embedded in pgvector | ⏳ Pending | High | Transcription |
| BD114 | File size must be limited (e.g., <100MB) | ⏳ Pending | High | File storage |
| BD115 | Transcripts must support search across speaker + keyword | ⏳ Pending | Medium | Transcription |
| BD116 | Transcription summaries must be stored in summaries table | ⏳ Pending | High | Transcription |
| BD117 | Yonder must queue a summarization job after transcript completion | ⏳ Pending | High | Transcription |
| BD118 | File uploads must show progress in the frontend | ⏳ Pending | Medium | File storage |
| BD119 | File uploads must be resumable or fail gracefully | ⏳ Pending | Medium | File storage |
| BD120 | Supabase must reject unauthorized file uploads | ⏳ Pending | High | Security |

---

## 🧠 MEMORY & NOTEBOOK (JUNCTION) (121–140)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| BD121 | Every note must be assigned a note_id, user_id, project_id | ⏳ Pending | High | Notebook |
| BD122 | Notes must support full Markdown with live preview | ⏳ Pending | High | Notebook |
| BD123 | Notes must be autosaved every 5 seconds or on blur | ⏳ Pending | High | Notebook |
| BD124 | Edits must trigger embedding refresh | ⏳ Pending | High | Notebook |
| BD125 | Semantic note search must use pgvector | ⏳ Pending | High | Notebook |
| BD126 | Notes must support cross-referencing ([[Note Title]] links) | ⏳ Pending | Medium | Notebook |
| BD127 | Notes can be tagged with any user-defined tag | ⏳ Pending | Medium | Notebook |
| BD128 | Flashcards must be created from highlighted text | ⏳ Pending | Medium | Notebook |
| BD129 | Notes must support linked audio or transcript IDs | ⏳ Pending | Medium | Notebook |
| BD130 | Keyboard shortcuts (e.g., cmd+enter) must trigger save | ⏳ Pending | Medium | Notebook |
| BD131 | Rich text to Markdown conversion must be seamless | ⏳ Pending | Medium | Notebook |
| BD132 | Images pasted must be uploaded to Supabase and linked | ⏳ Pending | Medium | Notebook |
| BD133 | Every note must support export to .md or .pdf | ⏳ Pending | Medium | Notebook |
| BD134 | Search must support both keyword and semantic filters | ⏳ Pending | High | Notebook |
| BD135 | Notes must belong to folders or collections | ⏳ Pending | Medium | Notebook |
| BD136 | Note revisions must be versioned | ⏳ Pending | Medium | Notebook |
| BD137 | "Replay mode" must show semantic timeline of notes | ⏳ Pending | Medium | Notebook |
| BD138 | Daily notes must auto-create a new entry on open | ⏳ Pending | Medium | Notebook |
| BD139 | Notes must be scoped to user and organization | ⏳ Pending | High | Notebook |
| BD140 | Soft-deleted notes must go to a recycle bin | ⏳ Pending | Medium | Notebook |

---

## 🤖 MERE (AI CHATBOT + CONTEXTUAL COMMANDS) (141–160)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| BD141 | Mere must use Ollama by default and Claude for fallbacks | ⏳ Pending | High | Chatbot |
| BD142 | All chat sessions must be stored in chat_sessions with app_context | ⏳ Pending | High | Chatbot |
| BD143 | Chat messages must be linked to memory IDs | ⏳ Pending | High | Chatbot |
| BD144 | Commands like "make this a flashcard" must route to Junction's backend | ⏳ Pending | High | Chatbot |
| BD145 | Mere must ask user before switching app contexts | ⏳ Pending | Medium | Chatbot |
| BD146 | Memory snapshot toggle must enable saving each chat turn | ⏳ Pending | Medium | Chatbot |
| BD147 | Mere must detect app-specific intent (e.g., "summarize this meeting") | ⏳ Pending | Medium | Chatbot |
| BD148 | Each chat must include system message context (e.g., notebook, voice, meeting) | ⏳ Pending | High | Chatbot |
| BD149 | Mere must suggest apps when asked (e.g., "open Yonder") | ⏳ Pending | Medium | Chatbot |
| BD150 | Chat context must persist only within one app unless toggled | ⏳ Pending | Medium | Chatbot |
| BD151 | Mere must show loading status if waiting on LLM response | ⏳ Pending | Medium | Chatbot |
| BD152 | Failed LLM calls must fallback gracefully | ⏳ Pending | High | Chatbot |
| BD153 | Users must be able to copy, pin, or delete individual messages | ⏳ Pending | Medium | Chatbot |
| BD154 | LLM queries must include memory excerpts as context | ⏳ Pending | High | Chatbot |
| BD155 | Tokens used per session must be tracked for analytics | ⏳ Pending | Medium | Chatbot |
| BD156 | Chat history must support scroll and load-on-demand | ⏳ Pending | Medium | Chatbot |
| BD157 | Embeddings from chats must be optional but recommended | ⏳ Pending | Medium | Chatbot |
| BD158 | Chat input must support Markdown or inline code | ⏳ Pending | Medium | Chatbot |
| BD159 | Mere must respond differently when launched on home vs. in-app | ⏳ Pending | Medium | Chatbot |
| BD160 | Chat must support quick buttons for user actions (e.g., summarize, search) | ⏳ Pending | Medium | Chatbot |

---

## 📚 SUMMARIZATION + VECTOR OPS (161–180)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| BD161 | Summarization jobs must queue automatically after transcripts or long notes | ⏳ Pending | High | Summarization |
| BD162 | Claude/GPT must summarize in user-selected formats (e.g., bullets, narrative, TL;DR) | ⏳ Pending | High | Summarization |
| BD163 | Each summary must include source memory_id and timestamp | ⏳ Pending | High | Summarization |
| BD164 | Embeddings must be generated for all summaries | ⏳ Pending | High | Summarization |
| BD165 | A summaries table must include model_used, type, input_tokens, output_tokens | ⏳ Pending | High | Summarization |
| BD166 | Summaries must be tagged with topic/intent for faster retrieval | ⏳ Pending | Medium | Summarization |
| BD167 | Claude must receive the top-5 related memories as vector context | ⏳ Pending | High | Summarization |
| BD168 | Similar memories must be grouped in semantic_clusters | ⏳ Pending | Medium | Summarization |
| BD169 | Notes, summaries, and memories must all support hybrid search | ⏳ Pending | High | Summarization |
| BD170 | Vector queries must support a toggle between pgvector and chroma | ⏳ Pending | Medium | Summarization |
| BD171 | Vector queries must sort by descending similarity | ⏳ Pending | Medium | Summarization |
| BD172 | Users can favorite a summary and pin to their notebook | ⏳ Pending | Medium | Summarization |
| BD173 | Embedded items must be re-vectorized on edits | ⏳ Pending | High | Summarization |
| BD174 | Vector records must log source_type (chat, transcript, note) | ⏳ Pending | High | Summarization |
| BD175 | Summaries must be used to generate AI flashcards | ⏳ Pending | Medium | Summarization |
| BD176 | A single API route must fetch all summaries tied to a session | ⏳ Pending | Medium | Summarization |
| BD177 | Vector results must include metadata (e.g., relevance, similarity score) | ⏳ Pending | Medium | Summarization |
| BD178 | Vectors older than 30d must be eligible for pruning | ⏳ Pending | Medium | Summarization |
| BD179 | Summaries must support translation with fallback | ⏳ Pending | Medium | Summarization |
| BD180 | Summaries must include a confidence score | ⏳ Pending | Medium | Summarization |

---

## 🚦 SYSTEM HEALTH, FALLBACKS, & MONITORING (181–200)

| ID | Task | Status | Priority | Category |
|----|------|--------|----------|----------|
| BD181 | Every API route must log execution time and status code | ⏳ Pending | High | Monitoring |
| BD182 | Claude and GPT usage must log latency, model name, and response success | ⏳ Pending | High | Monitoring |
| BD183 | Whisper jobs must log WER (word error rate) if known | ⏳ Pending | Medium | Monitoring |
| BD184 | System health check must return status of LLMs, DB, Redis, Whisper, storage | ⏳ Pending | High | Monitoring |
| BD185 | Redis must auto-restart if memory exceeds 75% | ⏳ Pending | Medium | Monitoring |
| BD186 | All jobs must expose logs via a /jobs dashboard (basic) | ⏳ Pending | Medium | Monitoring |
| BD187 | API route /api/status must return build version and uptime | ⏳ Pending | High | Monitoring |
| BD188 | Embedding failures must push an error to Sentry or LogSnag | ⏳ Pending | Medium | Monitoring |
| BD189 | Users must receive feedback when a task is queued, running, or failed | ⏳ Pending | Medium | Monitoring |
| BD190 | If Claude is unreachable, users must see a fallback prompt | ⏳ Pending | High | Monitoring |
| BD191 | Whisper job latency must be tracked and averaged | ⏳ Pending | Medium | Monitoring |
| BD192 | System usage logs must support filtering by user, app, job_type | ⏳ Pending | Medium | Monitoring |
| BD193 | API limits must be enforced per user and log rejections | ⏳ Pending | High | Monitoring |
| BD194 | A daily cron job must clean orphaned vector rows | ⏳ Pending | Medium | Monitoring |
| BD195 | If file upload fails, a retry should be attempted | ⏳ Pending | Medium | Monitoring |
| BD196 | Claude summarization jobs must auto-retry once | ⏳ Pending | Medium | Monitoring |
| BD197 | A system dashboard must show success/failure counts for major flows | ⏳ Pending | Medium | Monitoring |
| BD198 | Vector dimensions must be validated on insert | ⏳ Pending | High | Monitoring |
| BD199 | Summaries must be stored even if embedding fails | ⏳ Pending | Medium | Monitoring |
| BD200 | DB must track total usage per app module per user | ⏳ Pending | Medium | Monitoring |

---

## Implementation Notes

### Priority Levels
- **High**: Critical for core functionality and security
- **Medium**: Important for user experience and system reliability
- **Low**: Nice-to-have features and optimizations

### Categories
- **Memory intelligence**: Vector embeddings, semantic search, memory management
- **Job queues**: Background processing, task orchestration, queue management
- **Security**: Authentication, authorization, data protection
- **LLM**: Language model integration, prompting, fallback logic
- **API**: REST endpoints, versioning, documentation
- **Monitoring**: Logging, metrics, health checks
- **Performance**: Optimization, caching, response times
- **Testing**: Unit tests, integration tests, coverage
- **Audit**: Logging, compliance, traceability
- **File storage**: Audio uploads, file management, storage optimization
- **Notebook**: Junction app backend, note management, markdown processing
- **Chatbot**: Mere app backend, chat sessions, contextual commands
- **Summarization**: AI summarization, vector operations, content processing
- **Transcription**: Whisper integration, audio processing, speaker detection

### Tech Stack Integration
- **Supabase**: Primary database, auth, and vector storage
- **BullMQ + Redis**: Job queue management
- **Whisper.cpp**: Audio transcription
- **Ollama**: Local LLM inference
- **Claude/GPT**: Cloud LLM fallback
- **pgvector/Chroma**: Vector similarity search
- **Next.js/Fastify**: API framework
- **Vercel/Supabase/Render**: Hosting and deployment

### Development Phases
1. **Phase 1**: Core infrastructure (auth, database, basic API)
2. **Phase 2**: Memory and vector search implementation
3. **Phase 3**: Job queues and background processing
4. **Phase 4**: LLM integration and fallback logic
5. **Phase 5**: Security hardening and audit logging
6. **Phase 6**: Monitoring, testing, and optimization
7. **Phase 7**: App-specific features (Junction, Yonder, Mere)
8. **Phase 8**: Advanced features and performance optimization 