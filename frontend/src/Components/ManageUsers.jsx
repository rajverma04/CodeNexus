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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            to="/admin"
            className="mr-4 p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Manage Users</h1>
        </div>

        {usersLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4 bg-red-500/10 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-800 rounded-lg shadow-xl">
            <table className="table w-full">
              <thead className="bg-slate-700 text-slate-300">
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-center">Joined At</th>

                  <th  className="text-center">Solved</th>
                </tr>
              </thead>

              <tbody>
                {usersList && usersList.length > 0 ? (
                  usersList.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-700/50 border-slate-700"
                    >
                      <th>{index + 1}</th>

                      <td>
                        <div className="font-bold">
                          {user.firstName} {user.lastName || ""}
                        </div>
                        {/* <div className="text-sm opacity-50">{user.id}</div> */}
                      </td>

                      <td>{user.emailId}</td>

                      <td>
                        <span
                          className={`badge ${
                            user.role === "admin"
                              ? "badge-secondary"
                              : "badge-primary"
                          } badge-outline`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="text-sm text-slate-300 text-center align-middle">
                        <span className="inline-flex items-center justify-center">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </td>

                      <td className="text-center">
                        {user.problemSolved?.length || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageUsers;
