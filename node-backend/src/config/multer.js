const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { allowed, validateFile } = require('../utils/safeUploads');
const { validToken } = require('../utils/security');

// Asegurar que las carpetas de destino existen
const uploadDirs = [
    path.join(__dirname, '../../public/assets/parashot'),
    path.join(__dirname, '../../public/uploads/portfolio'),
    path.join(__dirname, '../../public/uploads/ensenanzas'),
    path.join(__dirname, '../../public/uploads/haftara'),
    path.join(__dirname, '../../public/uploads/blog'),
    path.join(__dirname, '../../public/uploads/noticias'),
    path.join(__dirname, '../../public/uploads/team'),
    path.join(__dirname, '../../public/uploads/pdf'),
    path.join(__dirname, '../../public/uploads/audios'),
    path.join(__dirname, '../../public/uploads/general'),
    path.join(__dirname, '../../public/uploads/semillas'),
    path.join(__dirname, '../../public/uploads/videos'),
    path.join(__dirname, '../../public/uploads/entity'),
    path.join(__dirname, '../../public/uploads/seder')
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determinar carpeta según la ruta o tipo de archivo
        let base = '../../public/uploads/';
        let folder = 'general';
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
        const isAudio = file.mimetype.startsWith('audio/') || 
                        /mp3|m4a|wav|aac|ogg|oga|opus|wma|flac|webm/.test(ext) ||
                        file.mimetype.includes('ogg') || 
                        file.mimetype.includes('opus') || 
                        req.originalUrl.includes('/aliyot');

        if (isAudio) {
            folder = 'audios';
        } else if (req.originalUrl.includes('/parashot')) {
            folder = 'parashot';
            base = '../../public/assets/';
        } else if (req.originalUrl.includes('/portfolio')) folder = 'portfolio';
        else if (req.originalUrl.includes('/ensenanzas')) folder = 'ensenanzas';
        else if (req.originalUrl.includes('/haftara')) folder = 'haftara';
        else if (req.originalUrl.includes('/semillas')) folder = 'semillas';
        else if (req.originalUrl.includes('/seder')) folder = 'seder';
        else if (req.originalUrl.includes('/noticias')) folder = 'noticias';
        else if (req.originalUrl.includes('/blog')) folder = 'blog';
        else if (req.originalUrl.includes('/team')) folder = 'team';
        else if (req.originalUrl.includes('/entity')) folder = 'entity';

        if (file.fieldname === 'seder_image') {
            folder = 'seder';
        } else if (file.mimetype === 'application/pdf' || ext === 'pdf' || file.fieldname === 'seder_pdf') {
            folder = 'pdf';
        }

        // Si es video, va a la carpeta de videos
        if (file.mimetype && file.mimetype.startsWith('video/')) folder = 'videos';

        const dest = path.join(__dirname, base, folder);
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 250 * 1024 * 1024, // Límite de 250MB para audios/videos/archivos
        files: 30, fields: 500, parts: 530,
        fieldSize: 50 * 1024 * 1024   // Límite de 50MB para campos de texto / contenido HTML / base64
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const imageFields = /^(image_file|seder_image|image|cover|thumbnail)$/i;
        const allowedHere = allowed.has(ext) && (!imageFields.test(file.fieldname) || ['.jpg','.jpeg','.png','.webp','.gif'].includes(ext));
        if (!allowedHere) { const error = new Error('Formato de archivo no permitido.'); error.status = 400; return cb(error); }
        cb(null, true);
    }
});

// Wrap every multipart entry point: verify CSRF and file signatures before invoking a controller.
function protect(middleware) {
    return (req, res, next) => middleware(req, res, async error => {
        const files = req.file ? [req.file] : Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat();
        try {
            if (error) throw error;
            if (!validToken(req)) { const denied = new Error('Solicitud no válida. Recarga la página.'); denied.status=403; throw denied; }
            req.csrfValidated = true;
            delete req.body._csrf;
            for (const file of files) await validateFile(file);
            return next();
        } catch (failure) {
            await Promise.allSettled(files.map(file => fs.promises.unlink(file.path)));
            if (failure.status===403) return res.status(403).send(failure.message);
            next(failure);
        }
    });
}
module.exports = { single: name => protect(upload.single(name)), fields: names => protect(upload.fields(names)), any: () => protect(upload.any()), array: (...args) => protect(upload.array(...args)), none: () => protect(upload.none()) };
