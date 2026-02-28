import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="flex items-center">
        <div className="lg:hidden">
          <MobileNav />
        </div>
        <div className="flex-1">
          <Header />
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
