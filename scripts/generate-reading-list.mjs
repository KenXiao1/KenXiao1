import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
      // 如果是文件夹（如徐訏小说选txt），返回一个特殊对象
      return {
        name: cleanFileName(item),
        type: 'folder',
        originalName: item,
        files: fs.readdirSync(fullPath)
          .filter(f => f.endsWith('.txt'))
          .map(f => ({
            name: cleanFileName(f),
            originalName: f
          }))
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
  fs.writeFileSync(outputPath, JSON.stringify(readingList, null, 2));

  console.log('✅ Reading list generated successfully!');
  console.log(`   Output: ${outputPath}`);
  console.log(`   - History: ${readingList.history.length} items`);
  console.log(`   - Literature: ${readingList.literature.length} items`);
  console.log(`   - Other: ${readingList.other.length} items`);
}

generateReadingList();
