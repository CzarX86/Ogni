import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  cartItemCount?: number;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  cartItemCount = 0,
  onSearch,
  searchQuery = ''
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        cartItemCount={cartItemCount}
        onSearch={onSearch}
        searchQuery={searchQuery}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};