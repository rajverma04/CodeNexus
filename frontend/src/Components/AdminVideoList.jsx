import React, { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { ArrowLeft, Video, Film, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";

function AdminVideoList() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get("/video/all");
            setVideos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch video library.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const formatDuration = (seconds) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden selection:bg-emerald-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex items-center mb-8">
                    <Link
                        to="/admin"
                        className="mr-6 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">Video Library</h1>
                        <p className="text-zinc-400 text-sm mt-1">List of all problems with video solutions</p>
                    </div>
                </div>

                {loading ? (
                    <div className="min-h-[40vh] flex items-center justify-center">
                        <span className="loading loading-spinner loading-lg text-emerald-500"></span>
                    </div>
                ) : (
                    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 bg-black/20">
                                        <th className="p-4 font-medium text-zinc-400">#</th>
                                        <th className="p-4 font-medium text-zinc-400">Problem Title</th>
                                        <th className="p-4 font-medium text-zinc-400">Duration</th>
                                        <th className="p-4 font-medium text-zinc-400">Uploaded Date</th>
                                        <th className="p-4 font-medium text-zinc-400 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {videos.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-zinc-500">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Film className="w-10 h-10 opacity-20" />
                                                    <p>No videos found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        videos.map((video, idx) => (
                                            <tr key={video._id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 text-zinc-500 font-mono text-sm">{idx + 1}</td>
                                                <td className="p-4 font-medium text-white flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                                                        <Video className="w-4 h-4" />
                                                    </div>
                                                    <Link to={`/admin/upload/${video.problemId?._id}`} className="hover:text-emerald-400 transition-colors">
                                                        {video.problemId?.title || "Unknown Problem"}
                                                    </Link>
                                                </td>
                                                <td className="p-4 text-zinc-400">
                                                    <div className="flex items-center gap-2 text-xs font-mono bg-white/5 px-2 py-1 rounded-md w-fit">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDuration(video.duration)}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-zinc-400 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(video.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Live
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-white/10 bg-white/5 text-zinc-500 text-xs flex justify-between items-center">
                            <span>Total Videos: {videos.length}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminVideoList;
