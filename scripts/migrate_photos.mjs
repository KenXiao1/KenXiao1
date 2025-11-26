
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHOTOS_DIR = path.join('d:\\kenxiao blog\\ken-blog\\src\\content\\photos');
const OTHERS_SOURCE_DIR = path.join('D:\\kenxiao blog\\blog photo others');

// Helper to get all files recursively
function getFiles(dir) {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    const files = dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    });
    return Array.prototype.concat(...files);
}

// 1. Update existing JSONs
console.log('Updating existing JSONs...');
const existingFiles = fs.readdirSync(PHOTOS_DIR).filter(f => f.endsWith('.json'));

existingFiles.forEach(file => {
    const filePath = path.join(PHOTOS_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Skip if already assigned correctly
    if (content.album !== 'stickers-on-desks') {
        content.album = 'stickers-on-desks';
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        console.log(`Updated ${file} to stickers-on-desks`);
    }
});

// 2. Import new photos
console.log('Importing new photos...');
if (fs.existsSync(OTHERS_SOURCE_DIR)) {
    const otherFiles = getFiles(OTHERS_SOURCE_DIR);

    otherFiles.forEach(file => {
        // Filter for images
        if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) return;

        const relativePath = path.relative(OTHERS_SOURCE_DIR, file);
        const parts = relativePath.split(path.sep);

        // Structure: Subfolder/Filename
        let subfolder = '';
        let filename = parts[parts.length - 1];
        let filenameNoExt = path.parse(filename).name;

        if (parts.length > 1) {
            subfolder = parts[0]; // Top level folder in 'blog photo others'
        }

        // Cloudinary ID construction
        // Normalize path separators to /
        const cloudSubfolder = subfolder ? `${subfolder}/` : '';
        const cloudinaryIdNoExt = `ken-blog/photography/${cloudSubfolder}${filenameNoExt}`.replace(/\\/g, '/');

        const newJson = {
            title: filenameNoExt,
            cloudinaryId: cloudinaryIdNoExt,
            date: new Date().toISOString(),
            album: 'others',
            tags: ['photography', subfolder].filter(Boolean)
        };

        // Create JSON file
        let targetFileName = `${filenameNoExt}.json`;
        let targetPath = path.join(PHOTOS_DIR, targetFileName);

        if (fs.existsSync(targetPath)) {
            // Check if it's the same file (already imported) or a collision
            const existingContent = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
            if (existingContent.cloudinaryId === cloudinaryIdNoExt) {
                // Already exists, maybe update album if needed
                if (existingContent.album !== 'others') {
                    // Wait, if it exists, it might be one of the stickers we just updated to 'stickers-on-desks'
                    // If the filename collides, we should be careful.
                    // Stickers seem to be Pxxxxxx.
                    // Others might have different names.
                    // If collision, use subfolder prefix.
                    targetFileName = `${subfolder}_${filenameNoExt}.json`;
                    targetPath = path.join(PHOTOS_DIR, targetFileName);
                } else {
                    return; // Already correct
                }
            } else {
                // Collision with different content
                targetFileName = `${subfolder}_${filenameNoExt}.json`;
                targetPath = path.join(PHOTOS_DIR, targetFileName);
            }
        }

        fs.writeFileSync(targetPath, JSON.stringify(newJson, null, 2));
        console.log(`Created ${targetFileName} for ${relativePath}`);
    });
} else {
    console.error(`Source directory ${OTHERS_SOURCE_DIR} not found!`);
}

console.log('Done.');
