const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.diskStorage({ 
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => { 
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);  
      }
});

// Middleware pour optimiser l'image téléchargée et redimensionner si nécessaire.
const optimizeImage = async (req, res, next) => {
    if (!req.file) return next(); 
  
    const originalImagePath = req.file.path; 
    const ext = path.extname(originalImagePath).toLowerCase(); 
    const optimizedImageName = `optimized_${path.basename(originalImagePath, ext)}${ext}`; 
    const optimizedImagePath = path.join('images', optimizedImageName); 
  
    try {
     
      await sharp(originalImagePath)
        .resize({ width: 400, withoutEnlargement: true }) 
        .toFile(optimizedImagePath); 
  
      req.file.path = optimizedImagePath; 
      req.file.filename = optimizedImageName; 
  
      fs.unlink(originalImagePath, (error) => {
        if (error) {
          console.error("Impossible de supprimer l'image originale :", error);
          return next(error);
        }
        next(); 
      });
    } catch (error) {
      next(error);
    }
  };
 
  const upload = multer({ storage }).single('image');
  
  module.exports = {
    upload,
    optimizeImage,
  };