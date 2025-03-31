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
}
