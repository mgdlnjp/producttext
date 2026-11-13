import { Logo } from '../ui';

export function Footer() {
  return (
    <footer className="border-t border-ink-200/70 bg-paper-2/60">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">
              Transformez les caractéristiques de votre produit en une annonce claire et convaincante. Sans compte, sans invention.
            </p>
          </div>
          <nav aria-label="Produit" className="text-sm">
            <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-ink-400 uppercase">Produit</p>
            <ul className="mt-4 space-y-2.5 text-ink-700">
              <li><a href="#creer" className="hover:text-ink-950">Créer une fiche</a></li>
              <li><a href="#usages" className="hover:text-ink-950">Usages</a></li>
              <li><a href="#comment-ca-marche" className="hover:text-ink-950">Comment ça marche</a></li>
              <li><a href="#faq" className="hover:text-ink-950">FAQ</a></li>
            </ul>
          </nav>
          <nav aria-label="Liens légaux" className="text-sm">
            <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-ink-400 uppercase">Informations</p>
            <ul className="mt-4 space-y-2.5 text-ink-700">
              <li><a href="#/mentions-legales" className="hover:text-ink-950">Mentions légales</a></li>
              <li><a href="#/confidentialite" className="hover:text-ink-950">Confidentialité</a></li>
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-ink-200/70 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ProductText</p>
          <p>Aide à la rédaction : relisez toujours vos fiches avant publication.</p>
        </div>
      </div>
    </footer>
  );
}
