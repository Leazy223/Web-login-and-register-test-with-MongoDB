const multer = require('multer');
const path = require('path');

// Configure storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/');
    },
    filename: (req, file, cb) => {
        // Get the file extension and base name
        const ext = path.extname(file.originalname) || '';
        const base = path.basename(file.originalname, ext);
        // Create unique filename: timestamp-random-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Create a safe base name (alphanumeric and dashes)
        const safeBase = base.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        // Ensure extension is lowercased
        const safeExt = ext.toLowerCase();
        cb(null, `${uniqueSuffix}-${safeBase}${safeExt}`);
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Middleware function to handle single image upload
// Instead of rendering responses here, the middleware attaches an uploadError
// to the request and calls next(), so the route handler can decide how to
// render the form and preserve form data.
const uploadImage = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                // Attach the upload error to the request for the route to handle
                console.error('Upload middleware error:', err);
                req.uploadError = err;
                return next();
            }

            // If no file was uploaded, mark it so route can decide (required for create)
            if (!req.file) {
                req.uploadError = new Error('No file uploaded');
                return next();
            }

            // All good
            next();
        });
    };
};

module.exports = {
    uploadImage
};