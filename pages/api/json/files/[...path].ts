import { existsSync, statSync, readdirSync } from 'fs';
import { join, resolve, relative, sep } from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

interface FileInfo {
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
  isDirectory: boolean;
  lastModified: string;
}

interface DirectoryInfo {
  name: string;
  path: string;
  url: string;
  isDirectory: boolean;
  files: FileInfo[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  
  // Construct the file path
  const filePath = Array.isArray(path) ? path.join('/') : path || '';
  
  // Security: Resolve canonical paths to prevent directory traversal
  const filesRoot = resolve(process.cwd(), 'public', 'files');
  const fullPath = resolve(filesRoot, filePath);
  
  // Security: Ensure the resolved path is within the files directory
  if (!fullPath.startsWith(filesRoot + sep) && fullPath !== filesRoot) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Check if file/directory exists
  if (!existsSync(fullPath)) {
    return res.status(404).json({ error: 'File or directory not found' });
  }
  
  try {
    const stats = statSync(fullPath);
    
    // Determine content type based on file extension
    const getContentType = (filename: string): string => {
      const ext = filename.split('.').pop()?.toLowerCase();
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
      
      return contentTypes[ext || ''] || 'application/octet-stream';
    };
    
    // Get the base URL from the request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    
    if (stats.isFile()) {
      // Return file information as JSON
      const fileName = fullPath.split('/').pop() || '';
      const relativePath = relative(filesRoot, fullPath);
      
      const fileInfo: FileInfo = {
        name: fileName,
        path: relativePath,
        url: `${baseUrl}/files/${relativePath}`,
        size: stats.size,
        type: getContentType(fileName),
        isDirectory: false,
        lastModified: stats.mtime.toISOString(),
      };
      
      // Set headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      
      // Handle OPTIONS preflight request
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      return res.status(200).json(fileInfo);
    } else if (stats.isDirectory()) {
      // Return directory listing as JSON
      const dirName = fullPath === filesRoot ? 'files' : fullPath.split('/').pop() || '';
      const relativePath = relative(filesRoot, fullPath);
      
      // Read directory contents
      const dirContents = readdirSync(fullPath);
      const files: FileInfo[] = dirContents.map((name) => {
        const itemPath = join(fullPath, name);
        const itemStats = statSync(itemPath);
        const itemRelativePath = relative(filesRoot, itemPath);
        
        return {
          name,
          path: itemRelativePath,
          url: `${baseUrl}/files/${itemRelativePath}`,
          size: itemStats.size,
          type: itemStats.isDirectory() ? 'directory' : getContentType(name),
          isDirectory: itemStats.isDirectory(),
          lastModified: itemStats.mtime.toISOString(),
        };
      });
      
      const directoryInfo: DirectoryInfo = {
        name: dirName,
        path: relativePath || '.',
        url: `${baseUrl}/files/${relativePath}`,
        isDirectory: true,
        files,
      };
      
      // Set headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      
      // Handle OPTIONS preflight request
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      return res.status(200).json(directoryInfo);
    } else {
      return res.status(400).json({ error: 'Path is neither a file nor a directory' });
    }
  } catch (error) {
    console.error('Error reading file/directory:', error);
    return res.status(500).json({ error: 'Error reading file or directory' });
  }
}
