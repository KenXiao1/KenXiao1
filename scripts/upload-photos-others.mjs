import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import 'dotenv/config';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const PHOTO_DIR = 'd:\\kenxiao blog\\blog photo others';
const TARGET_DIR = 'd:\\kenxiao blog\\ken-blog\\src\\content\\photos';
const TEMP_DIR = 'd:\\kenxiao blog\\ken-blog\\temp-compressed';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const MAX_RETRIES = 3; // 最大重试次数
const RETRY_DELAY = 2000; // 重试延迟（毫秒）

// 延迟函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 压缩图片，使其小于 10MB
async function compressIfNeeded(filePath, filename) {
    const stats = await fs.stat(filePath);
    const fileSizeInBytes = stats.size;

    // 如果文件小于 10MB，直接返回原文件
    if (fileSizeInBytes <= MAX_FILE_SIZE) {
        console.log(`  ✓ ${filename}: ${(fileSizeInBytes / 1024 / 1024).toFixed(2)}MB (无需压缩)`);
        return filePath;
    }

    console.log(`  ⚠ ${filename}: ${(fileSizeInBytes / 1024 / 1024).toFixed(2)}MB (需要压缩)`);

    // 创建临时目录
    await fs.mkdir(TEMP_DIR, { recursive: true });

    const tempPath = path.join(TEMP_DIR, filename);
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // 策略：逐步降低质量，直到文件小于 10MB
    let quality = 85;
    let compressed = false;

    while (quality >= 60) {
        await image
            .jpeg({ quality, mozjpeg: true })
            .toFile(tempPath);

        const compressedStats = await fs.stat(tempPath);
        const compressedSize = compressedStats.size;

        if (compressedSize <= MAX_FILE_SIZE) {
            console.log(`  ✓ 压缩成功: ${(compressedSize / 1024 / 1024).toFixed(2)}MB (质量: ${quality}%)`);
            compressed = true;
            break;
        }

        quality -= 5;
    }

    // 如果质量降到 60% 还是太大，尝试调整尺寸
    if (!compressed) {
        console.log(`  ⚠ 质量压缩不够，调整尺寸...`);
        const maxWidth = Math.floor(metadata.width * 0.8); // 缩小到 80%

        await sharp(filePath)
            .resize(maxWidth, null, { withoutEnlargement: true })
            .jpeg({ quality: 75, mozjpeg: true })
            .toFile(tempPath);

        const finalStats = await fs.stat(tempPath);
        console.log(`  ✓ 尺寸调整: ${(finalStats.size / 1024 / 1024).toFixed(2)}MB (宽度: ${maxWidth}px)`);
    }

    return tempPath;
}

async function uploadPhotosRecursively(dir, relativePath = '') {
    if (!process.env.CLOUDINARY_API_KEY) {
        console.error('❌ 请设置 CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY 和 CLOUDINARY_API_SECRET 环境变量');
        process.exit(1);
    }

    await fs.mkdir(TARGET_DIR, { recursive: true });
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // 递归处理子文件夹
            await uploadPhotosRecursively(fullPath, path.join(relativePath, entry.name));
        } else if (entry.isFile() && entry.name.match(/\.(jpg|jpeg|png)$/i)) {
            const filename = path.parse(entry.name).name;
            console.log(`\n📤 处理: ${relativePath}/${entry.name}`);

            try {
                // 压缩图片（如果需要）
                const uploadPath = await compressIfNeeded(fullPath, entry.name);

                // 构建 Cloudinary folder 路径
                const folderPath = relativePath
                    ? `ken-blog/photography/${relativePath}`
                    : 'ken-blog/photography';

                // 重试上传逻辑
                let result;
                let lastError;

                for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                    try {
                        result = await cloudinary.uploader.upload(uploadPath, {
                            folder: folderPath,
                            public_id: filename,
                            resource_type: 'image'
                        });
                        break; // 上传成功，跳出重试循环
                    } catch (uploadError) {
                        lastError = uploadError;
                        if (attempt < MAX_RETRIES) {
                            const delay = RETRY_DELAY * attempt; // 指数退避
                            console.log(`  ⚠️  上传失败 (尝试 ${attempt}/${MAX_RETRIES}): ${uploadError.message}`);
                            console.log(`  ⏳ ${delay / 1000}秒后重试...`);
                            await sleep(delay);
                        }
                    }
                }

                if (!result) {
                    throw new Error(`上传失败 (已重试 ${MAX_RETRIES} 次): ${lastError.message}`);
                }

                const metadata = {
                    title: filename,
                    cloudinaryId: result.public_id,
                    date: new Date().toISOString(),
                    album: 'others',
                    tags: ['photography', relativePath || 'others']
                };

                await fs.writeFile(
                    path.join(TARGET_DIR, `${filename}.json`),
                    JSON.stringify(metadata, null, 2)
                );

                console.log(`  ✅ 上传成功: ${result.public_id}`);

                // 删除临时压缩文件
                if (uploadPath !== fullPath) {
                    await fs.unlink(uploadPath);
                }
            } catch (error) {
                console.error(`  ❌ 最终失败: ${error.message}`);
            }
        }
    }
}

// 清理临时目录
async function cleanup() {
    try {
        await fs.rm(TEMP_DIR, { recursive: true, force: true });
        console.log('\n🧹 清理临时文件完成');
    } catch (error) {
        // 忽略清理错误
    }
}

console.log('🚀 开始上传图片到 Cloudinary...\n');
uploadPhotosRecursively(PHOTO_DIR)
    .then(() => cleanup())
    .then(() => console.log('\n✅ 所有图片处理完成！'))
    .catch(error => {
        console.error('\n❌ 发生错误:', error);
        cleanup();
    });
