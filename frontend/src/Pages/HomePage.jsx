import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";
import axiosClient from "../utils/axiosClient";
import { NavLink } from "react-router";
import { useEffect, useState } from "react";

function HomePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: "all",
    tags: "all",
    status: "all",
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/getAllProblems");
        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems: ", error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/problemSolvedByUser");
        setSolvedProblems(data);
      } catch (error) {
        console.error("Error fetching solved problems: ", error);
      }
    };

    fetchProblems();
    if (user) {
      // if user exist then call fetchSolvedProblems()
      fetchSolvedProblems();
    }
  }, [user]); // if user changed: means another user logged in

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); // clear solved problem on logout
  };

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === "all" || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tags === "all" || problem.tags === filters.tags;
    const statusMatch =
      filters.status === "all" ||
      solvedProblems.some((sp) => sp._id === problem._id);

    return difficultyMatch && tagMatch && statusMatch;
  });

  return (
    <>
      <div className="min-h-screen bg-base-200">
        {/* Navigation Bar */}
        <nav className="navbar bg-base-100 shadow-lg px-4">
          <div className="flex-1">
            <NavLink to="/" className="btn btn-ghost text-xl">
              CodeNexus
            </NavLink>
          </div>

          {/* If role === admin then this URL will shows */}
          {user?.role === "admin" && (
            <div className="flex-1">
              <NavLink to="/admin" className="btn btn-ghost text-xl">
                Admin Panel
              </NavLink>
            </div>
          )}
          <div className="flex-none gap-4">
            {user && (
              <span className="hidden sm:inline text-sm">
                Welcome,&nbsp;
                <span className="font-semibold">
                  {user.firstName || user.name || "User"}
                </span>
              </span>
            )}

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar placeholder"
              >
                <div className="bg-neutral text-neutral-content rounded-full w-10">
                  <span className="text-sm">
                    {user?.firstName?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              </div>
              <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-40">
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto p-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 items-center">
            {/* Status filter */}
            <select
              className="select select-bordered"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="all">All Problems</option>
              <option value="solved">Solved Problems</option>
            </select>

            {/* Difficulty filter */}
            <select
              className="select select-bordered"
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Tags filter */}
            <select
              className="select select-bordered"
              value={filters.tags}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
            >
              <option value="all">All Tags</option>
              <option value="array">Arrays</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">Dynamic Programming</option>
            </select>
          </div>

          {/* Problems List */}
          <div className="grid gap-4">
            {filteredProblems.length === 0 ? (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg">No problems found</h2>
                  <p className="text-sm text-base-content/70">
                    Try changing the filters or check back later.
                  </p>
                </div>
              </div>
            ) : (
              filteredProblems.map((problem) => {
                const isSolved = solvedProblems.some(
                  (sp) => sp._id === problem._id
                );

                return (
                  <div key={problem._id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      {/* Title + Difficulty */}
                      <div className="flex justify-between gap-2 items-start">
                        <h2 className="card-title text-lg">{problem.title}</h2>
                        <span
                          className={`badge ${
                            problem.difficulty === "easy"
                              ? "badge-success"
                              : problem.difficulty === "medium"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(problem.tags) ? (
                          problem.tags.map((tag) => (
                            <span key={tag} className="badge badge-outline">
                              {tag}
                            </span>
                          ))
                        ) : problem.tags ? (
                          <span className="badge badge-outline">
                            {problem.tags}
                          </span>
                        ) : null}
                      </div>

                      {/* Status + Action */}
                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className={`badge ${
                            isSolved ? "badge-success" : "badge-ghost"
                          }`}
                        >
                          {isSolved ? "Solved" : "Unsolved"}
                        </span>

                        {/* Adjust the route below as per your app */}
                        <NavLink
                          to={`/problems/${problem._id}`}
                          className="btn btn-sm btn-neutral"
                        >
                          Solve
                        </NavLink>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
