import multer from "multer";

import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";

const __dirname = import.meta.dirname;
const __filename = import.meta.filename;

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "clearanceDocs");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cd) => cd(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const rnd = crypto.randomBytes(8).toString("hex");
    const fname = `${Date.now()}-${rnd}${ext}`;

    cb(null, fname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) return cb(new Error("Invalid file type"));

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
