import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { GetStaticProps } from 'next';
import { useState } from 'react';

interface FileItem {
  name: string;
  path: string;
  size: number;
  type: string;
}

interface HomeProps {
  files: FileItem[];
}

function getFileIcon(type: string): string {
  if (type.startsWith('video/')) return '🎥';
  if (type.startsWith('audio/')) return '🎵';
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type.startsWith('text/')) return '📝';
  if (type === 'application/zip' || type.includes('archive')) return '📦';
  return '📎';
}

export default function Home({ files }: HomeProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const copyToClipboard = (path: string) => {
    const fullUrl = `${window.location.origin}/files/${path}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        setCopiedPath(path);
        setTimeout(() => setCopiedPath(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        // Fallback: user will need to manually copy
        alert('Failed to copy to clipboard. Please copy the URL manually.');
      });
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px' 
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Vercel CDN System</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Simple CDN system that serves files from the <code style={{ 
          background: '#f4f4f4', 
          padding: '2px 6px', 
          borderRadius: '3px' 
        }}>/files</code> directory.
      </p>
      
      {files.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          background: '#f9f9f9', 
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <p>No files found in the <code>/files</code> directory.</p>
          <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
            Add files to <code>public/files/</code> to make them available via the CDN.
          </p>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Available Files</h2>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {files.map((file) => (
              <li key={file.path} style={{
                padding: '15px',
                background: '#f9f9f9',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getFileIcon(file.type)}</span>
                    <div>
                      <strong>{file.name}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => copyToClipboard(file.path)}
                      style={{
                        padding: '8px 16px',
                        background: copiedPath === file.path ? '#10b981' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        fontSize: '0.9rem'
                      }}
                    >
                      {copiedPath === file.path ? '✓ Copied' : '📋 Copy'}
                    </button>
                    <a 
                      href={`/files/${file.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 16px',
                        background: '#0070f3',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        fontSize: '0.9rem'
                      }}
                    >
                      Open
                    </a>
                  </div>
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '0.85rem',
                  color: '#666',
                  fontFamily: 'monospace',
                  background: '#fff',
                  padding: '8px',
                  borderRadius: '4px',
                  wordBreak: 'break-all'
                }}>
                  /files/{file.path}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{ 
        marginTop: '3rem', 
        padding: '20px', 
        background: '#f0f8ff', 
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>How to use</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Place your files in the <code style={{ background: '#e6f2ff', padding: '2px 6px', borderRadius: '3px' }}>public/files/</code> directory</li>
          <li>Access them via <code style={{ background: '#e6f2ff', padding: '2px 6px', borderRadius: '3px' }}>/files/filename.ext</code></li>
          <li>Share the link with anyone!</li>
        </ol>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const filesDir = join(process.cwd(), 'public', 'files');
  let files: FileItem[] = [];
  
  const getContentType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
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
      // Documents
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'csv': 'text/csv',
      // Archives
      'zip': 'application/zip',
    };
    return contentTypes[ext] || 'application/octet-stream';
  };
  
  try {
    const dirContents = readdirSync(filesDir);
    files = dirContents
      .map((name) => {
        const fullPath = join(filesDir, name);
        const stats = statSync(fullPath);
        
        // Only include actual files, not directories
        if (!stats.isFile()) {
          return null;
        }
        
        return {
          name,
          path: name,
          size: stats.size,
          type: getContentType(name),
        };
      })
      .filter((file): file is FileItem => file !== null);
  } catch (error) {
    // Directory doesn't exist or is empty
    console.log('Files directory is empty or does not exist');
  }
  
  return {
    props: {
      files,
    },
  };
};
