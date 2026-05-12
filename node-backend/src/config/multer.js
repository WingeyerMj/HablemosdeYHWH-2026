const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que las carpetas de destino existen
const uploadDirs = [
    path.join(__dirname, '../../public/assets/parashot'),
    path.join(__dirname, '../../public/uploads/portfolio'),
    path.join(__dirname, '../../public/uploads/team'),
    path.join(__dirname, '../../public/uploads/pdf'),
    path.join(__dirname, '../../public/uploads/general')
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
        if (req.originalUrl.includes('/parashot')) {
            folder = 'parashot';
            base = '../../public/assets/';
        } else if (req.originalUrl.includes('/portfolio')) folder = 'portfolio';
        else if (req.originalUrl.includes('/team')) folder = 'team';

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
    limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB
    fileFilter: (req, file, cb) => {
        // Permitir imágenes y PDFs
        const imageTypes = /jpeg|jpg|png|webp|gif|svg/;
        const pdfType = /pdf/;
        
        const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
        
        if (imageTypes.test(extname) || imageTypes.test(file.mimetype)) {
            return cb(null, true);
        }
        if (pdfType.test(extname) || file.mimetype === 'application/pdf') {
            return cb(null, true);
        }
        cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp, gif, svg) y PDFs"));
    }
});

module.exports = upload;
