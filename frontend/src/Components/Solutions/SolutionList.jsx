import { useState, useEffect } from "react";
import axiosClient from "../../utils/axiosClient";
import { Search, Filter, Plus, ThumbsUp, MessageSquare, Calendar, Code2, User } from "lucide-react";
import SolutionDetail from "./SolutionDetail";
import SolutionForm from "./SolutionForm";

const SolutionList = ({ problemId }) => {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("mostUpvoted");
    const [showForm, setShowForm] = useState(false);
    const [selectedSolution, setSelectedSolution] = useState(null);

    const fetchSolutions = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/solutions/problem/${problemId}?sortBy=${sortBy}`);
            if (res.data.success) {
                setSolutions(res.data.solutions);
            }
        } catch (error) {
            console.error("Error fetching solutions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolutions();
    }, [problemId, sortBy]);

    const handleSolutionCreated = () => {
        setShowForm(false);
        fetchSolutions();
    };

    const handleSolutionClick = (solution) => {
        setSelectedSolution(solution);
    };

    const handleCloseDetail = () => {
        setSelectedSolution(null);
        // Refresh list to update view counts or comments if needed
        fetchSolutions();
    };

    if (showForm) {
        return (
            <SolutionForm
                problemId={problemId}
                onCancel={() => setShowForm(false)}
                onSuccess={handleSolutionCreated}
            />
        );
    }

    if (selectedSolution) {
        return (
            <SolutionDetail
                solution={selectedSolution}
                onClose={handleCloseDetail}
            />
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header Controls */}
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setSortBy("mostUpvoted")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === "mostUpvoted" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                    >
                        Most Upvoted
                    </button>
                    <button
                        onClick={() => setSortBy("newest")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === "newest" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                    >
                        Newest
                    </button>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Share Solution
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                        <p className="text-zinc-500 text-sm">Loading solutions...</p>
                    </div>
                ) : solutions.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                        <Code2 className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400 font-medium">No solutions yet</p>
                        <p className="text-zinc-500 text-sm mb-4">Be the first to share your approach!</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="text-emerald-400 text-sm font-bold hover:underline"
                        >
                            Post a Solution
                        </button>
                    </div>
                ) : (
                    solutions.map((sol) => (
                        <div
                            key={sol._id}
                            onClick={() => handleSolutionClick(sol)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 cursor-pointer transition-all group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                                    {sol.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 capitalize">
                                        {sol.language}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-zinc-500 mt-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                                            {sol.user?.profilePicture ? (
                                                <img src={sol.user.profilePicture} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User className="w-3" />
                                            )}
                                        </div>
                                        <span className="text-zinc-400">{sol.user?.username || "Anonymous"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(sol.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-zinc-400">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        <span>{sol.upvoteCount}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-zinc-400">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>{sol.comments?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SolutionList;
