import { Asset } from 'expo-asset';
import { Image as ExpoImage } from 'expo-image';
import { Image as RNImage } from 'react-native';
import { ALL_PRELOAD_IMAGES, ALL_PRELOAD_LOTTIES } from '../constants/appAssets';

type ImageSource = number | { uri?: string };

function sourceUri(source: ImageSource): string | null {
  if (typeof source === 'number') return null;
  return source.uri ?? null;
}

async function prefetchImageModule(source: ImageSource, label: string): Promise<void> {
  if (typeof source === 'number') {
    const asset = Asset.fromModule(source);
    if (!asset.downloaded) {
      await asset.downloadAsync();
    }
    const uri = asset.localUri ?? asset.uri;

    await Promise.all([
      ExpoImage.loadAsync(source).catch(() => undefined),
      uri ? ExpoImage.prefetch(uri) : Promise.resolve(),
      uri ? RNImage.prefetch(uri).catch(() => undefined) : Promise.resolve(),
    ]);
    return;
  }

  const uri = sourceUri(source);
  if (!uri) {
    console.warn(`[PRELOAD] Skipping invalid image source: ${label}`);
    return;
  }

  await Promise.all([
    ExpoImage.prefetch(uri).catch(() => undefined),
    RNImage.prefetch(uri).catch(() => undefined),
  ]);
}

async function downloadLottieModule(moduleId: number, label: string): Promise<void> {
  if (typeof moduleId !== 'number') {
    console.warn(`[PRELOAD] Skipping invalid lottie source: ${label}`);
    return;
  }

  const asset = Asset.fromModule(moduleId);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }
}

function dedupeSources<T>(sources: readonly T[]): T[] {
  return [...new Set(sources)];
}

/** Block boot until every raster + lottie asset is on disk and images are decoded. */
export async function preloadAllAppAssets(): Promise<void> {
  const uniqueImages = dedupeSources(ALL_PRELOAD_IMAGES);
  const uniqueLotties = dedupeSources(ALL_PRELOAD_LOTTIES);

  const imageJobs = uniqueImages.map((source, index) =>
    prefetchImageModule(source as ImageSource, `image-${index}`).catch((error) => {
      console.warn(`[PRELOAD] Image failed (index ${index}):`, error);
    }),
  );

  const lottieJobs = uniqueLotties.map((source, index) =>
    downloadLottieModule(source as number, `lottie-${index}`).catch((error) => {
      console.warn(`[PRELOAD] Lottie failed (index ${index}):`, error);
    }),
  );

  await Promise.all([...imageJobs, ...lottieJobs]);
  console.log('[PRELOAD] ✅ Asset warmup complete');
}

/** @deprecated Use preloadAllAppAssets */
export const preloadCriticalVisualAssets = preloadAllAppAssets;
