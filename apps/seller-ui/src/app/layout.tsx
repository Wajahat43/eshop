import Provider from '../provider';
import './global.css';
import { Poppins } from 'next/font/google';

export const metadata = {
  title: 'NextCart Seller',
  description: 'NextGen Ecommerce Platform',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-background font-sans antialiased ${poppins.variable}`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
