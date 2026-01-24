import { existsSync, statSync, readdirSync } from 'fs';
import { join, resolve, extname } from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

interface FileMetadata {
  name: string;
  path: string;
  size: number;
  sizeFormatted: string;
  type: string;
  contentType: string;
  isDirectory: boolean;
  url: string;
  lastModified: string;
}

interface DirectoryMetadata {
  name: string;
  path: string;
  isDirectory: true;
  items?: FileMetadata[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  
  // Construct the file path
  const filePath = Array.isArray(path) ? path.join('/') : path || '';
  
  // Security: Resolve canonical paths to prevent directory traversal
  const filesRoot = resolve(process.cwd(), 'public', 'files');
  const fullPath = resolve(filesRoot, filePath);
  
  // Security: Ensure the resolved path is within the files directory
  if (!fullPath.startsWith(filesRoot + require('path').sep) && fullPath !== filesRoot) {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Path traversal detected'
    });
  }
  
  // Check if file/directory exists
  if (!existsSync(fullPath)) {
    return res.status(404).json({ 
      error: 'Not found',
      message: 'File or directory does not exist'
    });
  }
  
  try {
    const stats = statSync(fullPath);
    
    if (stats.isDirectory()) {
      // Return directory listing
      const items = readdirSync(fullPath);
      const directoryItems: FileMetadata[] = [];
      
      for (const item of items) {
        const itemPath = join(fullPath, item);
        const itemStats = statSync(itemPath);
        const itemRelativePath = filePath ? `${filePath}/${item}` : item;
        
        const metadata: FileMetadata = {
          name: item,
          path: itemRelativePath,
          size: itemStats.size,
          sizeFormatted: formatSize(itemStats.size),
          type: itemStats.isDirectory() ? 'directory' : getFileType(item),
          contentType: itemStats.isDirectory() ? 'directory' : getContentType(item),
          isDirectory: itemStats.isDirectory(),
          url: itemStats.isDirectory() 
            ? `/api/json/files/${itemRelativePath}`
            : `/files/${itemRelativePath}`,
          lastModified: itemStats.mtime.toISOString()
        };
        
        directoryItems.push(metadata);
      }
      
      // Sort: directories first, then files
      directoryItems.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      const response: DirectoryMetadata = {
        name: filePath.split('/').pop() || 'root',
        path: filePath,
        isDirectory: true,
        items: directoryItems
      };
      
      return res.status(200).json(response);
    } else {
      // Return file metadata
      const fileName = filePath.split('/').pop() || '';
      const metadata: FileMetadata = {
        name: fileName,
        path: filePath,
        size: stats.size,
        sizeFormatted: formatSize(stats.size),
        type: getFileType(fileName),
        contentType: getContentType(fileName),
        isDirectory: false,
        url: `/files/${filePath}`,
        lastModified: stats.mtime.toISOString()
      };
      
      return res.status(200).json(metadata);
    }
  } catch (error) {
    console.error('Error reading file/directory:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error reading file or directory'
    });
  }
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getFileType(filename: string): string {
  const ext = extname(filename).toLowerCase();
  
  const typeMap: { [key: string]: string } = {
    // Video
    '.mp4': 'video',
    '.mov': 'video',
    '.avi': 'video',
    '.webm': 'video',
    '.mkv': 'video',
    // Audio
    '.mp3': 'audio',
    '.wav': 'audio',
    '.ogg': 'audio',
    '.m4a': 'audio',
    '.flac': 'audio',
    // Images
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.svg': 'image',
    '.webp': 'image',
    '.ico': 'image',
    // Documents
    '.pdf': 'document',
    '.txt': 'document',
    '.csv': 'document',
    '.doc': 'document',
    '.docx': 'document',
    // Archives
    '.zip': 'archive',
    '.tar': 'archive',
    '.gz': 'archive',
    '.rar': 'archive',
    '.7z': 'archive',
  };
  
  return typeMap[ext] || 'file';
}

function getContentType(filename: string): string {
  const ext = extname(filename).toLowerCase().substring(1);
  
  const contentTypes: { [key: string]: string } = {
    // Video
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',
    'flac': 'audio/flac',
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
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
  };
  
  return contentTypes[ext] || 'application/octet-stream';
}
