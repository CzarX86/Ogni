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
  Sparkles,
  UserCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase/config';

interface NavbarProps {
  cartItemCount?: number;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const navItems = [
  { href: '/', label: 'Coleções' },
  { href: '/catalog', label: 'Loja' },
  { href: '/feed', label: 'Stories' },
];

export const Navbar: React.FC<NavbarProps> = ({
  cartItemCount = 0,
  onSearch,
  searchQuery = '',
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [localSearchQuery, setLocalSearchQuery] =
    React.useState(searchQuery);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch?.(localSearchQuery);
  };

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    onSearch?.(value);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:gap-8">
        <Link
          to="/"
          className="flex items-center gap-3 transition-transform hover:scale-[1.01]"
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-primary/50 bg-white shadow-ogni">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="absolute inset-0 rounded-full border border-primary/20" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-2xl font-semibold text-gradient-ogni">
              Ogni
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-secondary/70">
              Semi-jóias
            </span>
          </div>
        </Link>

        <div className="hidden flex-1 items-center justify-end gap-10 lg:flex">
          <div className="flex items-center gap-6">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className="group relative text-sm font-medium tracking-[0.12em] text-foreground/70 transition-colors hover:text-foreground"
              >
                {label}
                <span className="absolute -bottom-2 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
            <Input
              type="search"
              value={localSearchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Buscar por peça, banho ou coleção"
              className="h-11 w-full rounded-full border-border/60 bg-white pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-0"
            />
          </form>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-transparent text-secondary hover:border-secondary/30 lg:flex"
            aria-label="Lista de desejos"
          >
            <Heart className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/cart')}
            className="relative h-11 w-11 items-center justify-center rounded-full border border-secondary/30 text-secondary hover:border-secondary/60"
            aria-label="Abrir carrinho"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartItemCount > 0 && (
              <Badge
                variant="default"
                className="absolute -right-1 -top-1 px-2 py-0 text-[10px]"
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="hidden items-center gap-2 rounded-full border border-transparent px-4 text-sm text-foreground/80 hover:border-secondary/30 hover:text-foreground lg:flex"
          >
            <Avatar className="h-8 w-8 border border-secondary/40">
              <AvatarImage src={user?.photoURL || ''} alt="Usuário" />
              <AvatarFallback className="bg-secondary/10 text-secondary">
                {user?.displayName?.charAt(0)?.toUpperCase() || 'OG'}
              </AvatarFallback>
            </Avatar>
            <span className="tracking-[0.12em]">
              {isAuthenticated ? user?.displayName || 'Usuário' : 'Entrar'}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="ml-1 flex h-11 w-11 items-center justify-center rounded-full border border-secondary/20 text-secondary hover:border-secondary/40 lg:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border/60 bg-background/98 px-4 pb-6 pt-4 shadow-ogni lg:hidden">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
            <Input
              type="search"
              value={localSearchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Buscar semi-jóias"
              className="h-11 w-full rounded-full border-border/60 bg-white pl-11 pr-4 text-sm focus:border-primary focus:ring-0"
            />
          </form>

          <div className="flex flex-col divide-y divide-border/60">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                onClick={closeMenu}
                className="flex items-center justify-between py-3 text-sm font-medium tracking-[0.16em] text-foreground/70 transition-colors hover:text-foreground"
              >
                {label}
                <span className="text-xs text-secondary/60">↗</span>
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                closeMenu();
                navigate('/cart');
              }}
              className="flex items-center justify-between py-3 text-sm font-medium tracking-[0.16em] text-foreground/70 transition-colors hover:text-foreground"
            >
              Carrinho
              {cartItemCount > 0 && (
                <Badge variant="default">{cartItemCount}</Badge>
              )}
            </button>
          </div>

                    <div className="mt-6 rounded-2xl border border-border/70 bg-white/70 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-secondary/40">
                <AvatarImage src={user?.photoURL || ''} alt="Usuário" />
                <AvatarFallback className="bg-secondary/10 text-secondary">
                  {user?.displayName?.charAt(0)?.toUpperCase() || 'OG'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isAuthenticated ? `Olá, ${user?.displayName || 'Usuário'}` : 'Bem-vinda à Ogni'}
                </p>
                <p className="text-xs tracking-[0.2em] text-secondary/70 uppercase">
                  {isAuthenticated ? 'Conta conectada' : 'Clube de vantagens exclusivo'}
                </p>
              </div>
            </div>
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="mt-4 w-full justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  closeMenu();
                  navigate('/auth');
                }}
                className="mt-4 w-full justify-center gap-2"
              >
                <UserCircle className="h-4 w-4" />
                Acessar conta
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
