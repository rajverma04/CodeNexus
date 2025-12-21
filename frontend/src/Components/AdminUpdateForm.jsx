import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import axiosClient from "../utils/axiosClient";
import { Link } from "react-router";
import { ArrowLeft, Save, Plus, Trash2, FileText, Eye, EyeOff, Code2, CheckCircle2 } from "lucide-react";

const problemSchema = z.object({
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
    difficulty: z.enum(["easy", "medium", "hard"]),
    tags: z.enum(["array", "linkedList", "graph", "dp"]),
    visibleTestCases: z
        .array(
            z.object({
                input: z.string().min(1, "Input is required"),
                output: z.string().min(1, "Output is required"),
                explanation: z.string().min(1, "Explanation is required"),
            })
        )
        .min(1, "At least 1 visible testcase is required"),
    hiddenTestCases: z
        .array(
            z.object({
                input: z.string().min(1, "Input is required"),
                output: z.string().min(1, "Output is required"),
            })
        )
        .min(1, "At least 1 hidden testcase is required"),
    startCode: z
        .array(
            z.object({
                language: z.enum(["c++", "java", "javascript"]),
                initialCode: z.string().min(1, "Initial code is required"),
            })
        )
        .length(3, "All three languages are required"),
    referenceSolution: z
        .array(
            z.object({
                language: z.enum(["c++", "java", "javascript"]),
                completeCode: z.string().min(1, "Complete code is required"),
            })
        )
        .length(3, "All three languages are required"),
});

export default function AdminUpdateForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState(null);
    const [successData, setSuccessData] = useState(null);
    const [toast, setToast] = useState(null);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues: {
            title: "",
            description: "",
            difficulty: "easy",
            tags: "array",
            visibleTestCases: [{ input: "", output: "", explanation: "" }],
            hiddenTestCases: [{ input: "", output: "" }],
            startCode: [
                { language: "c++", initialCode: "// C++ initial code\n" },
                { language: "java", initialCode: "// Java initial code\n" },
                { language: "javascript", initialCode: "// JavaScript initial code\n" },
            ],
            referenceSolution: [
                { language: "c++", completeCode: "// C++ reference solution\n" },
                { language: "java", completeCode: "// Java reference solution\n" },
                { language: "javascript", completeCode: "// JS reference solution\n" },
            ],
        },
    });

    const {
        fields: visibleFields,
        append: appendVisible,
        remove: removeVisible,
    } = useFieldArray({
        control,
        name: "visibleTestCases",
    });

    const {
        fields: hiddenFields,
        append: appendHidden,
        remove: removeHidden,
    } = useFieldArray({
        control,
        name: "hiddenTestCases",
    });

    useEffect(() => {
        if (!id) {
            setServerError("No problem id provided.");
            setLoading(false);
            return;
        }

        const fetchProblem = async () => {
            try {
                setLoading(true);
                setServerError(null);

                // adjust endpoint to your backend
                const { data } = await axiosClient.get(`/problem/problemById/${id}`);

                if (!data) {
                    throw new Error("Problem not found");
                }

                const normalizeLanguage = (lang) => {
                    if (!lang) return "c++";
                    const l = lang.toLowerCase().trim();
                    if (l === "c++" || l === "cpp") return "c++";
                    if (l === "java") return "java";
                    if (l === "javascript" || l === "js") return "javascript";
                    // Check if valid enum
                    if (l === "c++" || l === "java" || l === "javascript") return l;
                    return "c++";
                };

                const payload = {
                    title: data.title ?? "",
                    description: data.description ?? "",
                    difficulty: data.difficulty ?? "easy",
                    tags: data.tags ?? "array",
                    visibleTestCases:
                        Array.isArray(data.visibleTestCases) && data.visibleTestCases.length
                            ? data.visibleTestCases
                            : [{ input: "", output: "", explanation: "" }],
                    hiddenTestCases:
                        Array.isArray(data.hiddenTestCases) && data.hiddenTestCases.length
                            ? data.hiddenTestCases
                            : [{ input: "", output: "" }],
                    startCode:
                        Array.isArray(data.startCode) && data.startCode.length === 3
                            ? data.startCode.map(sc => ({ ...sc, language: normalizeLanguage(sc.language) }))
                            : [
                                { language: "c++", initialCode: "// C++ initial code\n" },
                                { language: "java", initialCode: "// Java initial code\n" },
                                { language: "javascript", initialCode: "// JavaScript initial code\n" },
                            ],
                    referenceSolution:
                        Array.isArray(data.referenceSolution) &&
                            data.referenceSolution.length === 3
                            ? data.referenceSolution.map(rs => ({ ...rs, language: normalizeLanguage(rs.language) }))
                            : [
                                { language: "c++", completeCode: "// C++ reference solution\n" },
                                { language: "java", completeCode: "// Java reference solution\n" },
                                { language: "javascript", completeCode: "// JS reference solution\n" },
                            ],
                };

                reset(payload);
            } catch (err) {
                console.error(err);
                setServerError("Failed to load problem");
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id, reset]);

    const onSubmit = async (data) => {
        setServerError(null);
        setSubmitting(true);
        setToast(null);

        try {
            await axiosClient.put(`/problem/update/${id}`, data);

            setToast("Problem updated successfully!");
            setSuccessData({ message: "Problem updated successfully." });

            // Auto-hide toast after 3 sec
            setTimeout(() => setToast(null), 3000);
            setSubmitting(false);

            // Navigate back
            setTimeout(() => navigate("/admin/update"), 1500);

        } catch (err) {
            console.error(err);
            setServerError(
                err.response?.data?.message || err.message || "Failed to update problem"
            );
            setSubmitting(false);
        }
    };

    const handleGoAdmin = () => navigate("/admin");

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-emerald-500"></span>
                    <div className="text-zinc-400 animate-pulse">Loading problem data...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden selection:bg-emerald-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Loader overlay */}
            {submitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-hidden="true">
                    <div className="flex flex-col items-center gap-4 bg-[#0d1117] border border-white/10 p-8 rounded-2xl shadow-2xl">
                        <span className="loading loading-spinner loading-lg text-emerald-500"></span>
                        <div className="text-zinc-300 text-sm font-medium animate-pulse">Updating problem... please wait</div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 rounded-xl bg-emerald-600/90 backdrop-blur-md px-6 py-3 text-white shadow-xl animate-fade-in-up flex items-center gap-3 border border-white/10">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">{toast}</span>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">

                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate("/admin/update")}
                        className="mr-6 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Edit Problem</h1>
                        <p className="text-zinc-400 text-sm mt-1">Update content, test cases, and solution code</p>
                    </div>
                </div>

                {/* Server error */}
                {serverError && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 backdrop-blur-sm flex items-start gap-3">
                        <div className="p-1 bg-red-500/20 rounded-full"><EyeOff className="w-4 h-4" /></div>
                        <div>
                            <strong className="block text-sm font-semibold">Error</strong>
                            <span className="text-sm opacity-90">{serverError}</span>
                        </div>
                    </div>
                )}

                {/* Success confirmation */}
                {successData && (
                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400 mt-1">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Update Successful!</h3>
                                <p className="text-emerald-400/80 text-sm">{successData.message}</p>
                                <p className="text-zinc-500 text-xs mt-2">Redirecting to problem list...</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit, (e) => console.log(e))} className="space-y-8">
                    {/* Basic Information card */}
                    <section className="rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><FileText className="w-5 h-5" /></div>
                            <h2 className="text-xl font-bold text-white">Basic Information</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Title</label>
                                <input
                                    {...register("title")}
                                    className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${errors.title ? "border-rose-500/50 focus:border-rose-500" : "border-white/10 focus:border-emerald-500/50"}`}
                                    placeholder="Problem title"
                                    disabled={submitting}
                                />
                                {errors.title && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.title.message}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Description (Markdown supported)</label>
                                <textarea
                                    {...register("description")}
                                    className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all h-40 resize-y ${errors.description ? "border-rose-500/50 focus:border-rose-500" : "border-white/10 focus:border-emerald-500/50"}`}
                                    placeholder="Describe the problem..."
                                    disabled={submitting}
                                />
                                {errors.description && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.description.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Difficulty</label>
                                    <div className="relative">
                                        <select
                                            {...register("difficulty")}
                                            className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            disabled={submitting}
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Topic Tag</label>
                                    <div className="relative">
                                        <select
                                            {...register("tags")}
                                            className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            disabled={submitting}
                                        >
                                            <option value="array">Array</option>
                                            <option value="linkedList">Linked List</option>
                                            <option value="graph">Graph</option>
                                            <option value="dp">Dynamic Programming</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Visible Test Cases */}
                    <section className="rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Eye className="w-5 h-5" /></div>
                                <h2 className="text-xl font-bold text-white">Visible Test Cases</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => appendVisible({ input: "", output: "", explanation: "" })}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors font-medium"
                                disabled={submitting}
                            >
                                <Plus className="w-4 h-4" /> Add Case
                            </button>
                        </div>

                        <div className="space-y-6">
                            {visibleFields.map((field, index) => (
                                <div key={field.id} className="rounded-xl border border-white/5 bg-black/20 p-5 relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => removeVisible(index)}
                                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            disabled={submitting}
                                            title="Remove test case"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Case {index + 1}</h4>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-zinc-400 mb-1 block">Input</label>
                                                <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className="w-full rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50" disabled={submitting} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-zinc-400 mb-1 block">Output</label>
                                                <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className="w-full rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50" disabled={submitting} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-400 mb-1 block">Explanation</label>
                                            <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation" className="w-full rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 h-20 resize-none" disabled={submitting} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {visibleFields.length === 0 && (
                                <div className="text-center py-8 text-zinc-600 text-sm border-2 border-dashed border-white/5 rounded-xl">
                                    No visible test cases.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Hidden Test Cases */}
                    <section className="rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400"><EyeOff className="w-5 h-5" /></div>
                                <h2 className="text-xl font-bold text-white">Hidden Test Cases</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => appendHidden({ input: "", output: "" })}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors font-medium"
                                disabled={submitting}
                            >
                                <Plus className="w-4 h-4" /> Add Case
                            </button>
                        </div>

                        <div className="space-y-6">
                            {hiddenFields.map((field, index) => (
                                <div key={field.id} className="rounded-xl border border-white/5 bg-black/20 p-5 relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => removeHidden(index)}
                                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            disabled={submitting}
                                            title="Remove test case"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Hidden Case {index + 1}</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-zinc-400 mb-1 block">Input</label>
                                            <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="w-full rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50" disabled={submitting} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-400 mb-1 block">Output</label>
                                            <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="w-full rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50" disabled={submitting} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {hiddenFields.length === 0 && (
                                <div className="text-center py-8 text-zinc-600 text-sm border-2 border-dashed border-white/5 rounded-xl">
                                    No hidden test cases.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Code Templates */}
                    <section className="rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400"><Code2 className="w-5 h-5" /></div>
                            <h2 className="text-xl font-bold text-white">Code Templates</h2>
                        </div>

                        <div className="space-y-8">
                            {["c++", "java", "javascript"].map((lang, idx) => (
                                <div key={lang} className="bg-black/20 p-5 rounded-xl border border-white/5">
                                    <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        {lang}
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-zinc-400 mb-1 block">Initial Code</label>
                                            <textarea {...register(`startCode.${idx}.initialCode`)} className="w-full rounded-lg border border-white/5 bg-black/40 px-3 py-3 text-sm font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50 h-32" placeholder={`${lang} initial code`} disabled={submitting} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-400 mb-1 block">Reference Solution</label>
                                            <textarea {...register(`referenceSolution.${idx}.completeCode`)} className="w-full rounded-lg border border-white/5 bg-black/40 px-3 py-3 text-sm font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50 h-32" placeholder={`${lang} reference solution`} disabled={submitting} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="pt-4 pb-12">
                        <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none">
                            {submitting ? (
                                <span className="loading loading-spinner text-white"></span>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Update Problem
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
