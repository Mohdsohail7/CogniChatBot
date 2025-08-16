import { useState, useEffect, useRef } from "react";
import { Plus, Send, StopCircle, Menu, X } from "lucide-react";

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, title: "Marketing Plan", date: "Aug 10" },
    { id: 2, title: "JavaScript Help", date: "Aug 12" },
  ]);
  const messagesEndRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    const reply = "Sure! Here’s a sample response generated token by token...";
    let idx = 0;

    streamRef.current = setInterval(() => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last.role === "assistant") {
          const updated = [...prev];
          updated[updated.length - 1].text += reply[idx];
          return updated;
        } else {
          return [...prev, { role: "assistant", text: reply[idx] }];
        }
      });
      idx++;
      if (idx >= reply.length) {
        clearInterval(streamRef.current);
        setLoading(false);
      }
    }, 40);

    setInput("");
  };

  const handleStop = () => {
    setLoading(false);
    if (streamRef.current) clearInterval(streamRef.current);
  };

  const handleNewChat = () => {
    const newId = sessions.length + 1;
    setSessions([
      { id: newId, title: `Chat ${newId}`, date: new Date().toLocaleDateString() },
      ...sessions,
    ]);
    setMessages([{ role: "assistant", text: "New chat started. Ask me anything!" }]);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      {/* Sidebar */}
      <div
        className={`
          fixed md:static
          left-0 md:left-auto
          top-14 md:top-0
          h-[calc(100vh-3.5rem)] md:h-full
          w-64
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          z-30 md:z-20
          bg-white/10 backdrop-blur-lg border-r border-white/20 p-4 flex flex-col
        `}
      >
        <div className="mb-4">
          <button
            onClick={handleNewChat}
            className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-lg hover:bg-white/20 cursor-pointer text-white"
              onClick={() => setMessages([{ role: "assistant", text: `Loaded ${s.title}` }])}
            >
              <p className="font-medium">{s.title}</p>
              <span className="text-sm text-gray-200">{s.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar (always on top) */}
        <div className="h-14 sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="h-full flex items-center px-3">
            {/* Toggle on the left; switches Menu/X */}
            <button
              className="md:hidden w-10 h-10 grid place-items-center text-white"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Centered title on mobile, left on desktop; always fully visible */}
            <h1 className="flex-1 text-right md:text-left font-semibold text-white text-lg">
              CogniChatBot
            </h1>

            {/* Right spacer to keep the title centered on mobile */}
            <div className="w-10 md:w-0" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg shadow-md ${
                  msg.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white shadow-md flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400"
          />
          {!loading ? (
            <button
              onClick={handleSend}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              <Send size={18} />
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
            >
              <StopCircle size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
