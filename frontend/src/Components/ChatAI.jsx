import { useForm } from "react-hook-form";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, initializeChat } from "../chatSlice";

const ChatAI = ({ problem, selectedLanguage }) => {
  const { register, handleSubmit, reset } = useForm();
  const [isTyping, setIsTyping] = useState(false);

  // Use Redux state
  const messages = useSelector((state) => state.chat.messages);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const messageEndRef = useRef(null);

  // Initialize chat with greeting
  useEffect(() => {
    if (messages.length === 0) {
      dispatch(initializeChat(user));
    }
  }, [dispatch, user, messages.length]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const onSubmit = async (data) => {
    if (!data.message.trim()) return;

    // 1. Optimistically append user message to Redux
    const userMsg = { role: "user", parts: [{ text: data.message }] };
    dispatch(addMessage(userMsg));

    // Clean input immediately
    reset();
    setIsTyping(true);

    const updatedMessages = [...messages, userMsg];

    try {
      const { data: resp } = await axiosClient.post("/ai/chat", {
        messages: updatedMessages,
        title: problem.title,
        description: problem.description,
        testCases: problem.visibleTestCases,
        startCode: problem.startCode,
        selectedLanguage: selectedLanguage,
      }, {
        timeout: 20000,
      });

      const modelText = resp?.message ?? "I couldn't generate a response.";

      // 2. Append model reply
      dispatch(addMessage({
        role: "model",
        parts: [{ text: modelText }],
      }));

    } catch (err) {
      let errMsg = "Sorry, I encountered an error processing your request.";
      if (err?.response?.data?.message) {
        errMsg = `Error: ${err.response.data.message}`;
      } else if (err?.message) {
        errMsg = `Network Error: ${err.message}`;
      }

      dispatch(addMessage({
        role: "model",
        parts: [{ text: errMsg }],
      }));
      console.error("Chat request error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  // Custom Formatter to replace ReactMarkdown
  const formatMessage = (text) => {
    if (!text) return null;

    // Split by code blocks first
    const parts = text.split(/```/);

    return parts.map((part, index) => {
      // Even indices are text, Odd indices are code blocks
      if (index % 2 === 1) {
        return (
          <pre key={index} className="bg-black/50 p-3 rounded-lg overflow-x-auto my-2 border border-white/10 text-xs font-mono text-blue-200">
            <code>{part.trim()}</code>
          </pre>
        );
      }

      // Process text for bolding (**text**) and line breaks
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part.split(/(\*\*.*?\*\*)/).map((subPart, subIndex) => {
            if (subPart.startsWith("**") && subPart.endsWith("**")) {
              return <strong key={subIndex} className="text-white font-bold">{subPart.slice(2, -2)}</strong>;
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-zinc-100 font-sans">
      {/* CHAT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">

        {/* Welcome Message if empty */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">CodeNexus AI</h3>
            <p className="text-sm text-zinc-400 max-w-xs">
              I can help you understand the problem, debug your code, or suggest optimizations.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border
                ${msg.role === "user"
                ? "bg-emerald-500 text-black border-emerald-400"
                : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}
            >
              {msg.role === "user" ? <User size={16} strokeWidth={2.5} /> : <Bot size={16} strokeWidth={2.5} />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-tr-sm"
                  : "bg-[#1e1e1e] border border-white/5 text-zinc-300 rounded-tl-sm"
                }`}
            >
              {formatMessage(msg.parts[0].text)}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Bot size={16} strokeWidth={2.5} />
            </div>
            <div className="bg-[#1e1e1e] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 border-t border-white/10 bg-[#0d1117]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative flex items-center gap-2"
        >
          <input
            {...register("message", { required: true })}
            placeholder="Ask about this problem..."
            disabled={isTyping}
            className="w-full bg-[#161b22] text-zinc-200 text-sm placeholder:text-zinc-600 border border-white/10 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all disabled:opacity-50"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isTyping}
            className="absolute right-2 p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={2.5} />}
          </button>
        </form>
        <div className="text-center mt-2">
          <p className="text-[10px] text-zinc-600">AI can make mistakes. Verify important code.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
