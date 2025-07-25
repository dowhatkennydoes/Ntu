# Mere App UI/UX Acceptance Criteria (Excluding Sidebar)

This file tracks 100 full Acceptance Criteria (ACs) for the Mere App, ensuring it is production-ready, elegant, intelligent, and seamless from empty state through full interaction.

| AC | Description | Progress |
|----|-------------|----------|
| 1  | The Mere app must render full width and height of the content area (excluding sidebar). | [ ] Not Started |
| 2  | The content container must use a responsive flex column layout. | [ ] Not Started |
| 3  | The default view must center the input when there are no prior messages. | [ ] Not Started |
| 4  | Once a message is sent, the layout must reflow to a standard top-down chat layout. | [ ] Not Started |
| 5  | Padding must be applied symmetrically to top, left, and right (24–32px). | [ ] Not Started |
| 6  | Chat container must have a max-width (~900px) to preserve readability. | [ ] Not Started |
| 7  | Input must be pinned to the bottom in chat mode. | [ ] Not Started |
| 8  | On mobile, all layout elements must stack vertically without overflow. | [ ] Not Started |
| 9  | All elements must respect system theme (light/dark) and update reactively. | [ ] Not Started |
| 10 | Layout must pass lighthouse layout shift score of 100. | [ ] Not Started |
| 11 | All spacing must follow an 8px or 4px baseline grid. | [ ] Not Started |
| 12 | Suggestions, header, and chat messages must follow consistent vertical rhythm. | [ ] Not Started |
| 13 | The message feed must be scrollable while keeping input fixed. | [ ] Not Started |
| 14 | Overflow in long replies must enable internal scrolling, not body scroll. | [ ] Not Started |
| 15 | Page must not scroll when typing unless replying message exceeds viewport. | [ ] Not Started |
| 16 | The layout must support progressive hydration (e.g., stream-in reply). | [ ] Not Started |
| 17 | Main panel must include animation context for Framer Motion transitions. | [ ] Not Started |
| 18 | All animation durations must be <400ms for responsiveness. | [ ] Not Started |
| 19 | When transitioning from dashboard input, the submitted message must animate into Mere. | [ ] Not Started |
| 20 | Suggestions and header must gracefully collapse or fade when interaction begins. | [ ] Not Started |
| 21 | When chat history is empty, input bar must be centered on screen. | [ ] Not Started |
| 22 | Placeholder must say “Ask Mere anything…” with accessible aria-label. | [ ] Not Started |
| 23 | The send arrow icon must appear only when text is entered. | [ ] Not Started |
| 24 | Hitting Enter sends the message unless Shift+Enter is used. | [ ] Not Started |
| 25 | Input field must support multiline expansion (max height ~6 lines). | [ ] Not Started |
| 26 | On focus, input must glow subtly with animation. | [ ] Not Started |
| 27 | On submit, the input must animate to bottom and remain pinned there. | [ ] Not Started |
| 28 | Input bar must auto-focus on initial page load (desktop only). | [ ] Not Started |
| 29 | Input must support / commands with typeahead suggestions. | [ ] Not Started |
| 30 | Input must support @persona and #tag mentions, parsed as metadata. | [ ] Not Started |
| 31 | The send icon must animate (pulse or rotate) on hover. | [ ] Not Started |
| 32 | A loading spinner must replace the send icon briefly on submit. | [ ] Not Started |
| 33 | The input bar must be locked when AI is replying. | [ ] Not Started |
| 34 | Input field must automatically scroll if content exceeds max height. | [ ] Not Started |
| 35 | Input must support file paste (text, images, documents). | [ ] Not Started |
| 36 | Input state must be saved locally (draft restore on reload). | [ ] Not Started |
| 37 | Input must support theme-aware styles (blurred background, accent glow). | [ ] Not Started |
| 38 | Empty state input must resize appropriately on tablet and mobile. | [ ] Not Started |
| 39 | Input must show AI status tag when relevant (e.g., "Memory Active"). | [ ] Not Started |
| 40 | Input must support a mic icon if voice-to-text is enabled. | [ ] Not Started |
| 41 | On submission, AI must begin streaming token-by-token. | [ ] Not Started |
| 42 | Streaming must start only after UI animation is complete. | [ ] Not Started |
| 43 | An animated “Mere is thinking…” must show until first token arrives. | [ ] Not Started |
| 44 | Streamed content must be inserted linearly into the chat window. | [ ] Not Started |
| 45 | Long responses must be scrollable within chat window. | [ ] Not Started |
| 46 | Messages must animate into view with fade + slide-up. | [ ] Not Started |
| 47 | Streamed text must support markdown formatting (bold, links, lists, code). | [ ] Not Started |
| 48 | Code blocks must support copy, syntax highlight, and collapse. | [ ] Not Started |
| 49 | Image or chart output must be embedded as visual blocks. | [ ] Not Started |
| 50 | Reactions (👍, copy, pin) must appear on hover for each AI reply. | [ ] Not Started |
| 51 | Each message must be timestamped (visible on hover). | [ ] Not Started |
| 52 | If a memory snapshot is taken, a pin/icon must appear on the AI reply. | [ ] Not Started |
| 53 | Streaming must auto-scroll unless user is actively scrolling upward. | [ ] Not Started |
| 54 | Interrupting the AI reply must stop stream and allow resend or edit. | [ ] Not Started |
| 55 | AI replies must support follow-up suggestions or buttons. | [ ] Not Started |
| 56 | Token usage must be calculated and recorded after reply. | [ ] Not Started |
| 57 | AI must respond with error message if generation fails. | [ ] Not Started |
| 58 | All replies must be added to chat history and persist in Supabase. | [ ] Not Started |
| 59 | System messages must use a distinct style and icon. | [ ] Not Started |
| 60 | AI message metadata (e.g., task generated, memory status) must be captured for logs. | [ ] Not Started |
| 61 | Empty state must display 3–5 animated suggestions above the centered input. | [ ] Not Started |
| 62 | Each suggestion must appear as a card with title, icon, and subtext. | [ ] Not Started |
| 63 | Clicking a suggestion must populate the input field. | [ ] Not Started |
| 64 | Suggestion cards must animate on hover (scale or glow). | [ ] Not Started |
| 65 | Cards must stagger in on initial render using Framer Motion. | [ ] Not Started |
| 66 | Suggestions must disappear when first message is submitted. | [ ] Not Started |
| 67 | One of the suggestions must vary session-to-session (AI randomized). | [ ] Not Started |
| 68 | A fourth "See more" card may expand to a scrollable drawer of prompts. | [ ] Not Started |
| 69 | Empty state suggestions must be mobile-friendly (stacked layout). | [ ] Not Started |
| 70 | Empty state must support progressive disclosure: fewer cards on smaller screens. | [ ] Not Started |
| 71 | Tooltip on hover must say “Click to try this prompt.” | [ ] Not Started |
| 72 | Cards must use role="button" and be screen reader accessible. | [ ] Not Started |
| 73 | Suggestions must support full i18n/localization. | [ ] Not Started |
| 74 | On hover/focus, show slight shadow and motion accent. | [ ] Not Started |
| 75 | Clicking a suggestion triggers the same animation as manual input submission. | [ ] Not Started |
| 76 | Empty state must include a subtle header: “Welcome to Mere.” | [ ] Not Started |
| 77 | A mini personality bio must appear below the title: “Your memory-native AI assistant.” | [ ] Not Started |
| 78 | Fade out empty state smoothly on session start. | [ ] Not Started |
| 79 | Header must show current session type (e.g., 📂 Notebook Session, 🧠 Memory Snapshot). | [ ] Not Started |
| 80 | Header must collapse when scrolling through chat. | [ ] Not Started |
| 81 | All interactive elements must be keyboard navigable (Tab/Enter). | [ ] Not Started |
| 82 | All UI elements must pass WCAG AA color contrast. | [ ] Not Started |
| 83 | All inputs, cards, and messages must support aria-* roles. | [ ] Not Started |
| 84 | Any AI error must be handled with user-friendly toast or system message. | [ ] Not Started |
| 85 | AI retry must be available after failure. | [ ] Not Started |
| 86 | Input box must support autocomplete off for better UX. | [ ] Not Started |
| 87 | Initial load must happen under 1s TTI (Time to Interactive). | [ ] Not Started |
| 88 | Lazy-load chat messages after N=50 messages to preserve performance. | [ ] Not Started |
| 89 | All text must scale correctly on high-DPI or zoomed screens. | [ ] Not Started |
| 90 | Loading state must be minimal — no screen flicker or flash of unstyled content. | [ ] Not Started |
| 91 | If voice reply or TTS is enabled, playback controls must appear. | [ ] Not Started |
| 92 | If message contains a task, allow “Send to Punctual” inline. | [ ] Not Started |
| 93 | Light theme must retain spacing and layout parity with dark theme. | [ ] Not Started |
| 94 | The send button must animate slightly on keypress (hover + click). | [ ] Not Started |
| 95 | A glowing halo must appear around chat container if it’s active/focused. | [ ] Not Started |
| 96 | Input bar must not flicker on resize or orientation change. | [ ] Not Started |
| 97 | All input errors (too long, rate limited) must show helpful error text. | [ ] Not Started |
| 98 | “Scroll to bottom” button must appear when user scrolls up. | [ ] Not Started |
| 99 | A “Replay last AI response” button must exist on AI messages. | [ ] Not Started |
| 100| The entire app must be testable via data-testid for E2E and unit tests. | [ ] Not Started | 