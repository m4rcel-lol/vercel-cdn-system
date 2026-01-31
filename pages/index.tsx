import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { GetStaticProps } from 'next';
import { useState } from 'react';
import Head from 'next/head';

interface FileItem {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: string;
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vercel CDN System</title>
        <style>{`
          @media (max-width: 768px) {
            .container {
              padding: 20px !important;
            }
            .title {
              font-size: 1.8rem !important;
            }
            .grid {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 480px) {
            .container {
              padding: 16px !important;
            }
            .title {
              font-size: 1.5rem !important;
            }
            .button-group {
              flex-direction: column !important;
            }
            .button-group > * {
              width: 100% !important;
            }
          }
        `}</style>
      </Head>
      <div style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: '40px',
        }}>
      <h1 className="title" style={{ 
        fontSize: '2.5rem', 
        marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold'
      }}>Vercel CDN System</h1>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
        Simple CDN system that serves files from the <code style={{ 
          background: '#f4f4f4', 
          padding: '4px 8px', 
          borderRadius: '4px',
          color: '#e53e3e',
          fontWeight: '500'
        }}>/files</code> directory.
      </p>
      
      {files.length === 0 ? (
        <div style={{ 
          padding: '30px', 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
          borderRadius: '12px',
          border: '2px dashed #667eea',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>No files found in the <code>/files</code> directory.</p>
          <p style={{ marginTop: '10px', fontSize: '1rem', color: '#666' }}>
            Add files to <code>public/files/</code> to make them available via the CDN.
          </p>
        </div>
      ) : (
        <div>
          <h2 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '1.5rem',
            color: '#2d3748'
          }}>Available Files ({files.length})</h2>
          <ul className="grid" style={{ 
            listStyle: 'none', 
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {files.map((file) => (
              <li key={file.path} style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '2rem', flexShrink: 0 }}>{getFileIcon(file.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ 
                      display: 'block',
                      fontSize: '1.1rem',
                      color: '#2d3748',
                      wordBreak: 'break-word',
                      marginBottom: '4px'
                    }}>{file.name}</strong>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#718096',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      <div>{(file.size / 1024).toFixed(2)} KB</div>
                      <div>📅 {formatDate(file.lastModified)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="button-group" style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => copyToClipboard(file.path)}
                    style={{
                      flex: '1 1 auto',
                      minWidth: '80px',
                      padding: '10px 14px',
                      background: copiedPath === file.path ? '#48bb78' : '#4a5568',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {copiedPath === file.path ? '✓ Copied' : '📋 Copy'}
                  </button>
                  <a 
                    href={`/api/json/files/${file.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: '1 1 auto',
                      minWidth: '80px',
                      padding: '10px 14px',
                      background: '#ed8936',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    📄 JSON
                  </a>
                  <a 
                    href={`/files/${file.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: '1 1 auto',
                      minWidth: '80px',
                      padding: '10px 14px',
                      background: '#667eea',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    🔗 Open
                  </a>
                </div>
                
                <div style={{ 
                  marginTop: '4px', 
                  fontSize: '0.8rem',
                  color: '#718096',
                  fontFamily: 'monospace',
                  background: '#fff',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  wordBreak: 'break-all',
                  border: '1px solid #e2e8f0'
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
        padding: '24px', 
        background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', 
        borderRadius: '12px',
        border: '2px solid #0ea5e9'
      }}>
        <h3 style={{ 
          fontSize: '1.3rem', 
          marginBottom: '0.75rem',
          color: '#0c4a6e'
        }}>How to use</h3>
        <ol style={{ lineHeight: '2', color: '#0c4a6e' }}>
          <li>Place your files in the <code style={{ background: '#e0f2fe', padding: '3px 8px', borderRadius: '4px' }}>public/files/</code> directory</li>
          <li>Access them via <code style={{ background: '#e0f2fe', padding: '3px 8px', borderRadius: '4px' }}>/files/filename.ext</code></li>
          <li>Get JSON metadata via <code style={{ background: '#e0f2fe', padding: '3px 8px', borderRadius: '4px' }}>/api/json/files/filename.ext</code></li>
          <li>Share the links with anyone!</li>
        </ol>
      </div>
        </div>
      </div>
    </>
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
  
  // Recursive function to scan directories
  const scanDirectory = (dirPath: string, relativePath: string = ''): FileItem[] => {
    const result: FileItem[] = [];
    
    try {
      const dirContents = readdirSync(dirPath);
      
      for (const name of dirContents) {
        // Skip README.md files
        if (name === 'README.md') {
          continue;
        }
        
        const fullPath = join(dirPath, name);
        const stats = statSync(fullPath);
        const itemRelativePath = relativePath ? join(relativePath, name) : name;
        
        if (stats.isDirectory()) {
          // Recursively scan subdirectories
          result.push(...scanDirectory(fullPath, itemRelativePath));
        } else if (stats.isFile()) {
          // Add file to results
          result.push({
            name,
            path: itemRelativePath,
            size: stats.size,
            type: getContentType(name),
            lastModified: stats.mtime.toISOString(),
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
    
    return result;
  };
  
  try {
    files = scanDirectory(filesDir);
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
