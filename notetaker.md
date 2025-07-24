# Yonder AI Notetaker - Acceptance Criteria Tracker

## 🧠 1–20: Real-Time Intelligence & Semantic Transcription
1. Yonder must transcribe meetings in real-time with <3s latency.
2. Yonder must summarize each 2-minute segment while still recording.
3. Yonder must extract action items live, not post-meeting.
4. Yonder must detect speaker change and sentiment in real-time.
5. AI must tag quotes, questions, objections, decisions as metadata.
6. Yonder must support multi-language real-time transcription.
7. Whisper.cpp must be locally hosted for privacy and latency.
8. Transcripts must support semantic sectioning (chapters by topic).
9. Summaries must regenerate as meeting context evolves.
10. Transcripts must show emotional tone (e.g. neutral, excited, tense).
11. Key quotes must be ranked by AI in terms of importance.
12. AI must detect recurring themes (e.g., “project delay,” “budget”).
13. Each transcript section must have a confidence score and style tag.
14. Transcripts must auto-highlight names, dates, numbers, URLs.
15. Yonder must support real-time voice diarization (speaker ID).
16. AI must detect intent behind statements (informing, requesting, etc.).
17. AI must generate live bullet point summaries every 5 minutes.
18. AI must automatically draft recap email at meeting end.
19. Users must be able to ask “What did X say about Y?” during meeting.
20. All summaries must link back to exact timestamps in audio.

## 🧩 21–40: Context-Aware Integration with Mere, Junction, Punctual
21. Mere must be able to ask and answer context questions during the call.
22. Users can say “Turn this into a flashcard” and auto-send to Junction.
23. Action items must be auto-assigned in Punctual with due dates.
24. Mere must support follow-up on action items post-meeting.
25. Each meeting must be added to a memory timeline.
26. Meeting content must update the speaker’s memory profile.
27. Notes must link back to prior sessions with same participants.
28. Yonder must cross-reference facts from past notes if repeated.
29. “Memory Replay” mode must allow replaying meetings from speaker POV.
30. Mere must auto-generate a mind map based on transcript.
31. Junction must store each transcript as a knowledge document.
32. Mindtrain (knowledge graph) must update dynamically with meeting nodes.
33. Yonder must ask, “Do you want to schedule a follow-up?”
34. Punctual must extract time-sensitive items and route to calendar.
35. Each meeting’s summary must live link to other app memory.
36. A “Mere Analysis” overlay must appear post-meeting with conclusions.
37. Users must be able to navigate transcript via concept map.
38. Live “Context Overlay” must pop up during speaker turns.
39. Mere must generate 1-click email summary for review.
40. Yonder must create a memory cluster around each client/project.

## ⚡ 41–60: Speed, Local Power, and Offline Mode
41. Transcription must work offline with Whisper.cpp or similar.
42. Transcription latency must remain under 3 seconds.
43. Claude or GPT-4 must be fallbacks for summary when local models are insufficient.
44. Meetings must be downloadable in .mp3, .txt, .pdf, .json.
45. Yonder must cache transcription locally during poor connections.
46. Meetings must continue even if the internet drops temporarily.
47. Local-only mode must exist for HIPAA/enterprise compliance.
48. Transcripts must be saved in local SQL database with pgvector.
49. Vector search must be available offline for last 5 meetings.
50. User must be able to rerun a summary locally without internet.

## 🛡 61–80: Privacy, Audit, Compliance
61. All transcription must happen locally or on self-hosted backend.
62. No meeting data is ever sent to OpenAI or Anthropic unless approved.
63. End-to-end encryption must be available for voice-to-text pipeline.
64. Users must be able to opt out of speaker labeling.
65. Enterprise clients must support their own custom LLM endpoints.
66. Audit logs must track every access to any transcript or summary.
67. Organizations must be able to define their own retention rules.
68. Users must be able to redact content post-meeting and regenerate summary.
69. Transcript deletion must trigger deletion in all connected apps.
70. All summarization requests must be traceable and timestamped.

## 📐 81–100: UI/UX Excellence + Future-Proof Features
81. Transcript view must support: real-time scrolling, speaker highlighting, chapter folding, time-synced search.
82. Sidebar must show upcoming 5 Google/Zoom meetings with bot status.
83. Bot join must be visualized with presence indicator in UI.
84. “Live Highlights” panel must surface AI-detected important moments.
85. Summary UI must be toggleable between AI/edited/final.
86. Users can pin parts of transcript as bookmarks.
87. A “Smart View” must collapse transcript to 20% key moments.
88. UX must support command bar (⌘K) to control entire transcript.
89. All transcripts must have audio waveform view with scrubber.
90. Playback mode must support 0.5x–2x speed with text follow.
91. UI must support themes (light, dark, sepia).
92. “Insight Graph” must visualize speaker relationships over time.
93. Summary builder must allow drag-and-drop of transcript snippets.
94. Keyboard navigation must support power-user workflows.
95. UI must respond to “Hey Mere” voice command to start note capture.
96. User must be able to highlight a word and ask Mere “what does this refer to?”
97. Every transcript must include AI annotations as toggles.
98. Meeting preview must show people, time, AI confidence, purpose.
99. Summary-to-slide export must be possible in 1-click.
100. Transcript “diff mode” must show edits from original vs final.
101. Yonder must support inline collaboration like Google Docs.
102. A live confidence bar must show the certainty of current transcription.
103. Users must be able to fork transcripts to annotate differently.
104. Mobile UI must support voice commands to control bot.
105. Transcript version history must be browsable with diffs.
106. Transcript UI must auto-sync with calendar events.
107. Related meetings must show in a carousel for quick context.
108. App must support real-time Slack export and API webhook.
109. Voiceprint identification must be optional for recurring users.
110. “Summarize what just happened” button must be always visible.
111. End-of-meeting AI wrap-up must be instant and editable.
112. Meetings must be taggable across topics, projects, and clients.
113. Summary UX must support “just decisions,” “just action items,” “just quotes.”
114. All text must be copy-safe (no format breaks, quotes preserved).
115. Summary quality must be rated automatically with AI score.
116. Transcript browser must allow per-speaker review mode.
117. Bot presence must feel human-grade: silent, helpful, never intrusive.
118. Audio and text must sync on tap or scroll, not just playhead.
119. Summary export must support Markdown, HTML, and Word formats.
120. Everything must be memory-aware, permission-bound, and beautiful. 