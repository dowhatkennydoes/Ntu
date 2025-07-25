# Centered AI Input Bar: Acceptance Criteria (ACs)

Here are 100 Acceptance Criteria (ACs) to ensure your centered AI input bar on the main page behaves exactly as you intend — from rich typing, to sending, to animated transition into the full Mere chat interface.

Organized by theme for clarity:

---

## 🧩 I. INPUT BAR DESIGN & BEHAVIOR (1–20)
| AC | Description | Progress |
|----|-------------|----------|
- [x] The AI input bar must be horizontally centered between "Quick Actions" and "Your Progress" | Done
- [x] It must have a fixed width on desktop (e.g., 600px) and responsive width on mobile | Done
- [x] Input bar must support multiline input with growing height | Done
- [x] Placeholder must say: “Ask Mere anything…” | Done
- [x] A send arrow icon must appear on the right side of the input | Done
- [x] Hitting Enter submits unless Shift+Enter is pressed (which adds a newline) | Done
- [x] Clicking the arrow must also submit the input | Done
- [x] The input bar must support dark and light themes | Done
- [x] On focus, the input must expand slightly (animated padding/border) | Done
- [x] On blur, input must shrink back to default | Done
- [x] Input must support / slash commands | Done
- [x] Input must support autocomplete if the user starts typing / | Done
- [x] Input must highlight tokens like @persona, #tag, or [[note]] | Done
- [x] Input must save temporary state to local memory until submitted | Done
- [x] If input is empty, the arrow button must be disabled | Done
- [x] A loading spinner must replace the arrow briefly on submission | Done
- [x] A subtle pulse animation must appear around the input on hover | Done
- [x] Accessibility attributes (aria-label, keyboard navigation) must be present | Done
- [x] On mobile, input must shift vertically above other modules | Done
- [x] Input must preserve cursor position and formatting across edits | Done

## 🚀 II. SUBMISSION & CHAT TRANSFER LOGIC (21–40)
| AC | Description | Progress |
|----|-------------|----------|
- [x] Pressing Enter or clicking the arrow must trigger submission | Done
- [x] Submitted input must be saved to chat_messages table in Supabase | Done
- [x] A session_id must be generated (if one does not already exist) | Done
- [x] Submitted input must be temporarily stored as first message of session | Done
- [x] Submission must capture timestamp and user ID | Done
- [x] Submission must route through app context: app = home | Done
- [x] AI must begin streaming response using default LLM (Ollama) | Done
- [x] Chat streaming must be paused until animation completes | Done
- [x] Input must be cleared immediately after submission | Done
- [x] A loading state must persist until animation and AI response begins | Done
- [x] A unique ID must be generated for the temporary message | Done
- [x] Submission must also trigger memory snapshot if toggle is on | Done
- [x] Memory record must be linked to the new chat session | Done
- [x] Autocomplete tokens (#tag, @persona) must be parsed into metadata | Done
- [x] If app context changes mid-input, warn user before submit | Done
- [x] A session state flag (origin = home_input) must be recorded | Done
- [x] If chat failed to save, retry logic must show in UI | Done
- [x] Input must be locked if AI is still responding | Done
- [x] Emoji and special characters must be preserved on submit | Done
- [x] System message “Mere has joined your session” must show in final chat | Done

## 🎞️ III. ANIMATION TRANSITION TO MERE (41–60)
| AC | Description | Progress |
|----|-------------|----------|
- [x] On submit, animate chat panel into view with fade and slide | Done
- [x] The full Mere component must mount only after animation starts | Done
- [x] Animation must slide main layout upward to reveal Mere | Done
- [x] Background blur or fade must transition with chat | Done
- [x] Input must visually fly upward and merge into Mere’s chat input | Done
- [x] A scroll-down animation must be used to show prior messages | Done
- [x] The first submitted message must appear at the top of Mere | Done
- [x] Chat response must stream in after animation completes | Done
- [x] If animation fails, fallback must hard-navigate to Mere component | Done
- [x] Animation duration must be < 500ms for perceived performance | Done
- [x] Animation must use Framer Motion with AnimatePresence | Done
- [x] Outgoing input must scale down slightly before transforming | Done
- [x] Sidebar must fade in only after chat is mounted | Done
- [x] Command bar must remain hidden during animation | Done
- [x] Animation must be interruptible with escape key | Done
- [x] If animation is interrupted, input must return to original position | Done
- [x] If user clicks outside chat overlay, animation must reverse and input returns | Done
- [x] If user presses Escape during chat, overlay must close and input returns | Done
- [x] Input must restore previous value if animation is cancelled | Done
- [x] All transitions must be accessible and respect reduced motion settings | Done

## ♿ IV. ACCESSIBILITY, ARIA, AND SKIP LINKS (61–80)
| AC | Description | Progress |
|----|-------------|----------|
- [x] Chat overlay must support keyboard navigation for all elements | Done
- [x] Overlay must trap focus while open | Done
- [x] Overlay must be screen reader accessible (aria-modal, aria-label, etc.) | Done
- [x] Overlay must restore focus to input bar when closed | Done
- [x] Overlay must be dismissible with Escape and outside click | Done
- [x] Overlay must support screen reader live region for streaming AI responses | Done
- [x] Overlay must announce system messages | Done
- [x] Overlay must support tab order for all controls | Done
- [x] Overlay must support keyboard shortcuts for send, close, and focus | Done
- [x] Overlay must be fully navigable without a mouse | Done
- [x] Overlay must support high contrast mode | Done
- [x] Overlay must support user font size preferences | Done
- [x] Overlay must support reduced motion for all transitions | Done
- [x] Overlay must support color blindness accessibility | Done
- [x] Overlay must support screen magnification | Done
- [x] Overlay must support voice input for accessibility | Done
- [x] Overlay must support keyboard dictation | Done
- [x] Overlay must support screen reader navigation of chat history | Done
- [x] Overlay must support ARIA landmarks for chat and input | Done
- [x] Overlay must support skip links to jump to chat or input | Done

## 🖥️ V. PANEL RESIZING, MAXIMIZE, MULTI-USER (81–100)
| AC | Description | Progress |
|----|-------------|----------|
- [x] Overlay must support drag-to-resize for chat panel | Done
- [x] Overlay must support keyboard resizing (arrow keys) | Done
- [x] Overlay must support minimum/maximum size constraints | Done
- [x] Overlay must remember last size per session | Done
- [x] Overlay must reset to default size on double-click | Done
- [x] Overlay must support snapping to screen edges | Done
- [x] Overlay must support maximize/minimize toggle | Done
- [x] Overlay must support keyboard shortcut for maximize (Ctrl+M) | Done
- [x] Overlay must support keyboard shortcut for minimize (Ctrl+Shift+M) | Done
- [x] Overlay must support restoring last non-maximized size | Done
- [x] Overlay must support multi-window sync (resize/maximize state sync across tabs) | Done
- [x] Overlay must support collaborative cursors (show other users' focus) | Done
- [x] Overlay must support real-time presence indicator | Done
- [x] Overlay must support remote control (allow another user to resize/maximize) | Done
- [x] Overlay must support conflict resolution for simultaneous actions | Done
- [x] Overlay must support chat handoff between users (show transfer banner) | Done
- [x] Overlay must support undo/redo for panel actions | Done
- [x] Overlay must support activity log of all actions | Done
- [x] Overlay must support export of activity log | Done
- [x] Overlay must support admin override for stuck sessions | Done 