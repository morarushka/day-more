import type { Context } from 'telegraf';
import { session } from 'telegraf';
import type { CompanyTag, LocationTag, BudgetLevel, EnergyLevel, Mood, MomentRating, UserContextSelection } from '../../src/types';

export type ContextStep = 'time' | 'company' | 'location' | 'budget' | 'energy';

export interface RollFlow {
  mood?: Mood;
  useContext: boolean;
  step?: ContextStep;
  draft: Partial<Omit<UserContextSelection, 'updatedAt'>>;
  poolIds?: string[];
}

export interface ResultFlow {
  scenarioId: string;
  poolIds?: string[];
  mood?: Mood;
  useContext: boolean;
}

export interface CompleteFlow {
  scenarioId: string;
  rating?: MomentRating;
  note?: string | null;
  awaiting?: 'note' | 'photo';
}

export interface SessionData {
  roll?: RollFlow;
  result?: ResultFlow;
  complete?: CompleteFlow;
}

export interface BotContext extends Context {
  session: SessionData;
}

export const sessionMiddleware = session({ defaultSession: (): SessionData => ({}) });

export const COMPANY_VALUES: CompanyTag[] = ['just-me', 'together', 'friends', 'family', 'with-dog'];
export const LOCATION_VALUES: LocationTag[] = ['home', 'out', 'either'];
export const BUDGET_VALUES: BudgetLevel[] = ['free', 'low', 'medium', 'any'];
export const ENERGY_VALUES: EnergyLevel[] = ['very-low', 'normal', 'high'];
