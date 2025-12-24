import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { FileText, ChevronDown, ChevronRight, Printer, Book } from "lucide-react";

// Mock problems metadata. Replace with backend fetch later.
const MOCK_PROBLEMS = [
  {
    problemId: "two-sum",
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\nExample 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\nExample 2:\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n\nExample 3:\nInput: nums = [3,3], target = 6\nOutput: [0,1]\n\nConstraints:\n2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.\n\nFollow-up: Can you come up with an algorithm that is less than O(n^2) time complexity?",
  },
  {
    problemId: "valid-parentheses",
    title: "Valid Parentheses",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
  },
  {
    problemId: "merge-two-lists",
    title: "Merge Two Sorted Lists",
    description:
      "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a sorted manner.",
  },
];

const Notebook = () => {
  const notesByProblem = useSelector((state) => state.notes.byProblem);
  const [expanded, setExpanded] = useState({});

  const entries = useMemo(() => {
    // Build list combining mock problems and any existing notes by problemId
    const map = new Map(MOCK_PROBLEMS.map((p) => [p.problemId, p]));
    const ids = new Set([...map.keys(), ...Object.keys(notesByProblem || {})]);
    return Array.from(ids).map((id) => ({
      problemId: id,
      title: map.get(id)?.title || "Untitled Problem",
      description: map.get(id)?.description || "No description available.",
      note: notesByProblem?.[id] || "",
    }));
  }, [notesByProblem]);

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));
  const printAll = () => window.print();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="header-bar border-b border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600">
              <Book className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Notebook</h1>
              <p className="text-xs text-zinc-400">Review and print your notes</p>
            </div>
          </div>
          <button
            onClick={printAll}
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
            title="Print all notes as PDF"
          >
            <Printer className="w-4 h-4" /> Print All
          </button>
        </div>
      </div>

      {/* Instructions (screen only) */}
      <div className="screen-only mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">My Notes</h2>
          <h3 className="mt-2 text-sm font-medium text-zinc-300">Instructions</h3>
          <p className="mt-1 text-sm text-zinc-400">Here you can review all your notes.</p>
          <p className="mt-1 text-sm text-zinc-400">You can have all your notes printed as PDF.</p>
        </div>
      </div>

      {/* Interactive List (screen only) */}
      <div className="screen-only mx-auto max-w-5xl px-4 pb-16">
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-zinc-400">
              No notes yet. Add notes from a problem page.
            </div>
          ) : (
            entries.map((item) => (
              <div key={item.problemId} className="rounded-xl border border-white/10 bg-[#0d1117]">
                {/* Row */}
                <button
                  onClick={() => toggle(item.problemId)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30">
                      <FileText className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="text-xs text-zinc-500">{item.note ? "Has notes" : "No notes yet"}</div>
                    </div>
                  </div>
                  {expanded[item.problemId] ? (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {/* Expanded */}
                {expanded[item.problemId] && (
                  <div className="px-4 pb-4 space-y-4">
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <div className="text-xs font-semibold text-zinc-400">Problem</div>
                      <div className="mt-1 text-sm text-zinc-200">{item.title}</div>
                      <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{item.description}</div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <div className="text-xs font-semibold text-zinc-400">My Notes</div>
                      <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">
                        {item.note || "No notes yet."}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/problems/${item.problemId}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                      >
                        Open Problem
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Print-only expanded view */}
      <div className="print-only mx-auto max-w-5xl px-4 py-6">
        <h2 className="text-xl font-bold mb-4">Notebook – All Notes</h2>
        {entries.length === 0 ? (
          <div className="text-zinc-600">No notes to print.</div>
        ) : (
          entries.map((item) => (
            <div key={item.problemId} className="print-page mb-8">
              <div className="mb-2">
                <div className="text-xs font-semibold text-zinc-600">Problem</div>
                <div className="text-base font-semibold text-white">{item.title}</div>
              </div>
              <div className="mb-4">
                <div className="text-xs font-semibold text-zinc-600">Description</div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">{item.description}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-600">My Notes</div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-white">{item.note || "No notes yet."}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          nav, .header-bar { display: none !important; }
          body { background: white !important; }
          .screen-only { display: none !important; }
          .print-only { display: block !important; }
          .print-page { page-break-after: always; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Notebook;
