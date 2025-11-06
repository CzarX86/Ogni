import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  Headphones
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-ogni rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gradient-ogni bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Ogni</span>
                <p className="text-xs text-gray-400">Compre com inteligência</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Sua loja online completa com os melhores produtos, preços acessíveis e atendimento personalizado.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Links Rápidos</h3>
            <div className="space-y-3">
              <Link to="/" className="block text-gray-300 hover:text-white transition-colors text-sm group">
                <span className="animated-underline">Início</span>
              </Link>
              <Link to="/catalog" className="block text-gray-300 hover:text-white transition-colors text-sm group">
                <span className="animated-underline">Produtos</span>
              </Link>
              <Link to="/feed" className="block text-gray-300 hover:text-white transition-colors text-sm group">
                <span className="animated-underline">Feed</span>
              </Link>
              <Link to="/cart" className="block text-gray-300 hover:text-white transition-colors text-sm group">
                <span className="animated-underline">Carrinho</span>
              </Link>
              <Link to="/checkout" className="block text-gray-300 hover:text-white transition-colors text-sm group">
                <span className="animated-underline">Checkout</span>
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Atendimento</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-sm text-gray-300 group hover:text-white transition-colors">
                <Phone className="h-5 w-5 mt-0.5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium">Telefone</p>
                  <p>(11) 9999-9999</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm text-gray-300 group hover:text-white transition-colors">
                <Mail className="h-5 w-5 mt-0.5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium">Email</p>
                  <p>contato@ogni.com.br</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm text-gray-300 group hover:text-white transition-colors">
                <MapPin className="h-5 w-5 mt-0.5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium">Localização</p>
                  <p>São Paulo, SP</p>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                Atendimento: Seg-Sex 9h-18h
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Diferenciais</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-sm">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <div className="text-gray-300">
                  <p className="font-medium text-white">Frete Grátis</p>
                  <p className="text-xs">Acima de R$ 99</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-green-400" />
                </div>
                <div className="text-gray-300">
                  <p className="font-medium text-white">Compra Segura</p>
                  <p className="text-xs">SSL & Criptografia</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Headphones className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-gray-300">
                  <p className="font-medium text-white">Suporte 24/7</p>
                  <p className="text-xs">Sempre disponível</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="text-gray-300">
                  <p className="font-medium text-white">Parcelamento</p>
                  <p className="text-xs">Até 12x sem juros</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 pt-12 border-t border-gray-700">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Fique por dentro das novidades</h3>
            <p className="text-gray-300 mb-6">
              Receba ofertas exclusivas, lançamentos e promoções especiais por email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Seu melhor email"
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 h-12 rounded-xl"
              />
              <Button className="bg-gradient-ogni hover:opacity-90 text-white px-8 h-12 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all">
                Assinar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-gray-700 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Ogni. Todos os direitos reservados. Desenvolvido com 💙
            </p>
            <div className="flex space-x-8 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacidade
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Termos
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};