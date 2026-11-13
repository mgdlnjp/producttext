import { useEffect, useState } from 'react';

export type Route = 'home' | 'mentions-legales' | 'confidentialite' | 'abonnement';

function readRoute(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash === 'mentions-legales' || hash === 'confidentialite' || hash === 'abonnement') return hash;
  return 'home';
}

/** Routage minimal par hash : pas de dépendance, compatible hébergement statique. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute);
  useEffect(() => {
    const onChange = () => {
      const next = readRoute();
      setRoute(next);
      if (next !== 'home') {
        window.scrollTo(0, 0);
        return;
      }
      // Ancre de section (#faq, #creer…) : défile une fois la page d'accueil rendue.
      const anchor = window.location.hash.slice(1);
      if (anchor && !anchor.startsWith('/')) {
        requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView());
      }
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
