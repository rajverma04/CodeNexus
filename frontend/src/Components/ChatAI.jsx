import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import axiosClient from "../utils/axiosClient";

const ChatAI = ({ problem, selectedLanguage }) => {
  const { register, handleSubmit, reset } = useForm();

  const [messages, setMessages] = useState([
    { role: "model", parts: [{ text: "Hi, How are you?" }] },
    { role: "user", parts: [{ text: "I am good" }] },
  ]);

  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ChatAI.jsx — submit handler (example)
  const onSubmit = async (data) => {
    // Build updatedMessages from current state + new user message
    const updatedMessages = [
      ...messages,
      { role: "user", parts: [{ text: data.message }] },
    ];

    // Immediately update UI with user's message
    setMessages(updatedMessages);
    reset();

    try {
      const { data: resp } = await axiosClient.post("/ai/chat", {
        messages: updatedMessages,            // send the up-to-date array
        title: problem.title,
        description: problem.description,
        testCases: problem.visibleTestCases,
        startCode: problem.startCode,
        selectedLanguage: selectedLanguage,
      }, {
        timeout: 20000, // 20s, increase if needed
      });

      // If server returns model text
      const modelText = resp?.message ?? "No response text";

      // Append model reply
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: modelText }],
        },
      ]);
    } catch (err) {
      // Show more helpful error in UI (if server returned JSON message)
      let errMsg = "Sorry, Error in chatbot";

      if (err?.response?.data?.message) {
        errMsg = `Error: ${err.response.data.message}`;
      } else if (err?.message) {
        errMsg = `Network/Error: ${err.message}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: errMsg }],
        },
      ]);

      console.error("chat request error:", err);
    }
  };


  const renderMessage = (text) => {
    if (!text) return null;
    return text.split(/\*\*(.*?)\*\*/g).map((part, index) =>
      index % 2 === 1 ? (
        <strong key={index} className="font-bold">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-full h-full bg-slate-900 text-white flex flex-col">
      {/* CHAT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-32 w-full max-w-[900px] mx-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"
              }`}
          >
            <div
              className={`chat-bubble ${msg.role === "user"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-white"
                }`}
            >
              {renderMessage(msg.parts[0].text)}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* FIXED BOTTOM INPUT BAR */}
      <div className="absolute bottom-0 inset-x-0 bg-slate-800 border-t border-slate-700 p-4">
        {/* Match width of chat bubble area */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center gap-3 w-full max-w-[900px] mx-auto"
        >
          <input
            {...register("message", { required: true })}
            placeholder="Ask anything..."
            className="flex-1 px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="p-3 px-5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAI;


