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
    console.log("🔄 Fetching prescriptions from: http://localhost:5000/prescriptions");
    fetch("http://localhost:5000/prescriptions")
      .then((res) => {
        console.log("📊 Response status:", res.status);
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        console.log("✅ Prescriptions fetched:", data);
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
      .catch((err) => {
        console.error("❌ Fetch error:", err);
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("📤 Uploading file:", file.name);

    // Create FormData and append file
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      console.log("📊 Upload response status:", response.status);
      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      console.log("✅ Upload success:", data);
      
      // Expect server to return created record with at least { _id, name, date, url }
      const record = {
        id: data._id || data.id || `${data.name}-${Math.random()}`,
        name: data.name || file.name,
        date: data.date ? new Date(data.date) : new Date(),
        url: data.url || data.path || null,
        file: null,
      };
      setUploadedFiles((prev) => [record, ...prev]);
    } catch (error) {
      console.error("❌ Upload error:", error);
      // Fallback: store locally with the actual File object for preview/open
      const localRecord = {
        id: `local-${uploadedFiles.length + 1}-${Date.now()}`,
        name: file.name,
        date: new Date(),
        url: null,
        file,
      };
      setUploadedFiles((prev) => [localRecord, ...prev]);
    }

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

  const handleDownload = async (fileItem) => {
    if (!fileItem) return;
    try {
      if (fileItem.url) {
        // server URL - fetch blob then download
        const url = fileItem.url.startsWith("http")
          ? fileItem.url
          : `http://localhost:5000/${fileItem.url.replace(/^\/+/, "")}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to download file");
        const blob = await res.blob();
        const tmpUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = tmpUrl;
        a.download = fileItem.name || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(tmpUrl);
      } else if (fileItem.file) {
        // local File object
        const tmpUrl = URL.createObjectURL(fileItem.file);
        const a = document.createElement("a");
        a.href = tmpUrl;
        a.download = fileItem.name || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(tmpUrl);
      } else {
        alert("No file available to download for this item.");
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed.");
    }
  };

  const handleDelete = async (fileItem) => {
    if (!fileItem) return;
    // local-only item -> just remove from state
    if (String(fileItem.id).startsWith("local-")) {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
      return;
    }

    // Attempt server delete
    try {
      const res = await fetch(`http://localhost:5000/prescriptions/${fileItem.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed on server. Item removed locally.");
      // fallback: remove locally anyway
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: "#E4E9D9", fontFamily: "Poppins, Inter, sans-serif" }}>
      {/* Navbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 30px",
          background: "rgba(244, 242, 235, 0.7)",
          backdropFilter: "blur(8px)",
          borderRadius: "14px",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ fontSize: "28px", color: "#EB8A2F", margin: 0, fontWeight: 700 }}>
          ElderEase
        </h2>
        <div style={{ fontSize: "20px" }}>📄</div>
      </div>

      <h1 style={{ textAlign: "center", color: "#2A2A2A", fontSize: 32, marginBottom: 20, fontWeight: 700 }}>
        My Prescriptions
      </h1>

      {/* Upload Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
        <label
          style={{
            width: "100%",
            maxWidth: 560,
            cursor: "pointer",
            background: "#FAF9F0",
            border: "2px dashed #D4D8C6",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
            transition: "all .2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#EB8A2F";
            e.currentTarget.style.background = "#FEF8F0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#D4D8C6";
            e.currentTarget.style.background = "#FAF9F0";
          }}
        >
          <AiOutlineUpload style={{ fontSize: 48, color: "#EB8A2F", marginBottom: 12 }} />
          <p style={{ color: "#2A2A2A", marginBottom: 8, fontSize: 16, fontWeight: 600 }}>
            Drag & drop or click to upload
          </p>
          <p style={{ color: "#8B8B8B", fontSize: 14 }}>PDF, JPG, PNG allowed</p>
          <input type="file" style={{ display: "none" }} onChange={handleFileChange} />
        </label>
      </div>

      {/* Uploaded Prescriptions */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {uploadedFiles.length === 0 ? (
          <p style={{ textAlign: "center", color: "#8B7B6F", fontSize: 16 }}>
            No prescriptions uploaded yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {uploadedFiles.map((fileItem) => (
              <div
                key={fileItem.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#FAF9F0",
                  padding: 18,
                  borderRadius: 14,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  border: "1px solid #EDE9DF",
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, color: "#2A2A2A", margin: 0, fontSize: 16 }}>
                    {fileItem.name}
                  </p>
                  <p style={{ color: "#8B7B6F", fontSize: 14, margin: "6px 0 0 0" }}>
                    {fileItem.date ? format(new Date(fileItem.date), "dd MMM yyyy") : ""}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  {/* View (preview modal) */}
                  <button
                    onClick={() => {
                      if (fileItem.url) {
                        setSelectedFile(fileItem.url);
                      } else if (fileItem.file) {
                        setSelectedFile(fileItem.file);
                        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
                        const objUrl = URL.createObjectURL(fileItem.file);
                        setPreviewObjectUrl(objUrl);
                      } else {
                        window.alert("No file available to view for this item.");
                      }
                    }}
                    style={{
                      background: "#EB8A2F",
                      color: "#fff",
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: "none",
                      cursor: fileItem.url || fileItem.file ? "pointer" : "not-allowed",
                      opacity: fileItem.url || fileItem.file ? 1 : 0.6,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    View
                  </button>

                  {/* Open in new tab */}
                  <button
                    onClick={() => {
                      if (fileItem.url) {
                        openInNewTab(fileItem.url);
                      } else if (fileItem.file) {
                        openInNewTab(fileItem.file);
                      } else {
                        window.alert("No file available to open.");
                      }
                    }}
                    style={{
                      background: "#D4D8C6",
                      color: "#2A2A2A",
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: "none",
                      cursor: fileItem.url || fileItem.file ? "pointer" : "not-allowed",
                      opacity: fileItem.url || fileItem.file ? 1 : 0.6,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Open
                  </button>

                  {/* Download */}
                  <button
                    onClick={() => handleDownload(fileItem)}
                    style={{
                      background: "#C5B8A3",
                      color: "#fff",
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: "none",
                      cursor: fileItem.url || fileItem.file ? "pointer" : "not-allowed",
                      opacity: fileItem.url || fileItem.file ? 1 : 0.6,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Download
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this prescription?")) handleDelete(fileItem);
                    }}
                    style={{
                      background: "#D9534F",
                      color: "#fff",
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Delete
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
            background: "rgba(0,0,0,0.5)",
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
              background: "#FAF9F0",
              padding: 24,
              borderRadius: 16,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
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

            <div style={{ textAlign: "right", marginTop: 16 }}>
              <button
                onClick={() => {
                  if (previewObjectUrl) {
                    URL.revokeObjectURL(previewObjectUrl);
                    setPreviewObjectUrl(null);
                  }
                  setSelectedFile(null);
                }}
                style={{
                  padding: "10px 20px",
                  background: "#EB8A2F",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600,
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
