/**
 * Quota d'extractions gratuites, vérifié côté serveur (pas seulement dans le navigateur).
 * Fenêtre glissante de 24 h par IP, en mémoire : suffisant pour une instance unique,
 * à remplacer par Redis si l'application tourne sur plusieurs instances.
 */
export interface FreeQuota {
  peek(key: string): number;
  consume(key: string): { allowed: boolean; remaining: number };
  refund(key: string): void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function createFreeQuota(limit: number, now: () => number = Date.now): FreeQuota {
  const uses = new Map<string, number[]>();

  const recent = (key: string): number[] => {
    const t = now();
    const list = (uses.get(key) ?? []).filter((ts) => t - ts < DAY_MS);
    if (list.length) uses.set(key, list);
    else uses.delete(key);
    return list;
  };

  const sweep = () => {
    if (uses.size < 20_000) return;
    for (const key of [...uses.keys()]) recent(key);
  };

  return {
    peek(key) {
      return Math.max(0, limit - recent(key).length);
    },
    consume(key) {
      sweep();
      const list = recent(key);
      if (list.length >= limit) return { allowed: false, remaining: 0 };
      list.push(now());
      uses.set(key, list);
      return { allowed: true, remaining: limit - list.length };
    },
    refund(key) {
      const list = uses.get(key);
      if (list?.length) list.pop();
    },
  };
}
