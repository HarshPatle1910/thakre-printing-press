import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import ScrollToTop from '../common/ScrollToTop';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <ScrollToTop />
      <Header />
      <main className="public-main">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
