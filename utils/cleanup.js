import cron from 'node-cron';
import File from '../models/File.js'; 
import cloudinary from '../config/cloudinary.js';

const startCleanup = () => {
  // runs every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[cleanup] running expired file cleanup');
      const now = new Date();
      const expired = await File.find({ expiresAt: { $lt: now } }).lean();

      for (const f of expired) {
        try {
          if (f.publicId) {
            await cloudinary.uploader.destroy(f.publicId, { resource_type: 'auto' });
          }
        } catch (err) {
          console.error('[cleanup] failed to delete from cloudinary', f._id, err.message);
        }
      }
      // delete docs in bulk
      const ids = expired.map(x => x._id);
      if (ids.length) {
        await File.deleteMany({ _id: { $in: ids } });
        console.log(`[cleanup] deleted ${ids.length} files`);
      } else {
        console.log('[cleanup] nothing to delete');
      }
    } catch (err) {
      console.error('[cleanup] error', err);
    }
  }, { timezone: 'UTC' });
};

export default startCleanup;
