// client/src/components/UploadBox.jsx
import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function UploadBox() {
  const [file, setFile] = useState(null);
  const [ttl, setTtl] = useState(24);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = (accepted) => {
    if (accepted && accepted.length) setFile(accepted[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  });

  const upload = async () => {
    if (!file) return alert("Choose a file first");
    setLoading(true);
    setProgress(0);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("ttlHours", String(ttl));

    try {
      const res = await axios.post(`${API}/api/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={`p-6 border-2 rounded ${isDragActive ? "border-indigo-500" : "border-gray-200"}`}>
        <input {...getInputProps()} />
        <div className="text-center">
          <p className="font-medium">Drag & drop a file here or click to browse</p>
          <p className="text-sm text-gray-500 mt-2">{file ? file.name : "Max 50MB"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="number" min="1" value={ttl} onChange={(e) => setTtl(Number(e.target.value))} className="w-24 p-2 border rounded" />
        <div className="text-sm text-gray-500">hours until expiry</div>
      </div>

      <div className="flex gap-3">
        <button onClick={upload} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">
          {loading ? "Uploading..." : "Upload"}
        </button>
        <button onClick={() => { setFile(null); setResult(null); setProgress(0); }} className="px-4 py-2 border rounded">Reset</button>
      </div>

      {progress > 0 && (
        <div>
          <div className="h-3 bg-gray-100 rounded">
            <div className="h-3 bg-indigo-500 rounded" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-sm text-gray-500 mt-1">{progress}%</div>
        </div>
      )}

      {result && (
        <div className="p-3 border rounded bg-gray-50">
          <div className="text-sm">Share link (expires: <strong>{new Date(result.expiresAt).toLocaleString()}</strong>)</div>
          <div className="mt-2 flex gap-2">
            <input readOnly className="flex-1 p-2 border rounded" value={result.shareUrl} />
            <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={() => navigator.clipboard.writeText(result.shareUrl)}>Copy</button>
            <a className="px-3 py-2 bg-gray-200 rounded" href={result.shareUrl} target="_blank" rel="noreferrer">Open</a>
          </div>
        </div>
      )}
    </div>
  );
}
