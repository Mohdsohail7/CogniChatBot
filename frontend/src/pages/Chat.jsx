import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Send, StopCircle, Menu, X, Settings, LogOut, HelpCircle, UserCircle } from "lucide-react";
import {
  chatsList,
  createChat,
  getChatMessages,
  getMe,
  sendMessageStream,
  stopStreaming,
  updateChatTitle,
} from "../utils/api";
import { getInitials } from "../utils/initialName";


// dynamic menu
const profileMenu = [
  { label: "Settings", icon: Settings, onClick: () => alert("Open Settings") },
  { label: "Help", icon: HelpCircle, onClick: () => alert("Help Section") },
  {
    label: "Logout",
    icon: LogOut,
    onClick: () => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    },
    danger: true,
  },
];

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const dropdownRef = useRef(null);

  // get user dynamically
  const [user, setUser] = useState(null);
  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (me) setUser(me);
    })();
  },[])

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) || null,
    [chats, activeChatId]
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chats on mount; create one if none
  useEffect(() => {
    (async () => {
      const data = await chatsList();
      if (!data?.length) {
        const created = await createChat("New Chat");
        setChats([created]);
        setActiveChatId(created.id);
        setMessages([
          { role: "assistant", content: "New chat started. Ask me anything!" },
        ]);
      } else {
        setChats(data);
        setActiveChatId(data[0].id);
      }
    })();
  }, []);

  // load messages when active chat changes
  useEffect(() => {
    if (!activeChatId) return;
    (async () => {
      const msgs = await getChatMessages(activeChatId);
      // backend roles: "user" / "bot"
      const mapped = msgs.map((msg) => ({
        role: msg.role === "bot" ? "assistant" : msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      }));
      setMessages(mapped);
    })();
  }, [activeChatId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    let chatId = activeChatId;
    if (!chatId) {
      const created = await createChat("New Chat");
      setChats((prev) => [created, ...prev]);
      setActiveChatId(created.id);
      chatId = created.id;
    }

    // Optimistic user message
    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);

    let newTitle;
    // Local title update
    if (activeChat?.title === "New Chat") {
      newTitle = autoNameFrom(userText);
      setChats((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, title: newTitle } : c))
      );
    }

    // update backend
    try {
      await updateChatTitle(activeChatId, newTitle);
    } catch (err) {
      console.error("Failed to update chat title:", err);
    }

    // Prepare assistant placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    // Start streaming
    setLoading(true);
    abortRef.current = new AbortController();

    try {
      await sendMessageStream({
        chatId: activeChatId,
        content: userText,
        signal: abortRef.current.signal,
        onToken: (chunk) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (!last || last.role !== "assistant") return prev;
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            };
            return updated;
          });
        },
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages((p) => [
          ...p,
          { role: "assistant", content: "Stream failed.", isError: true },
        ]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = async () => {
    try {
      abortRef.current?.abort();
      await stopStreaming(activeChatId);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleNewChat = async () => {
    // close streaming if any
    if (loading) await handleStop();

    const created = await createChat("New Chat");
    setChats((prev) => [created, ...prev]);
    setActiveChatId(created.id);
    setMessages([
      { role: "assistant", content: "New chat started. Ask me anything!" },
    ]);
    setSidebarOpen(false); // collapse on mobile
  };

  const autoNameFrom = (text) => {
    const t = text.trim().replace(/\s+/g, " ");
    if (!t) return "New Chat";
    const words = t.split(" ").slice(0, 6).join(" ");
    return words.charAt(0).toUpperCase() + words.slice(1);
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
          z-30 md:z-20
          bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 backdrop-blur-lg border-r border-white/20 p-4 flex flex-col
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
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 rounded-lg hover:bg-white/20 cursor-pointer text-white ${
                chat.id === activeChatId ? "bg-white/20" : ""
              }`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <p className="font-medium">{chat.title}</p>
              <span className="text-sm text-gray-200">
                {new Date(chat.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        {/* Profile Button (fixed at bottom) */}
        <div className="relative">
          <button
            ref={profileRef}
            onClick={() => setProfileOpen((p) => !p)}
            className="w-full flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg mt-2"
          >
            {/* Avatar with initials */}
            <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold">
              {getInitials(user?.name)}
              
            </span>
            <span>{user?.name}</span>
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div
              ref={dropdownRef}
              className="absolute bottom-14 left-0 w-60 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 rounded-xl shadow-lg border border-gray-200 p-3"
            >
              {/* User Info */}
              <div className="mb-3 flex items-center gap-1">
                <UserCircle size={15} className="text-gray-600" />
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                {profileMenu.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-left ${
                        item.danger
                          ? "text-gray-700 font-medium"
                          : "text-gray-800"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`w-auto px-4 py-2 rounded-lg shadow-md ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : msg.isError
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {msg.content}
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
