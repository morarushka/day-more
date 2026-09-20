import type { Scenario } from '../types';
import { formatBudget, formatCompany, formatDuration, formatLocation } from '../lib/options';

interface Props {
  scenario: Scenario;
  eyebrow: string;
}

export function ScenarioCard({ scenario, eyebrow }: Props) {
  return (
    <div className="scenario-card">
      <p className="scenario-card__eyebrow">{eyebrow}</p>
      <h1 className="scenario-card__title">{scenario.title}</h1>
      <p className="scenario-card__instructions">{scenario.instructions}</p>
      <div className="meta-row">
        <span className="meta-tag">{formatDuration(scenario.durationMin, scenario.durationMax)}</span>
        <span className="meta-tag">{formatBudget(scenario.budgetLevel)}</span>
        <span className="meta-tag">{formatCompany(scenario.company)}</span>
        <span className="meta-tag">{formatLocation(scenario.location)}</span>
      </div>
    </div>
  );
}
