import { notFound } from 'next/navigation';

const notebookContent: Record<string, { title: string; content: JSX.Element }> = {
  demo: {
    title: 'Demo Notebook',
    content: (
      <>
        <h2 className="text-2xl font-bold mb-4">Welcome to the Demo Notebook!</h2>
        <p className="mb-2">This is a fully interactive demo notebook. Here you can:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Organize notes into blocks</li>
          <li>Use slash commands to add tables, kanban boards, and more</li>
          <li>Tag, comment, and collaborate in real time</li>
        </ul>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
          <strong>Tip:</strong> Try editing, dragging, and formatting blocks below!
        </div>
        <div className="mb-2">
          <h3 className="font-semibold">Sample Block</h3>
          <p>This is a sample text block. You can <b>bold</b>, <i>italicize</i>, or <code>add code</code>.</p>
        </div>
        <div className="mb-2">
          <h3 className="font-semibold">Kanban Board (Demo)</h3>
          <div className="flex gap-4">
            <div className="bg-gray-100 p-2 rounded w-32">
              <div className="font-bold mb-1">To Do</div>
              <div className="bg-white p-1 rounded mb-1">Try the demo</div>
              <div className="bg-white p-1 rounded">Explore blocks</div>
            </div>
            <div className="bg-gray-100 p-2 rounded w-32">
              <div className="font-bold mb-1">In Progress</div>
              <div className="bg-white p-1 rounded">Add a note</div>
            </div>
            <div className="bg-gray-100 p-2 rounded w-32">
              <div className="font-bold mb-1">Done</div>
              <div className="bg-white p-1 rounded">View this page</div>
            </div>
          </div>
        </div>
      </>
    ),
  },
  '1': {
    title: 'AI Research Notes',
    content: (
      <>
        <h2 className="text-2xl font-bold mb-4">AI Research Notes</h2>
        <p className="mb-2">Key findings and summaries from recent AI research papers:</p>
        <ul className="list-disc ml-6 mb-4">
          <li><b>Semantic Memory Models:</b> Enable context-aware retrieval and reasoning.</li>
          <li><b>LLM Evaluation:</b> GPT-4 outperforms previous models in reasoning and summarization.</li>
          <li><b>Open Problems:</b> Explainability, memory efficiency, and real-time adaptation.</li>
        </ul>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
          <strong>Quote:</strong> "Semantic search enables more effective knowledge discovery." (SampleDoc.pdf)
        </div>
        <div className="mb-2">
          <h3 className="font-semibold">Table: Model Comparison</h3>
          <table className="w-full text-sm border mb-2">
            <thead>
              <tr>
                <th className="border px-2 py-1">Model</th>
                <th className="border px-2 py-1">Params</th>
                <th className="border px-2 py-1">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border px-2 py-1">GPT-4</td><td className="border px-2 py-1">175B</td><td className="border px-2 py-1">92</td></tr>
              <tr><td className="border px-2 py-1">Claude</td><td className="border px-2 py-1">52B</td><td className="border px-2 py-1">88</td></tr>
              <tr><td className="border px-2 py-1">Gemini</td><td className="border px-2 py-1">Unknown</td><td className="border px-2 py-1">85</td></tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  '2': {
    title: 'Personal Journal',
    content: (
      <>
        <h2 className="text-2xl font-bold mb-4">Personal Journal</h2>
        <p className="mb-2">A daily log of thoughts, ideas, and reflections.</p>
        <div className="mb-2">
          <h3 className="font-semibold">Today</h3>
          <p>Explored new ideas in semantic search. Felt inspired by recent breakthroughs in AI memory systems. Need to follow up on the project plan tomorrow.</p>
        </div>
        <div className="mb-2">
          <h3 className="font-semibold">Yesterday</h3>
          <p>Had a productive meeting with the team. Discussed the importance of explainability in AI models.</p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-4">
          <strong>Reflection:</strong> "Progress is made one note at a time."
        </div>
      </>
    ),
  },
  '3': {
    title: 'Project X Docs',
    content: (
      <>
        <h2 className="text-2xl font-bold mb-4">Project X Docs</h2>
        <p className="mb-2">Documentation and planning for Project X.</p>
        <div className="mb-2">
          <h3 className="font-semibold">Overview</h3>
          <p>Project X aims to build a next-generation semantic research platform. Key milestones include:</p>
          <ul className="list-disc ml-6">
            <li>Design system architecture</li>
            <li>Implement semantic Q&A</li>
            <li>Integrate with Ntu platform</li>
          </ul>
        </div>
        <div className="mb-2">
          <h3 className="font-semibold">Next Steps</h3>
          <ol className="list-decimal ml-6">
            <li>Finalize requirements</li>
            <li>Start prototype development</li>
            <li>Schedule team review</li>
          </ol>
        </div>
        <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded mb-4">
          <strong>Note:</strong> "Integration with Junction is a top priority."
        </div>
      </>
    ),
  },
};

export default function NotebookDemoPage({ params }: { params: { id: string } }) {
  const notebook = notebookContent[params.id];
  if (!notebook) return notFound();
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{notebook.title}</h1>
      {notebook.content}
    </div>
  );
} 