const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const cloudinary = require('../config/cloudinary');
const File = require('../models/File');
// const { nanoid } = require('nanoid');
const crypto = require('crypto');

// POST /api/upload
// form field: file (single)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const contentType = req.file.mimetype;
    const size = req.file.size;

    // create a unique id
    // const id = nanoid(10);
    function generateId(len = 10) {
      const bytes = Math.ceil(len * 3 / 4);
      return crypto.randomBytes(bytes).toString('base64url').slice(0, len);
    }
    const id = generateId(10);

    // upload to Cloudinary - upload_stream with buffer
    const streamifier = require('streamifier');

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'file_sharing' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(stream);
    });

    // calculate expiry (24 hours by default or from query)
    const ttlHours = parseInt(req.body.ttlHours || req.query.ttlHours || '24', 10);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    // save metadata to MongoDB
    const fileDoc = new File({
      _id: id,
      originalName,
      storageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      size,
      contentType,
      expiresAt
    });
    await fileDoc.save();

    const shareUrl = `${req.protocol}://${req.get('host')}/f/${id}`;
    return res.json({ id, shareUrl, expiresAt });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ error: 'Upload failed', detail: err.message });
  }
});

module.exports = router;
