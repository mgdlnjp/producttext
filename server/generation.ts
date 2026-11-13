import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { buildSystemPrompt, buildUserPrompt } from '../shared/prompt';
import type { Listing, ProductInput } from '../shared/types';

/** Schéma de sortie imposé au modèle (structured outputs). */
const listingOutputSchema = z.object({
  title: z.string(),
  hook: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),
  keywords: z.array(z.string()),
  missingInfo: z.array(z.string()),
});

export interface ListingGenerator {
  generate(input: ProductInput, variant: number): Promise<Listing>;
}

/** Erreur dont le message peut être montré tel quel à l'utilisateur. */
export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

export interface AiGeneratorOptions {
  apiKey: string;
  model: string;
  effort: 'low' | 'medium' | 'high';
}

export function createAiGenerator({ apiKey, model, effort }: AiGeneratorOptions): ListingGenerator {
  const client = new Anthropic({ apiKey, timeout: 60_000, maxRetries: 1 });
  const system = buildSystemPrompt();

  return {
    async generate(input, variant) {
      let response;
      try {
        response = await client.beta.messages.parse({
          model,
          max_tokens: 16000,
          system,
          thinking: { type: 'adaptive' },
          output_config: { effort, format: betaZodOutputFormat(listingOutputSchema) },
          // Repli serveur automatique vers un autre modèle si la requête est déclinée.
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          messages: [{ role: 'user', content: buildUserPrompt(input, variant) }],
        });
      } catch (error) {
        throw toGenerationError(error);
      }

      if (response.stop_reason === 'refusal') {
        throw new GenerationError('La génération a été refusée pour ce contenu. Reformulez votre saisie.', 422);
      }
      if (response.stop_reason === 'max_tokens' || !response.parsed_output) {
        throw new GenerationError('La réponse générée est incomplète. Réessayez.', 502);
      }
      return response.parsed_output;
    },
  };
}

function toGenerationError(error: unknown): GenerationError {
  if (error instanceof Anthropic.RateLimitError) {
    return new GenerationError('Le service est très sollicité. Réessayez dans un instant.', 503);
  }
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    console.error('[generation] Clé API invalide ou non autorisée.');
    return new GenerationError('Le service de génération est mal configuré.', 500);
  }
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return new GenerationError('La génération a pris trop de temps. Réessayez.', 504);
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new GenerationError('Impossible de joindre le service de génération. Réessayez.', 502);
  }
  if (error instanceof Anthropic.APIError) {
    console.error(`[generation] Erreur API ${error.status ?? '?'}: ${error.message}`);
    return new GenerationError('Le service de génération a rencontré une erreur. Réessayez.', 502);
  }
  console.error('[generation] Erreur inattendue', error);
  return new GenerationError('Erreur inattendue pendant la génération.', 500);
}
