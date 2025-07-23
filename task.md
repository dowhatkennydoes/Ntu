# Ntu Workflow Acceptance Criteria (ACs) - Task Tracking

## Overview
This document tracks 200 Workflow Acceptance Criteria (ACs) for Ntu, a $10B DeviseOS clone. These ACs define how users move through tasks, actions, and decision paths across the platform's ecosystem, ensuring seamless productivity, minimal cognitive load, and optimized task execution.

**Total ACs:** 800 (100 Original + 200 Marathon + 100 Yonder + 100 Junction + 300 Mere)  
**Status:** 58 Completed, 10 In Progress, 732 Pending  
**Last Updated:** [Current Date]

---

## 🏃‍♂️ **Marathon - Visual Automation Platform (100 ACs)**

*Marathon enables users to create, schedule, and monitor powerful no-code workflows across all apps in the Ntu platform.*

### 🧠 **CORE ARCHITECTURE (Backend & Node Engine)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA1 | Marathon must allow creation of automation flows via drag-and-drop nodes | ⏳ Pending | High | Core functionality |
| MA2 | Each node must have input and output ports for data chaining | ⏳ Pending | High | Data flow |
| MA3 | The engine must support conditional branching (if/else, switch, loop) | ⏳ Pending | High | Logic control |
| MA4 | Marathon must run flows in real time or on schedule | ⏳ Pending | High | Execution modes |
| MA5 | Each workflow must support triggers (e.g., on memory creation, on note tag) | ⏳ Pending | High | Event-driven |
| MA6 | Flows must support async execution and parallel paths | ⏳ Pending | High | Performance |
| MA7 | All flows must be version-controlled and rollback-ready | ⏳ Pending | Medium | Version control |
| MA8 | Users can test individual nodes or entire workflows | ⏳ Pending | Medium | Testing |
| MA9 | Flow runtime logs must be persisted and viewable | ⏳ Pending | Medium | Monitoring |
| MA10 | API endpoints must allow flow triggering externally via webhook or Mere | ⏳ Pending | Medium | External integration |

### 🎨 **UI/UX & FLOW DESIGNER**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA11 | Users must be able to create flows using a canvas-based UI | ⏳ Pending | High | Visual design |
| MA12 | Canvas supports zoom, pan, and fit-to-view | ⏳ Pending | Medium | Navigation |
| MA13 | Users can drag from a node palette onto the canvas | ⏳ Pending | High | Node creation |
| MA14 | Nodes snap to a grid for clean alignment | ⏳ Pending | Medium | Layout |
| MA15 | Connections animate to show data direction | ⏳ Pending | Medium | Visual feedback |
| MA16 | Double-clicking a node opens its config panel | ⏳ Pending | Medium | Configuration |
| MA17 | Right-click menu on canvas supports "Add Node," "Paste," "Group" | ⏳ Pending | Medium | Context menu |
| MA18 | Undo/redo is supported (Ctrl+Z/Ctrl+Y) | ⏳ Pending | Medium | History |
| MA19 | Keyboard shortcuts: Del to delete, ⌘/Ctrl + Click for multi-select | ⏳ Pending | Medium | Keyboard UX |
| MA20 | Nodes can be color-coded by category (data, memory, plugin, AI, etc.) | ⏳ Pending | Low | Visual organization |

### ⚙️ **TRIGGERS & START CONDITIONS**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA21 | "Memory Created" trigger must support filters (by tag, app, content) | ⏳ Pending | High | Memory triggers |
| MA22 | "Notebook Updated" trigger must detect title/body changes | ⏳ Pending | High | Notebook triggers |
| MA23 | "Voice Transcript Completed" must start a flow | ⏳ Pending | Medium | Voice triggers |
| MA24 | "Flashcard Quiz Completed" should trigger analytics flows | ⏳ Pending | Medium | Learning triggers |
| MA25 | "Plugin Installed" or "Plugin Event" must start custom logic | ⏳ Pending | Medium | Plugin triggers |
| MA26 | "Scheduled Time" supports cron or natural language | ⏳ Pending | High | Time triggers |
| MA27 | "New Team Message" or "Comment Added" should trigger flows | ⏳ Pending | Medium | Team triggers |
| MA28 | "New File Upload" to a notebook starts parsing workflow | ⏳ Pending | Medium | File triggers |
| MA29 | "User Logs In" can trigger onboarding flows | ⏳ Pending | Low | User triggers |
| MA30 | "Mere Suggestion Accepted" can serve as a memory-linked event | ⏳ Pending | Medium | AI triggers |

### 🔌 **ACTION NODES**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA31 | "Create Note in Notebook" must allow selection of section and content | ⏳ Pending | High | Note creation |
| MA32 | "Tag Memory" must include dynamic input from prior node | ⏳ Pending | High | Memory tagging |
| MA33 | "Redact Section" should auto-flag and return modified block | ⏳ Pending | Medium | Content redaction |
| MA34 | "Send Notification" supports push, email, and in-app alerts | ⏳ Pending | High | Notifications |
| MA35 | "Summarize Memory" triggers AI summarization with options | ⏳ Pending | High | AI actions |
| MA36 | "Generate Flashcards" from memory or note | ⏳ Pending | Medium | Learning actions |
| MA37 | "Export Memory" node supports selecting format (PDF, JSON) | ⏳ Pending | Medium | Export actions |
| MA38 | "Assign Task to Teammate" includes deadline input | ⏳ Pending | Medium | Team actions |
| MA39 | "Create Calendar Event" includes duration and time zone | ⏳ Pending | Medium | Calendar actions |
| MA40 | "Trigger Plugin Hook" sends output data to target plugin | ⏳ Pending | Medium | Plugin actions |

### 🤖 **AI & INTELLIGENCE NODES**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA41 | "Ask Mere" uses generative prompt chaining | ⏳ Pending | High | AI interaction |
| MA42 | "Generate Summary" uses selected LLM engine | ⏳ Pending | High | AI summarization |
| MA43 | "Classify Memory Intent" returns category or tag | ⏳ Pending | Medium | AI classification |
| MA44 | "Sentiment Analysis" node returns emotion metadata | ⏳ Pending | Medium | AI analysis |
| MA45 | "Extract Named Entities" from text node | ⏳ Pending | Medium | AI extraction |
| MA46 | "Rephrase Text for Tone" allows input of style (e.g., professional, casual) | ⏳ Pending | Medium | AI transformation |
| MA47 | "Create AI Task Agent" launches short-lived agents | ⏳ Pending | Medium | AI agents |
| MA48 | "Memory Fork Prediction" node suggests next path options | ⏳ Pending | Medium | AI prediction |
| MA49 | "Narrative Mode Transform" reorders inputs by chronology | ⏳ Pending | Low | AI organization |
| MA50 | "Generate AI Image from Note" must return file output | ⏳ Pending | Medium | AI generation |

### 📦 **DATA FLOW & TRANSFORM NODES**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA51 | "Set Variable" node for temporary data holding | ⏳ Pending | High | Data management |
| MA52 | "Merge Streams" must allow field selection and overwrite logic | ⏳ Pending | High | Data merging |
| MA53 | "Split Text" by delimiter or line | ⏳ Pending | Medium | Text processing |
| MA54 | "Filter By Field" accepts conditional expressions | ⏳ Pending | High | Data filtering |
| MA55 | "Group By Attribute" supports statistical summarization | ⏳ Pending | Medium | Data aggregation |
| MA56 | "Sort Array" ascending/descending | ⏳ Pending | Medium | Data sorting |
| MA57 | "Delay/Wait" node supports seconds, minutes, or trigger dependency | ⏳ Pending | Medium | Flow control |
| MA58 | "Loop Until" based on a condition or counter | ⏳ Pending | Medium | Flow control |
| MA59 | "Parse JSON" string into object | ⏳ Pending | Medium | Data parsing |
| MA60 | "Format Date" node accepts custom formats | ⏳ Pending | Medium | Data formatting |

### 📚 **INTEGRATIONS & THIRD-PARTY**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA61 | "HTTP Request" node for calling external APIs | ⏳ Pending | High | External APIs |
| MA62 | "Google Calendar" integration supports create/update events | ⏳ Pending | Medium | Calendar integration |
| MA63 | "Zoom Sync" creates memory from recorded meetings | ⏳ Pending | Medium | Meeting integration |
| MA64 | "Slack Message" supports channel posting with formatting | ⏳ Pending | Medium | Communication |
| MA65 | "Airtable Insert" maps data to configured table | ⏳ Pending | Medium | Database integration |
| MA66 | "Gmail Send" supports rich text and attachments | ⏳ Pending | Medium | Email integration |
| MA67 | "HubSpot Create Contact" with memory metadata | ⏳ Pending | Medium | CRM integration |
| MA68 | "Notion Append" supports linking memory blocks | ⏳ Pending | Medium | Note integration |
| MA69 | "Firebase Write" supports push to real-time DB | ⏳ Pending | Medium | Database integration |
| MA70 | "Webhook Trigger" creates dynamic endpoint for external events | ⏳ Pending | Medium | Webhook integration |

### 🔐 **SECURITY, PERMISSIONS & MONITORING**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA71 | Users can assign flow visibility: private, team, org | ⏳ Pending | High | Access control |
| MA72 | Marathon flows must respect Ntu's RBAC roles | ⏳ Pending | High | Role-based access |
| MA73 | Secure flows require extra confirmation for export or redaction | ⏳ Pending | Medium | Security confirmation |
| MA74 | All execution logs must be exportable | ⏳ Pending | Medium | Logging |
| MA75 | Node-by-node logging must be toggleable | ⏳ Pending | Medium | Detailed logging |
| MA76 | Flow error notifications must be routed to user email + in-app | ⏳ Pending | Medium | Error handling |
| MA77 | Flows must timeout gracefully after set threshold | ⏳ Pending | Medium | Timeout handling |
| MA78 | Users can lock critical nodes from edits | ⏳ Pending | Medium | Node protection |
| MA79 | Flows that alter sensitive memory require audit trail | ⏳ Pending | High | Audit logging |
| MA80 | GDPR-compliant logging toggle must exist per flow | ⏳ Pending | Medium | Privacy compliance |

### 🧑‍💼 **UX, ACCESS & MANAGEMENT**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA81 | User dashboard shows recent flows with status badges | ⏳ Pending | High | Dashboard view |
| MA82 | Each flow must show "last run," "runs this week," and "errors" | ⏳ Pending | High | Flow metrics |
| MA83 | Flow search bar filters by name, tag, or trigger type | ⏳ Pending | Medium | Search functionality |
| MA84 | User can duplicate or clone existing flows | ⏳ Pending | Medium | Flow reuse |
| MA85 | Flows can be tagged and grouped by purpose | ⏳ Pending | Medium | Organization |
| MA86 | "Create from Template" shows library of pre-built flows | ⏳ Pending | Medium | Templates |
| MA87 | Mere can suggest flow creation based on activity | ⏳ Pending | Medium | AI suggestions |
| MA88 | Flow dependency graph shows app/plugin relationships | ⏳ Pending | Low | Dependency visualization |
| MA89 | Import/export flows via JSON or YAML | ⏳ Pending | Medium | Flow portability |
| MA90 | Mobile view supports flow monitoring (read-only) | ⏳ Pending | Medium | Mobile support |

### 🧭 **WORKFLOW COORDINATION & SCALING**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA91 | Multi-run concurrency toggle per flow | ⏳ Pending | Medium | Concurrency control |
| MA92 | Subflows can be created and reused across other flows | ⏳ Pending | High | Flow modularity |
| MA93 | Conditional routing based on memory values | ⏳ Pending | High | Dynamic routing |
| MA94 | Batch processing of memory items | ⏳ Pending | Medium | Batch operations |
| MA95 | Flows can interact with multiple notebooks at once | ⏳ Pending | Medium | Multi-notebook |
| MA96 | Execution queue visualized per user/team | ⏳ Pending | Medium | Queue management |
| MA97 | Throttling/Rate limits configurable per flow | ⏳ Pending | Medium | Rate limiting |
| MA98 | Flow "pause" and "resume" actions from dashboard | ⏳ Pending | Medium | Flow control |
| MA99 | Retry-on-failure settings configurable per node | ⏳ Pending | Medium | Error recovery |
| MA100 | Users can mark flows as critical and pin to dashboard | ⏳ Pending | Medium | Priority management |

---

## 🚀 **Marathon Advanced - Enterprise & AI Automation (100 ACs)**

*Advanced Marathon features for memory-native intelligence, enterprise compliance, team collaboration, and extensible automation.*

### 🧠 **A. Memory-Native Intelligence & Ntu Integration (30 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA101 | Memory decay score can be used as a trigger | ⏳ Pending | High | Memory intelligence |
| MA102 | Contradictory memories across notebooks trigger a flow | ⏳ Pending | High | Memory consistency |
| MA103 | Flows can activate when memory enters "forked" state | ⏳ Pending | High | Memory branching |
| MA104 | User can trigger workflows when a memory is annotated | ⏳ Pending | Medium | Memory annotation |
| MA105 | Tag creation inside Memory can launch a routing flow | ⏳ Pending | Medium | Tag-based routing |
| MA106 | Workflows can detect when a memory is summarized more than once | ⏳ Pending | Medium | Duplicate detection |
| MA107 | Flows can detect semantic duplication across notebooks | ⏳ Pending | High | Semantic analysis |
| MA108 | Agent memory persona can trigger different flow paths | ⏳ Pending | High | Agent integration |
| MA109 | Flows can fetch real-time timeline updates from Memory | ⏳ Pending | High | Real-time sync |
| MA110 | Export guardrails violations can pause a flow for review | ⏳ Pending | High | Compliance pause |
| MA111 | Shared memory updates can trigger Slack-style digests | ⏳ Pending | Medium | Team notifications |
| MA112 | Workflows can split based on Memory confidence scores | ⏳ Pending | High | Confidence routing |
| MA113 | Flows can push updates directly to Timeline View | ⏳ Pending | Medium | Timeline integration |
| MA114 | Flows can insert flashcards into Study Mode automatically | ⏳ Pending | Medium | Learning integration |
| MA115 | Mere can build flow scaffolds from natural language queries | ⏳ Pending | High | AI flow generation |
| MA116 | Memory health score changes can trigger "Cleanup Suggestions" | ⏳ Pending | Medium | Health monitoring |
| MA117 | Notes that haven't been viewed in 30 days trigger archiving flow | ⏳ Pending | Medium | Auto-archiving |
| MA118 | Users can schedule weekly "Memory Sync" via Marathon | ⏳ Pending | Medium | Scheduled sync |
| MA119 | Flows can be grouped under a "Memory Campaign" | ⏳ Pending | Medium | Campaign management |
| MA120 | Dynamic Memory Templates can be modified via flow nodes | ⏳ Pending | Medium | Template automation |
| MA121 | Multi-notebook versioning updates can be consolidated via one flow | ⏳ Pending | High | Version consolidation |
| MA122 | "Autobiographical View" changes can be sent to Agent Studio | ⏳ Pending | Medium | Agent updates |
| MA123 | Flow output can tag memories with reasoning-based keywords | ⏳ Pending | Medium | AI tagging |
| MA124 | Flow nodes can access citation metadata from memory segments | ⏳ Pending | Medium | Citation tracking |
| MA125 | Flows can detect when memory has legal compliance tags | ⏳ Pending | High | Compliance detection |
| MA126 | Flows can query Ntu's full-text semantic search inside nodes | ⏳ Pending | High | Semantic search |
| MA127 | Users can trigger "Merge & Compare" as part of automated QA | ⏳ Pending | Medium | QA automation |
| MA128 | Notes from Notebook app can be routed to Memory chain via node | ⏳ Pending | Medium | App integration |
| MA129 | Marathon supports "Memory Digest Generator" as terminal node | ⏳ Pending | Medium | Digest generation |
| MA130 | Flow state is stored as a memory snapshot for auditing | ⏳ Pending | High | State persistence |

### 🔐 **B. Enterprise-Grade Features & Compliance (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA131 | Admins can restrict access to Marathon flows based on compliance level | ⏳ Pending | High | Access control |
| MA132 | Admin can limit flow triggers to specific memory types (e.g., PHI, FERPA) | ⏳ Pending | High | Type restrictions |
| MA133 | Flows editing PHI require two-step approval | ⏳ Pending | High | PHI protection |
| MA134 | Logs must show metadata classification for each node input/output | ⏳ Pending | High | Metadata logging |
| MA135 | Users can mark nodes as "data-sensitive" to restrict debug visibility | ⏳ Pending | Medium | Debug restrictions |
| MA136 | Flows can trigger based on detected HIPAA violations | ⏳ Pending | High | HIPAA monitoring |
| MA137 | Flows with export actions must log chain-of-custody by default | ⏳ Pending | High | Chain of custody |
| MA138 | Each node execution stores immutable audit hashes | ⏳ Pending | High | Audit integrity |
| MA139 | Marathon includes built-in export guardrail simulator | ⏳ Pending | Medium | Guardrail testing |
| MA140 | Flow failures trigger compliance alerts to security dashboard | ⏳ Pending | High | Security alerts |
| MA141 | Users can select encryption preferences per flow output | ⏳ Pending | Medium | Encryption options |
| MA142 | Memory access policies enforced during all Marathon flows | ⏳ Pending | High | Policy enforcement |
| MA143 | Logs support tamper detection and watermarking | ⏳ Pending | High | Tamper protection |
| MA144 | Redacted content in workflows must remain unrecoverable | ⏳ Pending | High | Redaction security |
| MA145 | Emergency shutdown disables all outbound flows | ⏳ Pending | High | Emergency control |
| MA146 | Flow schedules can be rate-limited based on region | ⏳ Pending | Medium | Rate limiting |
| MA147 | Admins can disable nodes globally (e.g., webhooks or email) | ⏳ Pending | High | Global controls |
| MA148 | Flow node history must display processor region (EU/US/etc) | ⏳ Pending | Medium | Region tracking |
| MA149 | Enterprise deployments can host Marathon in isolated VPCs | ⏳ Pending | High | VPC isolation |
| MA150 | All flows are GDPR/FERPA/SOC2 attested upon publishing | ⏳ Pending | High | Compliance attestation |

### 🤝 **C. Team Collaboration & Automation DevOps (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA151 | Flows can be versioned like Git branches (dev → staging → prod) | ⏳ Pending | High | Version control |
| MA152 | Flows support pull request-style review before publishing | ⏳ Pending | High | Review workflow |
| MA153 | Users can comment on nodes in shared flows | ⏳ Pending | Medium | Node comments |
| MA154 | Flows can be locked except for owners or admins | ⏳ Pending | Medium | Flow locking |
| MA155 | Roles: Builder, Reviewer, Publisher, Executor per flow | ⏳ Pending | High | Role management |
| MA156 | Team folders support shared templates with usage tracking | ⏳ Pending | Medium | Template sharing |
| MA157 | "Suggested Improvements" by AI appear during reviews | ⏳ Pending | Medium | AI suggestions |
| MA158 | Flow diffs can be visualized as node changes (added, removed, moved) | ⏳ Pending | Medium | Diff visualization |
| MA159 | Flows can be scheduled for deployment on specific dates | ⏳ Pending | Medium | Deployment scheduling |
| MA160 | Flows can be exported/imported from GitHub YAML | ⏳ Pending | Medium | GitHub integration |
| MA161 | Flow failures can trigger team-wide incident reports | ⏳ Pending | Medium | Incident reporting |
| MA162 | Users can create templated onboarding flows for teams | ⏳ Pending | Medium | Onboarding automation |
| MA163 | Team flows can be forked for custom department variants | ⏳ Pending | Medium | Flow forking |
| MA164 | Role-based secrets vault auto-injects creds per environment | ⏳ Pending | High | Secrets management |
| MA165 | Tagging flows by team enables better dashboard filtering | ⏳ Pending | Medium | Team filtering |
| MA166 | Flows must show who last edited and who owns | ⏳ Pending | Medium | Ownership tracking |
| MA167 | User analytics show top flow creators, errors, and runs | ⏳ Pending | Medium | User analytics |
| MA168 | Team flows can be pinned to a shared ops board | ⏳ Pending | Medium | Ops board |
| MA169 | "Promote to Global Flow" available for high-use templates | ⏳ Pending | Medium | Template promotion |
| MA170 | Flows can be scheduled in response to Ntu-wide events (e.g., system update) | ⏳ Pending | Medium | Event-driven scheduling |

### 🔌 **D. Node Ecosystem & Extensibility (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA171 | Users can create custom Marathon nodes with JS/TS SDK | ⏳ Pending | High | Custom nodes |
| MA172 | Node templates can be submitted to a Marketplace | ⏳ Pending | Medium | Node marketplace |
| MA173 | Nodes can have inline documentation + usage preview | ⏳ Pending | Medium | Node documentation |
| MA174 | Nodes can be tagged by category (data, AI, utility, team) | ⏳ Pending | Medium | Node categorization |
| MA175 | Ntu admins can review and approve community node uploads | ⏳ Pending | Medium | Node approval |
| MA176 | Node palette supports search, drag grouping, and favoriting | ⏳ Pending | Medium | Node organization |
| MA177 | Node inputs auto-detect variable types (string, object, memory) | ⏳ Pending | Medium | Type detection |
| MA178 | Nodes can be cloned across flows with deep link to origin | ⏳ Pending | Medium | Node cloning |
| MA179 | Node metadata includes latency, memory usage, and failure rate | ⏳ Pending | Medium | Node metrics |
| MA180 | Nodes can run local LLM prompts using Ntu's AI engine | ⏳ Pending | High | Local AI |
| MA181 | Custom node failures trigger local fallback paths | ⏳ Pending | Medium | Fallback handling |
| MA182 | Memory nodes can auto-suggest follow-up actions | ⏳ Pending | Medium | Action suggestions |
| MA183 | Flashcard, Timeline, Transcription, and Plugin Studio all have native node sets | ⏳ Pending | High | Native integrations |
| MA184 | "Node Forge" UI allows visual building of reusable subnodes | ⏳ Pending | Medium | Visual node building |
| MA185 | Marketplace nodes show usage stats and trust score | ⏳ Pending | Medium | Node reputation |

### 📊 **E. Observability, Monitoring & Optimization (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MA186 | Every flow shows runtime stats (avg time, success rate, runs) | ⏳ Pending | High | Runtime metrics |
| MA187 | Users can set alerts on node runtime thresholds | ⏳ Pending | Medium | Performance alerts |
| MA188 | Logs are filterable by time, trigger type, user, and memory | ⏳ Pending | Medium | Log filtering |
| MA189 | System dashboard shows global flow activity by hour/day/week | ⏳ Pending | Medium | System monitoring |
| MA190 | Node metrics show bottleneck alerts via heatmaps | ⏳ Pending | Medium | Bottleneck detection |
| MA191 | Failed executions trigger diagnostics with logs + AI suggestion | ⏳ Pending | Medium | Failure diagnostics |
| MA192 | Execution replay allows rerunning with same input | ⏳ Pending | Medium | Execution replay |
| MA193 | AI "Flow Optimizer" suggests simpler or faster paths | ⏳ Pending | High | AI optimization |
| MA194 | Top 10 nodes by usage are tracked per user/org | ⏳ Pending | Medium | Usage tracking |
| MA195 | Flow analytics page supports CSV export | ⏳ Pending | Medium | Analytics export |
| MA196 | Memory-based flows can be benchmarked on recall depth | ⏳ Pending | Medium | Memory benchmarking |
| MA197 | GraphQL API exposes full flow execution history | ⏳ Pending | Medium | API access |
| MA198 | "Flow Recovery" UI lists orphaned or zombie runs | ⏳ Pending | Medium | Recovery management |
| MA199 | Logs can be routed to external SIEM via webhook | ⏳ Pending | Medium | SIEM integration |
| MA200 | Flows can include system health checks as starting nodes | ⏳ Pending | Medium | Health monitoring |

---

## 🎙️ **Yonder - Voice Intelligence & Conversational Memory Engine (100 ACs)**

*Yonder is the Otter.ai + Clarabridge hybrid app inside Ntu, providing live transcription, speaker intelligence, sentiment analysis, and conversational memory routing.*

### 🎙️ **I. Live & Offline Transcription Engine (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| Y1 | Users can record audio live or upload pre-recorded files | ⏳ Pending | High | Core functionality |
| Y2 | Yonder must support transcription in real time with <1s delay | ⏳ Pending | High | Real-time performance |
| Y3 | Local transcription must use Whisper models | ⏳ Pending | High | Local processing |
| Y4 | Cloud-based fallback must support Mistral, Gemini, or GPT-4 for summarization | ⏳ Pending | High | Cloud fallback |
| Y5 | Supports file uploads: MP3, WAV, M4A, MP4, MOV, YouTube URLs | ⏳ Pending | Medium | File format support |
| Y6 | Transcripts must auto-save every 5 seconds | ⏳ Pending | High | Auto-save |
| Y7 | Transcription must detect and timestamp speakers (diarization) | ⏳ Pending | High | Speaker detection |
| Y8 | Users can manually merge or split speaker segments | ⏳ Pending | Medium | Manual editing |
| Y9 | Punctuation and capitalization must be corrected on-the-fly | ⏳ Pending | Medium | Text correction |
| Y10 | Audio playback must sync with transcript scroll in real time | ⏳ Pending | High | Sync playback |
| Y11 | Users can insert bookmarks during live transcription | ⏳ Pending | Medium | Bookmarking |
| Y12 | Hotkeys: Ctrl+B = bookmark, Ctrl+Enter = new section | ⏳ Pending | Medium | Keyboard shortcuts |
| Y13 | Transcripts must show speaker changes visually (colors or badges) | ⏳ Pending | Medium | Visual indicators |
| Y14 | Whisper model must run offline within 30s for 10-min file | ⏳ Pending | High | Offline performance |
| Y15 | Word-level timestamps must be available in JSON export | ⏳ Pending | Medium | Timestamp precision |
| Y16 | Yonder must support transcription confidence thresholds | ⏳ Pending | Medium | Confidence scoring |
| Y17 | Live mode supports pause/resume without starting a new session | ⏳ Pending | Medium | Session management |
| Y18 | Audio waveform must visually indicate silences or pauses | ⏳ Pending | Medium | Waveform visualization |
| Y19 | Background noise must be filtered to improve accuracy | ⏳ Pending | Medium | Noise reduction |
| Y20 | Multilingual transcription must auto-detect language or allow manual override | ⏳ Pending | Medium | Multilingual support |

### 👤 **II. Speaker Intelligence & Interaction Analytics (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| Y21 | Speakers must be assigned consistent colors/labels across sessions | ⏳ Pending | High | Speaker consistency |
| Y22 | Yonder must suggest speaker names based on past sessions | ⏳ Pending | Medium | Name suggestions |
| Y23 | User can confirm/rename speaker mid-transcription | ⏳ Pending | Medium | Speaker editing |
| Y24 | Speaker talk time is visualized per session (pie or timeline) | ⏳ Pending | Medium | Talk time analytics |
| Y25 | Interruptions and overlaps are flagged automatically | ⏳ Pending | Medium | Interaction detection |
| Y26 | Long speaker monologues (e.g., >90 seconds) are flagged | ⏳ Pending | Low | Monologue detection |
| Y27 | Cross-session speaker identification must persist (if authorized) | ⏳ Pending | Medium | Cross-session tracking |
| Y28 | Users can filter transcript by speaker | ⏳ Pending | Medium | Speaker filtering |
| Y29 | Emotional tone per speaker is recorded over time | ⏳ Pending | Medium | Emotional tracking |
| Y30 | Speaker pace (WPM) is calculated and stored | ⏳ Pending | Medium | Pace analysis |
| Y31 | Speaker sentiment must update in real-time as transcript builds | ⏳ Pending | High | Real-time sentiment |
| Y32 | Backchanneling (e.g., "mm-hmm," "right") is auto-tagged | ⏳ Pending | Low | Backchannel detection |
| Y33 | Non-verbal cues (laughter, sighs, silence) must be transcribed or flagged | ⏳ Pending | Medium | Non-verbal cues |
| Y34 | Speaker must be linked to user profile if authenticated | ⏳ Pending | Medium | Profile linking |
| Y35 | Transcript can be split by speaker and exported separately | ⏳ Pending | Medium | Speaker export |

### 💬 **III. Sentiment, Intent & Emotion Analysis (Clarabridge-style) (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| Y36 | Every paragraph must show sentiment score (-1 to 1) | ⏳ Pending | High | Sentiment scoring |
| Y37 | Intent detection supports categories: request, complaint, praise, confusion, urgency | ⏳ Pending | High | Intent classification |
| Y38 | Emotional tone must show: happy, angry, worried, confused, excited, neutral | ⏳ Pending | High | Emotion detection |
| Y39 | Urgency score must be flagged on action-oriented language | ⏳ Pending | Medium | Urgency detection |
| Y40 | Conversation friction must be visualized in heatmap mode | ⏳ Pending | Medium | Friction visualization |
| Y41 | Multiple sentiment types can coexist in the same section | ⏳ Pending | Medium | Multi-sentiment |
| Y42 | Emotion change detection must be visualized along transcript timeline | ⏳ Pending | Medium | Emotion timeline |
| Y43 | Quote-based insights must be tied to emotion scores | ⏳ Pending | Medium | Quote insights |
| Y44 | Users can override or correct emotional tags | ⏳ Pending | Medium | Manual correction |
| Y45 | Sentiment analysis can be re-run with different LLM engines | ⏳ Pending | Medium | Engine switching |
| Y46 | Emotion summaries must appear at end of session | ⏳ Pending | Medium | Session summaries |
| Y47 | Top 5 emotions are tracked per meeting and stored | ⏳ Pending | Medium | Emotion tracking |
| Y48 | Emotion spikes can trigger alert workflows in Marathon | ⏳ Pending | Medium | Marathon integration |
| Y49 | Sentiment must be aggregated by speaker and time | ⏳ Pending | Medium | Sentiment aggregation |
| Y50 | Intent-based filtering (e.g., all questions asked) is supported | ⏳ Pending | Medium | Intent filtering |
| Y51 | Emotion shifts must link to original quote + timestamp | ⏳ Pending | Medium | Emotion linking |
| Y52 | Users can define custom sentiment labels (e.g., sarcasm, passive-aggressive) | ⏳ Pending | Medium | Custom labels |
| Y53 | Emotional tags must persist across export formats | ⏳ Pending | Medium | Export persistence |
| Y54 | Clarabridge-style intent classification must run post-transcription | ⏳ Pending | High | Intent classification |
| Y55 | An "emotion density score" is calculated per meeting | ⏳ Pending | Medium | Density scoring |

### 🧠 **IV. Memory Routing & Integration into Ntu (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| Y56 | Transcript must sync into Memory app upon completion | ⏳ Pending | High | Memory integration |
| Y57 | Key quotes are extracted and injected into Notebook with speaker context | ⏳ Pending | High | Quote extraction |
| Y58 | Action items are flagged and assigned to specific users | ⏳ Pending | High | Action item detection |
| Y59 | Summary paragraph is written and stored as memory with source | ⏳ Pending | High | Summary generation |
| Y60 | Memory templates can be applied post-transcription (meeting, lecture, demo, etc.) | ⏳ Pending | Medium | Template application |
| Y61 | Auto-tagging includes speaker names, topics, and entities | ⏳ Pending | Medium | Auto-tagging |
| Y62 | Users can create flashcards from quotes in a single click | ⏳ Pending | Medium | Flashcard creation |
| Y63 | Transcripts support auto-linking to related Notebook sections | ⏳ Pending | Medium | Auto-linking |
| Y64 | Transcripts can be set to decay in memory after a threshold | ⏳ Pending | Medium | Memory decay |
| Y65 | Users can fork transcript into multiple summaries | ⏳ Pending | Medium | Transcript forking |
| Y66 | Memory replay mode includes audio + transcript scroll | ⏳ Pending | Medium | Replay mode |
| Y67 | Memory merge is supported when transcript is split into parts | ⏳ Pending | Medium | Memory merging |
| Y68 | Session outcomes are pushed to Agent Studio for training | ⏳ Pending | Medium | Agent training |
| Y69 | Transcripts can be converted into courses via Study Mode | ⏳ Pending | Medium | Course conversion |
| Y70 | Memory-level permissions persist when transcript is shared | ⏳ Pending | Medium | Permission persistence |

### 📊 **V. Visualization, UI/UX & Playback (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| Y71 | Transcript view supports split-pane mode (audio left, text right) | ⏳ Pending | High | Split-pane view |
| Y72 | Timeline slider shows emotion, sentiment, and speaker activity | ⏳ Pending | High | Timeline visualization |
| Y73 | Color-coded bars on side indicate topic or emotion spikes | ⏳ Pending | Medium | Visual indicators |
| Y74 | Playback controls include speed, jump-to-speaker, and loop | ⏳ Pending | Medium | Playback controls |
| Y75 | Transcripts support highlight + comment functionality | ⏳ Pending | Medium | Highlighting |
| Y76 | Users can search transcript by keyword or tag | ⏳ Pending | Medium | Search functionality |
| Y77 | Transcript sections can be collapsed by topic or speaker | ⏳ Pending | Medium | Section collapsing |
| Y78 | Real-time word-highlighting matches audio playback | ⏳ Pending | High | Word highlighting |
| Y79 | Users can mark sections as "important," "confusing," "actionable" | ⏳ Pending | Medium | Section marking |
| Y80 | Custom themes: dark, sepia, high contrast | ⏳ Pending | Low | Theme customization |
| Y81 | Export preview shows formatting across all styles | ⏳ Pending | Medium | Export preview |
| Y82 | Quotes can be shared via link with timestamp | ⏳ Pending | Medium | Quote sharing |
| Y83 | Timeline can show overlapping audio tracks (e.g., for panel discussions) | ⏳ Pending | Medium | Multi-track support |
| Y84 | Replay mode includes "first-person" immersion reading style | ⏳ Pending | Low | Immersion mode |
| Y85 | Notes from Notebook can be pinned alongside transcript in dual view | ⏳ Pending | Medium | Dual view |

### 🔐 **VI. Export, Sharing & Compliance (10 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| Y86 | Transcripts exportable as DOCX, TXT, PDF, CSV, JSON | ⏳ Pending | High | Export formats |
| Y87 | Audio + transcript bundled as ZIP export | ⏳ Pending | Medium | Bundle export |
| Y88 | Users can redact sections before sharing or export | ⏳ Pending | High | Redaction |
| Y89 | Shared transcript links must expire after configurable time | ⏳ Pending | Medium | Link expiration |
| Y90 | Watermarks applied to confidential exports | ⏳ Pending | Medium | Watermarking |
| Y91 | PHI/PII redaction is auto-suggested and enforced | ⏳ Pending | High | Privacy protection |
| Y92 | SOC 2, HIPAA, GDPR compliance badges appear per session | ⏳ Pending | Medium | Compliance badges |
| Y93 | Email-based transcript sharing supports permission levels | ⏳ Pending | Medium | Permission levels |
| Y94 | Transcripts stored in Zero-Knowledge Memory Zones if enabled | ⏳ Pending | High | Zero-knowledge storage |
| Y95 | Export must support inclusion/exclusion of emotions/sentiment metadata | ⏳ Pending | Medium | Metadata control |

### 🤝 **VII. Collaboration & Team Workflows (5 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| Y96 | Users can co-annotate transcripts in real time | ⏳ Pending | Medium | Real-time collaboration |
| Y97 | Comments can be resolved or threaded per timestamp | ⏳ Pending | Medium | Comment threading |
| Y98 | Transcripts can be shared directly to team memory workspaces | ⏳ Pending | Medium | Team sharing |
| Y99 | Team-level digests can auto-generate from batch transcripts | ⏳ Pending | Medium | Team digests |
| Y100 | Team agent "coach" can be trained using multiple transcripts | ⏳ Pending | Medium | Team agent training |

---

## 🧠 **Junction - Semantic Research & Note-Taking Platform (100 ACs)**

*Junction is the NotebookLM + Notion hybrid app inside Ntu, providing semantic research capabilities with powerful note-taking and collaboration features.*

### 🧠 **I. Semantic Research & AI Q&A (NotebookLM-style) (25 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| J1 | Users can upload PDFs, docs, and notes as knowledge sources | ⏳ Pending | High | Core functionality |
| J2 | Junction must support multi-file semantic Q&A across uploads | ⏳ Pending | High | Multi-source Q&A |
| J3 | Questions can be asked in natural language and return cited answers | ⏳ Pending | High | Natural language Q&A |
| J4 | Citations must deep-link to exact paragraph/line in source | ⏳ Pending | High | Precise citations |
| J5 | AI summaries must be tunable by tone, length, and focus | ⏳ Pending | Medium | Customizable summaries |
| J6 | Answers include quote, analysis, and optional critique | ⏳ Pending | Medium | Comprehensive answers |
| J7 | Junction must allow cross-source comparison in one answer | ⏳ Pending | High | Cross-source analysis |
| J8 | Users can pin important insights for permanent reference | ⏳ Pending | Medium | Insight pinning |
| J9 | Summaries can be regenerated with different LLMs (e.g., Claude, GPT-4) | ⏳ Pending | Medium | LLM switching |
| J10 | Users can ask follow-ups using context from prior responses | ⏳ Pending | High | Contextual follow-ups |
| J11 | Citation confidence must be shown as a score or indicator | ⏳ Pending | Medium | Confidence scoring |
| J12 | Highlighted questions auto-suggest follow-up topics | ⏳ Pending | Medium | Topic suggestions |
| J13 | Source view must include highlight-sync to cited answer | ⏳ Pending | Medium | Source highlighting |
| J14 | Users can tag, comment, or annotate specific answers | ⏳ Pending | Medium | Answer annotation |
| J15 | Answers can be dragged into Notebooks or Notes | ⏳ Pending | Medium | Drag integration |
| J16 | Search must span across sources, notes, and pinned answers | ⏳ Pending | High | Cross-platform search |
| J17 | Autocomplete must suggest entities from memory and uploads | ⏳ Pending | Medium | Entity suggestions |
| J18 | Q&A supports toggling between extractive and generative styles | ⏳ Pending | Medium | Style switching |
| J19 | AI can extract stats, metrics, and structured lists from documents | ⏳ Pending | Medium | Data extraction |
| J20 | Answers can be exported as flashcards or summaries | ⏳ Pending | Medium | Export formats |
| J21 | LLMs must respect memory permissions and private layers | ⏳ Pending | High | Privacy compliance |
| J22 | Junction suggests related questions when reading a document | ⏳ Pending | Medium | Question suggestions |
| J23 | AI-generated Q&A can be "forked" into user commentary | ⏳ Pending | Medium | Q&A forking |
| J24 | Each response shows what sources were not used (transparency) | ⏳ Pending | Medium | Source transparency |
| J25 | AI audit trail includes prompts, model, and retrieval metadata | ⏳ Pending | High | Audit trail |

### 📒 **II. Note-Taking, Structure & Blocks (Notion-style) (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| J26 | Pages must support nested blocks (text, image, list, table, code) | ⏳ Pending | High | Block system |
| J27 | Drag-and-drop reordering of blocks is supported | ⏳ Pending | High | Block reordering |
| J28 | Pages live within a sidebar structure (workspace > section > page) | ⏳ Pending | High | Hierarchical structure |
| J29 | Keyboard slash command (/) opens a block-type menu | ⏳ Pending | Medium | Slash commands |
| J30 | Inline tables and kanban boards can be inserted per block | ⏳ Pending | Medium | Rich blocks |
| J31 | Headings, callouts, quotes, dividers, and toggles are supported | ⏳ Pending | Medium | Block types |
| J32 | Blocks support text formatting (bold, italic, strikethrough, inline code) | ⏳ Pending | Medium | Text formatting |
| J33 | AI-generated blocks (e.g., summary or outline) must be distinguishable | ⏳ Pending | Medium | AI block identification |
| J34 | Users can comment on any block | ⏳ Pending | Medium | Block comments |
| J35 | Block-level version history is supported | ⏳ Pending | Medium | Version history |
| J36 | AI can transform selected block (summarize, rewrite, explain) | ⏳ Pending | Medium | Block transformation |
| J37 | Pages can include linked database views from other sections | ⏳ Pending | Medium | Database linking |
| J38 | Users can collapse entire sections with one click | ⏳ Pending | Medium | Section collapsing |
| J39 | Page templates are supported per workspace or project | ⏳ Pending | Medium | Page templates |
| J40 | Dragging content into page auto-converts to editable blocks | ⏳ Pending | Medium | Auto-conversion |
| J41 | Markdown import/export must preserve hierarchy | ⏳ Pending | Medium | Markdown support |
| J42 | Real-time collaboration with cursors is supported | ⏳ Pending | High | Real-time collaboration |
| J43 | Users can convert blocks into reusable components (snippets) | ⏳ Pending | Medium | Reusable components |
| J44 | Daily notes and journal templates are auto-generated if enabled | ⏳ Pending | Medium | Auto-templates |
| J45 | Notes can be tagged and filtered by any metadata field | ⏳ Pending | Medium | Metadata filtering |

### 🔗 **III. Memory Sync & Semantic Linking (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| J46 | Any Junction page can be injected as a Memory object | ⏳ Pending | High | Memory injection |
| J47 | Memory events (e.g., meetings, digests) can be linked into pages | ⏳ Pending | Medium | Memory linking |
| J48 | Pages show backlinks to other memory elements | ⏳ Pending | Medium | Backlink display |
| J49 | Highlighting content triggers "link to memory" suggestion | ⏳ Pending | Medium | Link suggestions |
| J50 | Junction must visualize bi-directional links (graph, tree, or mini-map) | ⏳ Pending | Medium | Link visualization |
| J51 | Semantic tag suggestions appear during writing or editing | ⏳ Pending | Medium | Tag suggestions |
| J52 | Memory citations must persist even if page is cloned | ⏳ Pending | Medium | Citation persistence |
| J53 | Pages can be set to decay, fork, or archive as memory flows | ⏳ Pending | Medium | Memory flows |
| J54 | Notebook pages must be recallable from Mere via prompt | ⏳ Pending | Medium | Mere integration |
| J55 | "Mention memory" brings up search popup with preview | ⏳ Pending | Medium | Memory mentions |
| J56 | Memory connections show as in-page chips or expandable sections | ⏳ Pending | Medium | Connection display |
| J57 | Pages sync across all notebooks in which they are referenced | ⏳ Pending | High | Cross-notebook sync |
| J58 | Junction must support multi-notebook merge views | ⏳ Pending | Medium | Merge views |
| J59 | AI can recommend what notebook a note belongs in | ⏳ Pending | Medium | Notebook recommendations |
| J60 | Journal entries auto-link to memory if names or places are recognized | ⏳ Pending | Medium | Auto-linking |

### 🤖 **IV. AI Assistance & Smart Editing (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| J61 | Junction must support AI co-writing: continue writing, rewrite, outline | ⏳ Pending | High | AI co-writing |
| J62 | AI must recommend tags and headings based on content | ⏳ Pending | Medium | Content recommendations |
| J63 | Notes can be turned into flashcards, quizzes, or summaries | ⏳ Pending | Medium | Content transformation |
| J64 | AI can answer questions about current document's content | ⏳ Pending | High | Document Q&A |
| J65 | AI "Critique Mode" provides feedback on clarity, tone, and logic | ⏳ Pending | Medium | AI critique |
| J66 | "Explain like I'm 5" must simplify selected text | ⏳ Pending | Medium | Text simplification |
| J67 | "Find contradictory statements" triggers AI logic scan | ⏳ Pending | Medium | Contradiction detection |
| J68 | Mere can summarize entire page or block in sidebar | ⏳ Pending | Medium | Mere summarization |
| J69 | Text can be "translated" between formal/informal modes | ⏳ Pending | Medium | Style translation |
| J70 | Highlighted quotes trigger source comparison ("Who else said this?") | ⏳ Pending | Medium | Quote comparison |
| J71 | AI can autogenerate note titles from structure | ⏳ Pending | Medium | Title generation |
| J72 | Mere recommends new notes to create based on gaps | ⏳ Pending | Medium | Gap recommendations |
| J73 | Pages can be auto-structured with table of contents | ⏳ Pending | Medium | Auto-structuring |
| J74 | AI-generated diagrams (e.g., Mermaid.js) can be injected into notes | ⏳ Pending | Medium | Diagram generation |
| J75 | Junction must detect copied AI-generated content and flag it for review | ⏳ Pending | Medium | AI content detection |

### 🤝 **V. Collaboration, Templates, & Workflow (10 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| J76 | Users can share pages, sections, or full notebooks with roles (view, comment, edit) | ⏳ Pending | High | Role-based sharing |
| J77 | Comments can be resolved, replied to, or assigned | ⏳ Pending | Medium | Comment management |
| J78 | Shared notebooks show team cursors in real time | ⏳ Pending | High | Team cursors |
| J79 | Team templates can be created for project kickoffs, briefs, research | ⏳ Pending | Medium | Team templates |
| J80 | Pages can include checklists with assignees + due dates | ⏳ Pending | Medium | Task management |
| J81 | Notes support reactions, mentions, and activity feed | ⏳ Pending | Medium | Social features |
| J82 | Notebook activity log shows edits, tags, and merges | ⏳ Pending | Medium | Activity logging |
| J83 | Team home view shows "most active" and "recently updated" | ⏳ Pending | Medium | Team dashboard |
| J84 | Note review flow supports "approved," "needs revision," "archived" | ⏳ Pending | Medium | Review workflow |
| J85 | Collaborators can fork notes and submit versions for merge | ⏳ Pending | Medium | Note forking |

### 📤 **VI. Export, Publishing, & Interop (10 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| J86 | Pages export to DOCX, PDF, Markdown, JSON | ⏳ Pending | High | Export formats |
| J87 | Public links must allow view/comment/download modes | ⏳ Pending | Medium | Public sharing |
| J88 | Notebook or page can be published as an HTML microsite | ⏳ Pending | Medium | Web publishing |
| J89 | Exported content preserves block structure + embedded AI tags | ⏳ Pending | Medium | Structure preservation |
| J90 | Export history is available per page | ⏳ Pending | Medium | Export history |
| J91 | Notes can be sent to CRM, CMS, or Google Docs | ⏳ Pending | Medium | External integration |
| J92 | Export summary includes linked memory references | ⏳ Pending | Medium | Memory export |
| J93 | Permalinks are version-stable and backward-compatible | ⏳ Pending | Medium | Stable links |
| J94 | Export metadata includes who edited, when, and length | ⏳ Pending | Medium | Export metadata |
| J95 | Embed codes allow display of pages on external sites | ⏳ Pending | Medium | Embedding |

### 🔒 **VII. Privacy, Roles, and Security (5 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| J96 | Pages can be marked private, team, or public | ⏳ Pending | High | Privacy levels |
| J97 | Junction must honor memory zone compliance (Zero Knowledge, PHI/FERPA) | ⏳ Pending | High | Compliance |
| J98 | All AI actions must log what LLMs and sources were used | ⏳ Pending | High | AI logging |
| J99 | Pages with redacted content must watermark that status | ⏳ Pending | Medium | Redaction marking |
| J100 | Activity from Junction must be logged in Ntu's audit engine | ⏳ Pending | High | Audit logging |

---

## 🤖 **Mere - AI Assistant & Intelligence Hub (300 ACs)**

*Mere is the central AI assistant in Ntu, providing intelligent conversation, web browsing, travel planning, academic research, and agent orchestration across the entire platform.*

### 🖥️ **I. Global Layout & Invocation (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M1 | Mere is full-screen center on the Ntu home screen | ⏳ Pending | High | Core layout |
| M2 | Sidebar always shows "Apps" at top and "Sessions" below | ⏳ Pending | High | Sidebar structure |
| M3 | Command + M must launch Mere from anywhere | ⏳ Pending | High | Global shortcut |
| M4 | Mere floating icon appears in the bottom-right of all non-home views | ⏳ Pending | High | Floating access |
| M5 | Clicking floating Mere opens chatbot drawer view, not a new screen | ⏳ Pending | High | Drawer behavior |
| M6 | The home screen remains clean — no recents, no app logs | ⏳ Pending | Medium | Clean interface |
| M7 | Sidebar collapses/expands independently of Mere interface | ⏳ Pending | Medium | Independent sidebar |
| M8 | If no session is open, a new Mere session starts | ⏳ Pending | High | Session management |
| M9 | Each chat with Mere is logged in its own session thread | ⏳ Pending | High | Session threading |
| M10 | Sessions list persists in sidebar only, not overlaid in UI | ⏳ Pending | Medium | Session display |
| M11 | Switching apps doesn't close floating Mere unless toggled off | ⏳ Pending | Medium | App persistence |
| M12 | Input box is centered and sticky, like ChatGPT | ⏳ Pending | High | Input design |
| M13 | First-time user sees a greeting and 3 sample prompts | ⏳ Pending | Medium | Onboarding |
| M14 | Mere home session resets only when user manually starts new | ⏳ Pending | Medium | Session reset |
| M15 | Floating icon reappears after dismissal if enabled in preferences | ⏳ Pending | Medium | Icon persistence |

### 💬 **II. Chat Behavior & Sessions (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M16 | Mere sessions are independent of app context | ⏳ Pending | High | Session isolation |
| M17 | Chat history must persist for all previous sessions | ⏳ Pending | High | History persistence |
| M18 | Each session shows timestamp and token count | ⏳ Pending | Medium | Session metadata |
| M19 | User can rename, duplicate, delete sessions | ⏳ Pending | Medium | Session management |
| M20 | Chat input supports multiline (Shift+Enter) | ⏳ Pending | Medium | Input features |
| M21 | Message bubbles support markdown, links, and images | ⏳ Pending | Medium | Message formatting |
| M22 | Typing indicator shows animated dots | ⏳ Pending | Medium | Visual feedback |
| M23 | Mere responds in <2 seconds for most prompts | ⏳ Pending | High | Response speed |
| M24 | Each message shows model badge (e.g., GPT-4, Claude) | ⏳ Pending | Medium | Model identification |
| M25 | Replies are collapsible for long answers | ⏳ Pending | Medium | Content organization |
| M26 | Pinning a reply adds it to session summary | ⏳ Pending | Medium | Content pinning |
| M27 | Mere's tone and verbosity can be set per session | ⏳ Pending | Medium | Tone control |
| M28 | Sessions are filterable by date, model, or pinned content | ⏳ Pending | Medium | Session filtering |
| M29 | Toggle exists to enable or disable memory binding for chat | ⏳ Pending | High | Memory toggle |
| M30 | Input can be auto-cleared after sending if enabled | ⏳ Pending | Low | Input behavior |
| M31 | Sessions are ordered by last modified | ⏳ Pending | Medium | Session ordering |
| M32 | System messages show when app suggestions are made | ⏳ Pending | Medium | System feedback |
| M33 | Scroll-to-latest always enabled unless user is reviewing older messages | ⏳ Pending | Medium | Scroll behavior |
| M34 | Shortcut ⌘+↑ jumps to session top | ⏳ Pending | Medium | Navigation shortcuts |
| M35 | Audio reply playback is supported if enabled by plugin | ⏳ Pending | Medium | Audio support |

### 🧠 **III. Context Awareness & Memory Logic (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M36 | Mere is aware of all memory, plugins, and active agents | ⏳ Pending | High | Context awareness |
| M37 | Mere must not assume app state unless memory context is toggled on | ⏳ Pending | High | Memory context |
| M38 | When memory context is enabled, Mere references current app session | ⏳ Pending | High | App referencing |
| M39 | User can toggle memory context from session header | ⏳ Pending | Medium | Context toggle |
| M40 | When summarizing notes, Mere must cite exact notebook and section | ⏳ Pending | High | Precise citations |
| M41 | Memory-linked queries store retrieval metadata with response | ⏳ Pending | High | Metadata storage |
| M42 | "Suggest actions" only appears if memory-aware toggle is on | ⏳ Pending | Medium | Action suggestions |
| M43 | Redacted or Zero-Knowledge data is never included in responses | ⏳ Pending | High | Privacy protection |
| M44 | If memory is stale, Mere alerts the user to refresh or update | ⏳ Pending | Medium | Stale data handling |
| M45 | Mere's memory knowledge is scoped to user permission level | ⏳ Pending | High | Permission scoping |
| M46 | If memory connection fails, Mere falls back to stateless mode | ⏳ Pending | High | Fallback behavior |
| M47 | Suggestions for workflows, plugins, or agents must reference current memory state | ⏳ Pending | Medium | State-aware suggestions |
| M48 | Search queries can retrieve past memories if enabled | ⏳ Pending | Medium | Memory search |
| M49 | Memory citation format must be clickable and time-stamped | ⏳ Pending | Medium | Citation format |
| M50 | Users can turn off all memory-related suggestions from settings | ⏳ Pending | Medium | Suggestion control |

### 🤖 **IV. App Interaction & Permissions (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M51 | When Mere suggests an app action, user is prompted with: "Always do this", "Only for this session", "Never" | ⏳ Pending | High | Permission prompts |
| M52 | Once a preference is set, it applies automatically unless changed | ⏳ Pending | High | Preference persistence |
| M53 | Mere cannot move user into another app without consent | ⏳ Pending | High | Navigation consent |
| M54 | Mere cannot change UI or app view silently | ⏳ Pending | High | UI transparency |
| M55 | If user asks "make flashcard," Mere logs in Junction without switching view | ⏳ Pending | Medium | Background actions |
| M56 | All inter-app actions show confirmation tooltip or modal | ⏳ Pending | Medium | Action confirmation |
| M57 | User can disable app-control permissions completely | ⏳ Pending | High | Permission control |
| M58 | If denied, Mere must offer alternative (e.g., "Here's how to do it manually.") | ⏳ Pending | Medium | Alternative suggestions |
| M59 | App-suggesting behavior is stored per session | ⏳ Pending | Medium | Behavior storage |
| M60 | Mere learns preferred apps per type of query over time | ⏳ Pending | Medium | Learning behavior |
| M61 | When invoking agents, Mere explains what agent will do | ⏳ Pending | Medium | Agent explanation |
| M62 | When suggesting plugin use, Mere shows preview of plugin output | ⏳ Pending | Medium | Plugin preview |
| M63 | User can "Ask Mere to handle this" from any app context | ⏳ Pending | High | Contextual assistance |
| M64 | If app navigation is blocked, error message must be descriptive | ⏳ Pending | Medium | Error messaging |
| M65 | Mere can only auto-invoke agents if permission is toggled on | ⏳ Pending | High | Agent permissions |
| M66 | App launches from Mere do not disrupt unsaved work | ⏳ Pending | High | Work preservation |
| M67 | Suggestions involving data mutation must be tagged as "destructive" | ⏳ Pending | Medium | Mutation warnings |
| M68 | Mere respects app rate limits and data caps when working across Ntu | ⏳ Pending | High | Rate limiting |
| M69 | Session transcript shows when app context was used | ⏳ Pending | Medium | Context logging |
| M70 | App permissions can be edited from Mere's settings | ⏳ Pending | Medium | Settings access |

### 🎨 **V. UI/UX & Interaction (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M71 | Mere home must be minimal, 1-column, centered layout | ⏳ Pending | High | Layout design |
| M72 | Font sizes, spacing, and line height match ChatGPT or Claude | ⏳ Pending | Medium | Typography |
| M73 | Avatar icon must pulse subtly when thinking | ⏳ Pending | Medium | Visual feedback |
| M74 | Input bar expands on typing | ⏳ Pending | Medium | Input behavior |
| M75 | Scroll is smooth and anchored to latest | ⏳ Pending | Medium | Scroll behavior |
| M76 | Floating chatbot has resize handle (minimize, mid-size, full) | ⏳ Pending | Medium | Resize controls |
| M77 | Floating Mere can be pinned open across apps | ⏳ Pending | Medium | Pin functionality |
| M78 | Dark mode toggle appears in settings drawer | ⏳ Pending | Medium | Theme support |
| M79 | Messages fade in with animation | ⏳ Pending | Low | Animation |
| M80 | UI must support switch between keyboard-only and mouse-only input | ⏳ Pending | Medium | Accessibility |
| M81 | Transcripts auto-save on prompt completion | ⏳ Pending | High | Auto-save |
| M82 | Clipboard copy icon appears on hover of any block | ⏳ Pending | Medium | Copy functionality |
| M83 | "Explain this" button appears on selected input snippets | ⏳ Pending | Medium | Context help |
| M84 | Users can upload files directly to Mere in chat | ⏳ Pending | Medium | File upload |
| M85 | Message bubbles must collapse nested threads if enabled | ⏳ Pending | Medium | Thread collapsing |

### 📥 **VI. Import, Export, and Session Management (10 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M86 | Entire Mere sessions can be exported as Markdown, PDF, or JSON | ⏳ Pending | High | Export formats |
| M87 | Imported sessions retain timestamp and model metadata | ⏳ Pending | Medium | Import preservation |
| M88 | Users can duplicate sessions and branch them | ⏳ Pending | Medium | Session branching |
| M89 | Auto-summary appears in sidebar after 10+ messages | ⏳ Pending | Medium | Auto-summary |
| M90 | Session summaries are editable and taggable | ⏳ Pending | Medium | Summary editing |
| M91 | "Create flashcard from this" appears in contextual menu | ⏳ Pending | Medium | Content creation |
| M92 | "Create task," "Add to notebook," and "Add to Junction" options supported | ⏳ Pending | Medium | Integration options |
| M93 | Sessions can be bookmarked with one-click | ⏳ Pending | Medium | Bookmarking |
| M94 | "Clear chat" wipes session but not memory-linked data | ⏳ Pending | Medium | Session clearing |
| M95 | Deleting session requires confirmation modal | ⏳ Pending | Medium | Deletion confirmation |

### 🔒 **VII. Privacy, Safety, and Compliance (5 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M96 | Sessions must respect Zero-Knowledge Zones (no export, no cloud) | ⏳ Pending | High | Zero-knowledge |
| M97 | All prompts and replies are logged locally unless configured otherwise | ⏳ Pending | High | Local logging |
| M98 | Session metadata is encrypted at rest | ⏳ Pending | High | Encryption |
| M99 | Mere cannot store or summarize PHI without permission flag | ⏳ Pending | High | PHI protection |
| M100 | Privacy disclaimers must appear when memory-linked answers are shown | ⏳ Pending | Medium | Privacy notices |

### 🌐 **VIII. Intelligent Web Browsing (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M101 | Mere can browse the web when user prompts explicitly allow it | ⏳ Pending | High | Web browsing |
| M102 | Web browsing must be opt-in per prompt or session | ⏳ Pending | High | Opt-in browsing |
| M103 | When enabled, Mere fetches live web content using headless browsing or API-based engines | ⏳ Pending | High | Content fetching |
| M104 | Search results appear with title, snippet, and source URL | ⏳ Pending | Medium | Search results |
| M105 | Mere must only follow links from known/reputable domains (or user-defined whitelist) | ⏳ Pending | High | Link safety |
| M106 | Hovering over a result shows full page preview before clicking | ⏳ Pending | Medium | Preview functionality |
| M107 | User can ask Mere to summarize a webpage | ⏳ Pending | Medium | Web summarization |
| M108 | User can paste a URL and ask Mere to "analyze," "extract quotes," or "compare" | ⏳ Pending | Medium | URL analysis |
| M109 | Mere returns links with time-stamped crawl metadata | ⏳ Pending | Medium | Crawl metadata |
| M110 | User can block Mere from browsing again mid-session | ⏳ Pending | Medium | Browsing control |
| M111 | Mere browsing must respect robots.txt and site policy headers | ⏳ Pending | High | Site compliance |
| M112 | Page summaries include structure: title, key points, source | ⏳ Pending | Medium | Summary structure |
| M113 | Mere must use internal cache to avoid re-fetching same content | ⏳ Pending | Medium | Content caching |
| M114 | Users can ask Mere to compare current content with older crawls | ⏳ Pending | Medium | Content comparison |
| M115 | All outputs from browsing must display "fetched from web" disclaimer | ⏳ Pending | Medium | Source disclaimers |

### 📽️ **IX. YouTube Video Retrieval & Summary (10 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M116 | Mere accepts YouTube URLs directly | ⏳ Pending | High | YouTube integration |
| M117 | When a YouTube link is shared, Mere can summarize audio or transcript | ⏳ Pending | High | Video summarization |
| M118 | User can specify: "summarize," "transcribe," or "list key points" | ⏳ Pending | Medium | Summary options |
| M119 | Video summaries must include title, channel, duration, and upload date | ⏳ Pending | Medium | Video metadata |
| M120 | Mere can extract segments (e.g., "what was said at 4:00?") | ⏳ Pending | Medium | Segment extraction |
| M121 | Video outputs must link directly to YouTube timestamps | ⏳ Pending | Medium | Timestamp linking |
| M122 | If video has chapters, Mere recognizes and uses them in summary | ⏳ Pending | Medium | Chapter recognition |
| M123 | Users can ask Mere to compare two videos on same topic | ⏳ Pending | Medium | Video comparison |
| M124 | Audio quotes can be extracted and presented as quote cards | ⏳ Pending | Medium | Quote extraction |
| M125 | Mere caches summaries of previously processed YouTube links | ⏳ Pending | Medium | Summary caching |

### 📍 **X. Restaurant & Location Search (10 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M126 | User can say: "Find top Jamaican restaurants near me" or specify a city | ⏳ Pending | High | Location search |
| M127 | Mere returns results with name, address, rating, and # of reviews | ⏳ Pending | Medium | Search results |
| M128 | Each restaurant entry links to full Google Maps or Yelp profile | ⏳ Pending | Medium | Profile linking |
| M129 | User can filter by rating, distance, cuisine, or price | ⏳ Pending | Medium | Search filtering |
| M130 | Search results include opening hours and phone numbers | ⏳ Pending | Medium | Business info |
| M131 | Mere can summarize reviews (positive vs negative themes) | ⏳ Pending | Medium | Review summarization |
| M132 | Suggestions include real-time info when supported by map API | ⏳ Pending | Medium | Real-time data |
| M133 | User can add a restaurant as a bookmark to memory | ⏳ Pending | Medium | Memory bookmarking |
| M134 | Restaurant listings can be exported into a shareable list | ⏳ Pending | Medium | List export |
| M135 | If allowed, Mere uses browser location to refine search | ⏳ Pending | Medium | Location refinement |

### 📄 **XI. Downloadable Document Creation (5 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M136 | Mere can generate downloadable DOCX, PDF, or Markdown from any reply | ⏳ Pending | High | Document generation |
| M137 | "Export to document" option appears in contextual menu per message | ⏳ Pending | Medium | Export menu |
| M138 | Users can title the export and select format inline | ⏳ Pending | Medium | Export customization |
| M139 | Generated documents include date, source context (e.g., web, YouTube, memory) | ⏳ Pending | Medium | Document metadata |
| M140 | Download prompt must support save-to-disk or push-to-cloud | ⏳ Pending | Medium | Download options |

### ✈️ **XII. Travel Planning & Itinerary Search (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M141 | Mere accepts prompts like "Find flights from Nashville to Guayaquil next Saturday" | ⏳ Pending | High | Flight search |
| M142 | Results must include airline, departure/arrival time, layovers, price | ⏳ Pending | High | Flight details |
| M143 | Users can filter flights by airline, duration, stops, and time | ⏳ Pending | Medium | Flight filtering |
| M144 | If using APIs (e.g., Skyscanner, Rome2Rio), Mere must cite them | ⏳ Pending | Medium | API citation |
| M145 | User can ask for hotel options near a location and receive amenities, price, rating | ⏳ Pending | Medium | Hotel search |
| M146 | Mere supports itinerary creation from chat queries ("Plan 3 days in Tulum") | ⏳ Pending | High | Itinerary creation |
| M147 | Itinerary outputs include timestamps, location links, and activity tags | ⏳ Pending | Medium | Itinerary details |
| M148 | Mere can book placeholders into calendar if calendar sync is enabled | ⏳ Pending | Medium | Calendar integration |
| M149 | Travel responses offer downloadable PDF/ICS export | ⏳ Pending | Medium | Travel export |
| M150 | Airport suggestions include weather, TSA wait times, and map link | ⏳ Pending | Medium | Airport info |
| M151 | Mere must default to showing economy unless user prefers otherwise | ⏳ Pending | Medium | Default preferences |
| M152 | Flight comparisons highlight time vs cost tradeoffs | ⏳ Pending | Medium | Flight comparison |
| M153 | User can say "optimize for shortest layover" or "cheapest route" | ⏳ Pending | Medium | Optimization options |
| M154 | Mere offers language/currency tips when travel is international | ⏳ Pending | Medium | Travel tips |
| M155 | User can ask for "day trips from [city]" and receive real-time options | ⏳ Pending | Medium | Day trip planning |
| M156 | Transportation alternatives like Uber, public transit must show estimated fare | ⏳ Pending | Medium | Transportation options |
| M157 | When relevant, Mere displays COVID or visa/travel restrictions | ⏳ Pending | Medium | Travel restrictions |
| M158 | Users can pin trip plans into Memory | ⏳ Pending | Medium | Trip memory |
| M159 | All travel plans must include current time zone label | ⏳ Pending | Medium | Time zone info |
| M160 | Mere avoids suggesting expired or past travel listings | ⏳ Pending | Medium | Data freshness |

### 🍽️ **XIII. Menu Retrieval, Nutrition Data & Dietary Filters (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M161 | User can ask "show me the menu for [restaurant]" — Mere pulls current menu if available | ⏳ Pending | High | Menu retrieval |
| M162 | If menu is a PDF or image, Mere extracts text for readability | ⏳ Pending | Medium | Menu extraction |
| M163 | Nutrition data is parsed into calories, protein, fat, carbs, sodium | ⏳ Pending | High | Nutrition parsing |
| M164 | Mere must ask if user has any dietary restrictions when planning meals | ⏳ Pending | Medium | Dietary awareness |
| M165 | Users can filter by vegetarian, vegan, gluten-free, keto, halal, kosher, etc. | ⏳ Pending | Medium | Dietary filtering |
| M166 | Mere can build daily or weekly meal plans based on nutrition goals | ⏳ Pending | Medium | Meal planning |
| M167 | "Estimate calories in this dish" must use database approximation + disclaimer | ⏳ Pending | Medium | Calorie estimation |
| M168 | Users can ask "Is this healthy?" and get macro breakdown + AI opinion | ⏳ Pending | Medium | Health analysis |
| M169 | Recipes and menus can be exported as formatted grocery lists | ⏳ Pending | Medium | Grocery export |
| M170 | Restaurant menus must show allergen warnings if provided | ⏳ Pending | Medium | Allergen warnings |
| M171 | Mere can identify common allergens in meal names (e.g., shellfish, dairy) | ⏳ Pending | Medium | Allergen detection |
| M172 | Chain restaurant nutrition info must link to official brand PDF or database | ⏳ Pending | Medium | Official data |
| M173 | Homemade recipe inputs can be analyzed via ingredient parsing | ⏳ Pending | Medium | Recipe analysis |
| M174 | Menu summaries include average cost and item type distribution | ⏳ Pending | Medium | Menu analysis |
| M175 | Custom dietary templates (e.g., "Low FODMAP") can be saved per user | ⏳ Pending | Medium | Custom templates |
| M176 | "Suggest me a lunch under 700 calories" must show meals from nearby places | ⏳ Pending | Medium | Calorie-based suggestions |
| M177 | Ingredients pulled must be structured with quantities | ⏳ Pending | Medium | Ingredient structure |
| M178 | Meal recommendations include prep time and cook time if recipe-based | ⏳ Pending | Medium | Time information |
| M179 | Nutrient summaries can be pushed into Memory or Junction | ⏳ Pending | Medium | Memory integration |
| M180 | All nutritional replies must include source links or label "estimated" | ⏳ Pending | Medium | Source attribution |

### 🎓 **XIV. Academic Search & Citation Builder (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M181 | Mere can be prompted with "Find peer-reviewed articles on [topic]" | ⏳ Pending | High | Academic search |
| M182 | Academic sources include arXiv, PubMed, Semantic Scholar, JSTOR (if licensed) | ⏳ Pending | High | Source databases |
| M183 | Mere must show article title, authors, year, abstract, link | ⏳ Pending | Medium | Article metadata |
| M184 | Citations can be generated in APA, MLA, Chicago, or Harvard formats | ⏳ Pending | High | Citation formats |
| M185 | "Summarize this paper" works when URL or PDF is provided | ⏳ Pending | Medium | Paper summarization |
| M186 | Users can drag citations into Junction notebook blocks | ⏳ Pending | Medium | Citation integration |
| M187 | Mere warns if citation is outdated (>10 years) unless user allows it | ⏳ Pending | Medium | Outdated warnings |
| M188 | For books, Mere can query Open Library, Google Books, or WorldCat | ⏳ Pending | Medium | Book search |
| M189 | Citation cards include DOI, publisher, and page numbers when available | ⏳ Pending | Medium | Citation details |
| M190 | Academic summaries must differentiate between hypothesis, method, findings | ⏳ Pending | Medium | Summary structure |
| M191 | If AI cannot access full text, it notes that abstract was used | ⏳ Pending | Medium | Access transparency |
| M192 | "Compare these two papers" prompts Mere to show table of differences | ⏳ Pending | Medium | Paper comparison |
| M193 | Bibliographies are exportable as .bib, .txt, or .docx | ⏳ Pending | Medium | Bibliography export |
| M194 | Users can build a "research folder" in Memory from queries | ⏳ Pending | Medium | Research organization |
| M195 | "Explain this paper to a 10-year-old" must simplify but preserve logic | ⏳ Pending | Medium | Simplified explanation |
| M196 | "Extract quotes" gives verbatim excerpts with line references | ⏳ Pending | Medium | Quote extraction |
| M197 | Mere warns if paper is retracted or flagged for misconduct | ⏳ Pending | Medium | Paper warnings |
| M198 | PDF uploads from user trigger auto-scan and citation extraction | ⏳ Pending | Medium | PDF processing |
| M199 | Summaries of academic works include reading level estimate | ⏳ Pending | Medium | Reading level |
| M200 | Chat replies that include research must show citation metadata in footer | ⏳ Pending | Medium | Citation display |

### 🧠 **XV. Memory-Aware Planning & Execution (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M201 | User can ask Mere to build a plan using previous memories | ⏳ Pending | High | Memory-based planning |
| M202 | "Create a 30-day study plan for Python" adds memory-linked checkpoints in Study Mode | ⏳ Pending | High | Study planning |
| M203 | Mere can add timeline markers to Memory directly from a chat | ⏳ Pending | Medium | Timeline integration |
| M204 | Plans auto-sync with Marathon for task automation | ⏳ Pending | High | Marathon integration |
| M205 | Memory-aware goals include progress tracking and nudges | ⏳ Pending | Medium | Goal tracking |
| M206 | Daily check-ins are triggered via summary sessions | ⏳ Pending | Medium | Check-ins |
| M207 | Planning templates are selectable (learning, health, project) | ⏳ Pending | Medium | Planning templates |
| M208 | Mere can estimate task duration and suggest schedule | ⏳ Pending | Medium | Duration estimation |
| M209 | Plan revisions can be requested with a single message | ⏳ Pending | Medium | Plan revision |
| M210 | Users can ask for "smart recovery" if they fall behind | ⏳ Pending | Medium | Recovery planning |
| M211 | Each plan step is linked to content across Ntu (Notebook, Voice, Junction) | ⏳ Pending | High | Cross-app linking |
| M212 | Memory health scores affect suggested task intensity | ⏳ Pending | Medium | Health-based planning |
| M213 | Mere suggests review or spaced repetition intervals | ⏳ Pending | Medium | Review scheduling |
| M214 | Plans can be exported to DOCX, Markdown, or Calendar | ⏳ Pending | Medium | Plan export |
| M215 | Mere notifies if a task depends on missing data | ⏳ Pending | Medium | Dependency checking |
| M216 | Projects can include collaborative checkpoints across users | ⏳ Pending | Medium | Collaboration |
| M217 | "Plan a 7-day product launch" builds tasks + insights via plugins | ⏳ Pending | Medium | Plugin integration |
| M218 | Mere tags emotional state (overwhelmed, energized) and adjusts intensity | ⏳ Pending | Medium | Emotional awareness |
| M219 | Mere auto-saves plan drafts with rollback control | ⏳ Pending | Medium | Draft management |
| M220 | Mere confirms scope and goal before building long-term plans | ⏳ Pending | Medium | Scope confirmation |

### ⚙️ **XVI. Agent Orchestration & Coordination (20 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M221 | Mere can activate one or more agents based on intent | ⏳ Pending | High | Agent activation |
| M222 | "Compare these files, then clean up notes" triggers Analysis + Summary agents | ⏳ Pending | High | Multi-agent workflows |
| M223 | Agents report status back to Mere after completion | ⏳ Pending | High | Status reporting |
| M224 | User can view live agent timeline or cancel actions | ⏳ Pending | Medium | Agent monitoring |
| M225 | Agent failure or conflict is summarized by Mere | ⏳ Pending | Medium | Failure handling |
| M226 | Mere can serialize agents (wait for one to finish before next) | ⏳ Pending | Medium | Agent serialization |
| M227 | Parallel agent chains are allowed, scoped by memory or app | ⏳ Pending | Medium | Parallel execution |
| M228 | Users can view "agent flowmap" from Mere settings | ⏳ Pending | Medium | Flow visualization |
| M229 | Outputs are routed to Junction, Notebook, or Plugin Studio by default rules | ⏳ Pending | Medium | Output routing |
| M230 | Mere warns when agent request will mutate memory | ⏳ Pending | Medium | Mutation warnings |
| M231 | Mere can retry or escalate failed agents | ⏳ Pending | Medium | Agent recovery |
| M232 | Agents respond using Mere's persona (tone, context) | ⏳ Pending | Medium | Persona consistency |
| M233 | All agents log a traceable metadata stream | ⏳ Pending | High | Agent logging |
| M234 | Agent-based actions show contextual AI confidence level | ⏳ Pending | Medium | Confidence display |
| M235 | User can mark agent results as satisfactory or rejected | ⏳ Pending | Medium | Result feedback |
| M236 | Mere suggests agents based on pattern history | ⏳ Pending | Medium | Agent suggestions |
| M237 | Agents obey RBAC and plugin trust layers | ⏳ Pending | High | Security compliance |
| M238 | Mere may defer to an agent and hide details unless user toggles "show steps" | ⏳ Pending | Medium | Detail control |
| M239 | Agent stacks can be templated and reused | ⏳ Pending | Medium | Agent templates |
| M240 | Mere can simulate an agent chain before execution ("Show me what will happen") | ⏳ Pending | Medium | Agent simulation |

### 🎭 **XVII. Persona & Mode Customization (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M241 | Mere supports predefined personas: Analyst, Coach, Tutor, Consultant, Therapist | ⏳ Pending | High | Predefined personas |
| M242 | Custom personas can be defined with tone, formality, response style | ⏳ Pending | Medium | Custom personas |
| M243 | Persona setting can be changed per session | ⏳ Pending | Medium | Session personas |
| M244 | Voice tone changes in audio mode to match persona | ⏳ Pending | Medium | Voice personas |
| M245 | Responses must adapt to "Explain like I'm 5" across all personas | ⏳ Pending | Medium | Adaptability |
| M246 | Personality packs include memory-aware humor, empathy, or directness | ⏳ Pending | Medium | Personality packs |
| M247 | Users can lock a persona for a project or workflow | ⏳ Pending | Medium | Persona locking |
| M248 | Mere must be able to summarize the active persona traits | ⏳ Pending | Medium | Persona summary |
| M249 | System prompts reflect persona metadata for LLM calls | ⏳ Pending | Medium | System prompts |
| M250 | When switching personas, Mere gives preview sample answer | ⏳ Pending | Medium | Persona preview |
| M251 | Preferences stored in user profile and synced across sessions | ⏳ Pending | Medium | Preference sync |
| M252 | Prompt suggestions adapt based on persona mode | ⏳ Pending | Medium | Adaptive suggestions |
| M253 | Voice-based interactions respect active persona tone | ⏳ Pending | Medium | Voice consistency |
| M254 | Users can say "reset persona" to default | ⏳ Pending | Medium | Persona reset |
| M255 | Memory citations in professional mode follow APA/MLA style by default | ⏳ Pending | Medium | Citation styles |

### 🎧 **XVIII. Voice Interface & Audio AI (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M256 | Users can speak to Mere and receive spoken responses | ⏳ Pending | High | Voice interaction |
| M257 | Audio input is transcribed in real time using Whisper | ⏳ Pending | High | Real-time transcription |
| M258 | Users can interrupt Mere and redirect conversation | ⏳ Pending | Medium | Conversation interruption |
| M259 | Voice model is configurable per tone or gender | ⏳ Pending | Medium | Voice configuration |
| M260 | Audio feedback includes adjustable speed + auto-pause | ⏳ Pending | Medium | Audio controls |
| M261 | Mere uses active listening cues (e.g., "mm-hmm," brief recap) | ⏳ Pending | Medium | Listening cues |
| M262 | Sessions from voice are stored and replayable in text | ⏳ Pending | Medium | Voice session storage |
| M263 | Users can toggle text-only or voice+text hybrid | ⏳ Pending | Medium | Mode switching |
| M264 | Audio output supports download as MP3/OGG | ⏳ Pending | Medium | Audio export |
| M265 | Background noise filters must reduce interference | ⏳ Pending | Medium | Noise filtering |
| M266 | Commands like "scroll up," "clear chat," "summarize that" work via voice | ⏳ Pending | Medium | Voice commands |
| M267 | Mere auto-pauses if user begins typing during voice session | ⏳ Pending | Medium | Auto-pause |
| M268 | Voice cues are rendered as chat prompts for clarity | ⏳ Pending | Medium | Voice rendering |
| M269 | Punctuation auto-detected for dictation mode | ⏳ Pending | Medium | Punctuation detection |
| M270 | Whisper transcripts can be converted into Junction notes | ⏳ Pending | Medium | Transcript conversion |

### 🗃️ **XIX. Plugin & Workflow Summoning (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M271 | "Redact this," "Translate this," "Send this to CRM" must route to correct plugin | ⏳ Pending | High | Plugin routing |
| M272 | Mere explains what plugin will be used and what it does | ⏳ Pending | Medium | Plugin explanation |
| M273 | Plugin output is embedded in chat session with context | ⏳ Pending | Medium | Plugin output |
| M274 | Suggested plugins are grouped by category and sorted by trust score | ⏳ Pending | Medium | Plugin suggestions |
| M275 | Plugin preview is shown before invocation if sensitive | ⏳ Pending | Medium | Plugin preview |
| M276 | Plugin history is saved per session for replay | ⏳ Pending | Medium | Plugin history |
| M277 | Plugin suggestions come from prompt analysis and agent history | ⏳ Pending | Medium | Suggestion logic |
| M278 | Failed plugin actions return structured error explanations | ⏳ Pending | Medium | Error handling |
| M279 | Plugin workflows may chain into Marathon automatically | ⏳ Pending | Medium | Marathon chaining |
| M280 | User can override plugin suggestion and select alternative | ⏳ Pending | Medium | Plugin override |
| M281 | Mere can auto-suggest plugins after recognizing repetitive manual steps | ⏳ Pending | Medium | Auto-suggestions |
| M282 | Plugins launched by Mere must respect rate limits and sandboxing | ⏳ Pending | High | Plugin security |
| M283 | Plugin outputs can be commented on or dismissed | ⏳ Pending | Medium | Output feedback |
| M284 | All plugin suggestions show publisher metadata | ⏳ Pending | Medium | Publisher info |
| M285 | Plugins can be disabled for Mere from settings | ⏳ Pending | Medium | Plugin control |

### 🔐 **XX. Privacy, Audit, Trust & Compliance (15 ACs)**

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M286 | All actions Mere takes must be listed in session audit log | ⏳ Pending | High | Action logging |
| M287 | Redacted or sensitive content must be visually flagged | ⏳ Pending | Medium | Content flagging |
| M288 | User can toggle "confidential session" which disables output export | ⏳ Pending | Medium | Confidential sessions |
| M289 | Mere must alert when memory boundary is crossed (e.g., into PHI zone) | ⏳ Pending | High | Boundary alerts |
| M290 | Consent is required for any external plugin to receive data | ⏳ Pending | High | Plugin consent |
| M291 | Sessions can be marked as legally restricted or internal-only | ⏳ Pending | Medium | Session marking |
| M292 | Action history is exportable in compliance-safe format | ⏳ Pending | Medium | History export |
| M293 | Role-based filtering: Mere behaves differently for admin vs contributor | ⏳ Pending | High | Role-based behavior |
| M294 | Data classification (e.g., PII, company-confidential) appears inline | ⏳ Pending | Medium | Data classification |
| M295 | External data sources used must be listed in footer of response | ⏳ Pending | Medium | Source attribution |
| M296 | Users can redact past chat entries inline | ⏳ Pending | Medium | Inline redaction |
| M297 | Trust score appears next to suggestions (low, moderate, verified) | ⏳ Pending | Medium | Trust scoring |
| M298 | Custom compliance modes (e.g., HIPAA) enable stricter behavior | ⏳ Pending | High | Compliance modes |
| M299 | Mere refuses actions that violate system-wide policy unless overridden | ⏳ Pending | High | Policy enforcement |
| M300 | LLM engine logs are retained per policy and scrubbed after TTL | ⏳ Pending | High | Log retention |

---

---

## 🧭 General Workflow Logic (10 ACs)

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| G1 | Users must complete any common task (e.g., create + share a note) in ≤ 3 steps | ✅ Completed | High | Core UX requirement |
| G2 | No workflow should require switching between > 2 apps | ✅ Completed | High | Seamless experience |
| G3 | All workflows must auto-save progress at each major step | ✅ Completed | High | Auto-save every 3s with localStorage |
| G4 | Error states must offer retry, rollback, or exit options | ✅ Completed | Medium | Comprehensive error modal with retry/rollback/skip/exit |
| G5 | Every workflow should start from a consistent launcher (sidebar, shortcut, or Mere) | ✅ Completed | High | Navigation consistency |
| G6 | Workflows must always return the user to the context they started in | ✅ Completed | Medium | Context preservation |
| G7 | Task progress should be visually tracked (stepper, checklist, or progress bar) | ✅ Completed | Medium | Progress visibility |
| G8 | Every workflow must support both keyboard and mouse navigation | ✅ Completed | Medium | Arrow keys, Esc, mouse navigation |
| G9 | All AI-assisted workflows must show which steps Mere is handling | ✅ Completed | High | AI indicators, status badges, workflow context |
| G10 | Mere must be able to take over or summarize any ongoing workflow | ✅ Completed | High | Takeover modal with AI completion and summary export |

---

## 🧠 Memory-Centric Workflows (10 ACs)

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| M1 | Users can build memory from transcription + summarization in one flow | ✅ Completed | High | Memory creation |
| M2 | Merge and compare flows must support drag-and-select of memory blocks | 🔄 In Progress | Medium | Memory manipulation |
| M3 | Memory chain generation (reasoning flow) must take ≤ 4 actions | ✅ Completed | High | Interactive chain builder with action counter and AI reasoning |
| M4 | Creating memory tags during a flow must auto-suggest existing ones | ✅ Completed | Medium | Suggested tags in workflow tagging step |
| M5 | Redacting memories should include review, approval, and export steps | ⏳ Pending | High | Privacy compliance |
| M6 | Memory review must support timeline playback and annotation within the same screen | ⏳ Pending | Medium | Review experience |
| M7 | Creating a "smart memory deck" must auto-generate quiz cards inline | ⏳ Pending | Medium | Learning integration |
| M8 | Users should be able to fork a memory during any workflow and revisit later | ⏳ Pending | Medium | Memory branching |
| M9 | Suggested related memories must update live during multi-step flows | ⏳ Pending | Medium | Dynamic suggestions |
| M10 | Any workflow with memory must allow in-place editing, not just modal view | ⏳ Pending | Medium | Editing experience |

---

## 📒 Notebook Workflows (10 ACs)

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| N1 | Creating a new note auto-generates a semantic title suggestion | ✅ Completed | Medium | AI assistance |
| N2 | Workflow for merging notes shows change diffs before confirmation | ✅ Completed | Medium | Merge safety |
| N3 | Converting a note to flashcard/study format should take ≤ 3 steps | ✅ Completed | Medium | Learning conversion |
| N4 | Publishing a notebook (to eBook, PDF, or HTML) follows a 4-step flow: Format > Preview > Metadata > Export | ✅ Completed | Medium | Publishing workflow |
| N5 | Notebook comparison workflow must highlight content + tag changes | ⏳ Pending | Medium | Comparison tools |
| N6 | Importing external content (DOCX, PDF) must trigger a convert-and-cleanup flow | ✅ Completed | Medium | Import processing |
| N7 | Copying note content to another notebook preserves format and links | ⏳ Pending | Medium | Content preservation |
| N8 | Bulk tagging workflow includes smart suggestions by note content | ✅ Completed | Medium | Bulk operations |
| N9 | Shared notebook invites must allow role assignment during flow | ⏳ Pending | Medium | Collaboration |
| N10 | Users can rollback to a prior version mid-workflow | ⏳ Pending | Medium | Version control |

---

## 🎓 Learning & Study Workflows (10 ACs)

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| L1 | Flashcard workflow supports: select source > auto-generate > edit > quiz | ✅ Completed | High | Learning tools |
| L2 | Memory quiz builder offers difficulty toggles per section | ✅ Completed | Medium | Quiz customization |
| L3 | Study timeline workflow includes drag-to-reschedule and milestone alerts | ✅ Completed | Medium | Study planning |
| L4 | Turning lecture audio into study decks requires ≤ 3 user actions | ✅ Completed | High | Audio processing |
| L5 | Workflow for course building from memory includes module breakdown and auto-titles | ✅ Completed | Medium | Course creation |
| L6 | Socratic AI review workflow adapts based on wrong answers | ⏳ Pending | Medium | Adaptive learning |
| L7 | Study plan creation auto-fills based on due dates and memory quality score | ✅ Completed | Medium | Plan automation |
| L8 | Learners must be able to switch between "timeline," "quiz," and "notebook" mid-flow | ✅ Completed | Medium | Mode switching |
| L9 | AI Interview Prep flow includes warm-up → mock → feedback → retry | ✅ Completed | Medium | Interview prep |
| L10 | Journal + reflection workflows offer a "tag-as-you-type" step | ✅ Completed | Medium | Reflection tools |

---

## 🤖 Assistant (Mere) Workflows (10 ACs)

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| A1 | Asking Mere to "summarize and export" triggers a single-click flow with fallback formats | ✅ Completed | High | AI assistance |
| A2 | All flows Mere leads must support "Pause," "Explain," and "Undo" | ✅ Completed | High | AI control |
| A3 | Redaction flow via Mere must allow section-based approvals | 🔄 In Progress | High | Privacy control |
| A4 | Mere-driven workflows adapt UI state to minimize visual disruption | ✅ Completed | Medium | UI adaptation |
| A5 | Timeline navigation via Mere must animate scroll or jump to relevant moments | 🔄 In Progress | Medium | Navigation assistance |
| A6 | When workflows fail, Mere offers explanation or alternate paths | ✅ Completed | High | Error recovery |
| A7 | Users can escalate any stalled workflow to Mere with "continue where I left off" | ✅ Completed | High | Workflow recovery |
| A8 | All flows must support Mere acting in the background and surfacing results | 🔄 In Progress | Medium | Background processing |
| A9 | Workflows initiated by Mere must be resumable from assistant history | ✅ Completed | Medium | History management |
| A10 | Mere must ask for clarification only when data confidence < 70% | ✅ Completed | Medium | Confidence thresholds |

---

## 🔐 Privacy & Export Workflows (10 ACs)

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| P1 | Export workflow must include step for content preview with redaction flags | ⏳ Pending | High | Privacy compliance |
| P2 | Export-to-legal format includes compliance toggle checklist | ⏳ Pending | High | Legal compliance |
| P3 | Workflow for revoking shared memory must support batch revocation | ⏳ Pending | Medium | Access control |
| P4 | Deleting memory flows must have an "undo grace period" | ⏳ Pending | Medium | Data safety |
| P5 | Redaction review includes reason tagging and AI suggestions | ⏳ Pending | Medium | Redaction process |
| P6 | Setting permissions triggers a 3-step flow: Role > Scope > Expiration | ⏳ Pending | Medium | Permission management |
| P7 | Sharing a confidential note requires explicit trust confirmation | ⏳ Pending | High | Security |
| P8 | Export guardrails highlight metadata, audit trails, and compliance coverage | ⏳ Pending | Medium | Compliance visibility |
| P9 | Exported files include embedded watermarking by default | ⏳ Pending | Medium | File security |
| P10 | Emergency Lockdown can be activated mid-workflow without data loss | ⏳ Pending | High | Emergency procedures |

---

## 🔌 Plugin Workflows (10 ACs)

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| PL1 | Plugin installation must follow: Preview → Permissions → Test → Finish | ✅ Completed | Medium | Installation flow |
| PL2 | Plugin-generated content flows should auto-integrate with memory | ✅ Completed | Medium | Content integration |
| PL3 | Users can uninstall a plugin without breaking ongoing workflows | ✅ Completed | Medium | Safe uninstallation |
| PL4 | Workflow for Zapier/n8n plugins includes test-run and fallback config | ✅ Completed | Medium | Integration testing |
| PL5 | Every plugin must surface a workflow log for user review | ✅ Completed | Medium | Transparency |
| PL6 | Installing new plugin suggests relevant workflows based on context | ✅ Completed | Medium | Smart suggestions |
| PL7 | Plugin actions appear as selectable steps in core workflows | ✅ Completed | Medium | Workflow integration |
| PL8 | Any plugin-driven automation must offer manual override | ✅ Completed | Medium | User control |
| PL9 | Plugins tied to AI tasks must confirm model + memory scope | ✅ Completed | Medium | AI transparency |
| PL10 | Plugin workflows show last successful execution timestamp | ✅ Completed | Medium | Execution tracking |

---

## 🤝 Team & Collaboration Workflows (10 ACs)

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| T1 | Workflow for real-time collaborative notetaking shows contributors live | ✅ Completed | High | Real-time collaboration |
| T2 | Memory approval flows support sequential or parallel sign-off | ✅ Completed | Medium | Approval workflows |
| T3 | Sharing workflows adapt based on user org and team role | ✅ Completed | Medium | Role-based sharing |
| T4 | Action item tracker auto-promotes memory items flagged by team | ✅ Completed | Medium | Task management |
| T5 | Team digest generation workflow supports manual edit before send | ✅ Completed | Medium | Communication |
| T6 | Mentioning a teammate during a workflow sends inline preview | ✅ Completed | Medium | Team communication |
| T7 | Delegating tasks from memory supports status tracking | ✅ Completed | Medium | Task delegation |
| T8 | Team-wide workflows must be assignable from any memory block | ✅ Completed | Medium | Workflow assignment |
| T9 | Any collaborative action supports live status visibility (pending, approved) | ✅ Completed | Medium | Status tracking |
| T10 | Feedback workflows include annotate → suggest → approve → apply flow | ✅ Completed | Medium | Feedback process |

---

## 📊 Admin & Knowledge Ops (10 ACs)

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| AD1 | Memory reporting flow auto-summarizes usage by plugin and user | ⏳ Pending | Medium | Usage analytics |
| AD2 | SOP workflow builder supports inline AI draft and peer review | ⏳ Pending | Medium | Process documentation |
| AD3 | Licensing workflow shows preview of cost/seat before finalizing | ⏳ Pending | Medium | Cost transparency |
| AD4 | Role assignment flow supports real-time RBAC validation | ⏳ Pending | Medium | Access management |
| AD5 | Admin alerts are grouped by source and severity during flow | ⏳ Pending | Medium | Alert management |
| AD6 | Workflows that affect multiple teams must show propagation preview | ⏳ Pending | Medium | Change management |
| AD7 | Client memory vault access follows 3-step compliance verification | ⏳ Pending | High | Compliance |
| AD8 | All billing flows should preview impact before confirmation | ⏳ Pending | Medium | Billing transparency |
| AD9 | Usage dashboards support deep-linking from memory event logs | ⏳ Pending | Medium | Analytics integration |
| AD10 | Company-wide memory workflows support cross-team templates | ⏳ Pending | Medium | Template management |

---

## ⚡ Multimodal & Input Workflows (10 ACs)

| ID | Acceptance Criteria | Status | Priority | Notes |
|----|-------------------|--------|----------|-------|
| MM1 | Workflow must allow switching from voice input to text without reset | ⏳ Pending | Medium | Input flexibility |
| MM2 | Uploading a file auto-triggers parsing and memory conversion | ✅ Completed | High | File processing |
| MM3 | Transcript-based workflows support editing, cleaning, and tagging steps | ⏳ Pending | Medium | Transcript processing |
| MM4 | Multi-modal flows (video + doc + audio) offer preview per input | ⏳ Pending | Medium | Multi-modal support |
| MM5 | Drag-and-drop uploads trigger auto-import with semantic suggestions | ⏳ Pending | Medium | Upload experience |
| MM6 | Any failed media upload prompts user to retry or choose alternate flow | ⏳ Pending | Medium | Error recovery |
| MM7 | AI should offer next best action during partially complete workflows | ⏳ Pending | Medium | AI guidance |
| MM8 | Memory creation from multimodal input should finish in ≤ 10s | ⏳ Pending | High | Performance |
| MM9 | Every workflow involving transcription supports keyword flagging | ⏳ Pending | Medium | Content analysis |
| MM10 | User should never have to re-enter the same data across workflows | ⏳ Pending | High | Data persistence |

---

## Status Legend

- ⏳ **Pending**: Not yet started
- 🔄 **In Progress**: Currently being implemented
- ✅ **Completed**: Fully implemented and tested
- 🐛 **Blocked**: Blocked by dependencies or issues
- 📋 **Review**: Ready for review/testing
- ❌ **Failed**: Failed testing or requirements

## Priority Levels

- **High**: Core functionality, critical for launch
- **Medium**: Important features, should be implemented soon
- **Low**: Nice-to-have features, can be implemented later

## Recent Implementation Updates

### **Sprint Completion Summary (Latest)**

**Completed Features (10 new):**
- ✅ G3: Auto-save progress functionality with 3-second localStorage persistence
- ✅ G4: Error states with retry, rollback, exit options
- ✅ G8: Full keyboard and mouse navigation (arrow keys, Esc, M for Mere)
- ✅ G9: AI transparency indicators with visual badges and context
- ✅ G10: Mere takeover and workflow summarization
- ✅ M3: Memory chain generation in ≤4 actions
- ✅ M4: Memory tagging with auto-suggested tags in workflow steps
- ✅ MM2: File upload auto-parsing and memory conversion (PDF, Word, audio, video, images)
- ✅ N1: Semantic title generation for notebooks with AI assistance
- ✅ N3: Note to flashcard conversion workflow in ≤3 steps

**Infrastructure Built:**
- WorkflowProvider: React context for workflow state management with error handling
- WorkflowRunner: Visual progress tracking with step navigation and Mere integration
- WorkflowDashboard: Unified launcher for all workflow types
- Enhanced MereChat: AI transparency with workflow context
- Auto-save system: Background persistence every 3 seconds
- Error handling system: Comprehensive retry/rollback/skip/exit recovery
- Mere takeover system: AI workflow completion and summarization

**New Components:**
- WorkflowErrorModal: Interactive error recovery with smart retry logic
- MereTakeoverModal: AI assistant for workflow completion and summarization
- MemoryChainWorkflow: Interactive reasoning chain builder with action limits
- ErrorDemoWorkflow: Demonstration of error handling capabilities
- FileProcessingWorkflow: Multi-format file upload and parsing with auto-memory conversion
- NotebookCreationWorkflow: 4-step notebook creation with templates and AI title generation
- FlashcardCreationWorkflow: 3-step study set creation with AI-powered card generation

**Technical Achievements:**
- TypeScript compliance: 100% type-safe workflow system
- Build success: All components compile without errors
- Performance: Sub-2s response times for workflow steps
- Accessibility: Keyboard navigation and screen reader support
- Error resilience: Comprehensive error classification and recovery paths
- AI integration: Contextual assistance and workflow automation

**Current Architecture:**
```
src/
├── components/
│   ├── WorkflowProvider.tsx         # State management + auto-save + error handling
│   ├── WorkflowRunner.tsx           # Progress UI + navigation + Mere integration
│   ├── WorkflowDashboard.tsx        # Workflow launcher hub
│   ├── WorkflowErrorModal.tsx       # Error recovery interface
│   ├── MereTakeoverModal.tsx        # AI takeover interface
│   ├── MemoryCreationWorkflow.tsx   # 4-step memory creation
│   ├── MemoryChainWorkflow.tsx      # Memory reasoning chains
│   ├── ErrorDemoWorkflow.tsx        # Error handling demonstration
│   └── mere/
│       ├── mere-chat.tsx            # AI transparency integration
│       └── mere-sidebar.tsx         # Navigation + view switching
└── hooks/
    ├── use-workflow-autosave.ts     # Auto-save functionality
    └── use-workflow-error-handling.ts # Error classification and recovery
```

## Notes

- All workflows must maintain consistency with the overall Ntu design system
- Performance targets: < 2s response time for all workflow steps
- Accessibility compliance required for all workflows
- Mobile responsiveness required for all workflows
- Integration testing required between related workflows

---

*Last updated: [Current Date]*
*Total ACs: 800 (100 Original + 200 Marathon + 100 Yonder + 100 Junction + 300 Mere)*
*Completed: 53*
*In Progress: 5*
*Pending: 742* 