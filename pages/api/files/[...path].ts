import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  
  // Construct the file path
  const filePath = Array.isArray(path) ? path.join('/') : path || '';
  const fullPath = join(process.cwd(), 'public', 'files', filePath);
  
  // Check if file exists
  if (!existsSync(fullPath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Check if it's a file (not a directory)
  const stats = statSync(fullPath);
  if (!stats.isFile()) {
    return res.status(400).json({ error: 'Path is not a file' });
  }
  
  try {
    // Read file
    const fileBuffer = readFileSync(fullPath);
    
    // Determine content type based on file extension
    const ext = filePath.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'zip': 'application/zip',
    };
    
    const contentType = contentTypes[ext || ''] || 'application/octet-stream';
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Send file
    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error('Error reading file:', error);
    return res.status(500).json({ error: 'Error reading file' });
  }
}
