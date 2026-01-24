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

1. Place your files in the `public/files/` directory
2. Files will automatically be available via the CDN

### Accessing Files

Files can be accessed via the following URL pattern:
```
https://your-domain.vercel.app/files/filename.ext
```

For example:
- `https://your-domain.vercel.app/files/test.txt`
- `https://your-domain.vercel.app/files/video.mp4`
- `https://your-domain.vercel.app/files/image.png`

### JSON API

Get file metadata in JSON format using the API endpoint:
```
https://your-domain.vercel.app/api/json/files/path/to/file.ext
```

**For a single file:**
```bash
curl https://your-domain.vercel.app/api/json/files/pictures/image.png
```

Returns:
```json
{
  "name": "image.png",
  "path": "pictures/image.png",
  "size": 41595,
  "sizeFormatted": "40.62 KB",
  "type": "image",
  "contentType": "image/png",
  "isDirectory": false,
  "url": "/files/pictures/image.png",
  "lastModified": "2026-01-24T11:39:20.921Z"
}
```

**For a directory:**
```bash
curl https://your-domain.vercel.app/api/json/files/videos/screenrecordings
```

Returns:
```json
{
  "name": "screenrecordings",
  "path": "videos/screenrecordings",
  "isDirectory": true,
  "items": [
    {
      "name": "video1.mp4",
      "path": "videos/screenrecordings/video1.mp4",
      "size": 10444229,
      "sizeFormatted": "9.96 MB",
      "type": "video",
      "contentType": "video/mp4",
      "isDirectory": false,
      "url": "/files/videos/screenrecordings/video1.mp4",
      "lastModified": "2026-01-24T11:39:20.943Z"
    }
  ]
}
```

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
│   │   └── files/
│   │       └── [...path].ts    # API route for serving files
│   └── index.tsx                # Homepage with file listing
├── public/
│   └── files/                   # Place your CDN files here
├── package.json
├── tsconfig.json
└── vercel.json                  # Vercel configuration
```

## How It Works

1. Files are stored in `public/files/` directory
2. The API route at `/api/files/[...path]` serves these files with proper content types
3. URL rewrites in `vercel.json` map `/files/*` to the API route
4. The homepage displays all available files with shareable links
5. Click "Copy" button to copy the full URL to clipboard
6. Security features include path traversal protection and proper content type headers

## Features

- 📁 **Easy File Management**: Just drop files in `public/files/`
- 🔗 **Instant URLs**: Get shareable links immediately
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
