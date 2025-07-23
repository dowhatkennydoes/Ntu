import React, { useState, useRef } from 'react';

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

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-2">Junction – Semantic Research & Note-Taking</h1>
        <p className="text-gray-600">Upload, search, ask, and organize knowledge with AI-powered blocks and Q&A.</p>
      </header>

      <main className="ml-0 lg:ml-64">
        {/* Knowledge Sources (Upload, List, Manage) */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Knowledge Sources</h2>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
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
            <p className="text-sm text-gray-600 mb-2">
              Drag files here or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                browse to upload
              </button>
            </p>
            <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT, MD files</p>
          </div>
          {/* Uploaded files list */}
          {sources.length > 0 && (
            <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
              {sources.map(src => (
                <div key={src.id} className="flex items-center justify-between border rounded p-2 bg-white">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800 truncate">{src.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({src.type}, {formatFileSize(src.size)})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Q&A (Semantic Search, Ask, Answers) */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Q&A</h2>
          {/* J5: Summary controls */}
          <div className="flex flex-wrap gap-4 mb-4 items-end">
            <div>
              <label className="block text-xs font-semibold mb-1">Tone</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={summaryOptions.tone}
                onChange={e => setSummaryOptions(opt => ({ ...opt, tone: e.target.value }))}
              >
                <option value="Analytical">Analytical</option>
                <option value="Comprehensive">Comprehensive</option>
                <option value="Concise">Concise</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Length</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={summaryOptions.length}
                onChange={e => setSummaryOptions(opt => ({ ...opt, length: e.target.value }))}
              >
                <option value="Short">Short</option>
                <option value="Medium">Medium</option>
                <option value="Long">Long</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Focus (optional)</label>
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm"
                placeholder="e.g. privacy, methodology"
                value={summaryOptions.focus}
                onChange={e => setSummaryOptions(opt => ({ ...opt, focus: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">LLM</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={summaryOptions.llm}
                onChange={e => setSummaryOptions(opt => ({ ...opt, llm: e.target.value }))}
              >
                <option value="GPT-4">GPT-4</option>
                <option value="Claude">Claude</option>
                <option value="Gemini">Gemini</option>
              </select>
            </div>
            {/* J18: Extractive/generative toggle */}
            <div>
              <label className="block text-xs font-semibold mb-1">Answer Style</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={answerStyle}
                onChange={e => setAnswerStyle(e.target.value as 'extractive' | 'generative')}
              >
                <option value="extractive">Extractive</option>
                <option value="generative">Generative</option>
              </select>
            </div>
          </div>
          <form onSubmit={handleAsk} className="flex gap-2 mb-4">
            {/* J17: Entity autocomplete (mock) */}
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2"
              placeholder="Ask a question about your knowledge sources..."
              value={input}
              onChange={e => {
                setInput(e.target.value);
                // Show entity suggestions if user types '@'
                if (e.target.value.includes('@')) {
                  setEntityAutocomplete(entitySuggestions.filter(s => s.toLowerCase().includes(e.target.value.split('@').pop()?.toLowerCase() || '')));
                } else {
                  setEntityAutocomplete([]);
                }
              }}
            />
            {entityAutocomplete.length > 0 && (
              <div className="absolute bg-white border rounded shadow z-10 mt-10 w-64">
                {entityAutocomplete.map((s, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                    onClick={() => {
                      setInput(input.replace(/@[^ ]*$/, '@' + s + ' '));
                      setEntityAutocomplete([]);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ask</button>
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
              <div key={ans.id} className="bg-white border rounded p-4 shadow-sm relative group">
                {/* J15: Drag handle (mock) */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 cursor-grab text-gray-300 group-hover:text-blue-400" title="Drag to Notebook/Notes">≡</div>
                <div className="font-semibold text-blue-800 mb-1">Q: {ans.question}</div>
                {/* J5: Show summary options used */}
                <div className="mb-2 text-xs text-gray-500">
                  <span>Summary: {ans.summaryOptions.tone}, {ans.summaryOptions.length}{ans.summaryOptions.focus ? `, Focus: ${ans.summaryOptions.focus}` : ''}, LLM: {ans.summaryOptions.llm || 'GPT-4'}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Quote:</span>
                  <span className="italic text-purple-700 ml-2">{ans.quote}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Analysis:</span>
                  <span className="ml-2">{ans.analysis}</span>
                </div>
                {ans.critique && (
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Critique:</span>
                    <span className="ml-2">{ans.critique}</span>
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
                          setShowCitationInfo(`${c.source}-p${c.paragraph}-l${c.line}`);
                          setHighlightedSource({ source: c.source, paragraph: c.paragraph, line: c.line });
                          setTimeout(() => setShowCitationInfo(null), 2000);
                          setTimeout(() => setHighlightedSource(null), 2000);
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
                    <span key={i} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">{tag}</span>
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
                  />
                </div>
                {/* J14: Commenting UI */}
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Comments:</span>
                  <div className="space-y-1">
                    {(answerComments[ans.id] || []).map((c, i) => (
                      <div key={i} className="text-xs bg-gray-100 rounded px-2 py-1">{c}</div>
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
                      placeholder="Add comment"
                      value={commentInput[ans.id] || ''}
                      onChange={e => setCommentInput(ci => ({ ...ci, [ans.id]: e.target.value }))}
                    />
                    <button type="submit" className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">Add</button>
                  </form>
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
                        <div className="font-semibold text-blue-700 mb-1">Follow-up: {fu.question}</div>
                        {/* J5: Show summary options for follow-up */}
                        <div className="mb-1 text-xs text-gray-500">
                          <span>Summary: {fu.summaryOptions.tone}, {fu.summaryOptions.length}{fu.summaryOptions.focus ? `, Focus: ${fu.summaryOptions.focus}` : ''}, LLM: {fu.summaryOptions.llm || 'GPT-4'}</span>
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold text-gray-700">Quote:</span>
                          <span className="italic text-purple-700 ml-2">{fu.quote}</span>
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold text-gray-700">Analysis:</span>
                          <span className="ml-2">{fu.analysis}</span>
                        </div>
                        {fu.critique && (
                          <div className="mb-1">
                            <span className="font-semibold text-gray-700">Critique:</span>
                            <span className="ml-2">{fu.critique}</span>
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
        </section>

        {/* Notes/Blocks (Notion-style, drag-and-drop, slash commands) */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Notes & Blocks</h2>
          <div className="bg-white border rounded p-4 text-gray-500">[Notion-style block editor will go here]</div>
        </section>

        {/* Source View (Highlight Sync) */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Source View (Highlight Sync)</h2>
          <div ref={sourceViewRef} className="border rounded bg-white p-4 max-h-64 overflow-y-auto text-xs">
            {highlightedSource && mockSourceText[highlightedSource.source] ? (
              <>
                {mockSourceText[highlightedSource.source].map((para, pIdx) => (
                  <div key={pIdx} className="mb-2">
                    {para.split('\n').map((line, lIdx) => {
                      const isHighlight =
                        pIdx + 1 === highlightedSource.paragraph && lIdx + 1 === highlightedSource.line;
                      return (
                        <div
                          key={lIdx}
                          className={
                            'px-2 py-1 rounded ' +
                            (isHighlight ? 'bg-yellow-200 font-bold animate-pulse' : '')
                          }
                          style={isHighlight ? { scrollMarginTop: 32 } : {}}
                          ref={isHighlight ? (el => { if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }) : undefined}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </>
            ) : (
              <div className="text-gray-400">Click a citation to view and highlight the cited source location.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default JunctionSemanticSearchWorkflow; 