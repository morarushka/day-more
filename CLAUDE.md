# Маленькие планы (little-plans)

PWA на русском: подбирает небольшие «сценарии» для обычной жизни по настроению и контексту. Только фронтенд, без бэкенда — все данные пользователя хранятся локально в IndexedDB (`idb-keyval`).

- Репозиторий: `github.com/morarushka/day-more`
- Прод: https://morarushka.github.io/day-more/ (GitHub Pages)

## Стек и структура

- Vite 8 + React 19 + TypeScript 6, линтер — oxlint. Node — версия из `.nvmrc`.
- Роутера нет: экраны переключаются состоянием в `src/App.tsx`.
- `src/components/` — экраны и UI, `src/hooks/` — состояние, `src/lib/` — чистая логика (подбор сценария, коллекции, итоги года, share-карточки), `src/data/scenarios.json` — контент.
- `public/sw.js` — service worker (stale-while-revalidate), `public/manifest.webmanifest` — PWA-манифест.
- `bot/` — отдельный Telegram-бот (Node + telegraf + better-sqlite3) со своим `package.json`. **Не деплоится** на Pages. Его `tsconfig.json` подключает `../src/types.ts` и `../src/lib/*`, поэтому изменения там должны оставаться совместимыми с Node (без DOM), кроме `src/lib/shareCard.ts`.

## Команды

```sh
npm ci                # установка
npm run dev           # dev-сервер
npm run lint          # oxlint
npm run build         # tsc -b + vite build → dist/
BASE_PATH=/day-more/ npm run build && npm run preview   # как на GitHub Pages
cd bot && npm ci && npx tsc -p .                        # проверка типов бота
```

Перед пушем всегда прогоняй `npm run lint` и `npm run build` — это ровно то, что проверяет CI.

## GitHub Pages: обязательные правила

Сайт открывается из подпапки `/day-more/`, а не из корня домена.

- Никаких абсолютных путей `/…` к файлам из `public/` в TS/TSX. Используй `` `${import.meta.env.BASE_URL}file.ext` ``.
- В `index.html` пути `/favicon.svg` и т. п. допустимы — Vite сам добавляет `base` при сборке.
- В `public/manifest.webmanifest` пути только относительные (`./`, `favicon.svg`) — Vite этот файл не обрабатывает.
- При изменении стратегии кэширования в `public/sw.js` поднимай версию `CACHE` (`little-plans-vN`), иначе у пользователей останется старый кэш.
- `base` задаётся в `vite.config.ts` через переменную `BASE_PATH`; в CI её выставляет `actions/configure-pages`. Не хардкодь `/day-more/` в коде.

## Git и CI/CD

- `main` — всегда деплоибельная ветка. Каждый пуш в `main` → `.github/workflows/deploy.yml`: CI → сборка → публикация на Pages.
- Работа ведётся в ветках `feat/…`, `fix/…`, `chore/…`, `ci/…` и попадает в `main` через Pull Request.
- `.github/workflows/ci.yml` запускается на каждый PR и пуш в не-`main` ветки: lint + build фронта и typecheck бота. PR мёржится только при зелёном CI.
- Коммиты — в стиле Conventional Commits: `feat: …`, `fix: …`, `chore: …`, `ci: …`, `docs: …`. Описание можно на русском.
- Не пушить напрямую в `main`, не делать `--force` в общие ветки и не мёржить PR без явной просьбы пользователя.
- Секреты (`bot/.env`, токены) никогда не коммитить. Фронт не должен содержать секретов — всё, что попадает в `dist/`, публично.
- Dependabot раз в неделю открывает PR с обновлениями npm-зависимостей (фронт и бот) и раз в месяц — GitHub Actions.

## Агенты (`.claude/agents/`)

- `ci-checker` — локально повторяет проверки CI и разбирает ошибки.
- `pages-reviewer` — ревью диффа на проблемы GitHub Pages / PWA / совместимости с ботом.
- `pr-manager` — ветка → коммит → пуш → PR → ожидание CI.
- `deploy-monitor` — следит за деплоем на Pages и проверяет живой сайт.
