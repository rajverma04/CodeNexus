import React, { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { ArrowLeft, Trash2, AlertTriangle, UploadCloud, Video, CheckCircle2, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router";

/**
 * AdminVideo (Manage Videos)
 * - Fetch problems
 * - Show table with Upload and Delete buttons
 * - On Upload -> Navigate to upload page
 * - On Delete -> Show modal -> calls /video/delete/${id}
 */

function AdminVideo() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null,
    title: "",
    loading: false,
  });

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosClient.get("/problem/getAllProblems");
      setProblems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch problems. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const openConfirm = (id, title) => {
    setConfirmModal({ open: true, id, title, loading: false });
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, id: null, title: "", loading: false });
  };

  const handleDeleteConfirm = async () => {
    const id = confirmModal.id;
    if (!id) return;

    try {
      setConfirmModal((s) => ({ ...s, loading: true }));
      // Use DELETE method
      await axiosClient.delete(`/video/delete/${id}`);

      // We might want to just show a success message. 
      // The list 'problems' is typically the list of existing problems. 
      // Deleting a VIDEO usually just removes the video link from that problem, 
      // but doesn't delete the problem itself from this list.
      // If the endpoint actually deletes the PROBLEM, then we filter it out.
      // But based on function name `AdminVideo`, it implies managing video content.
      // Assuming it just deletes video metadata, we won't remove the problem from the list,
      // but just show success. 

      // However, looking at previous code: `setProblems((problem) => problem._id !== id);` 
      // It tried to filter. If the intent is removing the problem from the list, fine.
      // If the intent was removing video association, the problem still exists.
      // I'll stick to not removing it unless the user clarified, but the previous code 
      // had a bug: `setProblems((problem) => problem._id !== id)` is not a filter function 
      // passed correctly (it should be `prev.filter(...)`).
      // I will assume for now we just show a success toast.

      setToast({ type: "success", message: "Video deleted successfully." });
      setTimeout(() => setToast(null), 3000);
      closeConfirm();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || "Failed to delete the video.";
      setToast({ type: "error", message: msg });
      setTimeout(() => setToast(null), 4000);
      setConfirmModal((s) => ({ ...s, loading: false }));
    }
  };

  const handleFileSelect = (id) => {
    navigate(`/admin/upload/${id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 rounded-xl px-6 py-3 text-white shadow-xl animate-fade-in-up flex items-center gap-3 border border-white/10 ${toast.type === "success" ? "bg-emerald-600/90" : "bg-rose-500/90"} backdrop-blur-md`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center mb-8">
          <Link
            to="/admin"
            className="mr-6 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">Manage Videos</h1>
            <p className="text-zinc-400 text-sm mt-1">Upload or remove solution videos for problems</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl shadow bg-red-500/10 border border-red-500/20 text-red-400 backdrop-blur-md flex items-center gap-3">
            <div className="p-1 bg-red-500/20 rounded-full"><EyeOff className="w-4 h-4" /></div>
            {error}
          </div>
        )}

        {/* Loading state for fetch */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    <th className="p-4 font-medium text-zinc-400">#</th>
                    <th className="p-4 font-medium text-zinc-400">Title</th>
                    <th className="p-4 font-medium text-zinc-400">Difficulty</th>
                    <th className="p-4 font-medium text-zinc-400">Tags</th>
                    <th className="p-4 font-medium text-zinc-400 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {problems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500">
                        No problems found.
                      </td>
                    </tr>
                  ) : (
                    problems.map((problem, idx) => (
                      <tr
                        key={problem._id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4 text-zinc-500 font-mono text-sm">{idx + 1}</td>

                        <td className="p-4 align-top">
                          <div className="font-bold text-white">{problem.title}</div>
                          {problem.description && (
                            <div className="mt-1 text-xs text-zinc-500 truncate max-w-xs">{problem.description}</div>
                          )}
                        </td>

                        <td className="p-4 align-top">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${problem.difficulty === "easy"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : problem.difficulty === "medium"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              }`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>

                        <td className="p-4 align-top">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-white/5 text-zinc-300 border-white/10">
                            {problem.tags}
                          </span>
                        </td>

                        <td className="p-4 align-top text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleFileSelect(problem._id)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all font-medium text-xs group"
                            >
                              <UploadCloud className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                              Upload
                            </button>

                            <button
                              onClick={() => openConfirm(problem._id, problem.title)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all font-medium text-xs group"
                            >
                              <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                              Delete Video
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (!confirmModal.loading) closeConfirm();
            }}
          />

          {/* modal content */}
          <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 text-rose-500">
                <Video className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Delete Video Solution?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Are you sure you want to delete the video for <strong className="text-white">"{confirmModal.title}"</strong>?
                <br /><span className="text-rose-400/80 text-xs">This action cannot be undone.</span>
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={closeConfirm}
                  disabled={confirmModal.loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteConfirm}
                  disabled={confirmModal.loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {confirmModal.loading ? (
                    <span className="loading loading-spinner loading-sm text-white"></span>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVideo;
