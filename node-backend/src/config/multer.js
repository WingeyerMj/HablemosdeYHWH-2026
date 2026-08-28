const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que las carpetas de destino existen
const uploadDirs = [
    path.join(__dirname, '../../public/assets/parashot'),
    path.join(__dirname, '../../public/uploads/portfolio'),
    path.join(__dirname, '../../public/uploads/ensenanzas'),
    path.join(__dirname, '../../public/uploads/blog'),
    path.join(__dirname, '../../public/uploads/team'),
    path.join(__dirname, '../../public/uploads/pdf'),
    path.join(__dirname, '../../public/uploads/general'),
    path.join(__dirname, '../../public/uploads/semillas'),
    path.join(__dirname, '../../public/uploads/entity')
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determinar carpeta según la ruta
        let base = '../../public/uploads/';
        let folder = 'general';
        if (req.originalUrl.includes('/parashot')) {
            folder = 'parashot';
            base = '../../public/assets/';
        } else if (req.originalUrl.includes('/portfolio')) folder = 'portfolio';
        else if (req.originalUrl.includes('/ensenanzas')) folder = 'ensenanzas';
        else if (req.originalUrl.includes('/semillas')) folder = 'semillas';
        else if (req.originalUrl.includes('/blog')) folder = 'blog';
        else if (req.originalUrl.includes('/team')) folder = 'team';
        else if (req.originalUrl.includes('/entity')) folder = 'entity';

        // Si es PDF, va a la carpeta de PDFs
        if (file.mimetype === 'application/pdf') folder = 'pdf';

        const dest = path.join(__dirname, base, folder);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // Límite de 100MB para videos
    fileFilter: (req, file, cb) => {
        // Permitir imágenes, videos y PDFs
        const imageTypes = /jpeg|jpg|png|webp|gif|svg/;
        const videoTypes = /mp4|webm|ogg|mov|avi|mkv/;
        const pdfType = /pdf/;
        
        const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
        
        if (imageTypes.test(extname) || imageTypes.test(file.mimetype)) {
            return cb(null, true);
        }
        if (videoTypes.test(extname) || videoTypes.test(file.mimetype) || file.mimetype.includes('video/')) {
            return cb(null, true);
        }
        if (pdfType.test(extname) || file.mimetype === 'application/pdf') {
            return cb(null, true);
        }
        cb(new Error("Solo se permiten imágenes, videos y PDFs"));
    }
});

module.exports = upload;
