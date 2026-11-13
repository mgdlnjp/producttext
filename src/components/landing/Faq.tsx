import { Plus } from 'lucide-react';
import { SectionHeading } from '../ui';

const FAQ_ITEMS = [
  {
    question: 'Faut-il créer un compte ?',
    answer: 'Non. Vous pouvez générer une fiche complète sans inscription et sans laisser d’adresse e-mail.',
  },
  {
    question: 'ProductText peut-il inventer des caractéristiques ?',
    answer:
      'Il est conçu pour ne pas le faire : il s’appuie uniquement sur les informations que vous saisissez. Si un élément utile manque (dimensions, matière…), il vous le signale au lieu de le supposer. Des contrôles automatiques signalent aussi les formulations à vérifier. Relisez toujours la fiche avant publication.',
  },
  {
    question: 'Est-ce que cela garantit plus de ventes ?',
    answer:
      'Non. Une fiche claire aide les acheteurs à comprendre votre produit, mais aucun outil ne peut garantir un résultat de vente.',
  },
  {
    question: 'Que signifie « mode démonstration » ?',
    answer:
      'Lorsque aucune IA n’est connectée au service, la fiche est assemblée à partir de gabarits simples et de vos informations. Le mode utilisé est toujours indiqué à côté du résultat.',
  },
  {
    question: 'Mes données sont-elles conservées ?',
    answer:
      'ProductText ne crée pas de compte et ne stocke pas vos fiches dans une base de données. En mode IA, votre saisie est transmise au fournisseur d’IA le temps de la génération. Évitez d’y inclure des données personnelles. Voir la politique de confidentialité.',
  },
  {
    question: 'Puis-je modifier le texte généré ?',
    answer:
      'Oui, c’est même recommandé. Chaque bloc (titre, accroche, description, points forts, mots-clés) se copie séparément pour être adapté facilement.',
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-titre" className="scroll-mt-16 border-t border-ink-200/70 bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id="faq-titre" eyebrow="FAQ" title="Questions fréquentes" intro="Tout ce qu’il faut savoir avant de rédiger votre première fiche." />
        </div>
        <div className="divide-y divide-ink-200/80 border-y border-ink-200/80">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left">
                <h3 className="text-[17px] font-medium tracking-tight text-ink-950 transition-colors group-hover:text-ink-700">{item.question}</h3>
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-700 transition-all duration-200 group-open:rotate-45 group-open:bg-vermilion-500 group-open:text-white"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </summary>
              <p className="-mt-1 max-w-2xl pb-6 text-[15px] leading-relaxed text-ink-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
