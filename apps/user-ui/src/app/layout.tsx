import Header from '../shared/widgets/header';
import './global.css';
import { DarkModeToggle } from '../components/ui/DarkModeToggle';
import { Poppins, Roboto } from 'next/font/google';
import Providers from './Providers';
import { ThemeScript } from './theme-script';

export const metadata = {
  title: 'NextCart',
  description: 'NextGen Ecommerce Platform',
};

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-background text-foreground font-sans antialiased ${roboto.variable} ${poppins.variable}`}
      >
        <ThemeScript />
        <Providers>
          <Header />
          {children}
          <DarkModeToggle />
        </Providers>
      </body>
    </html>
  );
}
