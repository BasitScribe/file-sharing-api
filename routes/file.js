const express = require('express');
const router = express.Router();
const File = require('../models/File');
const cloudinary = require('../config/cloudinary');

// GET /f/:id  -> redirect to signed cloudinary url or return storageUrl
router.get('/f/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const file = await File.findById(id);
    if (!file) return res.status(404).send('Not found');

    if (new Date() > new Date(file.expiresAt)) {
      return res.status(410).send('This link has expired');
    }

    // increment downloads (atomic)
    await File.updateOne({ _id: id }, { $inc: { downloads: 1 } });

    // Option 1: direct redirect to storageUrl (suitable if storage is public)
    // Option 2: generate signed URL (short-lived) - Cloudinary supports auth tokens or transformations; for simplicity we'll redirect to storageUrl
    return res.redirect(file.storageUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE /api/file/:id -> optional manual delete (requires auth ideally)
router.delete('/api/file/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ error: 'Not found' });

    // Delete from cloudinary
    if (file.publicId) {
      await cloudinary.uploader.destroy(file.publicId, { resource_type: 'auto' });
    }
    // remove metadata
    await File.deleteOne({ _id: id });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
