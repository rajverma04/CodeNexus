import React from "react";
import { Link } from "react-router";
import {
    Code,
    Cpu,
    TrendingUp,
    Users,
    Terminal,
    BrainCircuit,
    Zap,
    ChevronRight,
    Database,
    Lock,
} from "lucide-react";

/**
 * LandingPage Component
 * Public-facing entry point for CodeNexus.
 */
const LandingPage = () => {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative selection:bg-emerald-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Main Content */}
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="pt-15 pb-10 px-6 md:px-12 max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6 animate-fade-in-up">
                        <Zap className="w-4 h-4" />
                        <span>The Future of Coding Prep is Here</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Master Algorithms. <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                            Built for Engineers.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        CodeNexus is the ultimate platform to practice coding problems,
                        track your progress with advanced analytics, and leverage AI to
                        break through mental blocks.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/problems"
                            className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-500/25 w-full sm:w-auto flex items-center justify-center gap-2 group"
                        >
                            Start Coding Free
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-10 px-6 md:px-12 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Terminal className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">
                                Monaco Editor
                            </h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Experience a VS Code-like environment directly in your browser.
                                Syntax highlighting, auto-completion, and multi-language
                                support.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <BrainCircuit className="w-7 h-7 text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">
                                AI Assistance
                            </h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Stuck on a problem? Our integrated AI acts as your personal
                                tutor, providing hints and logic explanations without giving
                                away the answer.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="w-7 h-7 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">
                                Actionable Insights
                            </h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Visualize your consistency with GitHub-style heatmaps and track
                                performance metrics to stay motivated on your journey.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Code Preview Section */}
                <section className="py-20 px-6 md:px-12">
                    <div className="max-w-6xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/10 bg-[#0d1117]">
                        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="ml-4 px-3 py-1 rounded bg-black/40 border border-white/5 text-xs text-zinc-500 font-mono">
                                TWO_SUM.cpp
                            </div>
                        </div>
                        <div className="p-6 md:p-10 font-mono text-sm md:text-base overflow-x-auto text-cyan-200">
                            <div className="opacity-50 mb-2">
                // Find two numbers that add up to target
                            </div>
                            <div>
                                <span className="text-purple-400">class</span>{" "}
                                <span className="text-yellow-300">Solution</span> {"{"}
                            </div>
                            <div className="pl-4">
                                <span className="text-purple-400">public</span>:
                            </div>
                            <div className="pl-8">
                                <span className="text-blue-400">vector</span>&lt;
                                <span className="text-blue-400">int</span>&gt; twoSum(
                                <span className="text-blue-400">vector</span>&lt;
                                <span className="text-blue-400">int</span>&gt;& nums,{" "}
                                <span className="text-blue-400">int</span> target) {"{"}
                            </div>
                            <div className="pl-12">
                                unordered_map&lt;<span className="text-blue-400">int</span>,{" "}
                                <span className="text-blue-400">int</span>&gt; mp;
                            </div>
                            <div className="pl-12">
                                <span className="text-purple-400">for</span> (
                                <span className="text-blue-400">int</span> i = 0; i &lt;
                                nums.size(); i++) {"{"}
                            </div>
                            <div className="pl-16">
                                <span className="text-blue-400">int</span> complement = target -
                                nums[i];
                            </div>
                            <div className="pl-16">
                                <span className="text-purple-400">if</span> (mp.find(complement)
                                != mp.end()) {"{"}
                            </div>
                            <div className="pl-20">
                                <span className="text-purple-400">return</span> {"{"}{" "}
                                mp[complement], i {"}"};
                            </div>
                            <div className="pl-16">{"}"}</div>
                            <div className="pl-16">mp[nums[i]] = i;</div>
                            <div className="pl-12">{"}"}</div>
                            <div className="pl-12">
                                <span className="text-purple-400">return</span> {"{}"};
                            </div>
                            <div className="pl-8">{"}"}</div>
                            <div>{"}"};</div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">100+</div>
                            <div className="text-zinc-500 text-sm uppercase tracking-wider">
                                Problems
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">3</div>
                            <div className="text-zinc-500 text-sm uppercase tracking-wider">
                                Languages
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">24/7</div>
                            <div className="text-zinc-500 text-sm uppercase tracking-wider">
                                AI Support
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">100%</div>
                            <div className="text-zinc-500 text-sm uppercase tracking-wider">
                                Free
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-white/10 bg-black/40 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center gap-4 text-zinc-500 text-sm">
                            <span>&copy; {new Date().getFullYear()} CodeNexus. All rights reserved.</span>
                            <span className="hidden md:block w-1 h-1 bg-zinc-700 rounded-full"></span>
                            <span className="flex items-center gap-1">
                                Created by <a href="https://rajverma.cv/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-medium hover:underline transition-all">Raj Verma</a>
                            </span>
                        </div>
                        <div className="flex gap-6">
                            <a
                                href="#"
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                <Code className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                <Database className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                <Cpu className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
