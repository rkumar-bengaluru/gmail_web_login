// app/layout.tsx (updated)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers'; // Adjust path if needed

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Interview Platform',
  description: 'Professional Interview Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}