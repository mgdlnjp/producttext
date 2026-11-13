import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Eraser, Handshake, Loader2, ShoppingBag, Sparkles, Store, WandSparkles } from 'lucide-react';
import {
  CONDITIONS,
  CONDITION_LABELS,
  PLATFORMS,
  PLATFORM_LABELS,
  TONES,
  TONE_LABELS,
  type ProductInput,
} from '../../../shared/types';
import { EMPTY_INPUT, LIMITS, type FieldErrors } from '../../../shared/validation';
import { btn } from '../../lib/cn';
import { EXAMPLE_INPUT } from '../../lib/example';
import { Kbd } from '../ui';
import { OptionGroup } from './OptionGroup';
import { TextField } from './TextField';

interface ProductFormProps {
  onSubmit: (input: ProductInput) => Promise<boolean>;
  onFieldChange: (field: keyof ProductInput) => void;
  fieldErrors: FieldErrors;
  loading: boolean;
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="grid gap-4 border-t border-ink-100 px-5 py-6 first:border-t-0 sm:grid-cols-[2.5rem_1fr] sm:px-7">
      <div className="flex items-center gap-3 sm:block">
        <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-paper font-mono text-[11px] font-medium text-ink-600 ring-1 ring-ink-200">
          {String(n).padStart(2, '0')}
        </span>
        <p className="font-serif text-[17px] font-medium text-ink-950 sm:hidden">{title}</p>
      </div>
      <div className="space-y-5">
        <p className="hidden font-serif text-[17px] font-medium text-ink-950 sm:block">{title}</p>
        {children}
      </div>
    </div>
  );
}

export function ProductForm({ onSubmit, onFieldChange, fieldErrors, loading }: ProductFormProps) {
  const [values, setValues] = useState<ProductInput>(EMPTY_INPUT);

  const set = <K extends keyof ProductInput>(field: K) => (value: ProductInput[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    onFieldChange(field);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const valid = await onSubmit(values);
    if (!valid) {
      // Place le focus sur le premier champ en erreur.
      requestAnimationFrame(() => {
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
    }
  };

  // ⌘/Ctrl + Entrée : génère depuis n'importe quel champ.
  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !loading) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  };

  const isEmpty = Object.entries(values).every(([k, v]) => v === EMPTY_INPUT[k as keyof ProductInput]);

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      noValidate
      aria-describedby="form-intro"
      className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-200/80"
    >
      <div className="flex flex-col gap-3 border-b border-ink-100 bg-paper/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p id="form-intro" className="text-[13px] text-ink-600">
          Champs <span className="text-vermilion-600">*</span> obligatoires. Plus vous êtes précis, plus la fiche sera utile.
        </p>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={() => setValues(EXAMPLE_INPUT)} className={btn('ghost', 'sm', 'text-vermilion-700 hover:bg-vermilion-50 hover:text-vermilion-700')}>
            <WandSparkles aria-hidden="true" className="h-3.5 w-3.5" /> Remplir avec un exemple
          </button>
          <button type="button" onClick={() => setValues(EMPTY_INPUT)} disabled={isEmpty} className={btn('ghost', 'sm')}>
            <Eraser aria-hidden="true" className="h-3.5 w-3.5" /> Effacer
          </button>
        </div>
      </div>

      <Step n={1} title="Le produit">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Nom du produit"
            name="productName"
            required
            value={values.productName}
            onChange={set('productName')}
            maxLength={LIMITS.productName.max}
            placeholder="Ex. : Lampe de bureau articulée"
            error={fieldErrors.productName}
          />
          <TextField
            label="Catégorie"
            name="category"
            value={values.category}
            onChange={set('category')}
            maxLength={LIMITS.category.max}
            placeholder="Ex. : Luminaire, Vêtement, Jouet…"
            error={fieldErrors.category}
          />
        </div>
      </Step>

      <Step n={2} title="Ce que vous savez">
        <TextField
          label="Caractéristiques et dimensions"
          name="features"
          multiline
          rows={6}
          value={values.features}
          onChange={set('features')}
          maxLength={LIMITS.features.max}
          placeholder={'Une information par ligne, par exemple :\nMatière : coton bio\nTaille M\nLongueur 70 cm'}
          hint="Indiquez uniquement des faits : matière, mesures, couleur, contenu, compatibilité… Rien ne sera inventé."
          error={fieldErrors.features}
        />
        <OptionGroup legend="État du produit" name="condition" options={CONDITIONS} labels={CONDITION_LABELS} value={values.condition} onChange={set('condition')} />
      </Step>

      <Step n={3} title="Le contexte de publication">
        <TextField
          label="Public cible"
          name="audience"
          value={values.audience}
          onChange={set('audience')}
          maxLength={LIMITS.audience.max}
          placeholder="Ex. : parents de jeunes enfants, cyclistes urbains…"
          error={fieldErrors.audience}
        />
        <OptionGroup
          legend="Plateforme de publication"
          name="platform"
          options={PLATFORMS}
          labels={PLATFORM_LABELS}
          icons={{ ecommerce: ShoppingBag, marketplace: Store, particuliers: Handshake }}
          value={values.platform}
          onChange={set('platform')}
        />
        <OptionGroup legend="Ton" name="tone" options={TONES} labels={TONE_LABELS} value={values.tone} onChange={set('tone')} />
      </Step>

      <Step n={4} title="Le référencement">
        <TextField
          label="Mots-clés à intégrer"
          name="keywords"
          value={values.keywords}
          onChange={set('keywords')}
          maxLength={LIMITS.keywords.max}
          showCounter
          placeholder="Ex. : lampe de bureau, lampe vintage"
          hint={`Séparés par des virgules, ${LIMITS.keywords.maxCount} maximum. Ils seront intégrés naturellement, sans répétition.`}
          error={fieldErrors.keywords}
        />
      </Step>

      <div className="flex flex-col gap-3 border-t border-ink-100 bg-paper/50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="hidden items-center gap-1.5 text-[13px] text-ink-500 sm:flex">
          <Kbd>⌘</Kbd>
          <Kbd>Entrée</Kbd> pour générer
        </p>
        <button type="submit" disabled={loading} className={btn('primary', 'lg', 'w-full font-semibold sm:w-auto sm:px-8')}>
          {loading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Sparkles aria-hidden="true" className="h-4 w-4" />}
          {loading ? 'Génération en cours…' : 'Générer ma fiche'}
        </button>
      </div>
    </form>
  );
}
