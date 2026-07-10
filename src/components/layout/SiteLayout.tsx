import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import MarketTicker from './MarketTicker';
import ExitIntentModal from '@/components/ExitIntentModal';

export default function SiteLayout({ children, ticker = true }: { children: ReactNode; ticker?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {ticker && <MarketTicker />}
      <main className="flex-1">{children}</main>
      <Footer />
      <ExitIntentModal />
    </div>
  );
}
