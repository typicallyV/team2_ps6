import React, { useState, useEffect } from "react";
import { AiOutlineUpload } from "react-icons/ai";
import { format } from "date-fns";

export default function Prescription() {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([
    // local dummy initial data (server entries will replace/augment this if available)
    { id: "local-1", name: "Prescription_01.pdf", date: new Date("2025-12-05"), file: null, url: null },
    { id: "local-2", name: "Prescription_02.png", date: new Date("2025-12-04"), file: null, url: null },
  ]);
  const [selectedFile, setSelectedFile] = useState(null); // can be string (url/path) or File object
  const [previewObjectUrl, setPreviewObjectUrl] = useState(null); // track created object URL for cleanup

  // Fetch prescriptions from backend on mount
  useEffect(() => {
    fetch("http://localhost:5000/prescriptions")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        // Expecting array of { _id, name, date, url } (or similar)
        const normalized = data.map((d) => ({
          id: d._id || d.id || `${d.name}-${Math.random()}`,
          name: d.name,
          date: d.date ? new Date(d.date) : new Date(),
          url: d.url || d.path || d.filePath || null,
          file: null,
        }));
        setUploadedFiles(normalized);
      })
      .catch(() => {
        // backend unavailable — keep the local fallback state
      });
  }, []);

  // Cleanup created object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [previewObjectUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Attempt server upload first
    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then((data) => {
        // Expect server to return created record with at least { _id, name, date, url }
        const record = {
          id: data._id || data.id || `${data.name}-${Math.random()}`,
          name: data.name || file.name,
          date: data.date ? new Date(data.date) : new Date(),
          url: data.url || data.path || null,
          file: null,
        };
        setUploadedFiles((prev) => [record, ...prev]);
      })
      .catch(() => {
        // Fallback: store locally with the actual File object for preview/open
        const localRecord = {
          id: `local-${uploadedFiles.length + 1}-${Date.now()}`,
          name: file.name,
          date: new Date(),
          url: null,
          file,
        };
        setUploadedFiles((prev) => [localRecord, ...prev]);
      });

    // keep file in files state if needed
    setFiles([file]);
  };

  const openInNewTab = (fileObjOrUrl) => {
    if (!fileObjOrUrl) return;
    if (typeof fileObjOrUrl === "string") {
      const url = fileObjOrUrl.startsWith("http") ? fileObjOrUrl : `http://localhost:5000/${fileObjOrUrl.replace(/^\/+/, "")}`;
      window.open(url, "_blank");
    } else {
      // File object
      const url = URL.createObjectURL(fileObjOrUrl);
      window.open(url, "_blank");
      // If we plan to preview in-app, set selectedFile to the File object (modal will handle object URLs)
      setSelectedFile(fileObjOrUrl);
      // remember to revoke later; store current preview URL
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
      setPreviewObjectUrl(url);
    }
  };

  const determinePreviewSrc = (item) => {
    // returns a src string for embed/img if available, or null if preview should use File object
    if (typeof item === "string") {
      // selectedFile is a URL string
      return item.startsWith("http") ? item : `http://localhost:5000/${item.replace(/^\/+/, "")}`;
    }
    if (item && item.url) {
      return item.url.startsWith("http") ? item.url : `http://localhost:5000/${item.url.replace(/^\/+/, "")}`;
    }
    if (item && item.file) {
      // For File objects we'll createObjectURL when rendering
      return URL.createObjectURL(item.file);
    }
    return null;
  };

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: "#f3f6fb" }}>
      <h1 style={{ textAlign: "center", color: "#3b82f6", fontSize: 28, marginBottom: 20 }}>
        My Prescriptions
      </h1>

      {/* Upload Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <label
          style={{
            width: "100%",
            maxWidth: 560,
            cursor: "pointer",
            background: "#fff",
            border: "2px dashed #60a5fa",
            borderRadius: 12,
            padding: 28,
            textAlign: "center",
            transition: "border-color .15s ease",
          }}
        >
          <AiOutlineUpload style={{ fontSize: 48, color: "#60a5fa", marginBottom: 12 }} />
          <p style={{ color: "#374151", marginBottom: 6 }}>Drag & drop or click to upload a file</p>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>PDF, JPG, PNG allowed</p>
          <input type="file" style={{ display: "none" }} onChange={handleFileChange} />
        </label>
      </div>

      {/* Uploaded Prescriptions */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {uploadedFiles.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280" }}>No prescriptions uploaded yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {uploadedFiles.map((fileItem) => (
              <div
                key={fileItem.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fff",
                  padding: 14,
                  borderRadius: 10,
                  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, color: "#111827", margin: 0 }}>{fileItem.name}</p>
                  <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
                    {fileItem.date ? format(new Date(fileItem.date), "dd MMM yyyy") : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      // If server URL available, preview that; otherwise, preview local File object
                      if (fileItem.url) {
                        setSelectedFile(fileItem.url);
                      } else if (fileItem.file) {
                        setSelectedFile(fileItem.file);
                        // create and store previewObjectUrl for cleanup
                        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
                        const objUrl = URL.createObjectURL(fileItem.file);
                        setPreviewObjectUrl(objUrl);
                      } else {
                        window.alert("No file available to view for this item.");
                      }
                    }}
                    style={{
                      background: "#3b82f6",
                      color: "#fff",
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "none",
                      cursor: fileItem.url || fileItem.file ? "pointer" : "not-allowed",
                      opacity: fileItem.url || fileItem.file ? 1 : 0.6,
                    }}
                  >
                    View
                  </button>

                  <button
                    onClick={() => {
                      // open in new tab if possible
                      if (fileItem.url) {
                        openInNewTab(fileItem.url);
                      } else if (fileItem.file) {
                        openInNewTab(fileItem.file);
                      } else {
                        window.alert("No file available to open.");
                      }
                    }}
                    style={{
                      background: "#06b6d4",
                      color: "#fff",
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "none",
                      cursor: fileItem.url || fileItem.file ? "pointer" : "not-allowed",
                      opacity: fileItem.url || fileItem.file ? 1 : 0.6,
                    }}
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal preview for selectedFile (string url or File object) */}
      {selectedFile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => {
            // close and cleanup object URL if any
            if (previewObjectUrl) {
              URL.revokeObjectURL(previewObjectUrl);
              setPreviewObjectUrl(null);
            }
            setSelectedFile(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 8,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {typeof selectedFile === "string" ? (
              // server-provided path or url
              selectedFile.toLowerCase().endsWith(".pdf") ? (
                <embed
                  src={selectedFile.startsWith("http") ? selectedFile : `http://localhost:5000/${selectedFile.replace(/^\/+/, "")}`}
                  width="700"
                  height="500"
                  type="application/pdf"
                />
              ) : (
                <img
                  src={selectedFile.startsWith("http") ? selectedFile : `http://localhost:5000/${selectedFile.replace(/^\/+/, "")}`}
                  alt="Prescription"
                  style={{ maxWidth: "100%", maxHeight: "80vh" }}
                />
              )
            ) : (
              // File object preview
              <img
                src={previewObjectUrl || URL.createObjectURL(selectedFile)}
                alt="Prescription"
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            )}

            <div style={{ textAlign: "right", marginTop: 8 }}>
              <button
                onClick={() => {
                  if (previewObjectUrl) {
                    URL.revokeObjectURL(previewObjectUrl);
                    setPreviewObjectUrl(null);
                  }
                  setSelectedFile(null);
                }}
                style={{
                  padding: "8px 12px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
