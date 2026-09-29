import { useEffect, useState } from 'react';
import type { Scenario } from '../types';

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);

  useEffect(() => {
    import('../data/scenarios.json').then((mod) => setScenarios(mod.default as Scenario[]));
  }, []);

  return scenarios;
}
