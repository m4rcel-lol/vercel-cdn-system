# Vercel CDN System

A simple and easy-to-use CDN system for Vercel that serves files from the repository's files folder and provides sharable links.

## Features

- 📁 Serve files from the `public/files/` directory
- 🔗 Get sharable links for all files (e.g., `cdn-system.vercel.app/files/test.mp4`)
- 🚀 Optimized for Vercel deployment
- 📝 Simple web interface to view available files
- 🎯 Support for multiple file types (videos, images, audio, documents, etc.)

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/m4rcel-lol/vercel-cdn-system.git
cd vercel-cdn-system
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding Files

1. Place your files in the appropriate subdirectory within `public/files/`:
   - **Images**: `public/files/images/` - for jpg, png, gif, svg, webp, ico files
   - **Videos**: `public/files/videos/` - for mp4, mov, avi, webm files
   - **Audio**: `public/files/audio/` - for mp3, wav, ogg files
   - **GIFs**: `public/files/gifs/` - for gif animations
   - **Archives**: `public/files/archives/` - for zip, tar, gz files
   - **Documents**: `public/files/documents/` - for pdf, txt, csv files
   - **Web**: `public/files/web/` - for html, css, js, json, xml files
2. Files will automatically be available via the CDN

### Accessing Files

Files can be accessed via the following URL pattern:
```
https://your-domain.vercel.app/files/subdirectory/filename.ext
```

For example:
- `https://your-domain.vercel.app/files/documents/test.txt`
- `https://your-domain.vercel.app/files/videos/video.mp4`
- `https://your-domain.vercel.app/files/images/image.png`

### JSON API for File Metadata

Get file metadata as JSON via the following URL pattern:
```
https://your-domain.vercel.app/api/json/files/filename.ext
```

The API returns detailed information about files including:
- File name, path, and full URL
- File size and MIME type
- Last modified timestamp
- Whether it's a file or directory

Example responses:

**For a file:**
```json
{
  "name": "test.txt",
  "path": "test.txt",
  "url": "https://your-domain.vercel.app/files/test.txt",
  "size": 215,
  "type": "text/plain",
  "isDirectory": false,
  "lastModified": "2026-01-24T12:05:59.798Z"
}
```

**For a directory:**
```json
{
  "name": "images",
  "path": "images",
  "url": "https://your-domain.vercel.app/files/images",
  "isDirectory": true,
  "files": [
    {
      "name": "photo.jpg",
      "path": "images/photo.jpg",
      "url": "https://your-domain.vercel.app/files/images/photo.jpg",
      "size": 1234567,
      "type": "image/jpeg",
      "isDirectory": false,
      "lastModified": "2026-01-24T12:05:59.775Z"
    }
  ]
}
```

Supports nested paths and subdirectories:
- `https://your-domain.vercel.app/api/json/files/videos/clips/clip1.mp4`
- `https://your-domain.vercel.app/api/json/files/images/photos`

### Supported File Types

The CDN supports various file types including:
- **Videos**: mp4, mov, avi, webm
- **Audio**: mp3, wav, ogg
- **Images**: jpg, jpeg, png, gif, svg, webp, ico
- **Documents**: pdf, txt, csv
- **Web**: html, css, js, json, xml
- **Archives**: zip, tar, gz
- And more (served as `application/octet-stream`)

## Deployment to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy!

Your CDN will be available at your Vercel deployment URL.

## Project Structure

```
vercel-cdn-system/
├── pages/
│   ├── api/
│   │   ├── files/
│   │   │   └── [...path].ts         # API route for serving files
│   │   └── json/
│   │       └── files/
│   │           └── [...path].ts     # JSON API for file metadata
│   └── index.tsx                    # Homepage with file listing
├── public/
│   └── files/                       # Place your CDN files here
│       ├── images/                  # Image files (jpg, png, gif, svg, webp, ico)
│       ├── videos/                  # Video files (mp4, mov, avi, webm)
│       ├── audio/                   # Audio files (mp3, wav, ogg)
│       ├── gifs/                    # GIF animations
│       ├── archives/                # Compressed files (zip, tar, gz)
│       ├── documents/               # Documents (pdf, txt, csv)
│       └── web/                     # Web files (html, css, js, json, xml)
├── package.json
├── tsconfig.json
└── vercel.json                      # Vercel configuration
```

## How It Works

1. Files are organized in subdirectories within `public/files/` (images, videos, audio, gifs, archives, documents, web)
2. The API route at `/api/files/[...path]` serves these files with proper content types, supporting nested paths
3. The JSON API route at `/api/json/files/[...path]` provides file metadata in JSON format
4. URL rewrites in `vercel.json` map `/files/*` to the API route
5. The homepage displays all available files with shareable links
6. Click "Copy" button to copy the full URL to clipboard
7. Security features include path traversal protection and proper content type headers

## Features

- 📁 **Easy File Management**: Organized subdirectories in `public/files/` for different file types
- 🔗 **Instant URLs**: Get shareable links immediately
- 📊 **JSON API**: Get file metadata in JSON format for integration
- 🚀 **Optimized Performance**: Leverages Vercel's CDN with caching
- 📝 **Beautiful UI**: Clean interface with file type icons
- 📋 **Copy to Clipboard**: One-click URL copying
- 🔒 **Secure**: Path traversal protection and security headers
- 🎯 **Wide Format Support**: Videos, images, audio, documents, and more
- 🌐 **CORS Enabled**: Access files from any domain

## Troubleshooting

### Files not showing up
- Ensure files are placed in `public/files/` (not just `files/`)
- Run `npm run build` to regenerate static pages
- Check file permissions

### Type errors during build
- Run `npm install` to ensure all dependencies are installed
- Run `npm run type-check` to verify TypeScript compilation

### Deployment issues
- Ensure Node.js version is 18.0.0 or higher
- Check Vercel build logs for specific errors
- Verify `vercel.json` configuration is present

## License

MIT
