import React, { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

/**
 * AdminDelete
 * - Fetch problems
 * - Show table with Delete button
 * - On Delete click -> open confirmation modal (not window.confirm)
 * - On confirm -> call axiosClient.delete(`/problem/delete/${id}`)
 * - Shows success/error alerts and loading states
 */

function AdminDelete() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true); // for initial fetch
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', message }

  // modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null,
    title: "",
    loading: false, // for delete request
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
      await axiosClient.delete(`/problem/delete/${id}`);

      // remove from list
      setProblems((prev) => prev.filter((p) => p._id !== id));

      setAlert({ type: "success", message: "Problem deleted successfully." });
      closeConfirm();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete the problem.";
      setAlert({ type: "error", message: msg });
      setConfirmModal((s) => ({ ...s, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Delete Problems
        </h1>

        {/* Alert */}
        {alert && (
          <div
            className={`mb-6 p-4 rounded-md shadow ${
              alert.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {alert.message}
            <button
              onClick={() => setAlert(null)}
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading state for fetch */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <svg
              className="animate-spin h-10 w-10 text-indigo-600"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-300">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {problems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      No problems found.
                    </td>
                  </tr>
                ) : (
                  problems.map((problem, idx) => (
                    <tr
                      key={problem._id}
                      className="border-t border-slate-100 dark:border-slate-700"
                    >
                      <td className="px-4 py-4 align-top text-slate-700 dark:text-slate-200">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {problem.title}
                        </div>
                        {problem.description && (
                          <div className="mt-1 text-sm text-slate-500 dark:text-slate-300 truncate max-w-xl">
                            {problem.description}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            problem.difficulty === "easy"
                              ? "bg-green-100 text-green-800"
                              : problem.difficulty === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex gap-2 flex-wrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                            {problem.tags}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top text-center">
                        <button
                          onClick={() =>
                            openConfirm(problem._id, problem.title)
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-sm shadow"
                        >
                          {/* trash icon (simple) */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!confirmModal.loading) closeConfirm();
            }}
          />

          {/* modal content */}
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Delete Problem
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete{" "}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {confirmModal.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                disabled={confirmModal.loading}
                className="px-4 py-2 rounded-md border bg-transparent text-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                disabled={confirmModal.loading}
                className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white inline-flex items-center gap-2"
              >
                {confirmModal.loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDelete;
