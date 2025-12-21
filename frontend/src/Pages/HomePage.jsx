import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { NavLink } from "react-router";
import { useEffect, useState } from "react";
import { Search, Sparkles, CheckCircle2, Code2, ArrowRight } from "lucide-react";

function HomePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);

  // Custom Filter State
  const [filters, setFilters] = useState({
    difficulty: "all",
    tags: "all",
    status: "all",
    search: ""
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/getAllProblems");
        setProblems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching problems: ", error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/problemSolvedByUser");
        setSolvedProblems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching solved problems: ", error);
      }
    };

    fetchProblems();
    if (user) {
      fetchSolvedProblems();
    }
  }, [user]);

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === "all" || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tags === "all" || problem.tags === filters.tags;
    const statusMatch =
      filters.status === "all" ||
      (filters.status === "solved" ? solvedProblems.some((sp) => sp._id === problem._id) : !solvedProblems.some((sp) => sp._id === problem._id));

    // Search match
    const searchLower = filters.search.toLowerCase();
    const searchMatch = !filters.search ||
      problem.title.toLowerCase().includes(searchLower) ||
      (problem.tags && problem.tags.toLowerCase().includes(searchLower));

    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 pb-12">

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8 mt-4">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent flex items-center gap-3">
              Problem Set <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Sharpen your skills with our curated list of algorithmic challenges.
            </p>
          </div>

          {/* Stats Summary */}
          <div className="flex gap-4">
            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Total</p>
              <p className="text-2xl font-bold text-white">{problems.length}</p>
            </div>
            {user && (
              <div className="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm text-center">
                <p className="text-emerald-500/70 text-xs uppercase font-bold tracking-wider">Solved</p>
                <p className="text-2xl font-bold text-emerald-400">{solvedProblems.length}</p>
              </div>
            )}
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="sticky top-4 z-40 bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col lg:flex-row gap-4 justify-between items-center transition-all">
          {/* Search */}
          <div className="relative w-full lg:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search problems, tags..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
            {/* Status Filter */}
            <select
              className="bg-white/5 border border-white/10 text-zinc-300 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none hover:bg-white/10 transition-colors cursor-pointer"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>

            {/* Difficulty Filter */}
            <select
              className="bg-white/5 border border-white/10 text-zinc-300 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none hover:bg-white/10 transition-colors cursor-pointer"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Tags Filter */}
            <select
              className="bg-white/5 border border-white/10 text-zinc-300 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none hover:bg-white/10 transition-colors cursor-pointer capitalize"
              value={filters.tags}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
            >
              <option value="all">All Tags</option>
              <option value="array">Array</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">Dynamic Programming</option>
            </select>

            {/* Reset Filters */}
            {(filters.difficulty !== "all" || filters.tags !== "all" || filters.status !== "all" || filters.search) && (
              <button
                onClick={() => setFilters({ difficulty: "all", tags: "all", status: "all", search: "" })}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-medium transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Problems List (Horizontal Cards) */}
        <div className="space-y-4">
          {filteredProblems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-zinc-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No problems found</h2>
              <p className="text-zinc-500 max-w-sm">
                We couldn't find any problems matching your current filters. Try adjusting them.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProblems.map((problem) => {
                const isSolved = solvedProblems.some((sp) => sp._id === problem._id);

                return (
                  <NavLink
                    key={problem._id}
                    to={`/problems/${problem._id}`}
                    className="group relative bg-[#1c1c1c]/50 hover:bg-white/[0.07] border border-white/10 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden"
                  >
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className={`p-2.5 rounded-lg shrink-0 ${isSolved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-zinc-500 group-hover:text-zinc-300'} transition-colors`}>
                        {isSolved ? <CheckCircle2 className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                            {problem.title}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0
                                                ${problem.difficulty === "easy"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : problem.difficulty === "medium"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}>
                            {problem.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          {problem.tags && (
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                              {problem.tags}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="hidden md:flex items-center gap-2 pr-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <span className="text-sm font-medium text-emerald-400">Solve Challenge</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    </div>

                    {/* Mobile indicator */}
                    <ArrowRight className="w-4 h-4 text-zinc-600 md:hidden absolute right-4 top-1/2 -translate-y-1/2" />
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
