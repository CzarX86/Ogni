import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  ShoppingCart,
  Search,
  Menu,
  Heart,
  Store,
  Bell,
  UserCircle,
  ShoppingBag,
  Settings,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  cartItemCount?: number;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItemCount = 0,
  onSearch,
  searchQuery = ''
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);
  const [notifications] = React.useState(3); // Mock notifications count

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localSearchQuery);
    }
  };

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-blue-500/25">
              <Store className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Ogni
              </span>
              <span className="text-xs text-gray-500 -mt-1 font-medium">Compre com inteligência</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
              <Link
                to="/"
                className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-all duration-200 relative group rounded-lg hover:bg-primary/5"
              >
                Início
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </Link>
              <Link
                to="/catalog"
                className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-all duration-200 relative group rounded-lg hover:bg-primary/5"
              >
                Produtos
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </Link>
              <Link
                to="/feed"
                className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-all duration-200 relative group rounded-lg hover:bg-primary/5"
              >
                Feed
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-200" />
                <Input
                  type="text"
                  placeholder="Buscar produtos, marcas..."
                  value={localSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-12 pr-4 w-96 h-12 bg-gray-50/80 border-gray-200/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-full shadow-sm hover:shadow-md"
                />
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative group hover:bg-primary/5 transition-all duration-200 rounded-full"
            >
              <Bell className="h-5 w-5 text-gray-600 group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 border-0 animate-bounce"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="sm"
              className="relative group hover:bg-primary/5 transition-all duration-200 rounded-full"
            >
              <Heart className="h-5 w-5 text-gray-600 group-hover:text-red-500 group-hover:scale-110 transition-all duration-200" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cart')}
              className="relative group hover:bg-primary/5 transition-all duration-200 rounded-full"
            >
              <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 border-0 animate-pulse"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Badge>
              )}
            </Button>

            {/* User Account */}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 hover:bg-primary/5 transition-all duration-200 rounded-full px-3"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm">
                  JD
                </AvatarFallback>
              </Avatar>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-primary/5 transition-all duration-200 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100/50 py-6 animate-in slide-in-from-top duration-300 bg-white/95 backdrop-blur-lg">
            <div className="space-y-6">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={localSearchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-12 pr-4 w-full h-12 bg-gray-50/80 border-gray-200/50 rounded-full shadow-sm"
                  />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-1 px-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-primary hover:bg-primary/5 transition-all py-3 px-4 rounded-xl font-medium flex items-center space-x-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">🏠</span>
                  <span>Início</span>
                </Link>
                <Link
                  to="/catalog"
                  className="text-gray-700 hover:text-primary hover:bg-primary/5 transition-all py-3 px-4 rounded-xl font-medium flex items-center space-x-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">🛍️</span>
                  <span>Produtos</span>
                </Link>
                <Link
                  to="/feed"
                  className="text-gray-700 hover:text-primary hover:bg-primary/5 transition-all py-3 px-4 rounded-xl font-medium flex items-center space-x-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">📱</span>
                  <span>Feed</span>
                </Link>
                <Link
                  to="/cart"
                  className="text-gray-700 hover:text-primary hover:bg-primary/5 transition-all py-3 px-4 rounded-xl font-medium flex items-center space-x-3 relative"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">🛒</span>
                  <span>Carrinho</span>
                  {cartItemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500 border-0"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Link>
              </div>

              {/* Mobile User Actions */}
              <div className="border-t border-gray-100/50 pt-6 px-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">João Silva</p>
                    <p className="text-xs text-gray-500">cliente@exemplo.com</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
                    <UserCircle className="mr-3 h-4 w-4" />
                    Meu Perfil
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
                    <ShoppingBag className="mr-3 h-4 w-4" />
                    Meus Pedidos
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
                    <Heart className="mr-3 h-4 w-4" />
                    Favoritos
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
                    <Settings className="mr-3 h-4 w-4" />
                    Configurações
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-red-50 text-red-600">
                    <LogOut className="mr-3 h-4 w-4" />
                    Sair
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};