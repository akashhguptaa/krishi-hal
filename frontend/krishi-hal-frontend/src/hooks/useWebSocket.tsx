import { useEffect, useCallback, useRef, useState } from "react";

export const useWebSocket = (url: string) => {
  const ws = useRef<WebSocket | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [transcript, setTranscript] = useState<string | null>(null);

  const send = useCallback((data: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    }
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onmessage = async ({ data }) => {
      console.log("Message received:", data);

      if (data instanceof Blob) {
        try {
          audioChunks.current.push(data); // Collect the audio chunks
          console.log(`Received ${audioChunks.current.length} chunks so far`);
        } catch (error) {
          console.error("Error processing Blob:", error);
        }
        return;
      } else if (typeof data === "string") {
        setTranscript(data);
        console.log("Transcript:", data);
      }

      try {
        const parsedData = JSON.parse(data);
        console.log("Parsed Data:", parsedData);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onopen = () => console.log("WebSocket Connected");
    ws.current.onerror = (error) => console.error("WebSocket Error:", error);
    ws.current.onclose = () => {
      console.log("WebSocket connection closed.");

      if (audioChunks.current.length > 0) {
        const finalBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const audioURL = URL.createObjectURL(finalBlob);
        setAudioURL(audioURL);
        console.log("Final Audio Ready:", audioURL);

        audioChunks.current = []; // Clear buffer
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  return { send, audioURL, transcript };
};
