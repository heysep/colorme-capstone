import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DrValue BMES',
  description: 'BMES 프론트엔드',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
