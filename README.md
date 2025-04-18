# Styled Font Exporter

Styled Font Exporter is a browser-based tool that lets you create styled text using any font—including custom fonts you upload—and export the result as an SVG or PNG file. It’s ideal for graphic designers, digital creators, and anyone working with print, cutting machines, or web assets.

## Live Site

Visit: [styledfontexporter.zahin.org](https://styledfontexporter.zahin.org)

## What It Does

- Enter and preview multiline text in real time
- Choose from preset fonts or upload your own (.OTF or .TTF)
- Adjust font size, weight, letter spacing, line height, alignment, and color
- Export your styled text as either a PNG or SVG

## Why It Exists

Most online tools don’t support uploading your own fonts. This tool was built to fill that gap—whether you're designing signage, social media assets, or exporting clean SVGs for Cricut or print workflows.

## Tech Stack

- Next.js (React framework)
- Tailwind CSS
- Google Fonts API (optional)
- Deployed on Vercel

## Getting Started

To run locally:

```bash
git clone https://github.com/yourusername/styled-font-exporter.git
cd styled-font-exporter
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Deployment

Deployed using Vercel. You can connect the repo and set up automatic deployment from the Vercel dashboard.

## Optional: Google Fonts API Key

If you want to use the Google Fonts API dynamically:

```
GOOGLE_FONTS_API_KEY=your_api_key_here
```

Otherwise, you can rely on a static font list or use uploaded fonts only.

## Author

Built by Zahin Mohammad  
More projects at [zahin.org](https://zahin.org)

## License

MIT
