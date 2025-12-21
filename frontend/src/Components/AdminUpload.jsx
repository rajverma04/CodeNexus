import { useParams, Link } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import axiosClient from "../utils/axiosClient";
import { ArrowLeft, UploadCloud, FileVideo, CheckCircle2, AlertTriangle, X, PlayCircle } from "lucide-react";

function AdminUpload() {
  let { problemId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    setValue
  } = useForm();

  const selectedFile = watch("videoFile")?.[0];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setValue("videoFile", e.dataTransfer.files);
    }
  };

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
        upload_url,
      } = signatureResponse.data;

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
    if (bytes === 0) return "0 Bytes";
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
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">

        <div className="flex items-center mb-8">
          <Link
            to="/admin/video"
            className="mr-6 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Upload Solution</h1>
            <p className="text-zinc-400 text-sm mt-1">Upload a video explanation for this problem</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* File Drop Zone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Video File</label>
              <div
                className={`relative w-full h-64 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden
                    ${dragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-black/20 hover:bg-black/40 hover:border-white/20'}
                    ${errors.videoFile ? 'border-rose-500/50 bg-rose-500/5' : ''}
                    `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  {...register("videoFile", {
                    required: "Please select a video file",
                    onChange: (e) => {
                      if (e.target.files.length > 0) clearErrors("videoFile");
                    },
                    validate: {
                      isVideo: (files) => {
                        if (!files || !files[0]) return "Please select a video file";
                        return files[0].type.startsWith("video/") || "Invalid file type. Please upload a video.";
                      },
                      fileSize: (files) => {
                        if (!files || !files[0]) return true;
                        const maxSize = 100 * 1024 * 1024; // 100MB
                        return files[0].size <= maxSize || "File size exceeds 100MB limit";
                      },
                    },
                  })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-50"
                  disabled={uploading}
                  title=""
                />

                {selectedFile ? (
                  <div className="z-10 p-6 flex flex-col items-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                      <FileVideo className="w-8 h-8" />
                    </div>
                    <p className="text-white font-medium truncate max-w-[250px]">{selectedFile.name}</p>
                    <p className="text-zinc-500 text-sm mt-1">{formatFileSize(selectedFile.size)}</p>
                    <span className="mt-4 px-3 py-1 rounded-full bg-white/10 text-xs text-zinc-300">
                      Click or Drag to change
                    </span>
                  </div>
                ) : (
                  <div className="z-10 p-6 flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${dragActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-400'}`}>
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-white font-medium text-lg">
                      {dragActive ? "Drop video here" : "Drag & Drop video here"}
                    </p>
                    <p className="text-zinc-500 text-sm mt-2">
                      or <span className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">browse files</span>
                    </p>
                    <p className="text-zinc-600 text-xs mt-4">MP4, WebM, Ogg (Max 100MB)</p>
                  </div>
                )}
              </div>
              {errors.videoFile && (
                <p className="text-rose-400 text-sm flex items-center gap-1.5 mt-2">
                  <AlertTriangle className="w-4 h-4" /> {errors.videoFile.message}
                </p>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 animate-fade-in">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-300">Uploading...</span>
                  <span className="text-emerald-400 font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300 ease-out relative"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.root && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm">{errors.root.message}</span>
              </div>
            )}

            {/* Success Message */}
            {uploadedVideo && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-4">
                <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white mb-1">Upload Successful!</h3>
                  <div className="text-zinc-400 text-sm space-y-1">
                    <p>Duration: <span className="text-zinc-300">{formatDuration(uploadedVideo.duration)}</span></p>
                    <p>Uploaded: <span className="text-zinc-300">{new Date().toLocaleString()}</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]
                ${uploading
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                }`}
            >
              {uploading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  Upload Video
                </>
              )}
            </button>

            {/* Thumbnail Preview */}
            {uploadedVideo && (uploadedVideo.thumbnailURL || uploadedVideo.thubmnailURL) && (
              <div className="mt-8 pt-8 border-t border-white/10 animate-fade-in">
                <h4 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" /> Video Preview Thumbnail
                </h4>
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40 relative group">
                  <img
                    src={uploadedVideo.thumbnailURL || uploadedVideo.thubmnailURL}
                    alt="video thumbnail"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm">
                    <a href={uploadedVideo.secureURL} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium backdrop-blur-md transition-all">
                      Open Video
                    </a>
                  </div>
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