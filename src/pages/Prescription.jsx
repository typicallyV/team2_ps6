import React, { useState, useEffect } from "react";
import { AiOutlineUpload } from "react-icons/ai";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function Prescription() {
  const navigate = useNavigate();
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
          width: "100%",
          padding: "18px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 100,
          background: "rgba(246, 247, 236, 0.6)", // translucent
          backdropFilter: "blur(10px)", // blur
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* Logo */}
        <h2
          style={{
            fontSize: "28px",
            color: "#E86E23",
            margin: 0,
            fontWeight: 700,
          }}
        >
          ElderEase
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {/* Mic Button — navigate to voice assistant */}
          <div
            onClick={() => navigate("/voice-assistant")}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#E86E23",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/></svg>
          </div>

          {/* Language */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#D0C6B7",
              padding: "10px 18px",
              borderRadius: "14px",
              cursor: "pointer",
              color: "#3A3A3A",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z"/></svg> EN
          </div>
        </div>
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
