import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";

function AdminUpdate() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100">
          Update Problems
        </h1>

        {error && (
          <div className="mb-6 p-4 rounded-md shadow bg-red-50 text-red-800">
            {error}
          </div>
        )}

        {/* Loading Animation */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <span className="loading loading-lg"></span>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-slate-500 dark:text-slate-300">
                  <th>#</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Tags</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {problems.map((p, idx) => (
                  <tr
                    key={p._id}
                    className="border-t border-slate-200 dark:border-slate-700"
                  >
                    <td>{idx + 1}</td>

                    <td className="font-semibold">{p.title}</td>

                    <td>
                      <span
                        className={`badge ${p.difficulty === "easy"
                          ? "badge-success"
                          : p.difficulty === "medium"
                            ? "badge-warning"
                            : "badge-error"
                          }`}
                      >
                        {p.difficulty}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-neutral">{p.tags}</span>
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() => navigate(`/admin/update/${p._id}`)}
                        className="btn btn-primary btn-sm text-white"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {problems.length === 0 && (
              <p className="text-center text-slate-500 py-10">
                No problems available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUpdate;


