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

### Supported File Types

The CDN supports various file types including:
- **Videos**: mp4
- **Audio**: mp3, wav
- **Images**: jpg, jpeg, png, gif, svg
- **Documents**: pdf, txt
- **Web**: html, css, js, json
- **Archives**: zip
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
2. The API route at `/api/files/[...path]` serves these files
3. URL rewrites in `vercel.json` map `/files/*` to the API route
4. The homepage displays all available files with shareable links

## License

MIT
