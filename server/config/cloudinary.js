const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "PrepSync_Resources",
      resource_type: "auto",   // ALWAYS AUTO
      public_id: `${path.parse(file.originalname).name}-${Date.now()}`
    };
  }
});

// Configure Multer
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // You can add more complex filtering here if needed
    // For now, the 'allowed_formats' in CloudinaryStorage handles the filtering
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  }
});

module.exports = upload;