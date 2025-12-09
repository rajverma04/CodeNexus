import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

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

  const getStatusClasses = (status) => {
    // normalize
    const s = (status || "").toLowerCase();
    if (s === "accepted" || s === "ac") {
      return "bg-green-100 text-green-800";
    }
    if (s === "wrong" || s === "wa" || s === "wrong answer") {
      return "bg-rose-100 text-rose-800";
    }
    if (s === "error" || s === "runtime error") {
      return "bg-amber-100 text-amber-800";
    }
    if (s === "pending" || s === "running") {
      return "bg-slate-100 text-slate-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const formatMemory = (memory) => {
    if (typeof memory !== "number" || isNaN(memory)) return "-";
    // memory passed in KB? assume KB
    if (memory < 1024) {
      return `${memory} kB`;
    }
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months = 0–11
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-10 w-10 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <div className="text-sm text-slate-400">Loading submissions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 text-rose-800 rounded-md">{error}</div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-6 bg-slate-800 rounded-md text-slate-300">
        No submissions for this problem yet.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                #
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                Language
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                Runtime
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                Memory
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                Testcases
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                Submitted
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-700">
            {submissions.map((sub, idx) => {
              const statusLabel =
                sub.status?.charAt(0).toUpperCase() +
                (sub.status?.slice(1) || "");
              return (
                <tr
                  key={sub._id || `${idx}-${sub.language}-${sub.submittedAt}`}
                >
                  <td className="px-4 py-4 text-sm text-slate-300">
                    {idx + 1}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-200">
                    {sub.language || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(
                        sub.status
                      )}`}
                    >
                      {statusLabel || "-"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-300">
                    {sub.runtime !== undefined && sub.runtime !== null
                      ? `${sub.runtime} sec`
                      : "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-300">
                    {formatMemory(sub.memory)}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-300">
                    {typeof sub.testCasesPassed === "number" &&
                    typeof sub.testCasesTotal === "number"
                      ? `${sub.testCasesPassed}/${sub.testCasesTotal}`
                      : "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-300">
                    {formatDate(sub.submittedAt || sub.createdAt)}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => setSelectedSubmission(sub)}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                    >
                      View Code
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal to show selected submission code/details */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedSubmission(null)}
          />

          <div className="relative bg-slate-900 shadow-xl rounded-lg w-[90%] max-w-4xl mx-4 p-6 z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Submission by {selectedSubmission.user?.name || "User"}
                </h3>
                <p className="text-sm text-slate-400">
                  {selectedSubmission.language} •{" "}
                  {formatDate(
                    selectedSubmission.submittedAt ||
                      selectedSubmission.createdAt
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">
                  {selectedSubmission.testCasesPassed}/
                  {selectedSubmission.testCasesTotal} passed
                </span>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-sm"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              <div>
                <div className="text-xs text-slate-400 mb-2">Source Code</div>
                <pre className="bg-slate-800 text-slate-100 rounded-md p-4 overflow-auto max-h-60 language-none">
                  {selectedSubmission.code || "// No code available"}
                </pre>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-md p-3">
                  <div className="text-xs text-slate-400">Runtime</div>
                  <div className="text-sm text-slate-100 mt-1">
                    {selectedSubmission.runtime != null
                      ? `${selectedSubmission.runtime} sec`
                      : "-"}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-md p-3">
                  <div className="text-xs text-slate-400">Memory</div>
                  <div className="text-sm text-slate-100 mt-1">
                    {formatMemory(selectedSubmission.memory)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmissionHistory;
