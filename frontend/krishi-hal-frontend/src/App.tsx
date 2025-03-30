import { useState, useRef, useEffect } from "react";
import WaveSurfer from 'wavesurfer.js';

const audioContext = new AudioContext();

function App() {
  const ws = useRef<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  const [selectedFile, setSelectedFile] = useState<null | File>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4a5568',
        progressColor: '#48bb78',
        cursorColor: '#2f855a',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 100,
        barGap: 3
      });
    }

    ws.current = new WebSocket("ws://localhost:8005/ws/transcription");
    ws.current.onopen = () => console.log("WebSocket Connected");
    ws.current.onerror = (error) => console.error("WebSocket Error:", error);
    ws.current.onclose = () => console.log("WebSocket Disconnected");

    return () => {
      ws.current?.close();
      wavesurfer.current?.destroy();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.startsWith("audio/")) {
        console.error("Invalid file type. Please upload an audio file.");
        return;
      }

      setSelectedFile(file);
      wavesurfer.current?.loadBlob(file);

      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;

        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const monoAudioBuffer = convertToMono(audioBuffer);
          const chunks = createAudioChunks(monoAudioBuffer, 3, 1);

          for (const chunk of chunks) {
            sendChunkToBackend(chunk);
          }
        } catch (error) {
          console.error("Error decoding audio:", error);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
          const blob = new Blob([event.data], { type: 'audio/wav' });
          wavesurfer.current?.loadBlob(blob);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const arrayBuffer = await audioBlob.arrayBuffer();

        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const monoAudioBuffer = convertToMono(audioBuffer);
          const chunks = createAudioChunks(monoAudioBuffer, 3, 1);

          for (const chunk of chunks) {
            sendChunkToBackend(chunk);
          }
        } catch (error) {
          console.error("Error processing recorded audio:", error);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start(100); // Update every 100ms for visualization
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // ..
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-green-200">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-green-800 mb-2">Farm Voice Notes</h1>
          <p className="text-green-600">Record your farming observations and notes</p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg mb-8">
          <div className="flex items-center justify-center mb-6">
            <label className="relative cursor-pointer bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors">
              <span>Choose Audio File</span>
              <input
                type="file"
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
              />
            </label>
          </div>

          {selectedFile && (
            <div className="text-green-800 bg-green-100 p-4 rounded-lg mb-4">
              <p className="font-semibold">File Details:</p>
              <p>Name: {selectedFile.name}</p>
              <p>Size: {(selectedFile.size / 1_000_000).toFixed(2)} MB</p>
              <p>Type: {selectedFile.type}</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div 
            ref={waveformRef} 
            className="bg-green-50 rounded-lg p-4 border border-green-200"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`
              px-8 py-4 rounded-full font-bold text-lg shadow-lg transform transition-all
              ${isRecording 
                ? 'bg-red-600 hover:bg-red-700 scale-105' 
                : 'bg-green-600 hover:bg-green-700'
              } text-white
            `}
          >
            {isRecording ? (
              <div className="flex items-center">
                <span className="animate-pulse mr-2">●</span>
                Stop Recording
              </div>
            ) : (
              "Start Recording"
            )}
          </button>

        </div>
      </div>
    </div>
  );
}

export default App;

