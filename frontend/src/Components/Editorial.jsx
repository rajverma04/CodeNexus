import { useEffect, useRef, useState } from "react";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Settings,
    SkipBack,
    SkipForward,
} from "lucide-react";
import axiosClient from "../utils/axiosClient";
import Editor from "@monaco-editor/react";

const Editorial = ({ problemId, secureURL, thumbnailURL, duration }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(duration || 0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [buffered, setBuffered] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const controlsTimeoutRef = useRef(null);
    const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(0);

    const [editorialContent, setEditorialContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);

    useEffect(() => {
        const fetchEditorial = async () => {
            if (!problemId) return;
            try {
                setLoadingContent(true);
                const res = await axiosClient.get(`/editorial/${problemId}`);
                if (res.data.success) {
                    setEditorialContent(res.data.editorial);
                }
            } catch (error) {
                console.error("Failed to fetch editorial content", error);
            } finally {
                setLoadingContent(false);
            }
        };
        fetchEditorial();
    }, [problemId]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMutedState = !isMuted;
            setIsMuted(newMutedState);
            videoRef.current.muted = newMutedState;
            if (newMutedState) {
                setVolume(0);
            } else {
                setVolume(videoRef.current.volume || 0.5);
            }
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * videoDuration;
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const skipTime = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
        }
    };

    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };

    const handlePlaybackSpeedChange = (speed) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
            setShowSettings(false);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };

        const handleLoadedMetadata = () => {
            setVideoDuration(video.duration);
        };

        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const duration = video.duration;
                if (duration > 0) {
                    setBuffered((bufferedEnd / duration) * 100);
                }
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("progress", handleProgress);
        video.addEventListener("ended", handleEnded);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("progress", handleProgress);
            video.removeEventListener("ended", handleEnded);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-8">
            {/* 1. Video Player (Conditionally Rendered) */}
            {secureURL ? (
                <div
                    ref={containerRef}
                    className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl border border-white/10 ring-1 ring-white/5"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onMouseMove={handleMouseMove}
                >
                    <video
                        ref={videoRef}
                        src={secureURL}
                        poster={thumbnailURL}
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={togglePlayPause}
                        controlsList="nodownload nofullscreen noremoteplayback"
                        disablePictureInPicture
                    />

                    {!isPlaying && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer transition-all duration-300"
                            onClick={togglePlayPause}
                        >
                            <div className="w-20 h-20 rounded-full bg-white/10 hover:bg-emerald-500/20 backdrop-blur-md flex items-center justify-center transition-all transform hover:scale-110 border border-white/20 group-hover:border-emerald-500/50 shadow-2xl">
                                <Play size={36} className="text-white fill-white ml-2" />
                            </div>
                        </div>
                    )}

                    <div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-2 transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}`}
                    >
                        <div className="px-4 mb-2">
                            <div
                                className="group/seek relative h-1.5 bg-white/10 rounded-full cursor-pointer hover:h-2 transition-all duration-200"
                                onClick={handleSeek}
                            >
                                <div
                                    className="absolute h-full bg-white/20 rounded-full transition-all duration-300"
                                    style={{ width: `${buffered}%` }}
                                />
                                <div
                                    className="absolute h-full bg-emerald-500 rounded-full flex items-center justify-end relative"
                                    style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-0 group-hover/seek:scale-100 transform duration-200" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-4 pb-2 text-white">
                            <div className="flex items-center gap-4">
                                <button onClick={togglePlayPause} className="hover:bg-white/10 p-2 rounded-lg transition-all hover:text-emerald-400">
                                    {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
                                </button>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => skipTime(-10)} className="hover:bg-white/10 p-2 rounded-lg transition-all hover:text-emerald-400 group/skip">
                                        <SkipBack size={18} className="group-hover/skip:-translate-x-0.5 transition-transform" />
                                    </button>
                                    <button onClick={() => skipTime(10)} className="hover:bg-white/10 p-2 rounded-lg transition-all hover:text-emerald-400 group/skip">
                                        <SkipForward size={18} className="group-hover/skip:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 group/volume">
                                    <button onClick={toggleMute} className="hover:bg-white/10 p-2 rounded-lg transition-all hover:text-emerald-400">
                                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </button>
                                    <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 flex items-center">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg"
                                        />
                                    </div>
                                </div>
                                <div className="text-xs font-mono font-medium text-zinc-400">
                                    <span className="text-white">{formatTime(currentTime)}</span>
                                    <span className="mx-1 opacity-50">/</span>
                                    <span>{formatTime(videoDuration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 relative">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSettings(!showSettings)}
                                        className={`p-2 rounded-lg transition-all ${showSettings ? "bg-white/10 text-emerald-400" : "hover:bg-white/10 hover:text-emerald-400"}`}
                                    >
                                        <Settings size={20} className={showSettings ? "animate-spin-slow" : ""} />
                                    </button>
                                    {showSettings && (
                                        <div className="absolute bottom-full right-0 mb-4 bg-[#161b22]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 min-w-[200px] overflow-hidden animate-fade-in-up z-50">
                                            <div>
                                                <div className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5 bg-white/5">
                                                    Playback Speed
                                                </div>
                                                <div className="py-1 max-h-48 overflow-y-auto custom-scrollbar">
                                                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                                                        <button
                                                            key={speed}
                                                            onClick={() => handlePlaybackSpeedChange(speed)}
                                                            className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between group ${playbackSpeed === speed ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                                                        >
                                                            <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                                            {playbackSpeed === speed && (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button onClick={toggleFullscreen} className="hover:bg-white/10 p-2 rounded-lg transition-all hover:text-emerald-400">
                                    <Maximize size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* 2. Text Editorial API Content */}
            {editorialContent ? (
                <div className="animate-fade-in space-y-8">
                    {/* Tags/Meta */}
                    {editorialContent.tags && editorialContent.tags.length > 0 && (
                        <div className="flex gap-2">
                            {editorialContent.tags.map(tag => (
                                <span key={tag} className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Markdown Content */}
                    <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-zinc-300 leading-relaxed font-sans">{editorialContent.content}</p>
                    </div>

                    {/* Code Solutions */}
                    {editorialContent.code && editorialContent.code.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">Implementation</h3>

                            {/* Language Tabs */}
                            <div className="flex items-center gap-2">
                                {editorialContent.code.map((sol, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedLanguageIndex(i)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${selectedLanguageIndex === i
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                                            : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        {sol.language}
                                    </button>
                                ))}
                            </div>

                            {/* Active Solution */}
                            <div className="border border-white/10 rounded-xl overflow-hidden animate-fade-in shadow-2xl">
                                <div className="bg-[#252526] px-4 py-2 border-b border-white/10 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <span className="text-xs font-bold text-zinc-300 uppercase">{editorialContent.code[selectedLanguageIndex].language}</span>
                                    </div>
                                </div>
                                <div className="h-[400px]">
                                    <Editor
                                        height="100%"
                                        language={editorialContent.code[selectedLanguageIndex].language === "cpp" ? "cpp" : editorialContent.code[selectedLanguageIndex].language}
                                        value={editorialContent.code[selectedLanguageIndex].code}
                                        theme="vs-dark"
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            scrollBeyondLastLine: false,
                                            padding: { top: 16 }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                !loadingContent && !secureURL && (
                    <div className="text-center py-12 text-zinc-500 border border-dashed border-white/10 rounded-xl">
                        <p>No editorial content available yet.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default Editorial;
