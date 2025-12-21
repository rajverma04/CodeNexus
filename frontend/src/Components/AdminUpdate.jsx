import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { ArrowLeft, Pencil } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        <div className="flex items-center mb-8">
          <Link
            to="/admin"
            className="mr-6 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Update Problems</h1>
            <p className="text-zinc-400 text-sm mt-1">Select a problem to modify its details</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl shadow bg-red-500/10 border border-red-500/20 text-red-400 backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Loading Animation */}
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
                    <th className="p-4 font-medium text-zinc-400 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {problems.map((p, idx) => (
                    <tr
                      key={p._id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 text-zinc-500 font-mono text-sm">{idx + 1}</td>

                      <td className="p-4">
                        <div className="font-bold text-white">{p.title}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5 opacity-50 block sm:hidden">{p._id}</div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${p.difficulty === "easy"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : p.difficulty === "medium"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                        >
                          {p.difficulty}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-white/5 text-zinc-300 border-white/10">
                          {p.tags}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => navigate(`/admin/update/${p._id}`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all font-medium text-sm group"
                        >
                          <Pencil className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {problems.length === 0 && (
              <p className="text-center text-zinc-500 py-12 border-t border-white/5">
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
