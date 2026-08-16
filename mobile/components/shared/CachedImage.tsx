import React from 'react';
import { Image, ImageProps } from 'expo-image';

type Props = Omit<ImageProps, 'cachePolicy' | 'transition'> & {
  recyclingKey?: string;
};

/** Preloaded raster — zero fade, disk+memory cache. */
export default function CachedImage({ recyclingKey, ...props }: Props) {
  return (
    <Image
      {...props}
      cachePolicy="memory-disk"
      transition={0}
      recyclingKey={recyclingKey}
    />
  );
}
