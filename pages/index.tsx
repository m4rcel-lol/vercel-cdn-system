import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { GetStaticProps } from 'next';
import { useState, useEffect } from 'react';

interface FileItem {
  name: string;
  path: string;
  size: number;
  type: string;
  isDirectory: boolean;
}

interface FolderStructure {
  [key: string]: FileItem[];
}

interface HomeProps {
  fileStructure: FolderStructure;
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

export default function Home({ fileStructure }: HomeProps) {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const debouncedCheckMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };
    
    checkMobile();
    window.addEventListener('resize', debouncedCheckMobile);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCheckMobile);
    };
  }, []);

  const copyToClipboard = (path: string) => {
    const fullUrl = `${window.location.origin}/files/${path}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        setCopiedPath(path);
        setTimeout(() => setCopiedPath(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Please copy the URL manually.');
      });
  };

  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const navigateBack = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    const newPath = pathParts.slice(0, -1).join('/');
    setCurrentPath(newPath);
  };

  const currentItems = fileStructure[currentPath] || [];
  const pathParts = currentPath.split('/').filter(Boolean);
  const hasContent = Object.keys(fileStructure).length > 0;

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      maxWidth: isMobile ? '100%' : '900px', 
      margin: '0 auto', 
      padding: isMobile ? '20px 15px' : '40px 20px',
      minHeight: '100vh',
      background: '#fafafa'
    }}>
      <style jsx>{`
        @media (max-width: 768px) {
          .file-actions {
            flex-direction: column;
            width: 100%;
          }
          .file-actions > * {
            width: 100%;
          }
          .file-info {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .file-card {
            flex-direction: column;
          }
        }
      `}</style>

      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: isMobile ? '20px 15px' : '30px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h1 style={{ 
          fontSize: isMobile ? '1.5rem' : '2rem', 
          marginBottom: '0.5rem',
          color: '#1a1a1a'
        }}>
          📁 Vercel CDN System
        </h1>
        <p style={{ color: '#666', marginBottom: 0, fontSize: isMobile ? '0.9rem' : '1rem' }}>
          Organized file CDN with folder navigation
        </p>
      </div>

      {/* Breadcrumb Navigation */}
      {currentPath && (
        <div style={{
          background: 'white',
          padding: isMobile ? '12px 15px' : '15px 20px',
          borderRadius: '8px',
          marginBottom: '15px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={navigateBack}
            style={{
              padding: isMobile ? '6px 12px' : '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px',
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              fontWeight: '500'
            }}
          >
            ← Back
          </button>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            flexWrap: 'wrap',
            fontSize: isMobile ? '0.85rem' : '0.95rem'
          }}>
            <span 
              onClick={() => setCurrentPath('')}
              style={{ cursor: 'pointer', color: '#0070f3', fontWeight: '500' }}
            >
              Home
            </span>
            {pathParts.map((part, idx) => (
              <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#999' }}>›</span>
                <span 
                  onClick={() => setCurrentPath(pathParts.slice(0, idx + 1).join('/'))}
                  style={{ 
                    cursor: idx < pathParts.length - 1 ? 'pointer' : 'default',
                    color: idx < pathParts.length - 1 ? '#0070f3' : '#333',
                    fontWeight: idx === pathParts.length - 1 ? '600' : '400'
                  }}
                >
                  {part}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
      
      {!hasContent ? (
        <div style={{ 
          padding: isMobile ? '20px 15px' : '30px',
          background: 'white',
          borderRadius: '12px',
          border: '2px dashed #e0e0e0',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>📂</p>
          <p style={{ fontSize: isMobile ? '1rem' : '1.1rem', marginBottom: '10px' }}>
            No files found in the <code style={{ background: '#f4f4f4', padding: '2px 8px', borderRadius: '4px' }}>/files</code> directory.
          </p>
          <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', color: '#666' }}>
            Add files to <code style={{ background: '#f4f4f4', padding: '2px 8px', borderRadius: '4px' }}>public/files/</code> to get started.
          </p>
        </div>
      ) : (
        <div style={{ 
          background: 'white',
          borderRadius: '12px',
          padding: isMobile ? '15px' : '25px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: isMobile ? '1.2rem' : '1.4rem', 
            marginBottom: '15px',
            color: '#1a1a1a'
          }}>
            {currentPath ? `📂 ${pathParts[pathParts.length - 1]}` : '📁 All Files & Folders'}
          </h2>

          {currentItems.length === 0 ? (
            <div style={{ 
              padding: isMobile ? '15px' : '20px',
              background: '#f9f9f9',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666'
            }}>
              This folder is empty
            </div>
          ) : (
            <div style={{ 
              display: 'grid',
              gap: isMobile ? '10px' : '12px'
            }}>
              {/* Folders first */}
              {currentItems.filter(item => item.isDirectory).map((item) => (
                <div
                  key={item.path}
                  onClick={() => navigateToFolder(item.path)}
                  className="file-card"
                  style={{
                    padding: isMobile ? '12px' : '15px',
                    background: '#f8f9ff',
                    borderRadius: '8px',
                    border: '2px solid #e0e7ff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#eef2ff';
                    e.currentTarget.style.borderColor = '#c7d2fe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9ff';
                    e.currentTarget.style.borderColor = '#e0e7ff';
                  }}
                >
                  <span style={{ fontSize: isMobile ? '1.8rem' : '2rem' }}>📁</span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: isMobile ? '0.95rem' : '1rem', color: '#1a1a1a' }}>
                      {item.name}
                    </strong>
                    <div style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                      Folder
                    </div>
                  </div>
                  <span style={{ fontSize: isMobile ? '1rem' : '1.2rem', color: '#6b7280' }}>›</span>
                </div>
              ))}

              {/* Files */}
              {currentItems.filter(item => !item.isDirectory).map((file) => (
                <div
                  key={file.path}
                  className="file-card"
                  style={{
                    padding: isMobile ? '12px' : '15px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <div className="file-info" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: isMobile ? '10px' : '15px',
                    marginBottom: isMobile ? '10px' : '0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: isMobile ? '1.5rem' : '1.8rem' }}>{getFileIcon(file.type)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ 
                          fontSize: isMobile ? '0.9rem' : '0.95rem',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#1a1a1a'
                        }}>
                          {file.name}
                        </strong>
                        <div style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <div className="file-actions" style={{ 
                      display: 'flex', 
                      gap: isMobile ? '6px' : '8px',
                      flexShrink: 0
                    }}>
                      <button
                        onClick={() => copyToClipboard(file.path)}
                        style={{
                          padding: isMobile ? '6px 12px' : '8px 14px',
                          background: copiedPath === file.path ? '#10b981' : '#6b7280',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          fontSize: isMobile ? '0.8rem' : '0.85rem',
                          fontWeight: '500',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {copiedPath === file.path ? '✓' : '📋'}
                      </button>
                      <a 
                        href={`/files/${file.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: isMobile ? '6px 12px' : '8px 14px',
                          background: '#0070f3',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontSize: isMobile ? '0.8rem' : '0.85rem',
                          fontWeight: '500',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Open
                      </a>
                    </div>
                  </div>
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                    color: '#6b7280',
                    fontFamily: 'monospace',
                    background: '#f9fafb',
                    padding: isMobile ? '6px 8px' : '8px 10px',
                    borderRadius: '4px',
                    wordBreak: 'break-all',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    /files/{file.path}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div style={{ 
        marginTop: '20px', 
        padding: isMobile ? '15px' : '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: isMobile ? '1rem' : '1.1rem', marginBottom: '10px', color: '#1a1a1a' }}>
          💡 How to use
        </h3>
        <ul style={{ 
          lineHeight: '1.8', 
          paddingLeft: isMobile ? '20px' : '25px',
          fontSize: isMobile ? '0.85rem' : '0.9rem',
          color: '#4b5563'
        }}>
          <li>Organize files in folders within <code style={{ background: '#f4f4f4', padding: '2px 6px', borderRadius: '3px' }}>public/files/</code></li>
          <li>Click folders to navigate and browse files</li>
          <li>Click &quot;Copy&quot; to get the shareable link</li>
          <li>Click &quot;Open&quot; to view the file</li>
        </ul>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const filesDir = join(process.cwd(), 'public', 'files');
  const fileStructure: FolderStructure = {};
  
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
  
  const scanDirectory = (dirPath: string, relativePath: string = '', depth: number = 0) => {
    // Limit recursion depth to prevent stack overflow
    if (depth > 10) {
      console.warn(`Max recursion depth reached at: ${relativePath}`);
      return;
    }
    
    try {
      const items = readdirSync(dirPath);
      const currentDirItems: FileItem[] = [];
      
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stats = statSync(fullPath);
        const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;
        
        if (stats.isDirectory()) {
          // Add directory to current level
          currentDirItems.push({
            name: item,
            path: itemRelativePath,
            size: 0,
            type: 'directory',
            isDirectory: true,
          });
          
          // Recursively scan subdirectory
          scanDirectory(fullPath, itemRelativePath, depth + 1);
        } else if (stats.isFile()) {
          // Add file to current level
          currentDirItems.push({
            name: item,
            path: itemRelativePath,
            size: stats.size,
            type: getContentType(item),
            isDirectory: false,
          });
        }
      }
      
      // Store items for this directory level
      fileStructure[relativePath] = currentDirItems;
    } catch (error) {
      console.log(`Error scanning directory ${dirPath}:`, error);
    }
  };
  
  try {
    scanDirectory(filesDir);
  } catch (error) {
    console.log('Files directory is empty or does not exist');
  }
  
  return {
    props: {
      fileStructure,
    },
  };
};
