import { useState, useEffect } from "react";
import axiosClient from "../../utils/axiosClient";
import DiscussionItem from "./DiscussionItem";
import DiscussionForm from "./DiscussionForm";
import { MessageSquare, Loader2, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";

const DiscussionList = ({ problemId }) => {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState("newest"); // newest, oldest, mostLiked
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchDiscussions = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/discussion/${problemId}?sortBy=${sortBy}&page=${page}`);
            if (res.data.success) {
                setDiscussions(res.data.discussions);
                setTotalPages(res.data.totalPages);
            }
        } catch (error) {
            console.error("Error fetching discussions:", error);
            toast.error("Failed to load discussions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscussions();
    }, [problemId, sortBy, page]);

    const handleNewDiscussion = (newDiscussion) => {
        setDiscussions([newDiscussion, ...discussions]);
        setShowCreateForm(false);
    };

    const handleDelete = (discussionId) => {
        setDiscussions(discussions.filter(d => d._id !== discussionId));
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Header / Controls */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                        Discussions
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-400">
                        {discussions.length}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-[#252526] text-xs text-zinc-300 pl-8 pr-8 py-1.5 rounded-lg border border-white/10 outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            {/* <option value="mostLiked">Most Voted</option> */}
                        </select>
                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                    >
                        New Post
                    </button>
                </div>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="mb-6 animate-slide-down">
                    <DiscussionForm
                        problemId={problemId}
                        onSuccess={handleNewDiscussion}
                        onCancel={() => setShowCreateForm(false)}
                    />
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : discussions.length > 0 ? (
                    discussions.map((discussion) => (
                        <DiscussionItem
                            key={discussion._id}
                            discussion={discussion}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="text-center p-12 border border-dashed border-white/10 rounded-xl text-zinc-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No discussions yet. Be the first to start a topic!</p>
                    </div>
                )}
            </div>

            {/* Pagination (Simple) */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-white/10 shrink-0">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1 text-xs rounded bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10"
                    >
                        Prev
                    </button>
                    <span className="text-xs text-zinc-400 flex items-center px-2">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 text-xs rounded bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default DiscussionList;
