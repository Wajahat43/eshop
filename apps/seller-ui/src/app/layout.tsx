import Provider from '../provider';
import './global.css';

export const metadata = {
  title: 'NextCart Seller',
  description: 'NextGen Ecommerce Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
