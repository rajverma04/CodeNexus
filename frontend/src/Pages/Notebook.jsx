import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { FileText, ChevronDown, ChevronRight, Printer, Book, Trash2, ExternalLink, AlertCircle } from "lucide-react";
import axiosClient from "../utils/axiosClient";
import { deleteNote as deleteNoteLocal } from "../notesSlice";

const Notebook = () => {
  const dispatch = useDispatch();
  const notesByProblem = useSelector((state) => state.notes.byProblem);
  const [serverNotes, setServerNotes] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // null or problemId

  const entries = useMemo(() => {
    // Server notes already have title/description from populate; merge with local drafts
    const serverMap = new Map(serverNotes.map((n) => [n.problemId, n]));
    const ids = new Set([
      ...serverNotes.map((n) => n.problemId),
      ...Object.keys(notesByProblem || {}),
    ]);
    return Array.from(ids).map((id) => {
      const server = serverMap.get(id);
      return {
        problemId: id,
        title: server?.title ?? "Untitled Problem",
        description: server?.description ?? "No description available.",
        note: server?.content ?? notesByProblem?.[id] ?? "",
      };
    });
  }, [notesByProblem, serverNotes]);

  // Load server notes on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axiosClient.get("/notes");
        if (isMounted && res.data?.success) {
          const serverNotesData = res.data.data || [];
          setServerNotes(serverNotesData);
        }
      } catch (err) {
        // Silent fallback to local notes
        console.warn("Failed to fetch server notes", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [notesByProblem]);

  const toggle = (id) => {
    // Just toggle expanded state; no lazy loading needed since server notes already have title/description
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  };
  const handleDelete = async (id) => {
    try {
      console.log("Deleting note for problem:", id);
      const res = await axiosClient.delete(`/notes/${id}`);
      console.log("Delete response:", res.data);
      
      // Remove from serverNotes state
      setServerNotes((arr) => arr.filter((n) => n.problemId !== id));
      
      // Clear local draft (Redux only)
      dispatch(deleteNoteLocal(id));

      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete note:", err.response?.data || err.message);
      alert("Failed to delete note: " + (err.response?.data?.message || err.message));
    }
  };
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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-sm text-zinc-400">Loading your notebook...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                <div className="flex items-center justify-center gap-2 text-zinc-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>No notes yet. Add notes from a problem page.</span>
                </div>
              </div>
            ) : (
              entries.map((item) => (
                <div key={item.problemId} className="rounded-xl border border-white/10 bg-[#0d1117]">
                  {/* Row */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => toggle(item.problemId)}
                      className="flex-1 flex items-center justify-between text-left hover:bg-white/5 py-0 px-0"
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
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={`/problems/${item.problemId}`}
                        title="Open problem"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(item.problemId)}
                        title="Delete note"
                        className="p-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

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
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0d1117] border border-white/10 rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-white">Delete Note?</h3>
            <p className="mt-2 text-sm text-zinc-300">
              This will permanently delete your note. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
