import { Recycle, ShoppingBag, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from '../ui';

const USE_CASES: { icon: LucideIcon; title: string; text: string; tag: string }[] = [
  {
    icon: Tag,
    tag: 'Catalogue',
    title: 'Fiche produit',
    text: 'Un titre lisible, une accroche et des points forts structurés pour présenter un article de votre catalogue.',
  },
  {
    icon: ShoppingBag,
    tag: 'E-commerce',
    title: 'Description e-commerce',
    text: 'Des bénéfices formulés à partir des caractéristiques que vous donnez, avec vos mots-clés intégrés naturellement.',
  },
  {
    icon: Recycle,
    tag: 'Seconde main',
    title: 'Annonce de seconde main',
    text: 'Une annonce transparente qui respecte l’état réel de l’objet et met en avant les informations pratiques.',
  },
];

export function UseCases() {
  return (
    <section id="usages" aria-labelledby="cas-usage" className="scroll-mt-16 border-y border-ink-200/70 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="cas-usage" eyebrow="Usages" title="Pour quels usages ?" intro="Une boutique, une marketplace ou un vide-grenier en ligne : la fiche s’adapte au contexte que vous choisissez." />
        <ul className="mt-14 grid gap-4 md:grid-cols-3">
          {USE_CASES.map(({ icon: Icon, title, text, tag }, i) => (
            <li
              key={title}
              className="reveal group relative flex flex-col rounded-2xl bg-paper p-7 ring-1 ring-ink-200/80 transition-[box-shadow,transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-ink-800 ring-1 ring-ink-200 transition-colors group-hover:bg-vermilion-500 group-hover:text-white group-hover:ring-vermilion-500">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="font-mono text-[11px] text-ink-400">
                  0{i + 1} · {tag}
                </span>
              </div>
              <h3 className="mt-10 font-serif text-[22px] font-medium tracking-tight text-ink-950">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
