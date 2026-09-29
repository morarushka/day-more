# Little Plans — Telegram bot

Same scenario-picker as the web app, as a Telegram bot. Shares `src/types.ts`,
`src/lib/*` and `src/data/scenarios.json` with the web app by importing them
directly — there's one source of truth for scenario selection logic and data.

Per-user state (events, moments, saved scenarios, context, onboarding flag)
lives in a local SQLite file at `bot/data/bot.sqlite`, keyed by Telegram user
id. Photos aren't re-uploaded anywhere — the bot just keeps the Telegram
`file_id` and re-sends it on request.

## Setup

```bash
cd bot
npm install
cp .env.example .env   # fill in BOT_TOKEN from @BotFather
npm run dev            # or `npm start` for a one-off run without watch mode
```

## What it does

- `/start` — onboarding (first time only) + main menu. `/start <collectionId>`
  (a Telegram deep link, `t.me/<bot>?start=<collectionId>`) opens that
  collection directly instead of the main menu — the same mechanism a
  "share this collection" action in the web app would point at.
- `/now` or ⚡ Прямо сейчас — the fastest path to a plan: asks only "Сколько
  времени?" and rolls immediately using the rest of the saved context
  (company/location/budget/energy), instead of the full 5-question flow.
- 🎯 Подобрать сценарий — pick a mood, answer the same context questions as
  the web app's context sheet (time / company / location / budget / energy),
  get a weighted scenario pick
- 🎲 Сюрприз — random pick ignoring mood/context
- Accept / save / "not today" (with reason) on the result card, same as
  `ScenarioResultView`
- Mark an accepted plan done → rate it → optional note → optional photo →
  saved as a Moment
- 📚 Коллекции — browse collections, see progress, "pick for me" within one
  - 📸 Мои моменты — recent moments with rating, date and note
- ⚙️ Настройки — reset all data, replay onboarding text

## Notes

- Conversation flow state (which step of the context Q&A you're on, etc.) is
  kept in an in-memory Telegraf session — it resets if the bot restarts
  mid-flow, but persisted app data (events/moments/saved) never does.
- `bot/data/` and `bot/.env` are gitignored.
- `src/lib/shareCard.ts` (the web app's Stories-card canvas renderer) is
  DOM-only and deliberately excluded from the bot's `tsconfig.json` — the bot
  shares the content/selection/type modules with the web app, not the
  browser-rendering ones.
