import { useState } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../../utils/axiosClient";
import { Send, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const DiscussionForm = ({ problemId, discussionId, onSuccess, onCancel, isReply = false }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            let res;
            if (isReply) {
                // Reply to discussion
                res = await axiosClient.post(`/discussion/reply/${discussionId}`, {
                    content: data.content
                });
            } else {
                // New Discussion
                res = await axiosClient.post(`/discussion/${problemId}`, {
                    title: data.title,
                    content: data.content
                });
            }

            if (res.data.success) {
                toast.success(isReply ? "Reply posted!" : "Discussion posted!");
                reset();
                onSuccess(isReply ? res.data.reply : res.data.discussion);
            }
        } catch (error) {
            console.error("Error posting:", error);
            toast.error("Failed to post");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#252526] rounded-xl p-4 border border-white/10 relative">

            {/* Title only for top-level discussions */}
            {!isReply && (
                <div className="mb-3">
                    <input
                        {...register("title", { required: "Title is required", maxLength: 100 })}
                        placeholder="Title (e.g. How to optimize DP solution?)"
                        className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors"
                    />
                    {errors.title && <span className="text-rose-400 text-xs mt-1 block">{errors.title.message}</span>}
                </div>
            )}

            <div className="mb-3">
                <textarea
                    {...register("content", { required: "Content is required" })}
                    placeholder={isReply ? "Write a reply..." : "Detail your question or share your thought..."}
                    rows={isReply ? 3 : 5}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors resize-none"
                />
                {errors.content && <span className="text-rose-400 text-xs mt-1 block">{errors.content.message}</span>}
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {isReply ? "Reply" : "Post"}
                </button>
            </div>
        </form>
    );
};

export default DiscussionForm;
