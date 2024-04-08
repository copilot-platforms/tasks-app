import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeRegistry from './ThemeRegistry';
import { DndWrapper } from '@/hoc/DndWrapper';
import { AppMargin } from '@/hoc/AppMargin';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Task App',
  description: 'A comprehensive task app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DndWrapper>
          <AppMargin>
            <ThemeRegistry options={{ key: 'mui' }}>{children}</ThemeRegistry>
          </AppMargin>
        </DndWrapper>
      </body>
    </html>
  );
}
