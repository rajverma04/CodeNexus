import { useState } from "react";
import axiosClient from "../../utils/axiosClient";
import DiscussionForm from "./DiscussionForm";
import { MessageSquare, ThumbsUp, ThumbsDown, Trash2, ChevronDown, ChevronUp, User } from "lucide-react";
import toast from "react-hot-toast";
// Note: Assuming we can access current user info from Redux store if needed, or we just rely on API for permissions
// For "My Like Status", we'll track it locally in state after API interaction, 
// but initially we don't know if *we* liked it unless we send that from backend.
// Backend response currently sends `upvotes` array of userIds.
// We need current user ID to check `upvotes.includes(myId)`.
// We'll get user from Redux store.

import { useSelector } from "react-redux";

const DiscussionItem = ({ discussion, onDelete, isReply = false }) => {
    const user = useSelector(store => store.auth?.user); // Adjust based on actual store shape
    const [item, setItem] = useState(discussion);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState(discussion.replies || []); // In case we populate deeper later

    // For MVP, backend sends populated replies if we used the aggregation pipeline,
    // OR it sends IDs if we used .find(). 
    // In current controller logic (find), we populated replies -> userId.
    // So `discussion.replies` is an array of objects.

    const [isExpanded, setIsExpanded] = useState(false);

    const userId = user?._id || user?.id; // backend _id vs frontend id

    // Check if current user liked/disliked
    const hasLiked = item.upvotes?.includes(userId);
    const hasDisliked = item.downvotes?.includes(userId);

    const handleVote = async (type) => {
        if (!userId) {
            toast.error("Please login to vote");
            return;
        }
        try {
            const res = await axiosClient.put(`/discussion/vote/${item._id}`, { type });
            if (res.data.success) {
                setItem({ ...item, upvotes: res.data.upvotes, downvotes: res.data.downvotes });
            }
        } catch (error) {
            console.error("Vote failed:", error);
        }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const res = await axiosClient.delete(`/discussion/${item._id}`);
            if (res.data.success) {
                toast.success("Deleted");
                onDelete(item._id);
            }
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete");
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleReplySuccess = (newReply) => {
        // Optimistically add reply
        // Ensure the populated user field matches what DiscussionItem expects
        // The backend returns populated `userId` in `addReply` response.
        const updatedReplies = [...(item.replies || []), newReply];
        // We might want to just update local state if we are the parent
        setItem({ ...item, replies: updatedReplies });
        setShowReplies(true);
        setShowReplyForm(false);
    };

    return (
        <div className={`rounded-xl border border-white/5 bg-[#18181b] overflow-hidden transition-all ${isReply ? "ml-8 mt-3 border-l-2 border-l-zinc-700" : "mb-4"}`}>
            <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                            {item.userId?.profilePicture ? (
                                <img src={item.userId.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4" />
                            )}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-zinc-200">
                                {item.userId?.username || "Anonymous"}
                                {item.userId?._id === userId && <span className="ml-2 text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">YOU</span>}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-3">
                    {item.title && <h3 className="font-bold text-zinc-100 mb-1">{item.title}</h3>}
                    <p className={`text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed ${!isExpanded && !isReply && "line-clamp-3"}`}>
                        {item.content}
                    </p>
                    {!isReply && item.content.length > 150 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-xs text-blue-400 hover:underline mt-1"
                        >
                            {isExpanded ? "Show less" : "Show more"}
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 text-zinc-400">
                    <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
                        <button
                            onClick={() => handleVote("like")}
                            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${hasLiked ? "text-emerald-400" : ""}`}
                        >
                            <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? "fill-current" : ""}`} />
                        </button>
                        <span className="text-xs font-medium w-4 text-center">{(item.upvotes?.length || 0) - (item.downvotes?.length || 0)}</span>
                        <button
                            onClick={() => handleVote("dislike")}
                            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${hasDisliked ? "text-rose-400" : ""}`}
                        >
                            <ThumbsDown className={`w-3.5 h-3.5 ${hasDisliked ? "fill-current" : ""}`} />
                        </button>
                    </div>

                    {!isReply && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {item.replies?.length || 0} Replies
                        </button>
                    )}

                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="text-xs hover:text-white transition-colors"
                    >
                        Reply
                    </button>

                    {item.userId?._id === userId && (
                        <button
                            onClick={handleDeleteClick}
                            className="text-xs text-zinc-500 hover:text-rose-400 transition-colors ml-auto"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Reply Form */}
            {showReplyForm && (
                <div className="px-4 pb-4 animate-slide-down">
                    <DiscussionForm
                        discussionId={item._id}
                        isReply={true}
                        onSuccess={handleReplySuccess}
                        onCancel={() => setShowReplyForm(false)}
                    />
                </div>
            )}

            {/* Replies List */}
            {showReplies && !isReply && item.replies?.length > 0 && (
                <div className="border-t border-white/5 bg-black/20 p-4 space-y-3">
                    {item.replies.map(reply => (
                        <DiscussionItem
                            key={reply._id}
                            discussion={reply}
                            isReply={true}
                            onDelete={(id) => {
                                // Update local state to remove reply
                                const updated = item.replies.filter(r => r._id !== id);
                                setItem({ ...item, replies: updated });
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#252526] rounded-xl border border-white/10 p-6 w-full max-w-sm shadow-xl animate-scale-up">
                        <h3 className="text-lg font-bold text-white mb-2">Delete Discussion?</h3>
                        <p className="text-zinc-400 text-sm mb-6">
                            Are you sure you want to delete this discussion? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-lg shadow-rose-500/20 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscussionItem;
