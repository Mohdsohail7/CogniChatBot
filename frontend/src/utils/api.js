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

export const sendMessageStream = async ({ chatId, content, signal, onToken }) => {
  return new Promise((resolve, reject) => {
    const url = `${axiosInstance.defaults.baseURL}/chats/${chatId}/messages`;

    const eventSource = new EventSource(url + `?content=${encodeURIComponent(content)}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.token) {
        onToken(data.token);
      }
    };

    eventSource.addEventListener("done", () => {
      eventSource.close();
      resolve();
    });

    eventSource.addEventListener("error", (event) => {
      console.error("Streaming error:", event);
      eventSource.close();
      reject(new Error("Streaming failed"));
    });

    if (signal) {
      signal.addEventListener("abort", () => {
        eventSource.close();
        reject(new DOMException("Aborted", "AbortError"));
      });
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