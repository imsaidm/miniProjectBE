"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageBuffer = void 0;
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
cloudinary_1.v2.config({
    cloud_name: cloudName || '',
    api_key: apiKey || '',
    api_secret: apiSecret || '',
});
// Function to upload image buffer to Cloudinary
const uploadImageBuffer = (buffer, folder = 'payment-proofs') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: folder,
            resource_type: 'image',
            transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto' }
            ]
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result.secure_url);
            }
        });
        streamifier_1.default.createReadStream(buffer).pipe(uploadStream);
    });
};
exports.uploadImageBuffer = uploadImageBuffer;
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map