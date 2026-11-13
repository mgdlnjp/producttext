import type { MouseEvent } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { btn } from '../../lib/cn';
import { Logo } from '../ui';

const NAV = [
  { href: '#usages', label: 'Usages' },
  { href: '#comment-ca-marche', label: 'Comment ça marche' },
  { href: '#faq', label: 'FAQ' },
];

/** Referme le menu mobile (<details>) après un clic sur un lien. */
function closeMenu(e: MouseEvent<HTMLElement>) {
  e.currentTarget.closest('details')?.removeAttribute('open');
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/60 bg-paper/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#/" className="rounded-lg" aria-label="ProductText — accueil">
          <Logo />
        </a>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-full px-3.5 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950">
              {n.label}
            </a>
          ))}
          <span aria-hidden="true" className="mx-2 h-5 w-px bg-ink-200" />
          <a href="#creer" className={btn('ink', 'sm', 'group/cta px-4')}>
            Créer ma fiche
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" />
          </a>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <a href="#creer" className={btn('ink', 'sm')}>
            Créer ma fiche
          </a>
          <details className="group relative">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-ink-700 ring-1 ring-ink-200 transition hover:bg-ink-100" aria-label="Menu">
              <Menu aria-hidden="true" className="h-[18px] w-[18px] group-open:hidden" />
              <X aria-hidden="true" className="hidden h-[18px] w-[18px] group-open:block" />
            </summary>
            <nav
              aria-label="Navigation mobile"
              className="animate-fade-up absolute top-[calc(100%+0.75rem)] right-0 w-[min(16rem,calc(100vw-2rem))] rounded-2xl bg-white p-2 shadow-lift ring-1 ring-ink-200"
            >
              <ul>
                {NAV.map((n) => (
                  <li key={n.href}>
                    <a href={n.href} onClick={closeMenu} className="flex rounded-xl px-3.5 py-3 text-[15px] text-ink-700 hover:bg-ink-50 hover:text-ink-950">
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
