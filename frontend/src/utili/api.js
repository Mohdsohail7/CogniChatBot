

// create chats
import axiosInstance from "./axios";

export async function createChat(title = "New Chat") {
    const { data } = await axiosInstance.post("/api/chats", {title});
    return data; 
}

// chat list
export async function chatsList() {
    const { data } = await axiosInstance.get("/api/chats");
    return data;
}

// get chat messages
export async function getChatMessages(chatId) {
    const { data } = await axiosInstance.get(`/api/chats/${chatId}`);
    return data;
}

// streaming message
export async function sendMessageStream({ chatId, content, onToken, signal }) {
    const result = await fetch(`${process.env.REACT_APP_BASE_URL}/api/chats/${chatId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal
    });

    if (!result.ok || !result.body) throw new Error ("Failed to start stream");

    const reader = result.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (done) break;
        const text = decoder.decode(chunk.value, { stream: true });
        onToken?.(text);
    }
}

// stop streaming
export async function stopStreaming(chatId) {
    try {
        await axiosInstance.post(`/api/chats/${chatId}/stop`);
    } catch {
        // swallow — if no active process, backend may 400
    }
}

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
    const result = await axiosInstance.post("/google", { access_token });
    return result.data;
}