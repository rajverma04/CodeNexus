import axiosClient from "../utils/axiosClient";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { manageUsers } from "../authSlice";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

function ManageUsers() {
  const dispatch = useDispatch();
  // extracting usersLoading instead of loading
  const { usersList, usersLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(manageUsers());
  }, [dispatch]);

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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Manage Users</h1>
            <p className="text-zinc-400 text-sm mt-1">View and manage registered users</p>
          </div>
        </div>

        {usersLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    <th className="p-4 font-medium text-zinc-400">#</th>
                    <th className="p-4 font-medium text-zinc-400">User</th>
                    <th className="p-4 font-medium text-zinc-400">Email</th>
                    <th className="p-4 font-medium text-zinc-400">Role</th>
                    <th className="p-4 font-medium text-zinc-400 text-center">Joined At</th>
                    <th className="p-4 font-medium text-zinc-400 text-center">Solved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersList && usersList.length > 0 ? (
                    usersList.map((user, index) => (
                      <tr
                        key={user.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4 text-zinc-500 font-mono text-sm">{index + 1}</td>

                        <td className="p-4">
                          <div className="font-bold text-white">
                            {user.firstName} {user.lastName || ""}
                          </div>
                          {/* <div className="text-xs text-zinc-500 font-mono mt-0.5 opacity-50">{user.id}</div> */}
                        </td>

                        <td className="p-4 text-zinc-300">{user.emailId}</td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === "admin"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="p-4 text-sm text-zinc-400 text-center">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-zinc-300 min-w-[3rem]">
                            {user.problemSolved?.length || 0}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-zinc-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageUsers;
