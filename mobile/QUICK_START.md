# InsightAI Mobile - Quick Start

## Preferred local workflow

Use a development build for simulator testing. This app relies on native modules and auth flows that are not reliable in Expo Go.

## iOS simulator

### 1. Install the dev client

```bash
cd /Users/lucas/Desktop/InsightAI/mobile
npm run ios
```

### 2. Start Metro in dev-client mode

```bash
npm run start
```

### 3. Open the simulator

```bash
npm run ios:dev
```

## Useful commands

```bash
# Preferred Metro mode
npm run start

# Clear Metro cache
npm run start:clear

# Expo Go, only for quick UI-only checks
npm run start:go

# Local iOS dev build
npm run ios

# Launch simulator with dev client
npm run ios:dev

# Web
npm run web
```

## Notes

- If simulator launches keep timing out, make sure you are using the dev-client path above instead of Expo Go.
- If the app on the simulator looks stale, delete it and rerun `npm run ios`.
- If Metro behaves oddly, rerun `npm run start:clear`.

## More detail

See `DEV_CLIENT_WORKFLOW.md` for the full recommended workflow and reasoning.
