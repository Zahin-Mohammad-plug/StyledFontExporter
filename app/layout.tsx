import type { Metadata } from 'next'
import './globals.css'
import { url } from 'inspector';


export const metadata = {
  title: 'Styled Text to SVG | Upload Fonts and Export PNG or SVG',
  description:
    'Create and style custom text using any font, including your own uploaded fonts. Export as clean SVG or high-resolution PNG. Fast, browser-based, and free.',
  icons: {
    icon: [
      { url : '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  keywords: [
    'text to SVG',
    'upload font and convert to SVG',
    'text styling tool',
    'SVG text generator',
    'font to image',
    'convert text to PNG',
    'custom font export tool',
    'font preview to SVG',
  ],
  openGraph: {
    title: 'Styled Text to SVG',
    description:
      'Upload any font and design styled text with live preview. Export as SVG or PNG for printing, digital use, or cutting machines.',
    url: 'https://styledfontexporter.zahin.org',
    siteName: 'Styled Font Exporter',
    images: [
      {
        url: '/public/favicon.png', // Replace with a real OG image if possible
        width: 1200,
        height: 630,
        alt: 'Styled Font Exporter preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Styled Text to SVG',
    description:
      'Upload fonts, style text, and export as SVG or PNG. Built for designers and creators.',
    images: ['/favicon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


