import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const PHOTO_DIR = 'd:\\kenxiao blog\\blog photo sticker';
const TARGET_DIR = 'd:\\kenxiao blog\\ken-blog\\src\\content\\photos';

async function uploadPhotos() {
    if (!process.env.CLOUDINARY_API_KEY) {
        console.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
        process.exit(1);
    }

    await fs.mkdir(TARGET_DIR, { recursive: true });
    const files = await fs.readdir(PHOTO_DIR);

    for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

        console.log(`Uploading ${file}...`);
        try {
            const result = await cloudinary.uploader.upload(path.join(PHOTO_DIR, file), {
                folder: 'ken-blog/photography',
                public_id: path.parse(file).name,
                resource_type: 'image'
            });

            const metadata = {
                title: path.parse(file).name,
                cloudinaryId: result.public_id,
                date: new Date().toISOString(),
                tags: ['photography']
            };

            await fs.writeFile(
                path.join(TARGET_DIR, `${path.parse(file).name}.json`),
                JSON.stringify(metadata, null, 2)
            );
            console.log(`Saved metadata for ${file}`);
        } catch (error) {
            console.error(`Failed to upload ${file}:`, error);
        }
    }
}

uploadPhotos();
