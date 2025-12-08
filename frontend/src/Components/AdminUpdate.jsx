// import { useState, useEffect } from "react";
// import axiosClient from "../utils/axiosClient";

// function AdminUpdate() {
//   const [problems, setProblems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [alert, setAlert] = useState(null);

//   const [confirmModal, setConfirmModal] = useState({
//     open: false,
//     id: null,
//     title: "",
//     loading: false,
//   });

//   const fetchProblems = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const { data } = await axiosClient.get("/problem/getAllProblems");
//       setProblems(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch problems. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProblems();
//   }, []);

//   const openConfirm = (id, title) => {
//     setConfirmModal({ open: true, id, title, loading: false });
//   };

//   const closeConfirm = () => {
//     setConfirmModal({ open: false, id: null, title: "", loading: false });
//   };

//   // ===========================================
//   // ✅ Handle Update (NOT DELETE anymore)
//   // ===========================================
//   const handleUpdateConfirm = async () => {
//     const id = confirmModal.id;
//     if (!id) return;

//     try {
//       setConfirmModal((prev) => ({ ...prev, loading: true }));

//       // API CALL → PUT request
//       await axiosClient.put(`/problem/update/${id}`, {
//         title: "Updated Title", // <-- replace with real data later
//       });

//       setAlert({
//         type: "success",
//         message: "Problem updated successfully!",
//       });

//       closeConfirm();
//       fetchProblems(); // refresh updated list
//     } catch (err) {
//       console.error(err);
//       setAlert({
//         type: "error",
//         message: "Failed to update the problem.",
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
//       <div className="max-w-6xl mx-auto">

//         <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100">
//           Update Problems
//         </h1>

//         {alert && (
//           <div
//             className={`mb-6 p-4 rounded-md shadow ${
//               alert.type === "success"
//                 ? "bg-green-50 text-green-800"
//                 : "bg-red-50 text-red-800"
//             }`}
//           >
//             {alert.message}
//             <button
//               onClick={() => setAlert(null)}
//               className="ml-4 text-sm underline"
//             >
//               Dismiss
//             </button>
//           </div>
//         )}

//         {/* Loading Animation */}
//         {loading ? (
//           <div className="min-h-[40vh] flex items-center justify-center">
//             <span className="loading loading-lg"></span>
//           </div>
//         ) : (
//           <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-4 overflow-x-auto">
//             <table className="table w-full">
//               <thead>
//                 <tr className="text-slate-500 dark:text-slate-300">
//                   <th>#</th>
//                   <th>Title</th>
//                   <th>Difficulty</th>
//                   <th>Tags</th>
//                   <th className="text-center">Action</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {problems.map((p, idx) => (
//                   <tr
//                     key={p._id}
//                     className="border-t border-slate-200 dark:border-slate-700"
//                   >
//                     <td>{idx + 1}</td>

//                     <td className="font-semibold">{p.title}</td>

//                     <td>
//                       <span
//                         className={`badge ${
//                           p.difficulty === "easy"
//                             ? "badge-success"
//                             : p.difficulty === "medium"
//                             ? "badge-warning"
//                             : "badge-error"
//                         }`}
//                       >
//                         {p.difficulty}
//                       </span>
//                     </td>

//                     <td>
//                       <span className="badge badge-neutral">{p.tags}</span>
//                     </td>

//                     <td className="text-center">
//                       <button
//                         onClick={() => openConfirm(p._id, p.title)}
//                         className="btn btn-primary btn-sm text-white"
//                       >
//                         Update
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {problems.length === 0 && (
//               <p className="text-center text-slate-500 py-10">
//                 No problems available.
//               </p>
//             )}
//           </div>
//         )}
//       </div>

//       {/* UPDATE Confirmation Modal */}
//       {confirmModal.open && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md shadow-xl relative">
//             <h3 className="text-lg font-bold">Update Problem</h3>
//             <p className="mt-2 text-sm">
//               Do you want to update:{" "}
//               <span className="font-semibold">{confirmModal.title}</span>?
//             </p>

//             <div className="mt-6 flex justify-end gap-3">
//               <button
//                 className="btn btn-ghost"
//                 onClick={closeConfirm}
//                 disabled={confirmModal.loading}
//               >
//                 Cancel
//               </button>

//               <button
//                 className="btn btn-primary text-white"
//                 onClick={handleUpdateConfirm}
//                 disabled={confirmModal.loading}
//               >
//                 {confirmModal.loading ? "Updating..." : "Update"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// export default AdminUpdate;

// AdminUpdate.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import axiosClient from "../utils/axiosClient";

/**
 * NOTE:
 * - Endpoint used for fetch: GET /problem/get/:id
 * - Endpoint used for update: PUT /problem/update/:id
 *  (Change if your backend uses different paths)
 */

/* same schema as create (adjust if backend differs) */
const problemSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required"),
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
    .min(1, "Atleast 1 visible testcase is required"),
  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
      })
    )
    .min(1, "Atleast 1 hidden testcase is required"),
  startCode: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        initialCode: z.string().min(1, "Initial code is required"),
      })
    )
    .length(3, "All three languages is required"),
  referenceSolution: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        completeCode: z.string().min(1, "Complete code is required"),
      })
    )
    .length(3, "All three languages is required"),
});

export default function AdminUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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
        { language: "C++", initialCode: "" },
        { language: "Java", initialCode: "" },
        { language: "JavaScript", initialCode: "" },
      ],
      referenceSolution: [
        { language: "C++", completeCode: "" },
        { language: "Java", completeCode: "" },
        { language: "JavaScript", completeCode: "" },
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

  const {
    fields: startCodeFields,
    // appendStartCode, removeStartCode -- not needed since fixed length
  } = useFieldArray({
    control,
    name: "startCode",
  });

  const {
    fields: refSolutionFields,
    // appendRefSolution, removeRefSolution -- fixed length
  } = useFieldArray({
    control,
    name: "referenceSolution",
  });

  useEffect(() => {
    if (!id) {
      setFetchError("No problem id provided.");
      setLoading(false);
      return;
    }

    const fetchProblem = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        // adjust endpoint to your backend
        const { data } = await axiosClient.get(`/problem/get/${id}`);

        if (!data) {
          throw new Error("Problem not found");
        }

        /* normalize backend response to match form shape if needed */
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
              ? data.startCode
              : [
                  { language: "C++", initialCode: "" },
                  { language: "Java", initialCode: "" },
                  { language: "JavaScript", initialCode: "" },
                ],
          referenceSolution:
            Array.isArray(data.referenceSolution) &&
            data.referenceSolution.length === 3
              ? data.referenceSolution
              : [
                  { language: "C++", completeCode: "" },
                  { language: "Java", completeCode: "" },
                  { language: "JavaScript", completeCode: "" },
                ],
        };

        reset(payload);
      } catch (err) {
        console.error(err);
        setFetchError("Failed to load problem");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, reset]);

  const onSubmit = async (formData) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      setLoading(true);
      // change endpoint/method if your backend differs
      await axiosClient.put(`/problem/update/${id}`, formData);
      setSubmitSuccess("Problem updated successfully.");
      // optionally navigate back after a moment
      setTimeout(() => navigate("/admin"), 900);
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.response?.data?.message || "Failed to update problem. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Update Problem</h1>
        <p className="text-sm text-slate-500">
          Edit fields below and submit to update the problem.
        </p>
      </header>

      {/* Loading spinner while fetching */}
      {loading && (
        <div className="min-h-[30vh] flex items-center justify-center">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      )}

      {/* Fetch error */}
      {fetchError && (
        <div className="alert alert-error shadow-lg">
          <span>{fetchError}</span>
        </div>
      )}

      {/* Submit success / error */}
      {submitSuccess && (
        <div className="alert alert-success shadow-lg">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="alert alert-error shadow-lg">{submitError}</div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* BASIC INFO */}
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Basic Information</h2>

          <div>
            <label className="label">
              <span className="label-text font-medium">Title</span>
            </label>
            <input
              {...register("title")}
              className={`input input-bordered w-full bg-base-100 ${
                errors.title ? "input-error" : ""
              }`}
            />
            {errors.title && (
              <p className="text-sm text-error mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>
            <textarea
              {...register("description")}
              className={`textarea textarea-bordered w-full bg-base-100 h-40 ${
                errors.description ? "textarea-error" : ""
              }`}
            />
            {errors.description && (
              <p className="text-sm text-error mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Difficulty</span>
              </label>
              <select
                {...register("difficulty")}
                className="select select-bordered w-full bg-base-100"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Tag</span>
              </label>
              <select
                {...register("tags")}
                className="select select-bordered w-full bg-base-100"
              >
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
              </select>
            </div>
          </div>
        </div>

        {/* VISIBLE TEST CASES */}
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Visible Test Cases</h2>
            <button
              type="button"
              onClick={() =>
                appendVisible({ input: "", output: "", explanation: "" })
              }
              className="btn btn-sm btn-primary"
            >
              + Add
            </button>
          </div>

          <div className="space-y-4">
            {visibleFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 bg-base-100 border rounded-xl space-y-3"
              >
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeVisible(index)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>

                <input
                  {...register(`visibleTestCases.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full bg-base-100"
                />

                <input
                  {...register(`visibleTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full bg-base-100"
                />

                <textarea
                  {...register(`visibleTestCases.${index}.explanation`)}
                  placeholder="Explanation"
                  className="textarea textarea-bordered w-full bg-base-100 h-28"
                />
              </div>
            ))}
          </div>
        </div>

        {/* HIDDEN TEST CASES */}
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Hidden Test Cases</h2>
            <button
              type="button"
              onClick={() => appendHidden({ input: "", output: "" })}
              className="btn btn-sm btn-primary"
            >
              + Add
            </button>
          </div>

          <div className="space-y-4">
            {hiddenFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 bg-base-100 border rounded-xl space-y-3"
              >
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeHidden(index)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>

                <input
                  {...register(`hiddenTestCases.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full bg-base-100"
                />

                <input
                  {...register(`hiddenTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full bg-base-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* CODE TEMPLATES (LARGER) */}
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Code Templates</h2>

          <div className="space-y-8">
            {startCodeFields.map((f, idx) => (
              <div key={f.id} className="space-y-2">
                <h3 className="text-lg font-medium">{f.language}</h3>
                <textarea
                  {...register(`startCode.${idx}.initialCode`)}
                  className="textarea textarea-bordered w-full bg-base-100 h-56 font-mono"
                  placeholder={`${f.language} initial code`}
                />
                <textarea
                  {...register(`referenceSolution.${idx}.completeCode`)}
                  className="textarea textarea-bordered w-full bg-base-100 h-56 font-mono"
                  placeholder={`${f.language} reference solution`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full text-lg"
          >
            {isSubmitting ? "Updating..." : "Update Problem"}
          </button>
        </div>
      </form>
    </div>
  );
}
