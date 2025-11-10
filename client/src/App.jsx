import React from "react";
import UploadBox from "./components/UploadBox";

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-3">FileShare</h1>
        <p className="text-sm text-gray-500 mb-4">Upload a file and get a temporary share link.</p>
        <UploadBox />
      </div>
    </div>
  );
}

