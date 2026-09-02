import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://kosovalabs.com'),
  title: 'Kosova Labs — The Product Company for Modern Healthcare',
  description: 'Products, platforms, and intelligent systems for modern healthcare.',
  openGraph: {
    title: 'The product company for modern healthcare.',
    description: 'Built by operators, trusted by healthcare teams, and engineered for scale.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The product company for modern healthcare.',
    description: 'Built by operators, trusted by healthcare teams, and engineered for scale.',
    images: ['/og.png'],
  },
};
export const viewport: Viewport = {themeColor: '#07080a', colorScheme: 'dark'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
