import fs from 'fs/promises';
import path from 'path';

const SOURCE_ROOT = 'd:\\kenxiao blog';
const TARGET_ROOT = 'd:\\kenxiao blog\\ken-blog';

async function migrate() {
    // Ensure directories exist
    await fs.mkdir(path.join(TARGET_ROOT, 'src/content/blog'), { recursive: true });
    await fs.mkdir(path.join(TARGET_ROOT, 'src/content/pdfs'), { recursive: true });
    await fs.mkdir(path.join(TARGET_ROOT, 'src/content/recommendations'), { recursive: true });
    await fs.mkdir(path.join(TARGET_ROOT, 'public/pdfs'), { recursive: true });

    // 1. Migrate Blog Posts
    const blogSource = path.join(SOURCE_ROOT, 'blog obsidian');
    const files = await fs.readdir(blogSource);

    for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const content = await fs.readFile(path.join(blogSource, file), 'utf-8');
        const title = file.replace('.md', '');

        // Determine category
        let category = 'tech';
        if (title.includes('翻译') || content.includes('翻译')) category = 'translation';
        else if (title.includes('历史') || title.includes('政变') || title.includes('宫下')) category = 'history';
        else if (title.includes('数学') || title.includes('Algebra') || title.includes('微积分')) category = 'math';

        const frontmatter = `---
title: ${JSON.stringify(title)}
date: ${new Date().toISOString()}
description: ${JSON.stringify(content.slice(0, 150).replace(/\n/g, ' ') + '...')}
category: "${category}"
tags: []
mathjax: true
---

`;

        await fs.writeFile(path.join(TARGET_ROOT, 'src/content/blog', file), frontmatter + content);
        console.log(`Migrated blog: ${file}`);
    }

    // 2. Migrate PDFs
    const pdfSource = path.join(SOURCE_ROOT, 'personal blog - pdf');
    const pdfFiles = await fs.readdir(pdfSource);

    for (const file of pdfFiles) {
        if (!file.endsWith('.pdf')) continue;

        // Copy file
        await fs.copyFile(path.join(pdfSource, file), path.join(TARGET_ROOT, 'public/pdfs', file));

        // Create metadata
        const title = file.replace('.pdf', '');
        const metadata = {
            title: title,
            filename: file,
            description: `PDF Document: ${title}`,
            category: 'Academic',
            uploadDate: new Date().toISOString()
        };

        await fs.writeFile(
            path.join(TARGET_ROOT, 'src/content/pdfs', `${title.replace(/\s+/g, '-').toLowerCase()}.json`),
            JSON.stringify(metadata, null, 2)
        );
        console.log(`Migrated PDF: ${file}`);
    }

    // 3. Migrate Recommendations
    const recSource = path.join(SOURCE_ROOT, 'recommend - some are read some are not - more like a reading list');
    const recFiles = await fs.readdir(recSource);

    for (const file of recFiles) {
        const title = file.replace(path.extname(file), '');
        const metadata = {
            title: title,
            status: 'toread',
            notes: 'Imported from reading list'
        };

        await fs.writeFile(
            path.join(TARGET_ROOT, 'src/content/recommendations', `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`),
            JSON.stringify(metadata, null, 2)
        );
        console.log(`Migrated Recommendation: ${file}`);
    }
}

migrate().catch(console.error);
