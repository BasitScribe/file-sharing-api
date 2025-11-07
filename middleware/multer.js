const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: (req, file, cb) => {
    // Accept all for now, but you can whitelist by mime type
    // e.g., if (!['image/png','application/pdf'].includes(file.mimetype)) return cb(new Error('Invalid type'), false)
    cb(null, true);
  }
});

module.exports = upload;
