import { readFileSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  
  // Construct the file path
  const filePath = Array.isArray(path) ? path.join('/') : path || '';
  
  // Security: Resolve canonical paths to prevent directory traversal
  const filesRoot = resolve(process.cwd(), 'public', 'files');
  const fullPath = resolve(filesRoot, filePath);
  
  // Security: Ensure the resolved path is within the files directory
  if (!fullPath.startsWith(filesRoot + require('path').sep) && fullPath !== filesRoot) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
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
      // Video
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'webm': 'video/webm',
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'ico': 'image/x-icon',
      // Documents
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'csv': 'text/csv',
      // Web
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'xml': 'application/xml',
      // Archives
      'zip': 'application/zip',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
    };
    
    const contentType = contentTypes[ext || ''] || 'application/octet-stream';
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Send file
    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error('Error reading file:', error);
    return res.status(500).json({ error: 'Error reading file' });
  }
}
