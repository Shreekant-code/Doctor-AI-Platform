import { WebSocket, WebSocketServer } from "ws";
import { processVoiceTurn } from "../controller/assistantcontroller.js";
import { MAX_AUDIO_BYTES } from "../voiceservices/sarvamconnect.js";
export const VOICE_SOCKET_PATH = "/ws/assistant/voice";
const sendJson = (socket, payload) => {
    if (socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify(payload));
};
const clearAudio = (session) => {
    session.chunks = [];
    session.totalBytes = 0;
};
const rawDataToBuffer = (data) => {
    if (Buffer.isBuffer(data))
        return data;
    if (Array.isArray(data))
        return Buffer.concat(data);
    return Buffer.from(new Uint8Array(data));
};
const parseControlMessage = (data) => {
    try {
        const message = JSON.parse(rawDataToBuffer(data).toString());
        if (!message || typeof message !== "object" || !("type" in message))
            return undefined;
        const type = message.type;
        return type === "start" || type === "commit" || type === "reset" ? message : undefined;
    }
    catch {
        return undefined;
    }
};
export const installVoiceWebSocketServer = (server) => {
    const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_AUDIO_BYTES });
    server.on("upgrade", (request, socket, head) => {
        const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
        if (url.pathname !== VOICE_SOCKET_PATH) {
            socket.destroy();
            return;
        }
        wss.handleUpgrade(request, socket, head, (websocket) => wss.emit("connection", websocket, request));
    });
    wss.on("connection", (socket) => {
        const session = { threadId: undefined, languageCode: undefined, mimeType: "audio/webm", chunks: [], totalBytes: 0, processing: false, recording: false };
        sendJson(socket, { type: "ready", protocol: "voice.v1", message: "Send start, binary audio chunks, then commit. Omit languageCode for automatic detection." });
        socket.on("message", async (data, isBinary) => {
            if (isBinary) {
                if (session.processing || !session.recording)
                    return sendJson(socket, { type: "error", message: "Send start before audio, and wait for the current reply." });
                const chunk = rawDataToBuffer(data);
                if (!chunk.length)
                    return;
                if (session.totalBytes + chunk.length > MAX_AUDIO_BYTES) {
                    clearAudio(session);
                    return sendJson(socket, { type: "error", message: "Audio must be 15 MB or smaller." });
                }
                session.chunks.push(chunk);
                session.totalBytes += chunk.length;
                return;
            }
            const message = parseControlMessage(data);
            if (!message)
                return sendJson(socket, { type: "error", message: "Invalid voice control message." });
            if (message.type === "reset") {
                clearAudio(session);
                session.recording = false;
                return sendJson(socket, { type: "reset" });
            }
            if (message.type === "start") {
                if (session.processing)
                    return sendJson(socket, { type: "error", message: "Wait for the current reply." });
                clearAudio(session);
                session.recording = true;
                session.threadId = message.threadId;
                session.languageCode = message.languageCode;
                session.mimeType = message.mimeType?.startsWith("audio/") ? message.mimeType : "audio/webm";
                return sendJson(socket, { type: "recording" });
            }
            if (session.processing || !session.recording || !session.totalBytes) {
                return sendJson(socket, { type: "error", message: "Start a recording and send audio before commit." });
            }
            session.processing = true;
            session.recording = false;
            const audio = Buffer.concat(session.chunks);
            clearAudio(session);
            sendJson(socket, { type: "processing" });
            try {
                const result = await processVoiceTurn({ audio, mimeType: session.mimeType, languageCode: session.languageCode, threadId: session.threadId });
                session.threadId = result.threadId;
                sendJson(socket, { type: "transcript", transcript: result.transcript, languageCode: result.languageCode });
                sendJson(socket, { type: "assistant_reply", threadId: result.threadId, reply: result.reply, audioBase64: result.audioBase64, audioContentType: result.audioContentType });
            }
            catch (error) {
                console.error("Voice WebSocket failed:", error);
                sendJson(socket, { type: "error", message: error instanceof Error ? error.message : "Unable to process voice." });
            }
            finally {
                session.processing = false;
            }
        });
    });
};
//# sourceMappingURL=socket.js.map