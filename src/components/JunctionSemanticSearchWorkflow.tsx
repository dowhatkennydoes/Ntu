import React, { useState, useRef } from 'react';
import { marked } from 'marked';

// JunctionSemanticSearchWorkflow
// Implements J1: Upload knowledge sources
// Implements J2: Multi-file semantic Q&A
// Implements J3: Natural language Q&A with citations
// Implements J4: Citations deep-link to paragraph/line
// Implements J5: AI summaries tunable by tone, length, and focus
// Implements J6: Answers include quote, analysis, and optional critique
// Implements J10: Contextual follow-ups in Q&A
// Implements J7: Cross-source comparison in answers
// Implements J8: Allow users to pin important insights (answers) for permanent reference. Add pinning state, a pin/unpin button to each answer, and a section at the top to display all pinned answers. Support pinning/unpinning for both main answers and follow-ups. Use local state only.

interface Citation {
  source: string;
  paragraph: number;
  line: number;
  confidenceScore?: number; // 0-1
}

interface QAAnswer {
  id: string;
  question: string;
  quote: string;
  analysis: string;
  critique?: string;
  citations: Citation[];
  summaryOptions: SummaryOptions;
  followUps?: QAAnswer[];
  crossSourceComparison?: Array<{ source: string; quote: string; insight: string }>;
  followUpSuggestions?: string[];
}

interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  size: number;
}

interface SummaryOptions {
  tone: string;
  length: string;
  focus: string;
  llm?: string;
}

const defaultSummaryOptions: SummaryOptions = {
  tone: 'Comprehensive',
  length: 'Medium',
  focus: '',
  llm: 'GPT-4',
};

const mockAnswers: QAAnswer[] = [
  {
    id: '1',
    question: 'What is the main argument of the uploaded document?',
    quote: '"The primary thesis is that semantic search enables more effective knowledge discovery."',
    analysis: 'This quote highlights the document’s focus on semantic search as a transformative tool for research. The author argues that traditional keyword search is insufficient for complex queries, and semantic methods provide richer, context-aware results.',
    critique: 'While the argument is compelling, the document could provide more empirical evidence or case studies to support its claims.',
    citations: [
      { source: 'SampleDoc.pdf', paragraph: 3, line: 12 }
    ],
    summaryOptions: { ...defaultSummaryOptions },
    crossSourceComparison: [],
    followUps: [],
    followUpSuggestions: [
      'Can you elaborate on the methodology?',
      'What are the limitations?',
      'How does this compare to other sources?',
    ],
  },
  {
    id: '2',
    question: 'How does the system handle privacy?',
    quote: '"All user data is encrypted at rest and in transit, with strict access controls."',
    analysis: 'The answer addresses privacy by emphasizing encryption and access control. This suggests a strong commitment to data security, aligning with best practices in the industry.',
    critique: 'The document could provide more specific details about the encryption algorithms and key management.',
    citations: [
      { source: 'PrivacyPolicy.docx', paragraph: 7, line: 2 }
    ],
    summaryOptions: { ...defaultSummaryOptions },
    crossSourceComparison: [],
    followUps: [],
    followUpSuggestions: [
      'What evidence supports this?',
      'Are there counterarguments?',
      'Can you provide a summary?',
    ],
  }
];

const JunctionSemanticSearchWorkflow: React.FC = () => {
  // J1: Knowledge sources state
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Q&A state
  const [qaHistory, setQaHistory] = useState<QAAnswer[]>(mockAnswers);
  const [input, setInput] = useState('');
  const [followUpFor, setFollowUpFor] = useState<string | null>(null);
  const [followUpInput, setFollowUpInput] = useState('');
  const [showCitationInfo, setShowCitationInfo] = useState<string | null>(null);

  // J5: Summary options state
  const [summaryOptions, setSummaryOptions] = useState<SummaryOptions>({ ...defaultSummaryOptions });

  // J8: Pinning state
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  // J13: Source view highlight-sync state
  const [highlightedSource, setHighlightedSource] = useState<null | { source: string; paragraph: number; line: number }>(null);
  const sourceViewRef = useRef<HTMLDivElement>(null);

  // J14: Tagging, commenting, annotation state
  const [answerTags, setAnswerTags] = useState<Record<string, string[]>>({});
  const [answerComments, setAnswerComments] = useState<Record<string, string[]>>({});
  const [annotationInput, setAnnotationInput] = useState<Record<string, string>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  // J17: Entity autocomplete (mock)
  const entitySuggestions = ['GDPR', 'API', 'User Data', 'Encryption', 'Notebook', 'Memory', 'LLM', 'Summary'];
  const [entityAutocomplete, setEntityAutocomplete] = useState<string[]>([]);

  // J18: Extractive/generative toggle
  const [answerStyle, setAnswerStyle] = useState<'extractive' | 'generative'>('generative');

  // J19: Stats/metrics extraction state
  const [statsFor, setStatsFor] = useState<string | null>(null);

  // J20: Export feedback state
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  // Add state for tracking highlighted text and which answer is highlighted
  const [highlightedAnswerId, setHighlightedAnswerId] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [showSuggestionPopover, setShowSuggestionPopover] = useState<boolean>(false);

  // Add state for highlight pulse effect
  const [highlightPulseKey, setHighlightPulseKey] = useState<number>(0);
  const [showCitedBadge, setShowCitedBadge] = useState<boolean>(false);

  // Add state for drag-and-drop
  const [draggedAnswer, setDraggedAnswer] = useState<QAAnswer | null>(null);
  const [notebookDropActive, setNotebookDropActive] = useState(false);
  const [notebookEntries, setNotebookEntries] = useState<QAAnswer[]>([]);
  const [showDropSuccess, setShowDropSuccess] = useState(false);

  // Mock source content
  const mockSourceText: Record<string, string[]> = {
    'SampleDoc.pdf': Array.from({ length: 10 }, (_, p) =>
      Array.from({ length: 5 }, (_, l) => `SampleDoc.pdf Paragraph ${p + 1}, Line ${l + 1}: Lorem ipsum dolor sit amet...`).join('\n')
    ),
    'PrivacyPolicy.docx': Array.from({ length: 10 }, (_, p) =>
      Array.from({ length: 5 }, (_, l) => `PrivacyPolicy.docx Paragraph ${p + 1}, Line ${l + 1}: Data privacy and security...`).join('\n')
    ),
  };

  // Pin/unpin handlers
  const togglePin = (id: string) => {
    setPinnedIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  // Helper to collect all pinned answers (main and follow-ups)
  const getPinnedAnswers = () => {
    const pins: QAAnswer[] = [];
    qaHistory.forEach(ans => {
      if (pinnedIds.includes(ans.id)) pins.push(ans);
      (ans.followUps || []).forEach(fu => {
        if (pinnedIds.includes(fu.id)) pins.push(fu);
      });
    });
    return pins;
  };

  // J1: Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newSources: KnowledgeSource[] = Array.from(files).map(file => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      type: file.type || file.name.split('.').pop() || 'file',
      size: file.size,
    }));
    setSources(prev => [...newSources, ...prev]);
  };

  // J1: Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // J2/J3/J4: Simulate semantic Q&A with citations
  const getMockCitations = () => {
    if (sources.length === 0) return [{ source: '[No sources uploaded]', paragraph: 1, line: 1 }];
    // Randomly pick 1-2 sources to "cite"
    const shuffled = [...sources].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(2, sources.length)).map(s => ({
      source: s.name,
      paragraph: Math.floor(Math.random() * 10) + 1,
      line: Math.floor(Math.random() * 30) + 1,
      confidenceScore: Math.random() * 0.5 + 0.5, // 0.5-1.0
    }));
  };

  // Q&A logic
  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const citations = getMockCitations();
    setQaHistory([
      {
        id: Date.now().toString(),
        question: input,
        quote: '"[Sample quote from source document related to the question]"',
        analysis: `[${summaryOptions.tone} | ${summaryOptions.length}${summaryOptions.focus ? ' | Focus: ' + summaryOptions.focus : ''}] [Sample analysis of the answer, explaining context and reasoning.]`,
        critique: '[Optional critique or alternative perspective.]',
        citations: citations,
        summaryOptions: { ...summaryOptions, llm: summaryOptions.llm || 'GPT-4' },
        crossSourceComparison: citations.length > 1 ? citations.map(c => ({
          source: c.source,
          quote: `"[Mock quote from ${c.source}]"`,
          insight: `[Mock insight from ${c.source}]`,
        })) : undefined,
        followUps: [],
        followUpSuggestions: [
          'Can you elaborate on the methodology?',
          'What are the limitations?',
          'How does this compare to other sources?',
        ],
      },
      ...qaHistory,
    ]);
    setInput('');
  };

  const handleFollowUp = (parentId: string) => {
    if (!followUpInput.trim()) return;
    const citations = getMockCitations();
    setQaHistory(prev =>
      prev.map(ans =>
        ans.id === parentId
          ? {
              ...ans,
              followUps: [
                {
                  id: Date.now().toString(),
                  question: followUpInput,
                  quote: '"[Follow-up quote related to the context]"',
                  analysis: `[${summaryOptions.tone} | ${summaryOptions.length}${summaryOptions.focus ? ' | Focus: ' + summaryOptions.focus : ''}] [Follow-up analysis based on previous answer context.]`,
                  critique: '[Optional follow-up critique.]',
                  citations: citations,
                  summaryOptions: { ...summaryOptions, llm: summaryOptions.llm || 'GPT-4' },
                  crossSourceComparison: citations.length > 1 ? citations.map(c => ({
                    source: c.source,
                    quote: `"[Mock quote from ${c.source}]"`,
                    insight: `[Mock insight from ${c.source}]`,
                  })) : undefined,
                  followUps: [],
                  followUpSuggestions: [
                    'What evidence supports this?',
                    'Are there counterarguments?',
                    'Can you provide a summary?',
                  ],
                },
                ...(ans.followUps || []),
              ],
            }
          : ans
      )
    );
    setFollowUpFor(null);
    setFollowUpInput('');
  };

  // Helper for file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to handle text selection in Q&A
  const handleTextSelection = (ansId: string, text: string) => {
    if (text && text.length > 1) {
      setHighlightedAnswerId(ansId);
      setHighlightedText(text);
      setShowSuggestionPopover(true);
    } else {
      setShowSuggestionPopover(false);
      setHighlightedAnswerId(null);
      setHighlightedText('');
    }
  };

  // Enhance citation click handler to always trigger highlight, even if same citation
  const handleCitationClick = (source: string, paragraph: number, line: number) => {
    setHighlightedSource({ source, paragraph, line });
    setHighlightPulseKey(Date.now()); // force re-render for pulse
    setShowCitedBadge(true);
    setTimeout(() => setShowCitedBadge(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Improved Header with better visual hierarchy */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Junction</h1>
                <p className="text-sm text-gray-600">Semantic Research & Q&A</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {sources.length} sources uploaded
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {qaHistory.length} Q&A sessions
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Improved Knowledge Sources Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Knowledge Sources</h2>
            <p className="text-sm text-gray-600 mt-1">Upload documents to create your knowledge base</p>
          </div>
          <div className="p-6">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-gray-400'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={e => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 underline font-semibold"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX, TXT, MD files up to 10MB</p>
            </div>
            {/* Enhanced uploaded files list */}
            {sources.length > 0 && (
              <div className="mt-6 space-y-3 max-h-64 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Sources ({sources.length})</h3>
                {sources.map(src => (
                  <div key={src.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{src.name}</p>
                        <p className="text-xs text-gray-500">{src.type.toUpperCase()} • {formatFileSize(src.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Processed
                      </span>
                      <button className="text-gray-400 hover:text-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Enhanced Q&A Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI-Powered Q&A</h2>
                <p className="text-sm text-gray-600 mt-1">Ask questions and get intelligent answers with citations</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Powered by</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {summaryOptions.llm || 'GPT-4'}
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Improved Summary controls */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Answer Configuration</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Tone</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={summaryOptions.tone}
                    onChange={e => setSummaryOptions(opt => ({ ...opt, tone: e.target.value }))}
                  >
                    <option value="Analytical">Analytical</option>
                    <option value="Comprehensive">Comprehensive</option>
                    <option value="Concise">Concise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Length</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={summaryOptions.length}
                    onChange={e => setSummaryOptions(opt => ({ ...opt, length: e.target.value }))}
                  >
                    <option value="Short">Short</option>
                    <option value="Medium">Medium</option>
                    <option value="Long">Long</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Focus</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. privacy, methodology"
                    value={summaryOptions.focus}
                    onChange={e => setSummaryOptions(opt => ({ ...opt, focus: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">LLM Model</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={summaryOptions.llm}
                    onChange={e => setSummaryOptions(opt => ({ ...opt, llm: e.target.value }))}
                  >
                    <option value="GPT-4">GPT-4</option>
                    <option value="Claude">Claude</option>
                    <option value="Gemini">Gemini</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Answer Style</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={answerStyle}
                    onChange={e => setAnswerStyle(e.target.value as 'extractive' | 'generative')}
                  >
                    <option value="extractive">Extractive</option>
                    <option value="generative">Generative</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Enhanced question input */}
            <form onSubmit={handleAsk} className="relative">
              <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Ask a question about your knowledge sources... (use @ for entity suggestions)"
                    value={input}
                    onChange={e => {
                      setInput(e.target.value);
                      if (e.target.value.includes('@')) {
                        setEntityAutocomplete(entitySuggestions.filter(s => s.toLowerCase().includes(e.target.value.split('@').pop()?.toLowerCase() || '')));
                      } else {
                        setEntityAutocomplete([]);
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {entityAutocomplete.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                      <div className="p-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-600">Entity Suggestions</p>
                      </div>
                      {entityAutocomplete.map((s, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex items-center space-x-2"
                          onClick={() => {
                            setInput(input.replace(/@[^ ]*$/, '@' + s + ' '));
                            setEntityAutocomplete([]);
                          }}
                        >
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={!input.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Ask AI</span>
                </button>
              </div>
            </form>
          {/* Pinned Insights Section */}
          {getPinnedAnswers().length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <span>Pinned Insights</span>
                <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">Pinned</span>
              </h2>
              <div className="space-y-4">
                {getPinnedAnswers().map(ans => (
                  <div key={ans.id} className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3">
                    <div className="font-semibold text-yellow-800 mb-1">Q: {ans.question}</div>
                    <div className="mb-1 text-xs text-gray-500">
                      <span>Summary: {ans.summaryOptions.tone}, {ans.summaryOptions.length}{ans.summaryOptions.focus ? `, Focus: ${ans.summaryOptions.focus}` : ''}, LLM: {ans.summaryOptions.llm || 'GPT-4'}</span>
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-gray-700">Quote:</span>
                      <span className="italic text-purple-700 ml-2">{ans.quote}</span>
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold text-gray-700">Analysis:</span>
                      <span className="ml-2">{ans.analysis}</span>
                    </div>
                    {ans.critique && (
                      <div className="mb-1">
                        <span className="font-semibold text-gray-700">Critique:</span>
                        <span className="ml-2">{ans.critique}</span>
                      </div>
                    )}
                    <button
                      className="text-xs text-yellow-700 hover:underline mt-1"
                      onClick={() => togglePin(ans.id)}
                    >
                      Unpin
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
          <div className="space-y-6">
            {qaHistory.map(ans => (
              <div
                onMouseUp={e => {
                  const selection = window.getSelection();
                  if (selection && selection.toString().length > 0) {
                    handleTextSelection(ans.id, selection.toString());
                  } else {
                    setShowSuggestionPopover(false);
                    setHighlightedAnswerId(null);
                    setHighlightedText('');
                  }
                }}
                className="bg-white border rounded p-4 shadow-sm relative group"
              >
                {/* J15: Drag handle (mock) */}
                <div
                  draggable
                  onDragStart={() => setDraggedAnswer(ans)}
                  onDragEnd={() => setDraggedAnswer(null)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 cursor-grab text-gray-300 group-hover:text-blue-400 select-none"
                  title="Drag to Notebook/Notes"
                  style={{ zIndex: 2 }}
                >
                  ≡
                </div>
                <div className="font-semibold text-blue-800 mb-1">Q: {ans.question}</div>
                {/* J5: Show summary options used */}
                <div className="mb-2 text-xs text-gray-500">
                  <span>Summary: {ans.summaryOptions.tone}, {ans.summaryOptions.length}{ans.summaryOptions.focus ? `, Focus: ${ans.summaryOptions.focus}` : ''}, LLM: {ans.summaryOptions.llm || 'GPT-4'}</span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold text-gray-700 flex items-center" aria-label="Quote">
                    <svg className="w-4 h-4 text-purple-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17a4 4 0 01-4-4V7a4 4 0 014-4h3a4 4 0 014 4v6a4 4 0 01-4 4H7zm7 0a4 4 0 01-4-4V7a4 4 0 014-4h3a4 4 0 014 4v6a4 4 0 01-4 4h-3z" /></svg>
                    Quote:
                  </span>
                  <span className="italic text-purple-700 ml-1" title="Direct excerpt from cited source">{ans.quote}</span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold text-gray-700 flex items-center" aria-label="Analysis">
                    <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 113 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>
                    Analysis:
                  </span>
                  <span className="ml-1" title="AI-generated analysis and context">{ans.analysis}</span>
                  <span className="ml-1 text-xs text-gray-400" title="What is analysis?"> <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg></span>
                </div>
                {ans.critique ? (
                  <div className="mb-2 flex items-center gap-2 bg-yellow-50 border-l-4 border-yellow-400 rounded p-2" aria-label="Critique">
                    <span className="font-semibold text-yellow-800 flex items-center">
                      <svg className="w-4 h-4 text-yellow-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                      Critique:
                    </span>
                    <span className="ml-1 text-yellow-900" title="Optional critique or alternative perspective">{ans.critique}</span>
                    <span className="ml-1 text-xs text-gray-400" title="What is critique?"> <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg></span>
                  </div>
                ) : (
                  <div className="mb-2 flex items-center gap-2 text-xs text-gray-400" aria-label="No critique provided">
                    <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
                    No critique provided
                  </div>
                )}
                {/* J4: Show deep-linked citations */}
                <div className="mb-2 flex flex-wrap gap-2 items-center">
                  <span className="font-semibold text-gray-700">Cited Source{ans.citations.length > 1 ? 's' : ''}:</span>
                  {ans.citations.map((c, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <button
                        className="text-xs text-blue-700 underline hover:text-blue-900 px-1 py-0.5 rounded bg-blue-50 border border-blue-100"
                        onClick={e => {
                          e.preventDefault();
                          handleCitationClick(c.source, c.paragraph, c.line);
                        }}
                        title={`Go to ${c.source}, paragraph ${c.paragraph}, line ${c.line}`}
                      >
                        {c.source} (¶{c.paragraph}, ℓ{c.line})
                      </button>
                      <span
                        className={`text-xs font-semibold px-1 rounded ${c.confidenceScore !== undefined ?
                          c.confidenceScore > 0.85 ? 'bg-green-100 text-green-700 border border-green-200' :
                          c.confidenceScore > 0.7 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-red-100 text-red-700 border border-red-200' : ''}`}
                        title={`Citation confidence: ${c.confidenceScore !== undefined ? (c.confidenceScore * 100).toFixed(0) + '%' : 'N/A'}`}
                      >
                        {c.confidenceScore !== undefined ? `${(c.confidenceScore * 100).toFixed(0)}%` : 'N/A'}
                      </span>
                    </span>
                  ))}
                  {showCitationInfo && ans.citations.some(c => `${c.source}-p${c.paragraph}-l${c.line}` === showCitationInfo) && (
                    <span className="ml-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">Deep-link: Would jump to cited paragraph/line in source</span>
                  )}
                </div>
                {ans.crossSourceComparison && (
                  <div className="mb-2 mt-2">
                    <div className="font-semibold text-gray-700 mb-1">Cross-Source Comparison:</div>
                    <table className="w-full text-xs border bg-blue-50 mb-2">
                      <thead>
                        <tr>
                          <th className="border px-2 py-1">Source</th>
                          <th className="border px-2 py-1">Quote</th>
                          <th className="border px-2 py-1">Insight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ans.crossSourceComparison.map((row, i) => (
                          <tr key={i}>
                            <td className="border px-2 py-1 font-semibold">{row.source}</td>
                            <td className="border px-2 py-1 italic">{row.quote}</td>
                            <td className="border px-2 py-1">{row.insight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* J14: Tagging UI */}
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-gray-500">Tags:</span>
                  {(answerTags[ans.id] || []).map((tag, i) => (
                    <span key={i} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                      {tag}
                      <button
                        className="ml-1 text-yellow-700 hover:text-red-600 focus:outline-none"
                        aria-label="Remove tag"
                        onClick={() => setAnswerTags(tags => ({ ...tags, [ans.id]: tags[ans.id].filter((_, idx) => idx !== i) }))}
                        tabIndex={0}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="border rounded px-1 py-0.5 text-xs w-20"
                    placeholder="Add tag"
                    value={annotationInput[ans.id] || ''}
                    onChange={e => setAnnotationInput(a => ({ ...a, [ans.id]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && annotationInput[ans.id]) {
                        setAnswerTags(tags => ({ ...tags, [ans.id]: [...(tags[ans.id] || []), annotationInput[ans.id]] }));
                        setAnnotationInput(a => ({ ...a, [ans.id]: '' }));
                      }
                    }}
                    aria-label="Add tag"
                  />
                </div>
                {/* J14: Commenting UI */}
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Comments:</span>
                  <div className="space-y-1">
                    {(answerComments[ans.id] || []).map((c, i) => (
                      <div key={i} className="text-xs bg-gray-100 rounded px-2 py-1 flex items-center gap-2">
                        <span className="flex-1">{c}</span>
                        <button
                          className="text-gray-400 hover:text-red-600 focus:outline-none"
                          aria-label="Remove comment"
                          onClick={() => setAnswerComments(comments => ({ ...comments, [ans.id]: comments[ans.id].filter((_, idx) => idx !== i) }))}
                          tabIndex={0}
                        >
                          ×
                        </button>
                        <button
                          className="text-gray-400 hover:text-blue-600 focus:outline-none"
                          aria-label="Edit comment"
                          onClick={() => setCommentInput(ci => ({ ...ci, [ans.id]: c }))}
                          tabIndex={0}
                        >
                          ✎
                        </button>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (commentInput[ans.id]) {
                        setAnswerComments(comments => ({ ...comments, [ans.id]: [...(comments[ans.id] || []), commentInput[ans.id]] }));
                        setCommentInput(ci => ({ ...ci, [ans.id]: '' }));
                      }
                    }}
                    className="flex gap-1 mt-1"
                  >
                    <input
                      type="text"
                      className="border rounded px-1 py-0.5 text-xs flex-1"
                      placeholder="Add comment (Markdown supported)"
                      value={commentInput[ans.id] || ''}
                      onChange={e => setCommentInput(ci => ({ ...ci, [ans.id]: e.target.value }))}
                      aria-label="Add comment"
                    />
                    <button type="submit" className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">Add</button>
                  </form>
                  {/* Markdown preview for comment input */}
                  {commentInput[ans.id] && (
                    <div className="mt-1 p-2 bg-white border border-blue-100 rounded text-xs text-gray-700">
                      <span className="font-semibold text-blue-700">Preview:</span>
                      <span className="ml-2" dangerouslySetInnerHTML={{ __html: marked(commentInput[ans.id]) }} />
                    </div>
                  )}
                </div>
                {/* J19: Extract stats/metrics/lists button */}
                <button
                  className="mt-2 text-xs text-green-700 hover:underline mr-2"
                  onClick={() => setStatsFor(ans.id)}
                  type="button"
                >
                  Extract Stats/Metrics
                </button>
                {/* J20: Export as flashcard/summary buttons */}
                <button
                  className="mt-2 text-xs text-purple-700 hover:underline mr-2"
                  onClick={() => { setExportMsg('Exported as flashcard!'); setTimeout(() => setExportMsg(null), 1500); }}
                  type="button"
                >
                  Export as Flashcard
                </button>
                <button
                  className="mt-2 text-xs text-indigo-700 hover:underline"
                  onClick={() => { setExportMsg('Exported as summary!'); setTimeout(() => setExportMsg(null), 1500); }}
                  type="button"
                >
                  Export as Summary
                </button>
                {/* J19: Show mock stats/metrics output */}
                {statsFor === ans.id && (
                  <div className="mt-2 bg-green-50 border border-green-200 rounded p-2 text-xs">
                    <div className="font-semibold text-green-700 mb-1">Extracted Stats/Metrics:</div>
                    <ul className="list-disc ml-4">
                      <li>Word Count: 123</li>
                      <li>Mentions: GDPR, API, User Data</li>
                      <li>Numbers: 3 tables, 2 figures</li>
                      <li>Summary List: [Point 1, Point 2, Point 3]</li>
                    </ul>
                    <button className="mt-1 text-xs text-green-700 underline" onClick={() => setStatsFor(null)}>Close</button>
                  </div>
                )}
                {/* J20: Export feedback */}
                {exportMsg && (
                  <div className="mt-2 text-xs text-purple-700">{exportMsg}</div>
                )}
                <button
                  className={`ml-2 text-xs ${pinnedIds.includes(ans.id) ? 'text-yellow-600' : 'text-gray-400'} hover:underline`}
                  onClick={() => togglePin(ans.id)}
                  title={pinnedIds.includes(ans.id) ? 'Unpin insight' : 'Pin insight'}
                >
                  {pinnedIds.includes(ans.id) ? 'Unpin' : 'Pin'}
                </button>
                <button
                  className="mt-2 text-xs text-blue-600 hover:underline"
                  onClick={() => {
                    setFollowUpFor(ans.id);
                    setFollowUpInput('');
                  }}
                >
                  Follow up
                </button>
                {/* Follow-up input */}
                {followUpFor === ans.id && (
                  <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-300 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-700">Context:</span>
                      <span className="text-xs text-gray-700">Q: {ans.question}</span>
                      <span className="text-xs text-gray-500 italic truncate max-w-xs" title={ans.analysis}>A: {ans.quote} — {ans.analysis.slice(0, 60)}{ans.analysis.length > 60 ? '…' : ''}</span>
                      <span className="ml-1 text-xs text-gray-400" title="Your follow-up will use this answer as context.">
                        <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg>
                      </span>
                    </div>
                  </div>
                )}
                {followUpFor === ans.id && (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleFollowUp(ans.id);
                    }}
                    className="mt-2 flex gap-2"
                  >
                    <input
                      type="text"
                      className="flex-1 border rounded px-2 py-1 text-xs"
                      placeholder="Ask a follow-up question..."
                      value={followUpInput}
                      onChange={e => setFollowUpInput(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">Ask</button>
                    <button type="button" className="text-xs text-gray-500 ml-1" onClick={() => setFollowUpFor(null)}>Cancel</button>
                  </form>
                )}
                {/* Render follow-ups */}
                {ans.followUps && ans.followUps.length > 0 && (
                  <div className="mt-4 ml-4 border-l-2 border-blue-100 pl-4 space-y-4">
                    {ans.followUps.map(fu => (
                      <div key={fu.id} className="bg-blue-50 border rounded p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mr-2" title="This answer is a follow-up and uses previous context">Context</span>
                          <span className="font-semibold text-blue-700">Follow-up: {fu.question}</span>
                        </div>
                        {/* J5: Show summary options for follow-up */}
                        <div className="mb-1 text-xs text-gray-500">
                          <span>Summary: {fu.summaryOptions.tone}, {fu.summaryOptions.length}{fu.summaryOptions.focus ? `, Focus: ${fu.summaryOptions.focus}` : ''}, LLM: {fu.summaryOptions.llm || 'GPT-4'}</span>
                        </div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-semibold text-gray-700 flex items-center" aria-label="Quote">
                            <svg className="w-4 h-4 text-purple-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17a4 4 0 01-4-4V7a4 4 0 014-4h3a4 4 0 014 4v6a4 4 0 01-4 4H7zm7 0a4 4 0 01-4-4V7a4 4 0 014-4h3a4 4 0 014 4v6a4 4 0 01-4 4h-3z" /></svg>
                            Quote:
                          </span>
                          <span className="italic text-purple-700 ml-1" title="Direct excerpt from cited source">{fu.quote}</span>
                        </div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-semibold text-gray-700 flex items-center" aria-label="Analysis">
                            <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 113 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>
                            Analysis:
                          </span>
                          <span className="ml-1" title="AI-generated analysis and context">{fu.analysis}</span>
                          <span className="ml-1 text-xs text-gray-400" title="What is analysis?"> <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg></span>
                        </div>
                        {fu.critique ? (
                          <div className="mb-1 flex items-center gap-2 bg-yellow-50 border-l-4 border-yellow-400 rounded p-2" aria-label="Critique">
                            <span className="font-semibold text-yellow-800 flex items-center">
                              <svg className="w-4 h-4 text-yellow-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                              Critique:
                            </span>
                            <span className="ml-1 text-yellow-900" title="Optional critique or alternative perspective">{fu.critique}</span>
                            <span className="ml-1 text-xs text-gray-400" title="What is critique?"> <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor">i</text></svg></span>
                          </div>
                        ) : (
                          <div className="mb-1 flex items-center gap-2 text-xs text-gray-400" aria-label="No critique provided">
                            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
                            No critique provided
                          </div>
                        )}
                        {/* J4: Show deep-linked citations for follow-ups */}
                        <div className="mb-1 flex flex-wrap gap-2 items-center">
                          <span className="font-semibold text-gray-700">Cited Source{fu.citations.length > 1 ? 's' : ''}:</span>
                          {fu.citations.map((c, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <button
                                className="text-xs text-blue-700 underline hover:text-blue-900 px-1 py-0.5 rounded bg-blue-50 border border-blue-100"
                                onClick={e => {
                                  e.preventDefault();
                                  setShowCitationInfo(`${c.source}-p${c.paragraph}-l${c.line}`);
                                  setTimeout(() => setShowCitationInfo(null), 2000);
                                }}
                                title={`Go to ${c.source}, paragraph ${c.paragraph}, line ${c.line}`}
                              >
                                {c.source} (¶{c.paragraph}, ℓ{c.line})
                              </button>
                              <span
                                className={`text-xs font-semibold px-1 rounded ${c.confidenceScore !== undefined ?
                                  c.confidenceScore > 0.85 ? 'bg-green-100 text-green-700 border border-green-200' :
                                  c.confidenceScore > 0.7 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                  'bg-red-100 text-red-700 border border-red-200' : ''}`}
                                title={`Citation confidence: ${c.confidenceScore !== undefined ? (c.confidenceScore * 100).toFixed(0) + '%' : 'N/A'}`}
                              >
                                {c.confidenceScore !== undefined ? `${(c.confidenceScore * 100).toFixed(0)}%` : 'N/A'}
                              </span>
                            </span>
                          ))}
                          {showCitationInfo && fu.citations.some(c => `${c.source}-p${c.paragraph}-l${c.line}` === showCitationInfo) && (
                            <span className="ml-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">Deep-link: Would jump to cited paragraph/line in source</span>
                          )}
                        </div>
                        <button
                          className={`ml-2 text-xs ${pinnedIds.includes(fu.id) ? 'text-yellow-600' : 'text-gray-400'} hover:underline`}
                          onClick={() => togglePin(fu.id)}
                          title={pinnedIds.includes(fu.id) ? 'Unpin insight' : 'Pin insight'}
                        >
                          {pinnedIds.includes(fu.id) ? 'Unpin' : 'Pin'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {ans.followUpSuggestions && ans.followUpSuggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500">Suggested follow-ups:</span>
                    {ans.followUpSuggestions.map((s, i) => (
                      <button
                        key={i}
                        className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5 hover:bg-blue-200 border border-blue-200"
                        onClick={() => {
                          setFollowUpFor(ans.id);
                          setFollowUpInput(s);
                        }}
                        type="button"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        </section>

        {/* Enhanced Notes & Blocks Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Notes & Blocks</h2>
            <p className="text-sm text-gray-600 mt-1">Notion-style editor for organizing insights</p>
          </div>
          <div className="p-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Block Editor Coming Soon</h3>
              <p className="text-gray-600 mb-4">Create rich notes with drag-and-drop blocks, slash commands, and AI integration</p>
              <div className="flex justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Drag & Drop</span>
                </span>
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Slash Commands</span>
                </span>
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>AI Integration</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Source View */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Source View</h2>
                <p className="text-sm text-gray-600 mt-1">Click citations to highlight source locations</p>
              </div>
              {highlightedSource && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                    Highlighting: {highlightedSource.source}
                  </span>
                  <button
                    onClick={() => setHighlightedSource(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            <div ref={sourceViewRef} className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              {highlightedSource && mockSourceText[highlightedSource.source] ? (
                <div className="space-y-4">
                  {mockSourceText[highlightedSource.source].map((para, pIdx) => (
                    <div key={pIdx} className="space-y-1">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Paragraph {pIdx + 1}</div>
                      {para.split('\n').map((line, lIdx) => {
                        const isHighlight = highlightedSource && pIdx + 1 === highlightedSource.paragraph && lIdx + 1 === highlightedSource.line;
                        return (
                          <div
                            key={lIdx}
                            className={`px-3 py-2 text-sm leading-relaxed rounded transition-all duration-300 relative ${
                              isHighlight
                                ? 'bg-yellow-200 border-l-4 border-yellow-500 font-medium shadow-lg animate-pulse'
                                : 'hover:bg-white'
                            }`}
                            style={isHighlight ? { scrollMarginTop: 32 } : {}}
                            ref={isHighlight ? (el => { if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }) : undefined}
                            data-pulse={isHighlight ? highlightPulseKey : undefined}
                          >
                            <span className="text-xs text-gray-400 mr-2">L{lIdx + 1}:</span>
                            {line}
                            {isHighlight && showCitedBadge && (
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded shadow-lg animate-fade-in-out" style={{zIndex: 10}}>
                                Cited by Q&A
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-2">No source selected</p>
                  <p className="text-sm text-gray-400">Click on any citation in the Q&A section to highlight the source location</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      {/* Add Notebook/Notes drop zone at the bottom of the main content */}
      <div
        onDragOver={e => { e.preventDefault(); setNotebookDropActive(true); }}
        onDragLeave={() => setNotebookDropActive(false)}
        onDrop={e => {
          e.preventDefault();
          setNotebookDropActive(false);
          if (draggedAnswer) {
            setNotebookEntries(entries => [draggedAnswer, ...entries]);
            setShowDropSuccess(true);
            setTimeout(() => setShowDropSuccess(false), 1500);
          }
          setDraggedAnswer(null);
        }}
        className={`fixed bottom-8 right-8 w-72 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 shadow-lg bg-white z-50 ${notebookDropActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400'}`}
        style={{ pointerEvents: 'auto' }}
      >
        <span className="text-lg font-semibold text-blue-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 113 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>
          Drop here to add to Notebook/Notes
        </span>
        {showDropSuccess && (
          <span className="mt-2 text-green-700 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1 animate-fade-in-out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Added!
          </span>
        )}
      </div>
      {/* Optionally, show a mock Notebook/Notes list for demo */}
      {notebookEntries.length > 0 && (
        <div className="fixed bottom-36 right-8 w-72 max-h-64 overflow-y-auto rounded-xl border bg-white shadow-lg z-40">
          <div className="px-4 py-2 border-b font-semibold text-blue-800">Notebook/Notes</div>
          <ul className="divide-y">
            {notebookEntries.map(entry => (
              <li key={entry.id} className="px-4 py-2 text-sm">
                <span className="font-semibold text-blue-700">Q:</span> {entry.question}
                <div className="text-xs text-gray-500 mt-1">{entry.quote}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JunctionSemanticSearchWorkflow; 