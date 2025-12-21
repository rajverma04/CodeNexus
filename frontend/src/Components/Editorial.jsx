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

const Editorial = ({ secureURL, thumbnailURL, duration }) => {
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

        const handleTimeUpdate = () => {
            if (video) {
                setCurrentTime(video.currentTime);
            }
        };

        const handleLoadedMetadata = () => {
            if (video) {
                setVideoDuration(video.duration);
            }
        };

        const handleProgress = () => {
            if (video && video.buffered.length > 0) {
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

        if (video) {
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
        }
    }, []);

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    if (!secureURL) {
        return (
            <div className="flex items-center justify-center p-8 bg-base-200 rounded-lg border border-base-300">
                <p className="text-gray-500">
                    No editorial video available for this problem.
                </p>
            </div>
        );
    }

    return (
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

            {/* Center Play Button Overlay */}
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

            {/* Bottom Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-2 transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"
                    }`}
            >
                {/* Progress Bar */}
                <div className="px-4 mb-2">
                    <div
                        className="group/seek relative h-1.5 bg-white/10 rounded-full cursor-pointer hover:h-2 transition-all duration-200"
                        onClick={handleSeek}
                    >
                        {/* Buffered */}
                        <div
                            className="absolute h-full bg-white/20 rounded-full transition-all duration-300"
                            style={{ width: `${buffered}%` }}
                        />
                        {/* Progress */}
                        <div
                            className="absolute h-full bg-emerald-500 rounded-full flex items-center justify-end relative"
                            style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-0 group-hover/seek:scale-100 transform duration-200" />
                        </div>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between px-4 pb-2 text-white">
                    {/* Left Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={togglePlayPause}
                            className="hover:bg-white/10 p-2 rounded-lg transition-all hover:text-emerald-400"
                        >
                            {isPlaying ? (
                                <Pause size={20} className="fill-current" />
                            ) : (
                                <Play size={20} className="fill-current" />
                            )}
                        </button>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => skipTime(-10)}
                                className="hover:bg-white/10 p-2 rounded-lg transition-all hover:text-emerald-400 group/skip"
                            >
                                <SkipBack size={18} className="group-hover/skip:-translate-x-0.5 transition-transform" />
                            </button>

                            <button
                                onClick={() => skipTime(10)}
                                className="hover:bg-white/10 p-2 rounded-lg transition-all hover:text-emerald-400 group/skip"
                            >
                                <SkipForward size={18} className="group-hover/skip:translate-x-0.5 transition-transform" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 group/volume">
                            <button
                                onClick={toggleMute}
                                className="hover:bg-white/10 p-2 rounded-lg transition-all hover:text-emerald-400"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX size={20} />
                                ) : (
                                    <Volume2 size={20} />
                                )}
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

                    {/* Right Controls */}
                    <div className="flex items-center gap-2 relative">
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={`p-2 rounded-lg transition-all ${showSettings ? "bg-white/10 text-emerald-400" : "hover:bg-white/10 hover:text-emerald-400"
                                    }`}
                            >
                                <Settings size={20} className={showSettings ? "animate-spin-slow" : ""} />
                            </button>

                            {/* Settings Dropdown */}
                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-4 bg-[#161b22]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 min-w-[200px] overflow-hidden animate-fade-in-up z-50">
                                    {/* Playback Speed Section */}
                                    <div>
                                        <div className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5 bg-white/5">
                                            Playback Speed
                                        </div>
                                        <div className="py-1 max-h-48 overflow-y-auto custom-scrollbar">
                                            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                                                <button
                                                    key={speed}
                                                    onClick={() => handlePlaybackSpeedChange(speed)}
                                                    className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between group ${playbackSpeed === speed
                                                            ? 'bg-emerald-500/10 text-emerald-400'
                                                            : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                                                        }`}
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
                        <button
                            onClick={toggleFullscreen}
                            className="hover:bg-white/10 p-2 rounded-lg transition-all hover:text-emerald-400"
                        >
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Editorial;
