import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import axiosClient from "../utils/axiosClient";

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
            setTimeout(() => navigate("/admin"), 1000);

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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <div className="text-slate-100">Loading problem...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 p-8 relative">
            {/* Loader overlay */}
            {submitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" aria-hidden="true">
                    <div className="flex flex-col items-center gap-4 bg-slate-800/90 p-6 rounded-lg shadow-lg">
                        <svg className="animate-spin h-12 w-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <div className="text-slate-100 text-sm">Updating problem... please wait</div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 rounded-md bg-emerald-600 px-4 py-2 text-white shadow-lg animate-bounce">
                    {toast}
                </div>
            )}

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Nav using Buttons to avoid NavLink issues */}
                <nav className="flex gap-3">
                    <button onClick={() => navigate("/admin/create")} className="btn btn-sm btn-ghost text-slate-300 hover:text-white">
                        Create
                    </button>
                    <button onClick={() => navigate("/admin/update")} className="btn btn-sm btn-primary">
                        Update
                    </button>
                    <button onClick={() => navigate("/admin/delete")} className="btn btn-sm btn-ghost text-slate-300 hover:text-white">
                        Delete
                    </button>
                </nav>

                <h1 className="text-3xl font-bold text-slate-100">Update Problem</h1>

                {/* Server error */}
                {serverError && (
                    <div className="rounded-md bg-rose-600/10 border border-rose-500 p-3 text-rose-200">
                        {serverError}
                    </div>
                )}

                {/* Success confirmation */}
                {successData && (
                    <div className="rounded-md bg-green-600/10 border border-green-400 p-4 text-green-100 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <strong className="block text-lg">Success</strong>
                                <p className="text-sm text-green-100/90">
                                    {successData.message}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleGoAdmin} className="px-4 py-2 rounded-md bg-slate-800 border text-slate-100">
                                    Go to Admin
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit, (e) => console.log(e))} className="space-y-8">
                    {/* Basic Information card */}
                    <section className="rounded-xl bg-slate-800 p-6 shadow-md border border-slate-700">
                        <h2 className="text-2xl font-semibold text-slate-100 mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-300">Title</label>
                                <input
                                    {...register("title")}
                                    className={`mt-2 block w-full rounded-md border bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 ${errors.title ? "ring-1 ring-rose-500" : "border-slate-700"
                                        }`}
                                    placeholder="Problem title"
                                    disabled={submitting}
                                />
                                {errors.title && <p className="text-rose-400 text-sm mt-1">{errors.title.message}</p>}
                            </div>

                            <div>
                                <label className="text-sm text-slate-300">Description</label>
                                <textarea
                                    {...register("description")}
                                    className={`mt-2 block w-full rounded-md border bg-slate-900 px-3 py-3 text-slate-100 placeholder-slate-500 h-40 ${errors.description ? "ring-1 ring-rose-500" : "border-slate-700"
                                        }`}
                                    placeholder="Describe the problem..."
                                    disabled={submitting}
                                />
                                {errors.description && <p className="text-rose-400 text-sm mt-1">{errors.description.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="text-sm text-slate-300">Difficulty</label>
                                    <select
                                        {...register("difficulty")}
                                        className="mt-2 block w-full rounded-md border bg-slate-900 px-3 py-2 text-slate-100 border-slate-700"
                                        disabled={submitting}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-slate-300">Tag</label>
                                    <select
                                        {...register("tags")}
                                        className="mt-2 block w-full rounded-md border bg-slate-900 px-3 py-2 text-slate-100 border-slate-700"
                                        disabled={submitting}
                                    >
                                        <option value="array">Array</option>
                                        <option value="linkedList">Linked List</option>
                                        <option value="graph">Graph</option>
                                        <option value="dp">DP</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Visible Test Cases */}
                    <section className="rounded-xl bg-slate-800 p-6 shadow-md border border-slate-700">
                        <div className="flex items-start justify-between">
                            <h2 className="text-2xl font-semibold text-slate-100">Visible Test Cases</h2>
                            <button
                                type="button"
                                onClick={() => appendVisible({ input: "", output: "", explanation: "" })}
                                className="ml-4 inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-violet-600 hover:bg-violet-700 text-white"
                                disabled={submitting}
                            >
                                + Add
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            {visibleFields.map((field, index) => (
                                <div key={field.id} className="rounded-md border border-slate-600 p-4 bg-slate-900">
                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => removeVisible(index)} className="text-sm px-3 py-1 rounded-md bg-rose-500 text-white" disabled={submitting}>
                                            Remove
                                        </button>
                                    </div>

                                    <div className="mt-2">
                                        <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className="mt-2 block w-full rounded-md border bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 border-slate-700" disabled={submitting} />
                                    </div>

                                    <div className="mt-3">
                                        <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className="mt-2 block w-full rounded-md border bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 border-slate-700" disabled={submitting} />
                                    </div>

                                    <div className="mt-3">
                                        <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation" className="mt-2 block w-full rounded-md border bg-slate-900 px-3 py-3 text-slate-100 placeholder-slate-500 border-slate-700 h-28" disabled={submitting} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Hidden Test Cases */}
                    <section className="rounded-xl bg-slate-800 p-6 shadow-md border border-slate-700">
                        <div className="flex items-start justify-between">
                            <h2 className="text-2xl font-semibold text-slate-100">Hidden Test Cases</h2>
                            <button type="button" onClick={() => appendHidden({ input: "", output: "" })} className="ml-4 inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-violet-600 hover:bg-violet-700 text-white" disabled={submitting}>
                                + Add
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            {hiddenFields.map((field, index) => (
                                <div key={field.id} className="rounded-md border border-slate-600 p-4 bg-slate-900">
                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => removeHidden(index)} className="text-sm px-3 py-1 rounded-md bg-rose-500 text-white" disabled={submitting}>
                                            Remove
                                        </button>
                                    </div>

                                    <div className="mt-2">
                                        <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="mt-2 block w-full rounded-md border bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 border-slate-700" disabled={submitting} />
                                    </div>

                                    <div className="mt-3">
                                        <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="mt-2 block w-full rounded-md border bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 border-slate-700" disabled={submitting} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Code Templates */}
                    <section className="rounded-xl bg-slate-800 p-6 shadow-md border border-slate-700">
                        <h2 className="text-2xl font-semibold text-slate-100 mb-4">Code Templates</h2>

                        <div className="space-y-8">
                            {["c++", "java", "javascript"].map((lang, idx) => (
                                <div key={lang}>
                                    <h3 className="text-lg text-slate-200 mb-2">{lang}</h3>

                                    <label className="text-sm text-slate-400 block mb-1">Initial code</label>
                                    <textarea {...register(`startCode.${idx}.initialCode`)} className="w-full rounded-md border bg-slate-900 px-3 py-3 text-slate-100 font-mono h-40 border-slate-700" placeholder={`${lang} initial code`} disabled={submitting} />

                                    <label className="text-sm text-slate-400 block mt-4 mb-1">Reference solution</label>
                                    <textarea {...register(`referenceSolution.${idx}.completeCode`)} className="w-full rounded-md border bg-slate-900 px-3 py-3 text-slate-100 font-mono h-40 border-slate-700" placeholder={`${lang} reference solution`} disabled={submitting} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="pt-2">
                        <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-lg">
                            {submitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                "Update Problem"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
