// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppHome from "./AppHome";
import FarmerHealthPage from "./FarmerData";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<AppHome />} />
        <Route path="/farmer-health" element={<FarmerHealthPage />} />
      </Routes>
  );
  //   <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-4">
  //     <h1 className="text-5xl font-bold text-blue-600 mb-6">Krishi-Hal</h1>

  //     <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg">
  //       <h2 className="text-xl font-semibold mb-3">Upload Audio</h2>
  //       <input type="file" onChange={handleFileChange} accept="audio/*" className="mb-4 w-full border p-2 rounded-lg" />
  //       {selectedFile && (
  //         <div className="bg-gray-50 p-3 rounded-lg">
  //           <p><strong>File Name:</strong> {selectedFile.name}</p>
  //           <p><strong>Size:</strong> {(selectedFile.size / 1_000_000).toFixed(2)} MB</p>
  //         </div>
  //       )}
  //     </div>

  //     <button
  //       onClick={isRecording ? stopRecording : startRecording}
  //       className={`mt-6 px-6 py-3 text-white rounded-2xl transition-all shadow-md ${
  //         isRecording ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"
  //       }`}
  //     >
  //       {isRecording ? "Stop Recording" : "Start Recording"}
  //     </button>

  //     <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg mt-6">
  //       <h2 className="text-xl font-semibold mb-3">Upload Image</h2>
  //       <input type="file" onChange={handleChangesImages} className="mb-4 w-full border p-2 rounded-lg" />
  //       {imgs && <img src={imgs} className="rounded-lg shadow-md" alt="Uploaded preview" />}
  //     </div>
  //   </div>
  // );
}
