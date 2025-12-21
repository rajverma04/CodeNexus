import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { CheckCircle2, History, XCircle, AlertTriangle, Clock, Eye, X, Terminal, Code2 } from "lucide-react";

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    if (!problemId) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosClient.get(
          `/problem/submittedProblem/${problemId}`
        );
        // make sure response.data is array
        setSubmissions(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch submission history");
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusConfig = (status) => {
    const s = (status || "").toLowerCase();

    if (s === "accepted" || s === "ac") {
      return {
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: CheckCircle2,
        label: "Accepted"
      };
    }
    if (s === "wrong" || s === "wa" || s === "wrong answer") {
      return {
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        icon: XCircle,
        label: "Wrong Answer"
      };
    }
    if (s === "error" || s === "runtime error") {
      return {
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        icon: AlertTriangle,
        label: "Runtime Error"
      };
    }
    return {
      color: "text-zinc-400",
      bg: "bg-white/5",
      border: "border-white/10",
      icon: Clock,
      label: "Pending"
    };
  };

  const formatMemory = (memory) => {
    if (typeof memory !== "number" || isNaN(memory)) return "-";
    if (memory < 1024) return `${memory} KB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-3"></div>
        <p className="text-sm">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        {error}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-dashed border-white/10 rounded-xl bg-white/5">
        <History className="w-10 h-10 mb-3 opacity-20" />
        <p className="text-sm">No submissions yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {submissions.map((sub, idx) => {
          const status = getStatusConfig(sub.status);
          const StatusIcon = status.icon;

          return (
            <div
              key={sub._id || idx}
              className="group bg-[#0d1117] border border-white/5 hover:border-emerald-500/30 rounded-xl p-4 transition-all hover:bg-white/[0.02]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status.bg} ${status.color}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${status.color}`}>{status.label}</h4>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {formatDate(sub.submittedAt || sub.createdAt)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(sub)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-emerald-500 rounded-lg transition-all"
                  title="View Code"
                >
                  <Code2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/20 rounded px-2 py-1.5 flex justify-between border border-white/5">
                  <span className="text-zinc-500">Language</span>
                  <span className="text-zinc-300 font-medium">{sub.language}</span>
                </div>
                <div className="bg-black/20 rounded px-2 py-1.5 flex justify-between border border-white/5">
                  <span className="text-zinc-500">Time</span>
                  <span className="text-zinc-300 font-medium">{sub.runtime ? `${sub.runtime}s` : "-"}</span>
                </div>
                <div className="bg-black/20 rounded px-2 py-1.5 flex justify-between border border-white/5">
                  <span className="text-zinc-500">Memory</span>
                  <span className="text-zinc-300 font-medium">{formatMemory(sub.memory)}</span>
                </div>
                <div className="bg-black/20 rounded px-2 py-1.5 flex justify-between border border-white/5">
                  <span className="text-zinc-500">Passed</span>
                  <span className={`font-medium ${sub.testCasesPassed === sub.testCasesTotal ? "text-emerald-400" : "text-zinc-300"}`}>
                    {sub.testCasesPassed}/{sub.testCasesTotal}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Code Viewer Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedSubmission(null)}
          />

          <div className="relative bg-[#0d1117] border border-white/10 shadow-2xl rounded-2xl w-full max-w-3xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161b22]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getStatusConfig(selectedSubmission.status).bg} ${getStatusConfig(selectedSubmission.status).color}`}>
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Submission Details</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    {selectedSubmission.language} • {formatDate(selectedSubmission.submittedAt || selectedSubmission.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-0">
              <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/10 bg-[#0d1117]">
                <div className="p-4 text-center">
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Runtime</div>
                  <div className="text-white font-mono font-bold">{selectedSubmission.runtime ? `${selectedSubmission.runtime}s` : "-"}</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Memory</div>
                  <div className="text-white font-mono font-bold">{formatMemory(selectedSubmission.memory)}</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Test Cases</div>
                  <div className={`font-mono font-bold ${selectedSubmission.testCasesPassed === selectedSubmission.testCasesTotal ? "text-emerald-400" : "text-zinc-300"}`}>
                    {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-zinc-500 bg-black/50 px-2 py-1 rounded border border-white/10">Read Only</span>
                </div>
                <pre className="p-6 bg-[#0a0a0a] text-sm font-mono text-blue-100 overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10">
                  <code>{selectedSubmission.code || "// Code not available"}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmissionHistory;
