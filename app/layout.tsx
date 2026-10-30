import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DRRMS | Disaster Relief Resource Management System',
  description: 'DBMS Experiential Learning Level 3 Project - PES University Department of CSE. Mission-critical emergency logistics, relief camp management, and automated supply allocation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
