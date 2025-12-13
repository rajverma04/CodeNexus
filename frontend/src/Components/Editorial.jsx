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
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
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
                    className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-opacity"
                    onClick={togglePlayPause}
                >
                    <div className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all transform hover:scale-110 shadow-2xl">
                        <Play size={36} className="text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"
                    }`}
            >
                {/* Progress Bar */}
                <div className="px-4 pt-2">
                    <div
                        className="group/seek relative h-1 bg-green-400/30 rounded-full cursor-pointer hover:h-1.5 transition-all"
                        onClick={handleSeek}
                    >
                        {/* Buffered */}
                        <div
                            className="absolute h-full bg-red-400/50 rounded-full"
                            style={{ width: `${buffered}%` }}
                        />
                        {/* Progress */}
                        <div
                            className="absolute h-full bg-red-600 rounded-full flex items-center justify-end"
                            style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                        >
                            <div className="w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity shadow-lg" />
                        </div>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between px-4 py-3 text-white">
                    {/* Left Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlayPause}
                            className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                        >
                            {isPlaying ? (
                                <Pause size={24} className="fill-current" />
                            ) : (
                                <Play size={24} className="fill-current" />
                            )}
                        </button>

                        <button
                            onClick={() => skipTime(-10)}
                            className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                        >
                            <SkipBack size={20} />
                        </button>

                        <button
                            onClick={() => skipTime(10)}
                            className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                        >
                            <SkipForward size={20} />
                        </button>

                        <div className="flex items-center gap-2 group/volume">
                            <button
                                onClick={toggleMute}
                                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX size={20} />
                                ) : (
                                    <Volume2 size={20} />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover/volume:w-20 transition-all duration-200 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                            />
                        </div>

                        <div className="text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(videoDuration)}
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2 relative">
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                            >
                                <Settings size={20} />
                            </button>

                            {/* Settings Dropdown */}
                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg shadow-2xl border border-white/10 min-w-[180px] overflow-hidden">
                                    {/* Quality Section */}
                                    <div className="border-b border-white/10">
                                        <div className="px-4 py-2 text-sm font-semibold border-b border-green-400/10">
                                            Quality
                                        </div>
                                        <button
                                            className="w-full px-4 py-2 text-left text-sm bg-white/20 text-red-500"
                                        >
                                            Auto
                                        </button>
                                    </div>

                                    {/* Playback Speed Section */}
                                    <div>
                                        <div className="px-4 py-2 text-sm font-semibold border-b border-green-400/10">
                                            Playback Speed
                                        </div>
                                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                                            <button
                                                key={speed}
                                                onClick={() => handlePlaybackSpeedChange(speed)}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-green-400/10 transition-colors ${playbackSpeed === speed ? 'bg-white/20 text-red-500' : ''
                                                    }`}
                                            >
                                                {speed === 1 ? 'Normal' : `${speed}x`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={toggleFullscreen}
                            className="hover:bg-green-400/20 p-1.5 rounded-full transition-colors"
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
