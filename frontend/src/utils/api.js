import axiosInstance from "./axios";

// create chats
export async function createChat(title = "New Chat") {
    const { data } = await axiosInstance.post("/chats", {title});
    return data; 
}

// chat list
export async function chatsList() {
    const { data } = await axiosInstance.get("/chats");
    return data;
}

// get chat messages
export async function getChatMessages(chatId) {
    const { data } = await axiosInstance.get(`/chats/${chatId}`);
    return data;
}

export const sendMessageStream = async ({ chatId, content, signal, onToken, onTyping }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `${process.env.REACT_APP_BASE_URL || "http://localhost:4000/api"}/chats/${chatId}/messages`;

      // Use fetch for POST + SSE streaming
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content }),
        signal,
      });

      if (!response.ok) {
        reject(new Error(`HTTP ${response.status}`));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botHasOutput = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = chunk.split("\n\n");

        for (let evt of events) {
          if (!evt.trim()) continue;

          // Parse SSE lines
          const lines = evt.split("\n");
          const eventName = lines[0].replace("event: ", "").trim();
          const dataStr = lines.slice(1).map(l => l.replace("data: ", "").trim()).join("\n");

          try {
            if (eventName === "message") {
              const data = JSON.parse(dataStr);
              if (data.token) {
                botHasOutput = true;
                onToken?.(data.token);
              }
            }
            else if (eventName === "typing") {
              const data = JSON.parse(dataStr);
              onTyping?.(data.typing);
            }
            else if (eventName === "done") {
              onTyping?.(false);
              resolve();
              return;
            }
            else if (eventName === "error") {
              const data = JSON.parse(dataStr);
              onTyping?.(false);
              if (botHasOutput) {
                console.warn("Stream ended with error but partial reply exists:", data.error);
                resolve();
              } else {
                reject(new Error(data.error || "Streaming error"));
              }
              return;
            }
          } catch (err) {
            console.error("SSE parse error:", err, evt);
          }
        }
      }
      onTyping?.(false);
      resolve();
    } catch (err) {
      onTyping?.(false);
      reject(err);
    }
  });
};



// -------------------------
// Stop streaming
// -------------------------
export const stopStreaming = async (chatId) => {
  const res = await axiosInstance.post(`/chats/${chatId}/stop`);
  return res.data;
};

// Register
export async function registerUser(data) {
    const result = await axiosInstance.post("/auth/register", data);
    return result.data;
}

// Login
export async function loginUser(data) {
    const result = await axiosInstance.post("/auth/login", data);
    return result.data;
}

// Google Oauth
export async function googleOAuth(access_token) {
    const result = await axiosInstance.post("/auth/google-login", { access_token });
    return result.data;
}

// get current user
export const getMe = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const res = await axiosInstance.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch user:", err);
    return null;
  }
};

// update chat title / rename chat
export async function updateChatTitle(chatId, title) {
  const res = await axiosInstance.put(`/chats/${chatId}/title`, { title });
  return res.data.chat;
}

// delete chat
export async function deleteChat(chatId) {
  await axiosInstance.delete(`/chats/${chatId}`);
  return true;
}