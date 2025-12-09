import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import axiosClient from "../utils/axiosClient";

const ChatAI = ({problem, selectedLanguage}) => {
  const { register, handleSubmit, reset } = useForm();

  const [messages, setMessages] = useState([
    { role: "model", parts: [{ text: "Hi, How are you?" }] },
    { role: "user", parts: [{ text: "I am good" }] },
  ]);

  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // !
  
  // const onSubmit = async (data) => {
  //   setMessages((prev) => [
  //     ...prev,
  //     { role: "user", parts: [{ text: data.message }] },
  //   ]);
  //   reset();

  //   try {
  //     const response = await axiosClient.post("/ai/chat", { 
  //       messages: messages,
  //       title: problem.title,
  //       description: problem.description,
  //       testCases: problem.visibleTestCases,
  //       startCode: problem.startCode,
  //       selectedLanguage : selectedLanguage

  //      });
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         role: "model",
  //         parts: [{ text: response.data.message }],     // message recieved from backend json
  //       },
  //     ]);
  //   } catch (err) {
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         role: "model",
  //         parts: [{ text: "Sorry, Error in chatbot" }],
  //       },
  //     ]);
  //   }
  // };

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


  return (
    <div className="relative w-full h-full bg-slate-900 text-white flex flex-col">
      {/* CHAT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-32 w-full max-w-[900px] mx-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat ${
              msg.role === "user" ? "chat-end" : "chat-start"
            }`}
          >
            <div
              className={`chat-bubble ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-700 text-white"
              }`}
            >
              {msg.parts[0].text}
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

// import { useState, useRef, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import axiosClient from "../utils/axiosClient";
// import { Send } from 'lucide-react';

// function ChatAI({problem}) {
//     const [messages, setMessages] = useState([
//         { role: 'model', parts:[{text: "Hi, How are you"}]},
//         { role: 'user', parts:[{text: "I am Good"}]}
//     ]);

//     const { register, handleSubmit, reset,formState: {errors} } = useForm();
//     const messagesEndRef = useRef(null);

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages]);

//     const onSubmit = async (data) => {

//         setMessages(prev => [...prev, { role: 'user', parts:[{text: data.message}] }]);
//         reset();

//         try {

//             const response = await axiosClient.post("/ai/chat", {
//                 messages:messages,
//                 title:problem.title,
//                 description:problem.description,
//                 testCases: problem.visibleTestCases,
//                 startCode:problem.startCode
//             });

//             setMessages(prev => [...prev, {
//                 role: 'model',
//                 parts:[{text: response.data.message}]
//             }]);
//         } catch (error) {
//             console.error("API Error:", error);
//             setMessages(prev => [...prev, {
//                 role: 'model',
//                 parts:[{text: "Error from AI Chatbot"}]
//             }]);
//         }
//     };

//     return (
//         <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
//             <div className="flex-1 overflow-y-auto p-4 space-y-4">
//                 {messages.map((msg, index) => (
//                     <div
//                         key={index}
//                         className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
//                     >
//                         <div className="chat-bubble bg-base-200 text-base-content">
//                             {msg.parts[0].text}
//                         </div>
//                     </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//             </div>
//             <form
//                 onSubmit={handleSubmit(onSubmit)}
//                 className="sticky bottom-0 p-4 bg-base-100 border-t"
//             >
//                 <div className="flex items-center">
//                     <input
//                         placeholder="Ask me anything"
//                         className="input input-bordered flex-1"
//                         {...register("message", { required: true, minLength: 2 })}
//                     />
//                     <button
//                         type="submit"
//                         className="btn btn-ghost ml-2"
//                         disabled={errors.message}
//                     >
//                         <Send size={20} />
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }

// export default ChatAI;

// import { useState, useRef, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import axiosClient from "../utils/axiosClient";
// import { Send } from "lucide-react";

// function ChatAI({ problem }) {
//   const [messages, setMessages] = useState([
//     { role: "model", parts: [{ text: "Hi, How are you" }] },
//     { role: "user", parts: [{ text: "I am Good" }] },
//   ]);

//   const { register, handleSubmit, reset, formState: { errors } } = useForm();
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const onSubmit = async (data) => {
//     if (!data.message) return;
//     setMessages(prev => [...prev, { role: "user", parts: [{ text: data.message }] }]);
//     reset();

//     try {
//       const response = await axiosClient.post("/ai/chat", {
//         messages,
//         title: problem?.title,
//         description: problem?.description,
//         testCases: problem?.visibleTestCases,
//         startCode: problem?.startCode,
//       });

//       setMessages(prev => [
//         ...prev,
//         { role: "model", parts: [{ text: response.data.message || "No reply" }] }
//       ]);
//     } catch (error) {
//       console.error("API Error:", error);
//       setMessages(prev => [...prev, { role: "model", parts: [{ text: "Error from AI Chatbot" }] }]);
//     }
//   };

//   return (
//     // Parent must allow children to shrink — min-h-0 is essential for overflow to work inside flex containers
//     <div className="flex flex-col h-full min-h-0">
//       {/* Chat area — this container scrolls only */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
//         {messages.map((msg, index) => (
//           <div key={index} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
//             <div className="chat-bubble bg-base-200 text-base-content max-w-[80%] break-words">
//               {msg.parts[0].text}
//             </div>
//           </div>
//         ))}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input area — stays fixed to the bottom of this component */}
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="sticky bottom-0 z-10 bg-base-100 border-t px-4 py-3"
//       >
//         <div className="max-w-5xl mx-auto flex gap-3">
//           <input
//             placeholder="Ask me anything"
//             className="input input-bordered flex-1"
//             {...register("message", { required: true, minLength: 1 })}
//             aria-invalid={errors.message ? "true" : "false"}
//           />
//           <button
//             type="submit"
//             className="btn btn-primary inline-flex items-center gap-2"
//             disabled={!!errors.message}
//           >
//             <Send size={16} />
//             Send
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default ChatAI;
