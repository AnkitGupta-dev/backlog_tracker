import '@/app/global.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Backlog Tracker | Neo-Brutalist Academic OS',
  description: 'Track your engineering backlogs and degree progress with style.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#F4F1EA] text-black antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
