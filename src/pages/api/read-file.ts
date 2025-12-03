import fs from 'fs';
import path from 'path';

export async function GET({ request }) {
  const url = new URL(request.url);
  const folder = url.searchParams.get('folder');
  const file = url.searchParams.get('file');

  if (!folder || !file) {
    return new Response(JSON.stringify({ error: 'Missing folder or file parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const basePath = path.resolve(process.cwd(), '../recommend - some are read some are not - more like a reading list/literature');
    const filePath = path.join(basePath, folder, file);

    // 安全检查：确保文件路径在允许的目录内
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(basePath)) {
      return new Response(JSON.stringify({ error: 'Invalid file path' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
