"use client";
import { useState, useRef, use } from 'react';
import { notFound } from 'next/navigation';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// --- Block Types ---
const BLOCK_TYPES = [
  { type: 'text', label: 'Text' },
  { type: 'heading', label: 'Heading' },
  { type: 'list', label: 'List' },
  { type: 'table', label: 'Table' },
  { type: 'kanban', label: 'Kanban Board' },
  { type: 'code', label: 'Code' },
  { type: 'callout', label: 'Callout' },
  { type: 'quote', label: 'Quote' },
  { type: 'divider', label: 'Divider' },
  { type: 'toggle', label: 'Toggle' },
  { type: 'section', label: 'Section' },
  { type: 'linked-db', label: 'Linked Database View' },
];

const TEMPLATES = [
  { name: 'Meeting Notes', blocks: [
    { type: 'heading', content: 'Meeting Notes', children: [] },
    { type: 'text', content: 'Date: ', children: [] },
    { type: 'text', content: 'Attendees: ', children: [] },
    { type: 'section', content: 'Agenda', children: [
      { type: 'list', content: 'Discuss project status', children: [] },
      { type: 'list', content: 'Review action items', children: [] },
    ] },
    { type: 'section', content: 'Notes', children: [
      { type: 'text', content: '', children: [] },
    ] },
  ] },
  { name: 'Research Outline', blocks: [
    { type: 'heading', content: 'Research Outline', children: [] },
    { type: 'section', content: 'Background', children: [
      { type: 'text', content: '', children: [] },
    ] },
    { type: 'section', content: 'Findings', children: [
      { type: 'text', content: '', children: [] },
    ] },
    { type: 'section', content: 'Next Steps', children: [
      { type: 'list', content: '', children: [] },
    ] },
  ] },
];

function createBlock(type = 'text', content = '', ai = false, children = []) {
  return {
    id: Math.random().toString(36).slice(2),
    type,
    content,
    children,
    ai,
    open: true, // for toggle/section
    comments: [],
    versions: [],
  };
}

const DEMO_BLOCKS = [
  { id: 'b1', type: 'heading', content: 'Welcome to the Demo Notebook!', children: [] },
  { id: 'b2', type: 'text', content: 'This is a fully interactive demo notebook. Try editing, dragging, and formatting blocks below!', children: [] },
  { id: 'b3', type: 'kanban', content: '', children: [] },
  { id: 'b4', type: 'table', content: '', children: [] },
];

function BlockEditor({ initialBlocks, snippets, setSnippets, filterTag }: { initialBlocks: any[], snippets: any[], setSnippets: (s: any[]) => void, filterTag: string }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [slashMenu, setSlashMenu] = useState<{ open: boolean; index: number | null; filter: string }>({ open: false, index: null, filter: '' });
  const [formatBar, setFormatBar] = useState<{ show: boolean; blockId: string | null }>({ show: false, blockId: null });
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [showVersions, setShowVersions] = useState<Record<string, boolean>>({});
  const [aiMenu, setAiMenu] = useState<Record<string, boolean>>({});
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({});
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const inputRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [aiCoWriteMenu, setAiCoWriteMenu] = useState<Record<string, boolean>>({});
  const [linkToMemory, setLinkToMemory] = useState<{ blockId: string, selection: string } | null>(null);
  const [showMemorySearch, setShowMemorySearch] = useState<{ blockId: string, atPos: number } | null>(null);
  const [memorySearchInput, setMemorySearchInput] = useState('');
  const mockMemories = [
    { id: 'm1', label: 'Meeting Memory', preview: 'Discussed semantic search and privacy.' },
    { id: 'm2', label: 'Action Item', preview: 'Follow up on AI co-writing.' },
    { id: 'm3', label: 'Research Note', preview: 'LLM evaluation and open problems.' },
  ];
  const [explainEli5, setExplainEli5] = useState<{ blockId: string, selection: string } | null>(null);

  // --- Drag and Drop ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over?.id);
      setBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  function handleAddTemplate(blocksToAdd: any[]) {
    setBlocks(bs => [...bs, ...blocksToAdd.map(b => ({ ...createBlock(b.type, b.content, false, b.children || []) }))]);
    setShowTemplateMenu(false);
  }

  // --- Block Rendering ---
  function renderBlock(block: any, idx: number, parentId?: string) {
    // Section block (collapsible group)
    if (block.type === 'section') {
      const isOpen = sectionOpen[block.id] !== false;
      return (
        <div key={block.id} className="mb-4 border rounded bg-gray-50">
          <div className="flex items-center px-2 py-1 cursor-pointer select-none" onClick={() => setSectionOpen(s => ({ ...s, [block.id]: !isOpen }))}>
            <span className="mr-2">{isOpen ? '▼' : '▶'}</span>
            <span className="font-semibold">{block.content || 'Section'}</span>
            <span className="ml-auto text-xs text-gray-400">Section</span>
          </div>
          {isOpen && (
            <div className="pl-6 pt-2">
              {(block.children || []).map((child: any, cidx: number) => renderBlock(child, cidx, block.id))}
              <button className="text-xs text-blue-500 hover:underline mt-2" onClick={() => {
                setBlocks(bs => bs.map(b => b.id === block.id ? { ...b, children: [...(b.children || []), createBlock()] } : b));
              }}>+ Add block to section</button>
            </div>
          )}
        </div>
      );
    }
    // Linked Database View block
    if (block.type === 'linked-db') {
      return (
        <div key={block.id} className="mb-2 border rounded bg-white p-2">
          <div className="font-semibold mb-1">Linked Database View</div>
          <table className="w-full text-sm border mb-2">
            <thead>
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border px-2 py-1">Sample Row 1</td><td className="border px-2 py-1">Active</td><td className="border px-2 py-1">Today</td></tr>
              <tr><td className="border px-2 py-1">Sample Row 2</td><td className="border px-2 py-1">Done</td><td className="border px-2 py-1">Yesterday</td></tr>
            </tbody>
          </table>
        </div>
      );
    }
    // Normal block
    return (
      <div key={block.id} className="group relative mb-2 border rounded bg-white hover:shadow p-2 flex items-start" tabIndex={0}
        onKeyDown={e => {
          if (e.key === '/' && !slashMenu.open) {
            setSlashMenu({ open: true, index: idx, filter: '' });
          }
        }}
        onFocus={() => setFormatBar({ show: true, blockId: block.id })}
        onBlur={() => setTimeout(() => setFormatBar({ show: false, blockId: null }), 200)}
        onMouseUp={e => {
          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) {
            setLinkToMemory({ blockId: block.id, selection: selection.toString() });
            setExplainEli5({ blockId: block.id, selection: selection.toString() });
          }
        }}
        onKeyUp={e => {
          if (e.key === '@') {
            setShowMemorySearch({ blockId: block.id, atPos: (e.target as HTMLElement).innerText.length });
          }
        }}
      >
        {/* Drag handle */}
        <span className="cursor-grab pr-2 text-gray-400">≡</span>
        {/* AI badge */}
        {block.ai && <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">AI</span>}
        {/* Block content */}
        <BlockContent block={block} onChange={val => {
          setBlocks(bs => bs.map(b => b.id === block.id ? { ...b, content: val, versions: [...(b.versions || []), b.content] } : b));
        }} inputRef={el => (inputRefs.current[block.id] = el)}
          onToggle={() => setBlocks(bs => bs.map(b => b.id === block.id ? { ...b, open: !b.open } : b))}
        />
        {/* Format bar */}
        {formatBar.show && formatBar.blockId === block.id && ['text','heading','quote'].includes(block.type) && (
          <div className="absolute -top-8 left-10 z-20 flex gap-1 bg-white border rounded shadow p-1">
            <button className="px-1" title="Bold" onMouseDown={e => {e.preventDefault(); document.execCommand('bold');}}>B</button>
            <button className="px-1" title="Italic" onMouseDown={e => {e.preventDefault(); document.execCommand('italic');}}><i>I</i></button>
            <button className="px-1" title="Strikethrough" onMouseDown={e => {e.preventDefault(); document.execCommand('strikeThrough');}}><s>S</s></button>
            <button className="px-1" title="Code" onMouseDown={e => {e.preventDefault(); document.execCommand('insertHTML', false, '<code>'+window.getSelection()?.toString()+'</code>');}}>&lt;/&gt;</button>
          </div>
        )}
        {/* AI actions menu */}
        <div className="ml-2 relative">
          <button className="text-xs text-purple-600 border border-purple-200 rounded px-1 py-0.5" onClick={() => setAiMenu(m => ({ ...m, [block.id]: !m[block.id] }))}>AI</button>
          {aiMenu[block.id] && (
            <div className="absolute left-0 top-6 z-30 bg-white border rounded shadow p-2 w-40">
              <div className="hover:bg-blue-50 px-2 py-1 rounded cursor-pointer" onClick={() => {
                setBlocks(bs => bs.map(b => b.id === block.id ? { ...b, content: '[AI Summary] ' + b.content, ai: true } : b));
                setAiMenu(m => ({ ...m, [block.id]: false }));
              }}>Summarize</div>
              <div className="hover:bg-blue-50 px-2 py-1 rounded cursor-pointer" onClick={() => {
                setBlocks(bs => bs.map(b => b.id === block.id ? { ...b, content: '[AI Rewrite] ' + b.content, ai: true } : b));
                setAiMenu(m => ({ ...m, [block.id]: false }));
              }}>Rewrite</div>
              <div className="hover:bg-blue-50 px-2 py-1 rounded cursor-pointer" onClick={() => {
                setBlocks(bs => bs.map(b => b.id === block.id ? { ...b, content: '[AI Explanation] ' + b.content, ai: true } : b));
                setAiMenu(m => ({ ...m, [block.id]: false }));
              }}>Explain</div>
            </div>
          )}
        </div>
        {/* AI co-writing menu */}
        <div className="ml-2 relative">
          <button
            className="text-xs text-emerald-600 border border-emerald-200 rounded px-1 py-0.5"
            onClick={() => setAiCoWriteMenu(m => ({ ...m, [block.id]: !m[block.id] }))}
          >
            AI ✍️
          </button>
          {aiCoWriteMenu[block.id] && (
            <div className="absolute left-0 top-6 z-30 bg-white border rounded shadow p-2 w-40">
              <div className="hover:bg-blue-50 px-2 py-1 rounded cursor-pointer" onClick={() => {/* Show placeholder */ setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: b.content + '\n[AI continues writing...]' } : b)); setAiCoWriteMenu({ ...aiCoWriteMenu, [block.id]: false }); }}>Continue Writing</div>
              <div className="hover:bg-blue-50 px-2 py-1 rounded cursor-pointer" onClick={() => {/* Show placeholder */ setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: '[AI rewrite placeholder]\n' + b.content } : b)); setAiCoWriteMenu({ ...aiCoWriteMenu, [block.id]: false }); }}>Rewrite</div>
              <div className="hover:bg-blue-50 px-2 py-1 rounded cursor-pointer" onClick={() => {/* Show placeholder */ setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: b.content + '\n[AI outline placeholder]' } : b)); setAiCoWriteMenu({ ...aiCoWriteMenu, [block.id]: false }); }}>Outline</div>
            </div>
          )}
        </div>
        {/* Version history */}
        <div className="ml-2 relative">
          <button className="text-xs text-gray-600 border border-gray-200 rounded px-1 py-0.5" onClick={() => setShowVersions(v => ({ ...v, [block.id]: !v[block.id] }))}>⏳</button>
          {showVersions[block.id] && (
            <div className="absolute left-0 top-6 z-30 bg-white border rounded shadow p-2 w-48">
              <div className="font-semibold text-xs mb-1">Version History</div>
              {(block.versions || []).length === 0 && <div className="text-xs text-gray-400">No previous versions</div>}
              {(block.versions || []).map((ver: string, i: number) => (
                <div key={i} className="text-xs border-b last:border-b-0 px-1 py-0.5">{ver}</div>
              ))}
            </div>
          )}
        </div>
        {/* Comments */}
        <div className="ml-2 relative">
          <button className="text-xs text-blue-600 border border-blue-200 rounded px-1 py-0.5" onClick={() => setShowComments(c => ({ ...c, [block.id]: !c[block.id] }))}>💬</button>
          {showComments[block.id] && (
            <div className="absolute left-0 top-6 z-30 bg-white border rounded shadow p-2 w-56">
              <div className="font-semibold text-xs mb-1">Comments</div>
              {(block.comments || []).length === 0 && <div className="text-xs text-gray-400">No comments yet</div>}
              {(block.comments || []).map((c: string, i: number) => (
                <div key={i} className="text-xs border-b last:border-b-0 px-1 py-0.5">{c}</div>
              ))}
              <input
                className="w-full border mt-1 px-1 py-0.5 text-xs"
                placeholder="Add a comment..."
                value={commentInput[block.id] || ''}
                onChange={e => setCommentInput(ci => ({ ...ci, [block.id]: e.target.value }))}
                onKeyDown={e => {
                  if (e.key === 'Enter' && commentInput[block.id]) {
                    setBlocks(bs => bs.map(b => b.id === block.id ? { ...b, comments: [...(b.comments || []), commentInput[block.id]] } : b));
                    setCommentInput(ci => ({ ...ci, [block.id]: '' }));
                  }
                }}
              />
            </div>
          )}
        </div>
        {/* Save as Snippet */}
        <div className="ml-2 relative">
          <button className="text-xs text-yellow-600 border border-yellow-200 rounded px-1 py-0.5" onClick={() => (setSnippets as React.Dispatch<React.SetStateAction<any[]>>)((snips) => [...snips, { ...block }])}>Save as Snippet</button>
        </div>
        {/* Slash command menu */}
        {slashMenu.open && slashMenu.index === idx && (
          <div className="absolute left-10 top-8 z-10 bg-white border rounded shadow p-2 w-56">
            <input
              className="w-full border-b mb-2 px-1 py-0.5 text-sm"
              placeholder="Type to filter..."
              autoFocus
              value={slashMenu.filter}
              onChange={e => setSlashMenu(sm => ({ ...sm, filter: e.target.value }))}
              onKeyDown={e => e.stopPropagation()}
            />
            {BLOCK_TYPES.filter(bt => bt.label.toLowerCase().includes(slashMenu.filter.toLowerCase())).map(bt => (
              <div key={bt.type} className="hover:bg-blue-100 px-2 py-1 rounded cursor-pointer"
                onClick={() => {
                  setBlocks(bs => {
                    const newBlock = createBlock(bt.type);
                    const arr = [...bs];
                    arr.splice(idx + 1, 0, newBlock);
                    return arr;
                  });
                  setSlashMenu({ open: false, index: null, filter: '' });
                }}
              >
                {bt.label}
              </div>
            ))}
            {/* AI block quick add */}
            <div className="mt-2 text-xs text-gray-500">AI blocks:</div>
            <div className="hover:bg-purple-100 px-2 py-1 rounded cursor-pointer text-purple-700"
              onClick={() => {
                setBlocks(bs => {
                  const newBlock = createBlock('text', 'This is an AI-generated summary block.', true);
                  const arr = [...bs];
                  arr.splice(idx + 1, 0, newBlock);
                  return arr;
                });
                setSlashMenu({ open: false, index: null, filter: '' });
              }}
            >AI Summary Block</div>
            {/* J43: Insert snippet */}
            {snippets.length > 0 && <div className="mt-2 text-xs text-gray-500">Snippets:</div>}
            {snippets.map((snip, i) => (
              <div key={i} className="hover:bg-yellow-100 px-2 py-1 rounded cursor-pointer text-yellow-700"
                onClick={() => {
                  setBlocks(bs => {
                    const arr = [...bs];
                    arr.splice(idx + 1, 0, { ...snip, id: Math.random().toString(36).slice(2) });
                    return arr;
                  });
                  setSlashMenu({ open: false, index: null, filter: '' });
                }}
              >{snip.type.charAt(0).toUpperCase() + snip.type.slice(1)} Snippet</div>
            ))}
            {/* J47: Insert Memory Event block */}
            <div className="mt-2 text-xs text-gray-500">Special:</div>
            <div className="hover:bg-emerald-100 px-2 py-1 rounded cursor-pointer text-emerald-700"
              onClick={() => {
                setBlocks(bs => {
                  const arr = [...bs];
                  arr.splice(idx + 1, 0, createBlock('memory-event', 'Meeting with Alice (2024-07-23) — Discussed semantic search.'));
                  return arr;
                });
                setSlashMenu({ open: false, index: null, filter: '' });
              }}
            >Memory Event Block</div>
          </div>
        )}
        {/* Add block button */}
        <button className="ml-2 text-xs text-blue-500 hover:underline" onClick={() => {
          setBlocks(bs => {
            const newBlock = createBlock();
            const arr = [...bs];
            arr.splice(idx + 1, 0, newBlock);
            return arr;
          });
        }}>+ Add</button>
        {/* J49: Link to Memory tooltip */}
        {linkToMemory && linkToMemory.blockId === block.id && (
          <div className="absolute left-1/2 -top-8 z-50 bg-emerald-600 text-white px-3 py-1 rounded shadow flex items-center gap-2">
            <span>Link "{linkToMemory.selection.slice(0, 20)}{linkToMemory.selection.length > 20 ? '...' : ''}" to Memory?</span>
            <button className="ml-2 text-xs bg-white text-emerald-700 px-2 py-0.5 rounded" onClick={() => {
              setLinkToMemory(null);
              // Mock feedback
              alert('Linked to Memory!');
            }}>Link</button>
            <button className="ml-1 text-xs bg-white text-gray-700 px-2 py-0.5 rounded" onClick={() => setLinkToMemory(null)}>Cancel</button>
          </div>
        )}
        {/* J55: Memory search popup */}
        {showMemorySearch && showMemorySearch.blockId === block.id && (
          <div className="absolute left-10 top-8 z-50 bg-white border rounded shadow p-2 w-64">
            <input
              className="w-full border-b mb-2 px-1 py-0.5 text-sm"
              placeholder="Search memories..."
              value={memorySearchInput}
              onChange={e => setMemorySearchInput(e.target.value)}
              autoFocus
            />
            {mockMemories.filter(m => m.label.toLowerCase().includes(memorySearchInput.toLowerCase())).map(m => (
              <div key={m.id} className="hover:bg-emerald-100 px-2 py-1 rounded cursor-pointer"
                onClick={() => {
                  // Insert memory mention (mock)
                  alert(`Mentioned memory: ${m.label}`);
                  setShowMemorySearch(null);
                  setMemorySearchInput('');
                }}
              >
                <div className="font-semibold text-emerald-700">@{m.label}</div>
                <div className="text-xs text-gray-500">{m.preview}</div>
              </div>
            ))}
            <button className="mt-2 text-xs text-gray-500 hover:underline" onClick={() => setShowMemorySearch(null)}>Cancel</button>
          </div>
        )}
        {/* J66: Explain like I’m 5 tooltip */}
        {explainEli5 && explainEli5.blockId === block.id && (
          <div className="absolute left-1/2 -top-16 z-50 bg-yellow-500 text-white px-3 py-1 rounded shadow flex items-center gap-2">
            <span>Explain "{explainEli5.selection.slice(0, 20)}{explainEli5.selection.length > 20 ? '...' : ''}" like I’m 5?</span>
            <button className="ml-2 text-xs bg-white text-yellow-700 px-2 py-0.5 rounded" onClick={() => {
              alert('Eli5: ' + explainEli5.selection + ' means: It is a simple way to understand or do something.');
              setExplainEli5(null);
            }}>Explain</button>
            <button className="ml-1 text-xs bg-white text-gray-700 px-2 py-0.5 rounded" onClick={() => setExplainEli5(null)}>Cancel</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button className="border rounded px-3 py-1 text-sm bg-gray-50 hover:bg-blue-50" onClick={() => setShowTemplateMenu(m => !m)}>
          + Templates
        </button>
        {showTemplateMenu && (
          <div className="absolute right-8 top-20 z-40 bg-white border rounded shadow p-2 w-64">
            <div className="font-semibold mb-2">Insert Template</div>
            {TEMPLATES.map(t => (
              <div key={t.name} className="hover:bg-blue-100 px-2 py-1 rounded cursor-pointer" onClick={() => handleAddTemplate(t.blocks)}>{t.name}</div>
            ))}
          </div>
        )}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.filter(b => !filterTag || (b.content && b.content.toLowerCase().includes(filterTag.toLowerCase()))).map((block, idx) => renderBlock(block, idx))}
        </SortableContext>
      </DndContext>
    </>
  );
}

function BlockContent({ block, onChange, inputRef, onToggle }: { block: any, onChange: (val: string) => void, inputRef: (el: HTMLDivElement | null) => void, onToggle?: () => void }) {
  if (block.type === 'heading') {
    return <div
      ref={inputRef}
      contentEditable
      suppressContentEditableWarning
      className="text-xl font-bold outline-none w-full"
      onInput={e => onChange((e.target as HTMLDivElement).innerText)}
      tabIndex={0}
    >{block.content}</div>;
  }
  if (block.type === 'text') {
    return <div
      ref={inputRef}
      contentEditable
      suppressContentEditableWarning
      className="outline-none w-full"
      onInput={e => onChange((e.target as HTMLDivElement).innerText)}
      tabIndex={0}
    >{block.content}</div>;
  }
  if (block.type === 'list') {
    return <ul className="list-disc ml-6">
      <li contentEditable suppressContentEditableWarning className="outline-none" onInput={e => onChange((e.target as HTMLLIElement).innerText)}>{block.content || 'List item'}</li>
    </ul>;
  }
  if (block.type === 'table') {
    return (
      <table className="w-full text-sm border mb-2">
        <thead>
          <tr>
            <th className="border px-2 py-1">Column 1</th>
            <th className="border px-2 py-1">Column 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1" contentEditable suppressContentEditableWarning onInput={e => onChange((e.target as HTMLTableCellElement).innerText)}>{block.content || 'Cell 1'}</td>
            <td className="border px-2 py-1">Cell 2</td>
          </tr>
        </tbody>
      </table>
    );
  }
  if (block.type === 'kanban') {
    return (
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
    );
  }
  if (block.type === 'callout') {
    return <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded flex items-center">
      <span className="mr-2">💡</span>
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        className="outline-none w-full"
        onInput={e => onChange((e.target as HTMLDivElement).innerText)}
        tabIndex={0}
      >{block.content || 'Callout block'}</div>
    </div>;
  }
  if (block.type === 'quote') {
    return <blockquote
      contentEditable
      suppressContentEditableWarning
      className="border-l-4 border-gray-400 pl-4 italic text-gray-700 outline-none w-full"
      onInput={e => onChange((e.target as HTMLQuoteElement).innerText)}
      tabIndex={0}
    >{block.content || 'Quote block'}</blockquote>;
  }
  if (block.type === 'divider') {
    return <hr className="my-2 border-t-2 border-gray-200" />;
  }
  if (block.type === 'toggle') {
    return <div className="w-full">
      <button className="font-semibold text-left w-full" onClick={onToggle}>
        <span className="mr-2">{block.open ? '▼' : '▶'}</span>
        {block.content || 'Toggle block'}
      </button>
      {block.open && <div className="ml-6 mt-2 text-gray-700">(Toggle content goes here)</div>}
    </div>;
  }
  if (block.type === 'code') {
    return <pre contentEditable suppressContentEditableWarning className="bg-gray-900 text-white p-2 rounded outline-none w-full" onInput={e => onChange((e.target as HTMLPreElement).innerText)}>{block.content || 'console.log("Hello, world!");'}</pre>;
  }
  if (block.type === 'memory-event') {
    return <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded text-emerald-900 text-sm font-mono">{block.content}</div>;
  }
  return null;
}

function NotebookDemoContent({ id }: { id: string }) {
  // All React hooks must be called before any conditional returns
  // J42: Mock real-time collaboration state
  const [collaborators] = useState([
    { id: 'u1', name: 'Alice', avatar: '👩‍💻', status: 'online', cursor: { x: 100, y: 200 } },
    { id: 'u2', name: 'Bob', avatar: '👨‍💻', status: 'online', cursor: { x: 300, y: 150 } },
    { id: 'u3', name: 'Charlie', avatar: '👩‍🔬', status: 'away', cursor: null },
  ]);

  const [snippets, setSnippets] = useState([
    { id: 's1', title: 'AI Co-writing Tips', content: 'Use /ai to get writing suggestions...', tags: ['ai', 'writing'] },
    { id: 's2', title: 'Meeting Template', content: '## Agenda\n1. Review...', tags: ['meeting', 'template'] },
  ]);

  const [filterTag, setFilterTag] = useState('');

  // J64: Semantic Q&A for this page
  const [showAskModal, setShowAskModal] = useState(false);
  const [askInput, setAskInput] = useState('');
  const [pageAnswers, setPageAnswers] = useState<{ question: string; answer: string }[]>([]);

  // J44: Daily Notes toggle
  const [dailyNotes, setDailyNotes] = useState(false);

  // J45: Tagging and filtering
  const [tags, setTags] = useState<string[]>(['research', 'ai']);
  const [tagInput, setTagInput] = useState('');

  // J46: Inject as Memory
  const [showMemoryConfirm, setShowMemoryConfirm] = useState(false);
  const [memoryInjected, setMemoryInjected] = useState(false);

  // J48: Backlinks (mock)
  const [backlinks] = useState([
    { id: 'm1', title: 'Memory: Project Kickoff', type: 'memory' },
    { id: 'p2', title: 'Notebook: AI Research Notes', type: 'page' },
  ]);

  // J50: Mini-map/graph view
  const [showGraph, setShowGraph] = useState(false);

  // J52: Clone/duplicate page (mock)
  const [cloneFeedback, setCloneFeedback] = useState(false);

  // J53: Page state (decay, fork, archive)
  const [pageState, setPageState] = useState<'active' | 'decaying' | 'forked' | 'archived'>('active');

  // J54: Recall in Mere
  const [recallFeedback, setRecallFeedback] = useState(false);

  // J56: Memory connections (mock)
  const [memoryConnections] = useState([
    { id: 'm1', label: 'Meeting Memory', preview: 'Discussed semantic search and privacy.' },
    { id: 'm2', label: 'Action Item', preview: 'Follow up on AI co-writing.' },
  ]);

  // J57: Sync indicator
  const [isSynced] = useState(true);

  // J58: Merge Views modal
  const [showMergeView, setShowMergeView] = useState(false);

  // J59: AI notebook recommendation
  const [showNotebookRec, setShowNotebookRec] = useState(true);
  // J63: Flashcard/quiz/summary modal
  const [showTransformModal, setShowTransformModal] = useState(false);
  const [transformType, setTransformType] = useState<'flashcard' | 'quiz' | 'summary' | null>(null);

  // J65: Critique Mode modal
  const [showCritique, setShowCritique] = useState(false);
  // J67: Contradiction highlights
  const [showContradictions, setShowContradictions] = useState(false);
  // J68: Summarize in Mere sidebar
  const [showMereSummary, setShowMereSummary] = useState(false);

  // New state for AI answer and share modal
  const [showAiAnswer, setShowAiAnswer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [privacy, setPrivacy] = useState<'private' | 'team' | 'public'>('private');

  // Mock notebook titles
  const notebookTitles: Record<string, string> = {
    'demo': 'Demo Notebook',
    'meeting-notes': 'Meeting Notes',
    'research': 'Research Notes',
  };

  const title = notebookTitles[id];
  if (!title) return notFound();

  // J51: AI tag suggestions
  const aiTagSuggestions = ['meeting', 'summary', 'action', 'NLP', 'deep learning'];

  return (
    <div className="max-w-2xl mx-auto p-8 relative">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Compliance: Zero Knowledge | PHI/FERPA</span>
      </div>
      <div className="mb-2">
        <span className="block bg-red-100 text-red-700 rounded px-2 py-1 text-xs font-medium">Warning: This page is in a Zero Knowledge or PHI/FERPA zone. AI and export features may be restricted. (placeholder)</span>
      </div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button
          className="btn btn-primary"
          onClick={() => setShowAiAnswer(v => !v)}
        >
          Ask AI about this page
        </button>
        {showAiAnswer && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800">[AI answer about this page would appear here. Placeholder for LLM integration.]</div>
        )}
        <button
          className="btn btn-secondary"
          onClick={() => setShowShareModal(true)}
        >
          Share
        </button>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded shadow-lg p-6 w-80">
              <h3 className="font-semibold mb-2">Share this page</h3>
              <div className="mb-4">
                <label className="block text-sm mb-1">Role:</label>
                <select className="w-full border rounded p-2">
                  <option>View</option>
                  <option>Comment</option>
                  <option>Edit</option>
                </select>
              </div>
              <button className="btn btn-primary w-full" onClick={() => { setShowShareModal(false); alert('Shared! (placeholder)'); }}>Share</button>
              <button className="btn btn-outline w-full mt-2" onClick={() => setShowShareModal(false)}>Cancel</button>
            </div>
          </div>
        )}
        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Team cursors active (demo)</span>
        <button
          className="btn btn-outline"
          onClick={() => setShowExportMenu(true)}
        >
          Export
        </button>
        {showExportMenu && (
          <div className="absolute z-50 bg-white border rounded shadow p-2 mt-12">
            <div className="font-semibold mb-2">Export as:</div>
            {['DOCX', 'PDF', 'Markdown', 'JSON'].map(fmt => (
              <button key={fmt} className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => { setShowExportMenu(false); alert(`Exported as ${fmt} (placeholder)`); }}>{fmt}</button>
            ))}
            <button className="block w-full text-left px-2 py-1 mt-2 text-red-500 hover:bg-gray-100" onClick={() => setShowExportMenu(false)}>Cancel</button>
          </div>
        )}
        <select
          className="border rounded p-2 text-sm"
          value={privacy}
          onChange={e => { setPrivacy(e.target.value as 'private' | 'team' | 'public'); alert(`Privacy set to ${e.target.value}`); }}
        >
          <option value="private">Private</option>
          <option value="team">Team</option>
          <option value="public">Public</option>
        </select>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <button
          className="btn btn-primary"
          onClick={() => alert('Page injected as Memory (placeholder)')}
        >
          Inject as Memory
        </button>
        <span className="text-xs text-gray-500">This page is referenced in multiple notebooks. Changes will sync everywhere.</span>
      </div>
      {/* J59: AI notebook recommendation banner */}
      {showNotebookRec && (
        <div className="mb-4 bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded flex items-center justify-between">
          <div>
            <span className="font-semibold text-indigo-700">AI Suggestion:</span> This note may belong in <span className="font-bold">Project X Docs</span>.
          </div>
          <button className="ml-4 text-xs text-indigo-700 hover:underline" onClick={() => setShowNotebookRec(false)}>Dismiss</button>
        </div>
      )}
      {/* J63: Transform note modal */}
      <div className="flex justify-end mb-2">
        <button className="border rounded px-3 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700" onClick={() => { setShowTransformModal(true); setTransformType(null); }}>
          Turn Note Into...
        </button>
      </div>
      {showTransformModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowTransformModal(false)}>✕</button>
            <div className="font-semibold mb-2">Transform Note</div>
            <div className="flex gap-2 mb-4">
              <button className={`px-3 py-1 rounded ${transformType === 'flashcard' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`} onClick={() => setTransformType('flashcard')}>Flashcards</button>
              <button className={`px-3 py-1 rounded ${transformType === 'quiz' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`} onClick={() => setTransformType('quiz')}>Quiz</button>
              <button className={`px-3 py-1 rounded ${transformType === 'summary' ? 'bg-yellow-600 text-white' : 'bg-yellow-50 text-yellow-700'}`} onClick={() => setTransformType('summary')}>Summary</button>
            </div>
            {transformType === 'flashcard' && <div className="text-sm"><b>Q:</b> What is semantic search?<br/><b>A:</b> A method for retrieving information based on meaning and context.</div>}
            {transformType === 'quiz' && <div className="text-sm"><b>1.</b> What is a key challenge in AI memory systems?<br/>a) Explainability<br/>b) Speed<br/>c) Storage<br/>d) None of the above</div>}
            {transformType === 'summary' && <div className="text-sm">Semantic search enables more effective knowledge discovery. Key challenges include explainability and real-time adaptation.</div>}
          </div>
        </div>
      )}
      {/* J42: Live cursors and presence */}
      <div className="absolute right-0 top-0 flex items-center gap-2 z-40">
        {collaborators.map(c => (
          <div key={c.id} className={`w-8 h-8 rounded-full border-2 border-white shadow -mr-2 flex items-center justify-center bg-purple-500`}
            title={c.name}
          >
            <span className="text-white font-bold">{c.name[0]}</span>
          </div>
        ))}
        <span className="text-xs text-gray-500 ml-2">{collaborators.length} online</span>
      </div>
      {/* J44: Daily Notes toggle */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" checked={dailyNotes} onChange={e => setDailyNotes(e.target.checked)} />
            Daily Notes
          </label>
          {/* J45: Tagging UI */}
          <div className="flex items-center gap-1 ml-4">
            {tags.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs mr-1 flex items-center">
                {tag}
                <button className="ml-1 text-xs" onClick={() => setTags(ts => ts.filter(t => t !== tag))}>×</button>
              </span>
            ))}
            <input
              className="border rounded px-1 py-0.5 text-xs w-20"
              placeholder="Add tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && tagInput) {
                  setTags(ts => [...ts, tagInput]);
                  setTagInput('');
                }
              }}
            />
            {/* J51: AI tag suggestions */}
            {aiTagSuggestions.map(sug => (
              <button key={sug} className="ml-1 text-xs bg-emerald-100 text-emerald-700 px-1 rounded" onClick={() => setTags(ts => ts.includes(sug) ? ts : [...ts, sug])}>{sug}</button>
            ))}
          </div>
        </div>
        {/* J46: Inject as Memory */}
        <button className="border rounded px-3 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700" onClick={() => setShowMemoryConfirm(true)}>
          Inject as Memory
        </button>
      </div>
      {/* J45: Tag filter bar */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs text-gray-500">Filter by tag:</span>
        <input className="border rounded px-1 py-0.5 text-xs w-24" value={filterTag} onChange={e => setFilterTag(e.target.value)} placeholder="Type tag..." />
      </div>
      {/* J46: Memory injection confirmation */}
      {showMemoryConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="font-semibold mb-2">Inject this page as a Memory?</div>
            <div className="mb-4 text-sm text-gray-600">This will create a Memory object from the current page. (Mock only)</div>
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 rounded bg-gray-100" onClick={() => setShowMemoryConfirm(false)}>Cancel</button>
              <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={() => {
                setMemoryInjected(true);
                setShowMemoryConfirm(false);
                setTimeout(() => setMemoryInjected(false), 2000);
              }}>Inject</button>
            </div>
          </div>
        </div>
      )}
      {memoryInjected && <div className="fixed top-8 right-8 z-50 bg-emerald-600 text-white px-4 py-2 rounded shadow">Page injected as Memory!</div>}
      {/* J64: Enhanced Ask about this page */}
      <div className="flex justify-end mb-2">
        <button className="border rounded px-3 py-1 text-sm bg-background hover:bg-blue-50" onClick={() => setShowAskModal(true)}>
          Ask about this page
        </button>
      </div>
      {showAskModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="font-semibold mb-2">Ask a question about this page</div>
            <input
              className="w-full border rounded px-2 py-1 mb-2"
              placeholder="Type your question..."
              value={askInput}
              onChange={e => setAskInput(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 rounded bg-gray-100" onClick={() => setShowAskModal(false)}>Cancel</button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => {
                setPageAnswers(ans => [
                  { question: askInput, answer: 'AI Answer: ' + (askInput.toLowerCase().includes('privacy') ? 'This document emphasizes privacy by describing encryption and access controls.' : 'This is a mock answer about the page, generated with context.') },
                  ...ans
                ]);
                setAskInput('');
                setShowAskModal(false);
              }}>Ask</button>
            </div>
          </div>
        </div>
      )}
      {/* J64: Show answers */}
      {pageAnswers.length > 0 && (
        <div className="mb-4">
          {pageAnswers.map((a, i) => (
            <div key={i} className="border rounded bg-white dark:bg-gray-800 p-3 mb-2 shadow-soft">
              <div className="text-xs text-gray-500 mb-1">Q: {a.question}</div>
              <div className="font-semibold">{a.answer}</div>
            </div>
          ))}
        </div>
      )}
      {/* J44: Daily Notes template */}
      {dailyNotes && (
        <div className="mb-4 border-l-4 border-blue-400 bg-blue-50 p-4 rounded">
          <div className="font-bold mb-1">Daily Note ({new Date().toLocaleDateString()})</div>
          <div className="text-sm text-gray-700">Mood: <span className="italic">[Your mood]</span></div>
          <div className="text-sm text-gray-700">Highlights: <span className="italic">[What stood out today?]</span></div>
          <div className="text-sm text-gray-700">Tasks: <span className="italic">[What did you accomplish?]</span></div>
        </div>
      )}
      {/* J60: Auto-link names/places in journal entries (mock) */}
      {dailyNotes && (
        <div className="mb-4 border-l-4 border-blue-400 bg-blue-50 p-4 rounded">
          <div className="font-bold mb-1">Daily Note ({new Date().toLocaleDateString()})</div>
          <div className="text-sm text-gray-700">Mood: <span className="italic">[Your mood]</span></div>
          <div className="text-sm text-gray-700">Highlights: <span className="italic">[What stood out today?]</span></div>
          <div className="text-sm text-gray-700">Tasks: <span className="italic">[What did you accomplish?]</span></div>
          <div className="mt-2 text-xs">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded cursor-pointer" title="Linked to Memory">Alice</span> met with <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded cursor-pointer" title="Linked to Memory">Bob</span> in <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded cursor-pointer" title="Linked to Memory">San Francisco</span>.
          </div>
        </div>
      )}
      {/* J48: Backlinks section */}
      <div className="mb-4">
        <div className="font-semibold text-sm mb-1">Backlinks</div>
        {backlinks.length === 0 && <div className="text-xs text-gray-400">No backlinks yet</div>}
        {backlinks.map(link => (
          <div key={link.id} className="text-xs text-blue-700 hover:underline cursor-pointer">
            {link.type === 'memory' ? '🔗' : '📄'} {link.title}
          </div>
        ))}
      </div>
      {/* J50: Mini-map/graph view button */}
      <div className="flex justify-end mb-2">
        <button className="border rounded px-3 py-1 text-xs bg-gray-50 hover:bg-blue-50 text-blue-700" onClick={() => setShowGraph(true)}>
          Open Link Graph
        </button>
      </div>
      {showGraph && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowGraph(false)}>✕</button>
            <div className="font-semibold mb-2">Link Graph (Mock)</div>
            <div className="flex flex-col items-center">
              <div className="w-64 h-40 bg-gray-100 dark:bg-gray-800 rounded mb-2 flex items-center justify-center">
                <span className="text-gray-400">[Graph visualization here]</span>
              </div>
              <div className="text-xs text-gray-500">This is a mock mini-map of linked pages and memories.</div>
            </div>
          </div>
        </div>
      )}
      {/* J52: Clone/duplicate page button */}
      <div className="flex justify-end mt-2">
        <button className="border rounded px-3 py-1 text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700" onClick={() => {
          setCloneFeedback(true);
          setTimeout(() => setCloneFeedback(false), 2000);
        }}>
          Clone/Duplicate Page
        </button>
      </div>
      {cloneFeedback && <div className="fixed top-8 right-8 z-50 bg-yellow-500 text-white px-4 py-2 rounded shadow">Page cloned! All memory citations/links preserved.</div>}
      {/* J53: Page state controls */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500">Page State:</span>
        <select className="border rounded px-2 py-0.5 text-xs" value={pageState} onChange={e => setPageState(e.target.value as any)}>
          <option value="active">Active</option>
          <option value="decaying">Decaying</option>
          <option value="forked">Forked</option>
          <option value="archived">Archived</option>
        </select>
        {pageState !== 'active' && (
          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${pageState === 'decaying' ? 'bg-yellow-100 text-yellow-700' : pageState === 'forked' ? 'bg-blue-100 text-blue-700' : 'bg-gray-300 text-gray-700'}`}>{pageState.charAt(0).toUpperCase() + pageState.slice(1)}</span>
        )}
        {/* J57: Sync indicator */}
        {isSynced && <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Synced across notebooks</span>}
      </div>
      {/* J54: Recall in Mere */}
      <div className="flex justify-end mb-2">
        <button className="border rounded px-3 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700" onClick={() => {
          setRecallFeedback(true);
          setTimeout(() => setRecallFeedback(false), 2000);
        }}>
          Recall in Mere
        </button>
      </div>
      {recallFeedback && <div className="fixed top-8 right-8 z-50 bg-indigo-600 text-white px-4 py-2 rounded shadow">Page recalled in Mere!</div>}
      {/* J56: Memory connections */}
      <div className="mb-4">
        <div className="font-semibold text-sm mb-1">Memory Connections</div>
        <div className="flex flex-wrap gap-2">
          {memoryConnections.map(conn => (
            <div key={conn.id} className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded text-xs cursor-pointer" title={conn.preview}>
              {conn.label}
            </div>
          ))}
        </div>
      </div>
      {/* J58: Merge Views button */}
      <div className="flex justify-end mb-2">
        <button className="border rounded px-3 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700" onClick={() => setShowMergeView(true)}>
          Merge Views
        </button>
      </div>
      {showMergeView && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-3xl relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowMergeView(false)}>✕</button>
            <div className="font-semibold mb-2">Multi-Notebook Merge View (Mock)</div>
            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                <div className="font-bold mb-1">Notebook: AI Research Notes</div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded mb-2 text-sm">Block: "Semantic Memory Models: Enable context-aware retrieval and reasoning."</div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded mb-2 text-sm">Block: "Open Problems: Explainability, memory efficiency, and real-time adaptation."</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold mb-1">Notebook: Project X Docs</div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded mb-2 text-sm">Block: "Project X aims to build a next-generation semantic research platform."</div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded mb-2 text-sm">Block: "Key milestones: Design system architecture, implement semantic Q&A."</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">This is a mock UI for comparing and merging blocks from multiple notebooks.</div>
          </div>
        </div>
      )}
      {/* J68: Summarize in Mere floating button */}
      <button className="fixed bottom-8 right-8 z-50 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700" onClick={() => setShowMereSummary(true)}>
        Summarize in Mere
      </button>
      {showMereSummary && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 shadow-lg z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-semibold">Mere Summary (Mock)</span>
            <button className="text-gray-400 hover:text-gray-700" onClick={() => setShowMereSummary(false)}>✕</button>
          </div>
          <div className="p-4 text-sm">
            <b>Summary:</b> This page covers semantic research, block editing, and AI-powered workflows. Key points include memory linking, collaboration, and advanced note-taking.
          </div>
        </div>
      )}
      {/* J65: Critique Mode button */}
      <div className="flex justify-end mb-2">
        <button className="border rounded px-3 py-1 text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700" onClick={() => setShowCritique(true)}>
          Critique Mode
        </button>
        <button className="ml-2 border rounded px-3 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-700" onClick={() => setShowContradictions(true)}>
          Find Contradictions
        </button>
      </div>
      {showCritique && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowCritique(false)}>✕</button>
            <div className="font-semibold mb-2">AI Critique (Mock)</div>
            <div className="mb-2 text-sm"><b>Clarity:</b> The note is clear and well-structured, but some blocks could use more detail.</div>
            <div className="mb-2 text-sm"><b>Tone:</b> The tone is professional and informative.</div>
            <div className="mb-2 text-sm"><b>Logic:</b> The arguments are logical, but one block contradicts another (see contradictions).</div>
          </div>
        </div>
      )}
      {showContradictions && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowContradictions(false)}>✕</button>
            <div className="font-semibold mb-2">Contradictions Found (Mock)</div>
            <div className="mb-2 text-sm text-red-700">Block 2: "All data is public." contradicts Block 5: "All data is private and encrypted."</div>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6">
        {title}
        {/* J62: AI heading suggestion */}
        <span className="ml-4 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded cursor-pointer" title="AI Suggestion: 'Semantic Research Overview'">AI: Semantic Research Overview</span>
      </h1>
      <BlockEditor initialBlocks={DEMO_BLOCKS} snippets={snippets} setSnippets={setSnippets} filterTag={filterTag} />
    </div>
  );
}

export default function NotebookDemoPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  return <NotebookDemoContent id={resolvedParams.id} />;
} 