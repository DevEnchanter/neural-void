import type { Metadata, Viewport } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Neural Void | Interactive 3D Neural Network by Min Tun',
  description:
    'Step into a living cyber-noir AI brain. An interactive 3D neural network explorer built with Next.js, Three.js, and custom GLSL shaders.',
  openGraph: {
    title: 'Neural Void | Interactive 3D Neural Network by Min Tun',
    description:
      'Step into a living cyber-noir AI brain. An interactive 3D neural network explorer built with Next.js, Three.js, and custom GLSL shaders.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  other: {
    'theme-color': '#000000',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistMono.variable} font-mono bg-black text-white overflow-hidden antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
