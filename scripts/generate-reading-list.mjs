import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const READING_LIST_BASE = path.resolve(__dirname, '../../recommend - some are read some are not - more like a reading list');

function cleanFileName(fileName) {
  // 移除文件扩展名
  let name = fileName.replace(/\.(pdf|epub|mobi|txt)$/i, '');

  // 移除 Z-Library 标注
  name = name.replace(/\s*\(Z-Library\)/g, '');

  // 移除多余的括号和空格
  name = name.replace(/\s+--\s+/g, ' - ');
  name = name.trim();

  return name;
}

function readFileWithEncoding(filePath) {
  // 读取文件为 Buffer
  const buffer = fs.readFileSync(filePath);

  // 尝试检测编码：先尝试 UTF-8，如果失败则使用 GBK
  try {
    const utf8Content = buffer.toString('utf-8');
    // 检查是否有乱码（通过检测常见的乱码字符）
    if (utf8Content.includes('�') || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(utf8Content)) {
      // 可能是 GBK 编码，使用 iconv-lite 转换
      return iconv.decode(buffer, 'gbk');
    }
    return utf8Content;
  } catch (e) {
    // 如果 UTF-8 解码失败，使用 GBK
    return iconv.decode(buffer, 'gbk');
  }
}

function getFiles(category) {
  const categoryPath = path.join(READING_LIST_BASE, category);

  if (!fs.existsSync(categoryPath)) {
    console.warn(`Category path not found: ${categoryPath}`);
    return [];
  }

  const items = fs.readdirSync(categoryPath);

  return items.map(item => {
    const fullPath = path.join(categoryPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 如果是文件夹（如徐訏小说选txt），读取所有 txt 文件内容
      const txtFiles = fs.readdirSync(fullPath).filter(f => f.endsWith('.txt'));

      return {
        name: cleanFileName(item),
        type: 'folder',
        originalName: item,
        files: txtFiles.map(f => {
          const txtPath = path.join(fullPath, f);
          const content = readFileWithEncoding(txtPath);
          return {
            name: cleanFileName(f),
            originalName: f,
            content: content
          };
        })
      };
    } else {
      // 普通文件
      return {
        name: cleanFileName(item),
        type: 'file',
        originalName: item
      };
    }
  });
}

function generateReadingList() {
  const readingList = {
    history: getFiles('history'),
    literature: getFiles('literature'),
    other: getFiles('other')
  };

  // 保存到 public 目录
  const outputPath = path.resolve(__dirname, '../public/reading-list.json');
  fs.writeFileSync(outputPath, JSON.stringify(readingList, null, 2), 'utf-8');

  console.log('✅ Reading list generated successfully!');
  console.log(`   Output: ${outputPath}`);
  console.log(`   - History: ${readingList.history.length} items`);
  console.log(`   - Literature: ${readingList.literature.length} items`);

  // 计算文学类中有内容的文件数量
  const literatureWithContent = readingList.literature.filter(item => item.type === 'folder');
  if (literatureWithContent.length > 0) {
    const totalFiles = literatureWithContent.reduce((acc, item) => acc + item.files.length, 0);
    console.log(`     (including ${totalFiles} txt files with content)`);
  }

  console.log(`   - Other: ${readingList.other.length} items`);
}

generateReadingList();
