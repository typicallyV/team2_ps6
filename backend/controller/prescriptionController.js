// backend/controllers/prescriptionController.js
import Upload from "../models/Upload.js";
import Prescription from "../models/Prescription.js";

/**
 * Create/upload a file (multipart/form-data, field name "file").
 * Saves file bytes to Upload (base64) and creates a Prescription doc referencing the upload.
 * Protected: requires req.userId to be set (middleware).
 */
export const uploadFile = async (req, res) => {
  try {
    // Ensure auth
    const userId = req.userId || req.session?.userId || req.session?.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // multer places file on req.file
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    // Optional: enforce allowed mime types
    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Persist upload (base64)
    const uploadDoc = new Upload({
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileData: req.file.buffer.toString("base64"),
      user: userId,
      uploadedAt: new Date(),
    });
    await uploadDoc.save();

    // Create a Prescription entry pointing to the file retrieval URL
    const pres = new Prescription({
      name: req.file.originalname,
      url: `/api/prescriptions/files/${uploadDoc._id}`, // route to download bytes
      user: userId,
      date: new Date(),
    });
    await pres.save();

    // Return created resource info
    return res.status(201).json({
      ok: true,
      upload: {
        _id: uploadDoc._id,
        name: uploadDoc.fileName,
        date: uploadDoc.uploadedAt,
        url: pres.url,
        prescriptionId: pres._id,
      },
    });
  } catch (err) {
    console.error("prescriptionController.uploadFile error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * GET list of prescriptions for the logged-in user.
 * Query params optional: ?since=YYYY-MM-DD&until=YYYY-MM-DD
 */
export const listPrescriptions = async (req, res) => {
  try {
    const userId = req.userId || req.session?.userId || req.session?.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { since, until } = req.query;
    const q = { user: userId };
    if (since || until) {
      q.date = {};
      if (since) q.date.$gte = new Date(since);
      if (until) q.date.$lte = new Date(until);
    }

    const pres = await Prescription.find(q).sort({ date: -1 }).limit(500);
    const formatted = pres.map((p) => ({
      _id: p._id,
      name: p.name,
      date: p.date,
      url: p.url,
    }));

    return res.json({ ok: true, prescriptions: formatted });
  } catch (err) {
    console.error("prescriptionController.listPrescriptions error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * GET file bytes for an upload by id (returns raw bytes with proper Content-Type).
 * Route: GET /api/prescriptions/files/:id
 */
export const getFileBytes = async (req, res) => {
  try {
    const userId = req.userId || req.session?.userId || req.session?.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const file = await Upload.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    // Ensure ownership
    if (String(file.user) !== String(userId)) return res.status(403).json({ error: "Forbidden" });

    res.setHeader("Content-Type", file.fileType);
    const buf = Buffer.from(file.fileData, "base64");
    return res.send(buf);
  } catch (err) {
    console.error("prescriptionController.getFileBytes error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * DELETE prescription (and linked upload if found).
 * Route: DELETE /api/prescriptions/:id
 */
export const deletePrescription = async (req, res) => {
  try {
    const userId = req.userId || req.session?.userId || req.session?.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const pres = await Prescription.findById(req.params.id);
    if (!pres) return res.status(404).json({ error: "Not found" });
    if (String(pres.user) !== String(userId)) return res.status(403).json({ error: "Forbidden" });

    // If URL references an upload id by our convention /api/prescriptions/files/:id
    const m = pres.url && pres.url.match(/\/api\/prescriptions\/files\/([a-f0-9]{24})/i);
    if (m) {
      const uploadId = m[1];
      await Upload.findByIdAndDelete(uploadId);
    }

    await pres.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error("prescriptionController.deletePrescription error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
