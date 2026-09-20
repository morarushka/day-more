export type Mood = 'new' | 'cozy' | 'romance' | 'creative' | 'fun' | 'surprise' | 'adventure' | 'nostalgia';

export type SeasonTag = 'evergreen' | 'autumn' | 'halloween' | 'winter' | 'christmas' | 'new-year' | 'valentines' | 'spring' | 'summer';

export type CompanyTag = 'just-me' | 'together' | 'friends' | 'family' | 'with-dog' | 'any';

export type LocationTag = 'home' | 'out' | 'either';

export type BudgetLevel = 'free' | 'low' | 'medium' | 'any';

export type EnergyLevel = 'very-low' | 'normal' | 'high';

export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both';

export type TimeBudget = '15m' | '30-60m' | '2-3h' | 'evening' | 'half-day' | 'day';

/** Not shown to the user as a category — the generator infers it from time/energy/mood.
 * spark: 5-60 min, near-zero prep, "an ordinary day took a small turn".
 * plan: 1-5 hours, "we had a plan today".
 * memory: 5-20 min, capture/reflection so the moment doesn't just disappear. */
export type Tier = 'spark' | 'plan' | 'memory';

export interface Scenario {
  id: string;
  tier: Tier;
  title: string;
  shortDescription: string;
  instructions: string;
  categories: string[];
  moods: Mood[];
  season: SeasonTag[];
  company: CompanyTag[];
  location: LocationTag;
  durationMin: number;
  durationMax: number;
  budgetLevel: BudgetLevel;
  energyLevel: EnergyLevel;
  indoorOutdoor: IndoorOutdoor;
  noveltyScore: number;
  socialLevel: number;
  romanceLevel: number;
  shareabilityScore: number;
  safetyNotes?: string;
  collectionIds: string[];
  active: boolean;
  createdAt: string;
}

export type RejectionReason =
  | 'not-enough-time'
  | 'too-expensive'
  | 'dont-want-to-go-out'
  | 'too-much-energy'
  | 'not-my-thing'
  | 'already-done-similar';

export type EventKind = 'viewed' | 'accepted' | 'rejected' | 'saved' | 'completed';

export interface ScenarioEvent {
  id: string;
  scenarioId: string;
  kind: EventKind;
  rejectionReason?: RejectionReason;
  rating?: MomentRating;
  occurredAt: string;
}

export type MomentRating = 'loved' | 'nice' | 'not-for-me';

export interface Moment {
  id: string;
  scenarioId: string;
  scenarioTitleSnapshot: string;
  rating: MomentRating;
  photoRef: string | null;
  note: string | null;
  completedAt: string;
  tagsSnapshot: {
    categories: string[];
    noveltyScore: number;
    socialLevel: number;
    romanceLevel: number;
    location: LocationTag;
  };
}

export interface UserContextSelection {
  time: TimeBudget;
  company: CompanyTag;
  location: LocationTag;
  budget: BudgetLevel;
  energy: EnergyLevel;
  updatedAt: string;
}

export const DEFAULT_CONTEXT: UserContextSelection = {
  time: '30-60m',
  company: 'just-me',
  location: 'either',
  budget: 'any',
  energy: 'normal',
  updatedAt: new Date(0).toISOString(),
};
