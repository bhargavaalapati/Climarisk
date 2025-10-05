import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Header section with Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-14 flex items-center">
          <Navbar />
        </div>
      </header>

      {/* Main content area where our pages will be rendered */}
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;