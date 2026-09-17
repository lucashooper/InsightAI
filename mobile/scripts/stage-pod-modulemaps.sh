#!/bin/bash
# Copy CocoaPods modulemaps into DerivedData before SwiftGeneratePch runs.
# Xcode 26 looks for ${PODS_CONFIGURATION_BUILD_DIR}/<Pod>/<Name>.modulemap
# before those pods have compiled, which surfaces as "No such module 'Expo'".
set -euo pipefail

if [[ -z "${PODS_ROOT:-}" || -z "${PODS_CONFIGURATION_BUILD_DIR:-}" ]]; then
  echo "stage-pod-modulemaps: PODS_ROOT or PODS_CONFIGURATION_BUILD_DIR unset; skipping"
  exit 0
fi

SUPPORT="${PODS_ROOT}/Target Support Files"
DEST="${PODS_CONFIGURATION_BUILD_DIR}"
mkdir -p "$DEST"

shopt -s nullglob
for dir in "$SUPPORT"/*/; do
  name="$(basename "$dir")"
  case "$name" in
    Pods-*) continue ;;
  esac
  maps=("$dir"*.modulemap)
  if (( ${#maps[@]} == 0 )); then
    continue
  fi
  mkdir -p "$DEST/$name"
  cp -f "$dir"* "$DEST/$name/" 2>/dev/null || true
  for map in "$DEST/$name"/*.modulemap; do
    [[ -f "$map" ]] || continue
    mod="$(awk '/^module / { print $2; exit }' "$map")"
    if [[ -n "$mod" && "$(basename "$map")" != "${mod}.modulemap" ]]; then
      cp -f "$map" "$DEST/$name/${mod}.modulemap"
    fi
  done
done
