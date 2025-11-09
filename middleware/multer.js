// middleware/multer.js
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    cb(null, true); // change to whitelist types if needed
  }
});

export default upload;
