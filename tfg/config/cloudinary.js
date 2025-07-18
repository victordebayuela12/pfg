const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'tfg-images2',
        format: async (req, file) => {
  const mime = file.mimetype.split('/')[1]; // Ej: "jpeg" o "png"
  return mime === 'jpeg' || mime === 'jpg' || mime === 'png' ? mime : 'png';
},

        public_id: (req, file) => Date.now() + '-' + file.originalname
    }
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
