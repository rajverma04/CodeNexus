import { useState } from "react";
import Editor from "@monaco-editor/react";
import axiosClient from "../../utils/axiosClient";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const SolutionForm = ({ problemId, onCancel, onSuccess }) => {
    const [title, setTitle] = useState("");
    const [language, setLanguage] = useState("cpp");
    const [description, setDescription] = useState("");
    const [code, setCode] = useState("// Write your solution here...");
    const [tags, setTags] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !description.trim() || !code.trim()) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setSubmitting(true);
            const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);

            const res = await axiosClient.post(`/solutions/${problemId}`, {
                title,
                language,
                description,
                code,
                tags: tagArray
            });

            if (res.data.success) {
                toast.success("Solution shared successfully!");
                onSuccess();
            }
        } catch (error) {
            console.error("Error creating solution:", error);
            toast.error("Failed to share solution");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#252526]">
                <h2 className="font-bold text-white text-lg">Share Your Solution</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                        Post
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Optimized O(n) Approach using HashMap"
                        className="w-full bg-[#2d2d2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 outline-none transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-1">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-[#2d2d2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 outline-none transition-colors"
                        >
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="javascript">JavaScript</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., Two Pointers, DP"
                            className="w-full bg-[#2d2d2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Explanation</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Explain your approach..."
                        className="w-full h-32 bg-[#2d2d2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 outline-none transition-colors resize-none"
                    />
                </div>

                <div className="h-64 border border-white/10 rounded-lg overflow-hidden">
                    <label className="block text-xs font-bold text-zinc-400 bg-[#252526] px-3 py-1.5 border-b border-white/10">Code</label>
                    <Editor
                        height="100%"
                        language={language === "cpp" ? "cpp" : language}
                        value={code}
                        onChange={(val) => setCode(val)}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SolutionForm;
