
const fs = require('fs');
const path = require('path');

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

    // Skip if already assigned (unless it's 'others' which might be default, but we want to force stickers for existing)
    // Actually, the plan is to move ALL existing to stickers, except maybe the ones we just created?
    // But we haven't created any yet.
    // P1049437.json was manually set to stickers, so that's fine.
    // We will set all existing to stickers-on-desks.

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
        // We want cloudinaryId: ken-blog/photography/[Subfolder]/[Filename]
        // If it's in root of OTHERS_SOURCE_DIR, parts length is 1.

        let subfolder = '';
        let filename = parts[parts.length - 1];
        let filenameNoExt = path.parse(filename).name;

        if (parts.length > 1) {
            subfolder = parts[0]; // Top level folder in 'blog photo others'
        }

        // Cloudinary ID construction
        // Assuming standard path separator is / for Cloudinary
        const cloudSubfolder = subfolder ? `${subfolder}/` : '';
        const cloudinaryId = `ken-blog/photography/${cloudSubfolder}${filename}`; // Keeping extension? Usually Cloudinary IDs don't have extensions, but let's check existing.
        // Existing: "ken-blog/photography/P1049437" (no extension)

        const cloudinaryIdNoExt = `ken-blog/photography/${cloudSubfolder}${filenameNoExt}`;

        const newJson = {
            title: filenameNoExt,
            cloudinaryId: cloudinaryIdNoExt,
            date: new Date().toISOString(),
            album: 'others',
            tags: ['photography', subfolder].filter(Boolean)
        };

        // Create JSON file
        // Use a unique name to avoid collision if filenames are same in diff folders
        // Or just use filenameNoExt if unique.
        // Let's use filenameNoExt.json. If exists, append subfolder.

        let targetFileName = `${filenameNoExt}.json`;
        let targetPath = path.join(PHOTOS_DIR, targetFileName);

        if (fs.existsSync(targetPath)) {
            targetFileName = `${subfolder}_${filenameNoExt}.json`;
            targetPath = path.join(PHOTOS_DIR, targetFileName);
        }

        fs.writeFileSync(targetPath, JSON.stringify(newJson, null, 2));
        console.log(`Created ${targetFileName} for ${relativePath}`);
    });
} else {
    console.error(`Source directory ${OTHERS_SOURCE_DIR} not found!`);
}

console.log('Done.');
