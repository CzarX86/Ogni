import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Shield,
  Truck,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-24 bg-secondary text-secondary-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="leading-tight">
                <p className="font-serif text-2xl font-semibold text-foreground">
                  Ogni Atelier
                </p>
                <p className="text-[11px] uppercase tracking-[0.32em] text-primary/70">
                  Semi-jóias autorais
                </p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-secondary-foreground/80">
              Peças banhadas a ouro 18k, desenhadas em São Paulo e produzidas com
              banho antialérgico para acompanhar todas as suas celebrações.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-full border border-primary/30 text-secondary-foreground hover:bg-primary/10"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-full border border-primary/30 text-secondary-foreground hover:bg-primary/10"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-[0.32em] uppercase text-secondary-foreground/70">
              Descubra
            </h3>
            <div className="flex flex-col gap-3 text-sm text-secondary-foreground/80">
              <Link className="animated-underline" to="/catalog">
                Coleção Permanente
              </Link>
              <Link className="animated-underline" to="/catalog?tag=novidades">
                Lançamentos
              </Link>
              <Link className="animated-underline" to="/catalog?tag=best-sellers">
                Best sellers
              </Link>
              <Link className="animated-underline" to="/feed">
                Diário Atelier
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-[0.32em] uppercase text-secondary-foreground/70">
              Atendimento
            </h3>
            <div className="space-y-4 text-sm leading-relaxed text-secondary-foreground/80">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p>WhatsApp Concierge</p>
                  <p className="text-xs text-secondary-foreground/70">
                    (11) 99999-9999 · Seg a Sex 9h-18h
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p>E-mail</p>
                  <p className="text-xs text-secondary-foreground/70">
                    atelier@ogni.com.br
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p>Showroom</p>
                  <p className="text-xs text-secondary-foreground/70">
                    Jardins · São Paulo
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-[0.32em] uppercase text-secondary-foreground/70">
              Compromissos
            </h3>
            <div className="space-y-3 text-sm text-secondary-foreground/85">
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Garantia de banho 12 meses</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>Envio express em até 48h</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Pagamento em até 6x sem juros</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-16 rounded-3xl border border-primary/25 bg-white/90 px-6 py-10 text-foreground shadow-ogni lg:px-10">
          <div className="grid gap-6 md:grid-cols-[2fr,3fr] md:items-center">
            <div className="space-y-2">
              <h4 className="font-serif text-3xl font-semibold text-foreground">
                Lista privada Ogni
              </h4>
              <p className="text-sm text-foreground/70">
                Receba convites para lançamentos limitados, pré-venda e dicas de
                styling assinadas pela equipe de design.
              </p>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                className="h-12 flex-1 rounded-full border-border/70 bg-white/90 text-sm placeholder:text-foreground/50 focus:border-primary focus:ring-0"
              />
              <Button
                type="submit"
                className="h-12 rounded-full px-6 text-sm tracking-[0.14em]"
              >
                Quero fazer parte
              </Button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-primary/20 py-10 text-xs uppercase tracking-[0.28em] text-secondary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 Ogni. Todas as joias com banho 18k e garantia.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-secondary-foreground">
              Privacidade
            </Link>
            <Link to="/terms" className="hover:text-secondary-foreground">
              Termos
            </Link>
            <Link to="/support" className="hover:text-secondary-foreground">
              Suporte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
