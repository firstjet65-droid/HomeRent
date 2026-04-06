import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const { dark } = useTheme();
  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'bg-surface-950 text-surface-100' : 'bg-surface-50 text-surface-900'}`}>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
