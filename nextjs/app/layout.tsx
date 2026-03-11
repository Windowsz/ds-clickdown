import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClickDown — Project Management',
  description: 'A ClickUp-style project management app built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
