import { useEffect } from 'react';
import { Footer } from './components/landing/Footer';
import { Header } from './components/landing/Header';
import { useHashRoute } from './hooks/useHashRoute';
import { BillingReturnPage } from './pages/BillingReturnPage';
import { HomePage } from './pages/HomePage';
import { LegalNotice, PrivacyPolicy } from './pages/LegalPage';

const TITLES = {
  home: 'ProductText — Rédigez une fiche produit claire à partir de vos caractéristiques',
  'mentions-legales': 'Mentions légales — ProductText',
  confidentialite: 'Politique de confidentialité — ProductText',
  abonnement: 'Abonnement — ProductText',
} as const;

export default function App() {
  const route = useHashRoute();

  useEffect(() => {
    document.title = TITLES[route];
  }, [route]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenu"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('contenu')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-paper focus:shadow-lift"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" tabIndex={-1} className="flex-1 focus:outline-none">
        {route === 'home' && <HomePage />}
        {route === 'mentions-legales' && <LegalNotice />}
        {route === 'confidentialite' && <PrivacyPolicy />}
        {route === 'abonnement' && <BillingReturnPage />}
      </main>
      <Footer />
    </div>
  );
}
