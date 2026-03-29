# Dev Client Workflow

This app should be run on iOS with a development build, not Expo Go.

## Why

- The app uses native modules that Expo Go does not fully support.
- Auth flows are more reliable in a dev client.
- `expo start` in Expo Go mode is what led to the `simctl openurl ... timed out` behavior in the simulator logs.

## Recommended iOS simulator flow

### 1. Build or install the dev client once

Use one of these:

```bash
cd mobile
npm run ios
```

or, if you want an EAS simulator build:

```bash
cd mobile
npm run ios:build:dev
```

`eas.json` already has a `development` profile with:

- `developmentClient: true`
- `ios.simulator: true`

### 2. Start Metro in dev-client mode

```bash
cd mobile
npm run start
```

This now maps to:

```bash
expo start --dev-client
```

### 3. Open the simulator through the dev client

```bash
cd mobile
npm run ios:dev
```

If the simulator is already open and the dev client is installed, this is usually the cleanest way to reconnect Metro.

## Useful commands

```bash
# Dev-client Metro
npm run start

# Dev-client Metro with a clean cache
npm run start:clear

# Expo Go, only for quick UI checks
npm run start:go

# Local native iOS dev build
npm run ios

# Open iOS simulator with dev client
npm run ios:dev
```

## Practical notes

- Use Expo Go only for lightweight UI iteration.
- Use the dev client for auth, purchases, notifications, secure store, speech, and any simulator testing you care about.
- If Metro seems confused, stop it and rerun `npm run start:clear`.
- If the simulator still has an old build, delete the app from the simulator and rerun `npm run ios`.
