// import { useParams } from "react-router";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import { useState } from "react";
// import axiosClient from "../utils/axiosClient";

// function AdminUpload() {
//   let { problemId } = useParams();
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadedVideo, setUploadedVideo] = useState(null);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { error },
//     reset,
//     setError,
//     clearErrors,
//   } = useForm();

//   const selectedFile = watch("videoFile")?.[0];

//   // Upload video to cloudinary
//   const onSubmit = async (data) => {
//     const file = data.videoFile[0];

//     setUploading(true);
//     setUploadProgress(0);
//     clearErrors();

//     try {
//       const signatureResponse = await axiosClient.get(
//         `/video/create/${problemId}`
//       );
//       const {
//         signature,
//         timestamp,
//         public_id,
//         api_key,
//         cloud_name,
//         upload_url,
//       } = signatureResponse.data;

//       // Create form data for cloudinary
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("signature", signature);
//       formData.append("timestamp", timestamp);
//       formData.append("public_id", public_id);
//       formData.append("api_key", api_key);

//       // upload directly to cloudinary
//       const uploadResponse = await axios.post(upload_url, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         onUploadProgress: (progressEvent) => {
//           const progress = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );
//           setUploadProgress(progress);
//         },
//       });

//       const cloudinaryResult = uploadResponse.data;

//       // Save video metadata to backend
//       const metadataResponse = await axiosClient.post("/video/save", {
//         problemId: problemId,
//         cloudinaryPublicId: cloudinaryResult.public_id,
//         secureURL: cloudinaryResult.secure_url,
//         duration: cloudinaryResult.duration,
//       });

//       setUploadedVideo(metadataResponse.data.videoSolution);
//       reset();
//     } catch (err) {
//       console.log("Upload Error: ", err);
//       setError("root", {
//         type: "manual",
//         message:
//           err?.response?.data?.message || "Upload failed. Please try again.",
//       });
//     } finally {
//       setUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   // format file size
//   const formatFileSize = (bytes) => {
//     if (bytes === 0) {
//       return "0 Bytes";
//     }
//     const k = 1024;
//     const size = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));

//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + size[i];
//   };

//   // format duration
//   const formatDuration = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);

//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   return (
//     <>
//       <div>
//         <h1>Upload Video</h1>

//         <form onSubmit={handleSubmit(onSubmit)}>
//             <label htmlFor=""><span>Choose Video File</span></label>

//             <input type="file" accept="video/*"
//             {...register("videoFile", {
//                 required: "Please select the video",
//                 validate: {
//                     isVideo: (files) => {
//                         if(!files || !files[0]) {
//                             return "Please select a video file";
//                         }

//                         const file = files[0];
//                         return file.type.startsWith("video/") || "Please select a valid video file";
//                     },
//                     fileSize: (files) => {
//                         if(!files || !files[0]) {
//                             return true;
//                         }
//                         const file = files[0];
//                         const maxSize = 100 * 1024 * 1024;      // 100mb
//                         return file.size <= maxSize || "File size must be less than 100mb";
//                     }
//                 }
//             })}

//             className={`file-input file-input-bordered ${error.videoFile ? 'file-input-error': }`}
//             disabled={uploading}
//             />

//             {
//                 error.videoFile && (
//                     <label>
//                         <span>{error.videoFile.message}</span>
//                     </label>
//                 )
//             }

//             {/* Selected file info */}
//             {
//                 selectedFile && (
//                     <div>
//                         <h3>Selected File:</h3>
//                         <p>{selectedFile.name}</p>
//                         <p>Size: {formatFileSize(selectedFile.size)}</p>
//                     </div>

//                 )
//             }

//             {/* upload progress */}
//             {
//                 uploading && (
//                     <div>
//                         <span>Uploading...</span>
//                         <span>{uploadProgress}%</span>
//                     </div>
//                 )
//             }

//             {/* Error message */}
//             {
//                 error.root && (
//                     <span>{error.root.message}</span>
//                 )
//             }

//             {/* Success message */}
//             {
//                 uploadedVideo && (
//                     <div>
//                         <h3>Upload successful</h3>
//                         <p>Duration: {formatDuration(uploadedVideo.duration)}</p>
//                         <p>Uploaded: {new Date(uploadedVideo.uploadAt).toLocaleString()}</p>
//                     </div>
//                 )
//             }

//             {/* upload button */}
//             <div>
//                 <button type="submit" disabled={uploading}
//                     className={`${uploading ? "loading" : ""}`}
//                 >
//                     {uploading ? "Uploading..." : "Upload Video"}
//                 </button>
//             </div>

//             {/* Uploaded video preview */}
//             {uploadedVideo && uploadedVideo.thubmnailUrl && (
//                 <div>
//                     <h3>Video Thumbnail:</h3>
//                     <img src={uploadedVideo.thubmnailUrl} alt="video thubmnail" />
//                 </div>
//             )}
//         </form>
//       </div>
//     </>
//   );
// }

// export default AdminUpload;

// todo: above coderarmy code

import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import axiosClient from "../utils/axiosClient";

function AdminUpload() {
  let { problemId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm();

  const selectedFile = watch("videoFile")?.[0];

  const onSubmit = async (data) => {
    const file = data.videoFile[0];

    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      const signatureResponse = await axiosClient.get(
        `/video/create/${problemId}`
      );

      const {
        signature,
        timestamp,
        public_id,
        api_key,
        cloud_name,
        upload_url,
      } = signatureResponse.data;

      console.log("Signature:", signatureResponse.data.signature);
      console.log("Timestamp:", signatureResponse.data.timestamp);

      const formData = new FormData();
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("public_id", public_id);
      formData.append("api_key", api_key);
      formData.append("file", file);

      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      const metadataResponse = await axiosClient.post("/video/save", {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureURL: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
    } catch (err) {
      console.error("Upload Error Details:", err.response?.data);
      setError("root", {
        type: "manual",
        message:
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const size = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + size[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-slate-100 mb-8">
          Upload Video
        </h1>

        <div className="bg-white/95 dark:bg-slate-800 rounded-xl shadow-xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* File input - custom styled */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                Choose Video File
              </label>

              <div className="flex gap-3 items-center">
                {/* Hidden native input */}
                <input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  {...register("videoFile", {
                    required: "Please select the video",
                    validate: {
                      isVideo: (files) => {
                        if (!files || !files[0]) {
                          return "Please select a video file";
                        }
                        const file = files[0];
                        return (
                          file.type.startsWith("video/") ||
                          "Please select a valid video file"
                        );
                      },
                      fileSize: (files) => {
                        if (!files || !files[0]) return true;
                        const file = files[0];
                        const maxSize = 100 * 1024 * 1024; // 100MB
                        return (
                          file.size <= maxSize ||
                          "File size must be less than 100mb"
                        );
                      },
                    },
                  })}
                  className="hidden"
                  disabled={uploading}
                />

                {/* Visible custom choose button */}
                <label
                  htmlFor="videoFile"
                  className={`inline-flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer
                  ${
                    uploading
                      ? "opacity-60 pointer-events-none"
                      : "hover:shadow-lg"
                  }
                  bg-neutral-900 text-white`}
                >
                  {/* Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M12 3v12"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-medium">Choose File</span>
                </label>

                {/* Filename / size */}
                <div className="flex-1 min-w-0">
                  {selectedFile ? (
                    <div className="bg-slate-50 dark:bg-slate-700 border rounded-md px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="truncate">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {selectedFile.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">
                            {formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">Ready</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-700 border rounded-md px-4 py-3 text-slate-500">
                      No file chosen
                    </div>
                  )}
                </div>
              </div>

              {/* validation error */}
              {errors.videoFile && (
                <p className="text-sm text-rose-500 mt-2">
                  {errors.videoFile.message}
                </p>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-md h-3 overflow-hidden">
                  <div
                    className="h-3 bg-indigo-600 dark:bg-indigo-500 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center mt-2 text-slate-600 dark:text-slate-300">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}

            {/* Error message */}
            {errors.root && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-md">
                <p className="text-sm text-rose-700">{errors.root.message}</p>
              </div>
            )}

            {/* Success message */}
            {uploadedVideo && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md">
                <h3 className="font-semibold text-emerald-800">
                  Upload Successful
                </h3>
                <div className="mt-1 text-sm text-slate-700">
                  <p>Duration: {formatDuration(uploadedVideo.duration)}</p>
                  <p>
                    Uploaded:{" "}
                    {new Date(uploadedVideo.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={uploading}
                className={`w-full rounded-lg py-3 text-white font-semibold shadow-md
                ${
                  uploading
                    ? "bg-indigo-500/80"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {uploading ? "Uploading..." : "Upload Video"}
              </button>
            </div>

            {/* Thumbnail preview (if available) */}
            {uploadedVideo &&
              (uploadedVideo.thubmnailURL || uploadedVideo.thumbnailURL) && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Video Thumbnail
                  </h4>
                  <div className="w-full rounded-md overflow-hidden border">
                    <img
                      src={
                        uploadedVideo.thubmnailURL || uploadedVideo.thumbnailURL
                      }
                      alt="video thumbnail"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminUpload;

// import { useParams } from "react-router";
// import { useForm } from "react-hook-form";
// import axios from "axios";
// import { useState } from "react";
// import axiosClient from "../utils/axiosClient";

// function AdminUpload() {
//   let { problemId } = useParams();
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadedVideo, setUploadedVideo] = useState(null);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//     reset,
//     setError,
//     clearErrors,
//   } = useForm();

//   const selectedFile = watch("videoFile")?.[0];

//   const onSubmit = async (data) => {
//     // SAFETY: avoid crash if no file selected
//     const file = data.videoFile?.[0];
//     if (!file) {
//       setError("root", {
//         type: "manual",
//         message: "Please select a video file",
//       });
//       return;
//     }

//     setUploading(true);
//     setUploadProgress(0);
//     clearErrors();

//     try {
//       const signatureResponse = await axiosClient.get(
//         `/video/create/${problemId}`
//       );

//       // debug: make sure backend actually returned the signature object
//       console.log("SIGNATURE RESPONSE:", signatureResponse.data);

//       const {
//         signature,
//         timestamp,
//         public_id,
//         api_key,
//         cloud_name,
//         upload_url,
//       } = signatureResponse.data || {};

//       if (!signature || !timestamp || !public_id || !api_key || !upload_url) {
//         throw new Error("Invalid upload credentials received from server.");
//       }

//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("signature", signature);
//       formData.append("timestamp", timestamp);
//       formData.append("public_id", public_id);
//       formData.append("api_key", api_key);

//       const uploadResponse = await axios.post(upload_url, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         onUploadProgress: (progressEvent) => {
//           const progress = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );
//           setUploadProgress(progress);
//         },
//       });

//       const cloudinaryResult = uploadResponse.data || {};
//       // cloudinary may return duration directly or inside info
//       const duration =
//         cloudinaryResult.duration || cloudinaryResult.info?.duration || 0;

//       const metadataResponse = await axiosClient.post("/video/save", {
//         problemId: problemId,
//         cloudinaryPublicId: cloudinaryResult.public_id,
//         secureURL: cloudinaryResult.secure_url,
//         duration,
//       });

//       // backend should return saved instance fields under videoSolution
//       const received = metadataResponse?.data?.videoSolution || null;
//       setUploadedVideo(received);
//       reset();
//     } catch (err) {
//       console.log("Upload Error: ", err);
//       setError("root", {
//         type: "manual",
//         message:
//           err?.response?.data?.message ||
//           err?.message ||
//           "Upload failed. Please try again.",
//       });
//     } finally {
//       setUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) {
//       return "0 Bytes";
//     }
//     const k = 1024;
//     const size = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));

//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + size[i];
//   };

//   const formatDuration = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);

//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   return (
//     <div className="min-h-screen bg-slate-900 py-12">
//       <div className="max-w-3xl mx-auto">
//         <h1 className="text-4xl font-extrabold text-center text-slate-100 mb-8">
//           Upload Video
//         </h1>

//         <div className="bg-white/95 dark:bg-slate-800 rounded-xl shadow-xl p-6">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             {/* File input - custom styled */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
//                 Choose Video File
//               </label>

//               <div className="flex gap-3 items-center">
//                 {/* Hidden native input */}
//                 <input
//                   id="videoFile"
//                   type="file"
//                   accept="video/*"
//                   {...register("videoFile", {
//                     required: "Please select the video",
//                     validate: {
//                       isVideo: (files) => {
//                         if (!files || !files[0]) {
//                           return "Please select a video file";
//                         }
//                         const file = files[0];
//                         return (
//                           file.type.startsWith("video/") ||
//                           "Please select a valid video file"
//                         );
//                       },
//                       fileSize: (files) => {
//                         if (!files || !files[0]) return true;
//                         const file = files[0];
//                         const maxSize = 100 * 1024 * 1024; // 100MB
//                         return (
//                           file.size <= maxSize ||
//                           "File size must be less than 100mb"
//                         );
//                       },
//                     },
//                   })}
//                   className="hidden"
//                   disabled={uploading}
//                 />

//                 {/* Visible custom choose button */}
//                 <label
//                   htmlFor="videoFile"
//                   className={`inline-flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer
//                   ${
//                     uploading
//                       ? "opacity-60 pointer-events-none"
//                       : "hover:shadow-lg"
//                   }
//                   bg-neutral-900 text-white`}
//                 >
//                   {/* Icon */}
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                   >
//                     <path
//                       d="M12 3v12"
//                       strokeWidth="1.8"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                     <path
//                       d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
//                       strokeWidth="1.8"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                   <span className="font-medium">Choose File</span>
//                 </label>

//                 {/* Filename / size */}
//                 <div className="flex-1 min-w-0">
//                   {selectedFile ? (
//                     <div className="bg-slate-50 dark:bg-slate-700 border rounded-md px-4 py-3">
//                       <div className="flex items-center justify-between gap-4">
//                         <div className="truncate">
//                           <div className="font-medium text-slate-900 dark:text-slate-100">
//                             {selectedFile.name}
//                           </div>
//                           <div className="text-xs text-slate-500 dark:text-slate-300">
//                             {formatFileSize(selectedFile.size)}
//                           </div>
//                         </div>
//                         <div className="text-xs text-slate-400">Ready</div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="bg-slate-50 dark:bg-slate-700 border rounded-md px-4 py-3 text-slate-500">
//                       No file chosen
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* validation error */}
//               {errors.videoFile && (
//                 <p className="text-sm text-rose-500 mt-2">
//                   {errors.videoFile.message}
//                 </p>
//               )}
//             </div>

//             {/* Upload Progress */}
//             {uploading && (
//               <div>
//                 <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-md h-3 overflow-hidden">
//                   <div
//                     className="h-3 bg-indigo-600 dark:bg-indigo-500 transition-all"
//                     style={{ width: `${uploadProgress}%` }}
//                   />
//                 </div>
//                 <p className="text-sm text-center mt-2 text-slate-600 dark:text-slate-300">
//                   Uploading: {uploadProgress}%
//                 </p>
//               </div>
//             )}

//             {/* Error message */}
//             {errors.root && (
//               <div className="p-3 bg-rose-50 border border-rose-100 rounded-md">
//                 <p className="text-sm text-rose-700">{errors.root.message}</p>
//               </div>
//             )}

//             {/* Success message */}
//             {uploadedVideo && (
//               <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md">
//                 <h3 className="font-semibold text-emerald-800">
//                   Upload Successful
//                 </h3>
//                 <div className="mt-1 text-sm text-slate-700">
//                   <p>Duration: {formatDuration(uploadedVideo.duration || 0)}</p>
//                   <p>
//                     Uploaded:{" "}
//                     {new Date(
//                       uploadedVideo.uploadedAt ||
//                         uploadedVideo.uploadAt ||
//                         uploadedVideo.createdAt ||
//                         Date.now()
//                     ).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Submit */}
//             <div>
//               <button
//                 type="submit"
//                 disabled={uploading}
//                 className={`w-full rounded-lg py-3 text-white font-semibold shadow-md
//                 ${
//                   uploading
//                     ? "bg-indigo-500/80"
//                     : "bg-indigo-600 hover:bg-indigo-700"
//                 }`}
//               >
//                 {uploading ? "Uploading..." : "Upload Video"}
//               </button>
//             </div>

//             {/* Thumbnail preview (if available) */}
//             {uploadedVideo &&
//               (uploadedVideo.thumbnailURL || uploadedVideo.thubmnailURL) && (
//                 <div>
//                   <h4 className="text-sm font-medium text-slate-700 mb-2">
//                     Video Thumbnail
//                   </h4>
//                   <div className="w-full rounded-md overflow-hidden border">
//                     <img
//                       src={
//                         uploadedVideo.thumbnailURL || uploadedVideo.thubmnailURL
//                       }
//                       alt="video thumbnail"
//                       className="w-full h-48 object-cover"
//                     />
//                   </div>
//                 </div>
//               )}
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminUpload;
