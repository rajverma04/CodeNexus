import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { useParams, Link } from "react-router";
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../Components/SubmissionHistory";
import ChatAI from "../Components/ChatAI";
import NotesPanel from "../Components/NotesPanel";
import { useDispatch } from "react-redux";
import { clearChat } from "../chatSlice";
import Editorial from "../Components/Editorial";
import DiscussionList from "../Components/Discussion/DiscussionList";
import SolutionList from "../Components/Solutions/SolutionList";
import {
    Copy,
    Check,
    Play,
    Send,
    RotateCcw,
    MessageSquare,
    FileText,
    List,
    History,
    BookOpen,
    Code2,
    Terminal,
    CheckCircle2,
    AlertTriangle,
    ArrowLeft,
    Cpu,
    Zap,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";

// Language Map
const languageMap = {
    javascript: "javascript",
    java: "java",
    cpp: "c++",
};

const ProblemEditor = () => {
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("cpp");
    const [theme, setTheme] = useState("premium-dark");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [runningCode, setRunningCode] = useState(false); // New state for run/submit loading
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeLeftTab, setActiveLeftTab] = useState("description");
    const [activeRightTab, setActiveRightTab] = useState("code");
    const [copiedIndex, setCopiedIndex] = useState(null);
    const editorRef = useRef(null);
    let { problemId } = useParams();
    const dispatch = useDispatch();

    // Copy code handler
    const handleCopy = async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            toast.success("Code copied to clipboard");
            setTimeout(() => {
                setCopiedIndex(null);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
            toast.error("Failed to copy code");
        }
    };

    const { handleSubmit } = useForm();

    // Clear chat when switching problems
    useEffect(() => {
        dispatch(clearChat());
    }, [problemId, dispatch]);

    // Fetch problem data
    useEffect(() => {
        const fetchProblem = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/problem/problemById/${problemId}`);
                const initialCode = response.data.startCode.find(
                    (sc) => sc.language === languageMap[selectedLanguage]
                )?.initialCode || "";
                setProblem(response.data);
                setCode(initialCode);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching problem:", error);
                setLoading(false);
                toast.error("Failed to load problem details");
            }
        };

        fetchProblem();
    }, [problemId]);

    // Update code when language changes
    useEffect(() => {
        if (problem) {
            const initialCode = problem.startCode.find(
                (sc) => sc.language === languageMap[selectedLanguage]
            )?.initialCode || "";
            setCode(initialCode);
        }
    }, [selectedLanguage, problem]);

    const handleEditorChange = (value) => {
        setCode(value || "");
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
    };

    const handleThemeChange = (e) => {
        setTheme(e.target.value);
    };

    const handleRun = async () => {
        setRunningCode(true);
        setRunResult(null);
        setActiveRightTab("testcase");

        try {
            const response = await axiosClient.post(`/submission/run/${problemId}`, {
                code,
                language: languageMap[selectedLanguage] || selectedLanguage,
            });

            setRunResult(response.data);
            if (response.data.success) {
                toast.success("Run Successful");
            } else {
                toast.error("Run Failed");
            }
            setRunningCode(false);
        } catch (error) {
            console.error("Error running code:", error);
            setRunResult({
                success: false,
                error: "Internal server error. Please try again.",
            });
            toast.error("Execution failed");
            setRunningCode(false);
        }
    };

    const handleSubmitCode = async () => {
        setRunningCode(true);
        setSubmitResult(null);
        setActiveRightTab("result");

        try {
            const response = await axiosClient.post(`/submission/submit/${problemId}`, {
                code: code,
                language: languageMap[selectedLanguage] || selectedLanguage,
            }
            );

            setSubmitResult(response.data);
            if (response.data.accepted) {
                toast.success("Solution Accepted!", {
                    icon: '🎉',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            } else {
                toast.error("Solution Rejected");
            }
            setRunningCode(false);
        } catch (error) {
            console.error("Error submitting code:", error);
            setSubmitResult(null);
            toast.error("Submission failed");
            setRunningCode(false);
        }
    };

    const getLanguageForMonaco = (lang) => {
        switch (lang) {
            case "javascript": return "javascript";
            case "java": return "java";
            case "cpp": return "cpp";
            default: return "javascript";
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "easy": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            case "medium": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            case "hard": return "text-rose-400 bg-rose-400/10 border-rose-400/20";
            default: return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
        }
    };

    if (loading && !problem) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const handleEditorWillMount = (monaco) => {
        monaco.editor.defineTheme('premium-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'ff7b72' },
                { token: 'string', foreground: 'a5d6ff' },
                { token: 'number', foreground: '79c0ff' },
                { token: 'type', foreground: 'd2a8ff' },
            ],
            colors: {
                'editor.background': '#0d1117',
                'editor.foreground': '#c9d1d9',
                'editor.lineHighlightBackground': '#161b22',
                'editorLineNumber.foreground': '#6e7681',
                'editorIndentGuide.background': '#30363d',
                'editorSuggestWidget.background': '#161b22',
                'editorSuggestWidget.border': '#30363d',
            }
        });
    };

    // Common Button Style for Tabs
    const TabButton = ({ active, onClick, icon: Icon, label }) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all relative border-b-2 z-10 
            ${active
                    ? "text-emerald-400 border-emerald-500 bg-emerald-500/5"
                    : "text-zinc-400 border-transparent hover:text-white hover:bg-white/5"}`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-black text-white selection:bg-emerald-500/30 overflow-hidden">

            {/* Top Navigation Bar */}
            <div className="h-14 border-b border-white/10 bg-[#0a0a0a] flex items-center px-4 justify-between shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link to="/problems" className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="font-bold text-lg truncate max-w-[200px] md:max-w-md">{problem?.title}</h1>
                        {problem && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Run / Submit Actions */}
                    <button
                        onClick={handleRun}
                        disabled={loading || runningCode}
                        className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-white/10 text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {runningCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                        Run
                    </button>
                    <button
                        onClick={handleSubmitCode}
                        disabled={loading || runningCode}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                    >
                        {runningCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                        Submit
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANEL */}
                <div className="w-[45%] flex flex-col border-r border-white/10 bg-[#0d1117]">
                    {/* Left Tabs */}
                    <div className="flex items-center border-b border-white/10 bg-[#0d1117] overflow-x-auto no-scrollbar">
                        <TabButton active={activeLeftTab === "description"} onClick={() => setActiveLeftTab("description")} icon={FileText} label="Description" />
                        <TabButton active={activeLeftTab === "editorial"} onClick={() => setActiveLeftTab("editorial")} icon={BookOpen} label="Editorial" />
                        <TabButton active={activeLeftTab === "solutions"} onClick={() => setActiveLeftTab("solutions")} icon={Code2} label="Solutions" />
                        <TabButton active={activeLeftTab === "submissions"} onClick={() => setActiveLeftTab("submissions")} icon={History} label="Submissions" />
                        <TabButton active={activeLeftTab === "discussion"} onClick={() => setActiveLeftTab("discussion")} icon={MessageSquare} label="Discussion" />
                        <TabButton active={activeLeftTab === "notes"} onClick={() => setActiveLeftTab("notes")} icon={List} label="Notes" />
                        <TabButton active={activeLeftTab === "chatAI"} onClick={() => setActiveLeftTab("chatAI")} icon={MessageSquare} label="AI Help" />
                    </div>

                    {/* Left Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                        {problem && (
                            <>
                                {/* 1. Description Tab */}
                                {activeLeftTab === "description" && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="prose prose-invert max-w-none">
                                            <div className="text-zinc-300 text-base leading-relaxed whitespace-pre-wrap font-sans">
                                                {problem.description}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {problem.visibleTestCases.map((example, index) => (
                                                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">{index + 1}</span>
                                                        Example
                                                    </h4>
                                                    <div className="space-y-3 text-sm font-mono">
                                                        <div>
                                                            <span className="text-zinc-500 block mb-1 text-xs uppercase tracking-wider">Input</span>
                                                            <div className="bg-black/30 p-2.5 rounded-lg text-zinc-300">{example.input}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-zinc-500 block mb-1 text-xs uppercase tracking-wider">Output</span>
                                                            <div className="bg-black/30 p-2.5 rounded-lg text-zinc-300">{example.output}</div>
                                                        </div>
                                                        {example.explanation && (
                                                            <div>
                                                                <span className="text-zinc-500 block mb-1 text-xs uppercase tracking-wider">Explanation</span>
                                                                <div className="text-zinc-400 p-1">{example.explanation}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 2. Editorial Tab */}
                                {activeLeftTab === "editorial" && (
                                    <div className="prose prose-invert max-w-none animate-fade-in">
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-400" /> Editorial</h2>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <Editorial
                                                problemId={problemId}
                                                secureURL={problem.secureURL}
                                                thumbnailURL={problem.thumbnailURL}
                                                duration={problem.duration}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 3. Solutions Tab */}
                                {activeLeftTab === "solutions" && (
                                    <div className="h-full animate-fade-in flex flex-col">
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 shrink-0"><Code2 className="w-5 h-5 text-emerald-400" /> Community Solutions</h2>
                                        <div className="flex-1 min-h-0 bg-[#0d1117]">
                                            <SolutionList problemId={problemId} />
                                        </div>
                                    </div>
                                )}

                                {/* 4. Submissions Tab */}
                                {activeLeftTab === "submissions" && (
                                    <div className="animate-fade-in">
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><History className="w-5 h-5 text-amber-400" /> My Submissions</h2>
                                        <SubmissionHistory problemId={problemId} />
                                    </div>
                                )}

                                {/* 5. Discussion Tab */}
                                {activeLeftTab === "discussion" && (
                                    <div className="h-full animate-fade-in">
                                        <DiscussionList problemId={problemId} />
                                    </div>
                                )}
                                {/* 5. Notes Tab */}
                                {activeLeftTab === "notes" && (
                                    <div className="h-full animate-fade-in">
                                        <NotesPanel problemId={problemId} />
                                    </div>
                                )}

                                {/* 6. Chat Tab */}
                                {activeLeftTab === "chatAI" && (
                                    <div className="h-full flex flex-col animate-fade-in relative">
                                        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 rounded-xl border border-white/10 mb-4 flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                                                <Zap className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">AI Assistant</h3>
                                                <p className="text-xs text-zinc-400">Get hints, optimize code, and debug errors.</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                            <ChatAI problem={problem} selectedLanguage={selectedLanguage} />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL (Editor & Results) */}
                <div className="w-[55%] flex flex-col bg-[#1e1e1e]">
                    {/* Editor Header / Language Select */}
                    <div className="h-10 border-b border-white/10 bg-[#1e1e1e] flex items-center justify-between px-2">
                        <div className="flex items-center">
                            {/* Right Tabs in Header */}
                            <button
                                onClick={() => setActiveRightTab("code")}
                                className={`px-4 h-full text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${activeRightTab === "code" ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
                            >
                                <Code2 className="w-3.5 h-3.5" /> Code
                            </button>
                            <button
                                onClick={() => setActiveRightTab("testcase")}
                                className={`px-4 h-full text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${activeRightTab === "testcase" ? "border-amber-500 text-amber-400 bg-amber-500/5" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
                            >
                                <Terminal className="w-3.5 h-3.5" /> Output
                            </button>
                            <button
                                onClick={() => setActiveRightTab("result")}
                                className={`px-4 h-full text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${activeRightTab === "result" ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Result
                            </button>
                        </div>

                        {activeRightTab === "code" && (
                            <div className="flex items-center gap-2 px-2">
                                <select
                                    value={selectedLanguage}
                                    onChange={handleLanguageChange}
                                    className="bg-[#2d2d2d] text-zinc-300 text-xs rounded border border-white/10 px-2 py-1 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                                >
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                    <option value="javascript">JavaScript</option>
                                </select>

                                {/* Theme Selector */}
                                <select
                                    value={theme}
                                    onChange={handleThemeChange}
                                    className="bg-[#2d2d2d] text-zinc-300 text-xs rounded border border-white/10 px-2 py-1 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                                    title="Select Theme"
                                >
                                    <option value="premium-dark">Premium Dark</option>
                                    <option value="vs-dark">Dark (Standard)</option>
                                    <option value="light">Light</option>
                                    <option value="hc-black">High Contrast</option>
                                </select>
                                <button title="Reset Code" className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-colors">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden relative font-mono">

                        {activeRightTab === "code" && (
                            <Editor
                                height="100%"
                                language={getLanguageForMonaco(selectedLanguage)}
                                value={code}
                                onChange={handleEditorChange}
                                onMount={handleEditorDidMount}
                                beforeMount={handleEditorWillMount}
                                theme={theme}
                                options={{
                                    fontSize: 15,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                    fontLigatures: true,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 2,
                                    padding: { top: 20 },
                                    smoothScrolling: true,
                                    cursorBlinking: "smooth",
                                    cursorSmoothCaretAnimation: "on",
                                    renderLineHighlight: "all",
                                }}
                            />
                        )}

                        {activeRightTab === "testcase" && (
                            <div className="h-full overflow-y-auto p-4 bg-[#1e1e1e] text-sm animate-fade-in relative">
                                {runningCode ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1e1e] z-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500 mb-4"></div>
                                        <h3 className="text-zinc-400 font-medium">Running Test Cases...</h3>
                                    </div>
                                ) : runResult ? (
                                    <div className="space-y-4">
                                        <div className={`p-4 rounded-xl border ${runResult.success ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                {runResult.success ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-rose-400" />}
                                                <h3 className={`font-bold text-lg ${runResult.success ? "text-emerald-400" : "text-rose-400"}`}>
                                                    {runResult.success ? "Accepted" : "Wrong Answer"}
                                                </h3>
                                            </div>
                                            {runResult.success && (
                                                <div className="flex gap-4 text-xs text-zinc-400 ml-9">
                                                    <span>Runtime: <strong className="text-white">{runResult.runtime}s</strong></span>
                                                    <span>Memory: <strong className="text-white">{runResult.memory}KB</strong></span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Test Cases</h4>
                                            {runResult.testCases.map((tc, i) => (
                                                <div key={i} className="bg-[#252526] border border-white/5 rounded-lg overflow-hidden">
                                                    <div className="px-3 py-2 bg-[#2d2d2d] flex justify-between items-center text-xs">
                                                        <span className="font-medium text-zinc-300">Case {i + 1}</span>
                                                        <span className={`font-bold ${tc.status_id == 3 ? "text-emerald-400" : "text-rose-400"}`}>
                                                            {tc.status_id == 3 ? "Passed" : "Failed"}
                                                        </span>
                                                    </div>
                                                    <div className="p-3 text-xs font-mono space-y-2">
                                                        <div>
                                                            <span className="text-zinc-500 block">Input:</span>
                                                            <div className="text-zinc-300">{tc.stdin}</div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-zinc-500 block">Output:</span>
                                                                <div className={`${tc.status_id == 3 ? "text-zinc-300" : "text-rose-300"}`}>{tc.stdout}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-zinc-500 block">Expected:</span>
                                                                <div className="text-emerald-300">{tc.expected_output}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                                        <Terminal className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Run your code to see outputs here.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeRightTab === "result" && (
                            <div className="h-full overflow-y-auto p-4 bg-[#1e1e1e] text-sm animate-fade-in relative">
                                {runningCode ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1e1e] z-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                                        <h3 className="text-zinc-400 font-medium">Evaluating Submission...</h3>
                                    </div>
                                ) : submitResult ? (
                                    <div className="space-y-6">
                                        <div className={`text-center p-8 rounded-2xl border bg-gradient-to-b ${submitResult.accepted ? "from-emerald-900/20 to-transparent border-emerald-500/20" : "from-rose-900/20 to-transparent border-rose-500/20"}`}>
                                            {submitResult.accepted ? (
                                                <>
                                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                                    </div>
                                                    <h2 className="text-3xl font-bold text-white mb-2">Accepted</h2>
                                                    <p className="text-emerald-400/80">Congratulations! You solved this problem.</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <AlertTriangle className="w-8 h-8 text-rose-400" />
                                                    </div>
                                                    <h2 className="text-3xl font-bold text-white mb-2">Wrong Answer</h2>
                                                    <p className="text-rose-400/80">{submitResult.error || "Some test cases failed."}</p>
                                                </>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-[#252526] p-4 rounded-xl text-center border border-white/5">
                                                <div className="text-zinc-500 text-xs uppercase mb-1">Test Cases</div>
                                                <div className={`text-xl font-bold ${submitResult.accepted ? "text-white" : "text-rose-400"}`}>
                                                    {submitResult.passedTestCases}/{submitResult.totalTestCases}
                                                </div>
                                            </div>
                                            <div className="bg-[#252526] p-4 rounded-xl text-center border border-white/5">
                                                <div className="text-zinc-500 text-xs uppercase mb-1">Runtime</div>
                                                <div className="text-xl font-bold text-white">{submitResult.runtime}s</div>
                                            </div>
                                            <div className="bg-[#252526] p-4 rounded-xl text-center border border-white/5">
                                                <div className="text-zinc-500 text-xs uppercase mb-1">Memory</div>
                                                <div className="text-xl font-bold text-white">{submitResult.memory}KB</div>
                                            </div>
                                        </div>

                                        {!submitResult.accepted && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 text-blue-300 text-sm">
                                                <Zap className="w-5 h-5 shrink-0" />
                                                <p>Tip: Use the AI Assistant or check the "Testcase" tab to debug exactly where your code logic might be failing.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                                        <Cpu className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Submit your code to see detailed evaluation.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemEditor;
