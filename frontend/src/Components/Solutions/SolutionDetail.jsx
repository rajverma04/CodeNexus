import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axiosClient from "../../utils/axiosClient";
import { ArrowLeft, User, Calendar, ThumbsUp, MessageSquare, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const SolutionDetail = ({ solution, onClose }) => {
    const user = useSelector(store => store.auth?.user);
    const userId = user?._id || user?.id;

    const [details, setDetails] = useState(solution);
    const [loading, setLoading] = useState(false);
    const [commentText, setCommentText] = useState("");

    // Check local vote status (optimistic)
    const [hasUpvoted, setHasUpvoted] = useState(solution.upvotes?.includes(userId));
    const [upvoteCount, setUpvoteCount] = useState(solution.upvoteCount || solution.upvotes?.length || 0);

    const fetchDetail = async () => {
        try {
            const res = await axiosClient.get(`/solutions/${solution._id}`);
            if (res.data.success) {
                setDetails(res.data.solution);
                // Update basic stats that might have changed
                setHasUpvoted(res.data.solution.upvotes?.includes(userId));
                setUpvoteCount(res.data.solution.upvotes?.length || 0);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Initial fetch to get full comments if List passed truncated data
    useEffect(() => {
        fetchDetail();
    }, [solution._id]);

    const handleUpvote = async () => {
        if (!user) {
            toast.error("Please login to vote");
            return;
        }

        // Optimistic update
        const newStatus = !hasUpvoted;
        setHasUpvoted(newStatus);
        setUpvoteCount(prev => newStatus ? prev + 1 : prev - 1);

        try {
            const res = await axiosClient.put(`/solutions/vote/${solution._id}`);
            if (res.data.success) {
                // Sync with server source of truth
                setDetails(prev => ({ ...prev, upvotes: res.data.upvotes }));
            }
        } catch (error) {
            // Revert
            setHasUpvoted(!newStatus);
            setUpvoteCount(prev => !newStatus ? prev + 1 : prev - 1);
            toast.error("Vote failed");
        }
    };

    const handlePostComment = async () => {
        if (!commentText.trim()) return;
        if (!user) {
            toast.error("Please login to comment");
            return;
        }

        try {
            const res = await axiosClient.post(`/solutions/comment/${solution._id}`, {
                text: commentText
            });

            if (res.data.success) {
                setDetails(prev => ({
                    ...prev,
                    comments: [...(prev.comments || []), res.data.comment]
                }));
                setCommentText("");
                toast.success("Comment posted");
            }
        } catch (error) {
            toast.error("Failed to post comment");
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] animate-slide-up">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#252526] shrink-0">
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="font-bold text-white text-lg line-clamp-1">{details.title}</h2>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <div className="flex items-center gap-1">
                            {details.userId?.profilePicture ? (
                                <img src={details.userId.profilePicture} className="w-4 h-4 rounded-full" />
                            ) : (
                                <User className="w-3 h-3" />
                            )}
                            <span>{details.userId?.username}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(details.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
                {/* Description */}
                <div className="prose prose-invert max-w-none mb-6">
                    <p className="whitespace-pre-wrap text-zinc-300 font-sans leading-relaxed">
                        {details.description}
                    </p>
                </div>

                {/* Tags */}
                {details.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {details.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded text-zinc-400 border border-white/5">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Code Block */}
                <div className="border border-white/10 rounded-xl overflow-hidden mb-8">
                    <div className="bg-[#252526] px-4 py-2 border-b border-white/10 flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-300 capitalize">{details.language}</span>
                    </div>
                    <div className="h-[400px]">
                        <Editor
                            height="100%"
                            language={details.language === "cpp" ? "cpp" : details.language}
                            value={details.code}
                            theme="vs-dark"
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>
                </div>

                {/* Interaction Section */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={handleUpvote}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${hasUpvoted
                                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                            }`}
                    >
                        <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-current" : ""}`} />
                        <span className="font-bold">{upvoteCount}</span>
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400">
                        <MessageSquare className="w-4 h-4" />
                        <span>{details.comments?.length || 0} Comments</span>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-6">
                    <h3 className="font-bold text-white text-lg">Comments</h3>

                    {/* Comment Input */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {user?.profilePicture ? <img src={user.profilePicture} className="w-full h-full rounded-full" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add to the discussion..."
                                className="w-full bg-transparent border-b border-white/10 focus:border-emerald-500 outline-none text-zinc-300 text-sm py-2 min-h-[40px] transition-colors resize-none"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handlePostComment}
                                    disabled={!commentText.trim()}
                                    className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    Comment
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-4">
                        {details.comments?.map((comment, idx) => (
                            <div key={idx} className="flex gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                                    {comment.userId?.profilePicture ? (
                                        <img src={comment.userId.profilePicture} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4 text-zinc-500" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-zinc-300">{comment.userId?.username || "Unknown"}</span>
                                        <span className="text-[10px] text-zinc-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SolutionDetail;
