import React, { useState } from 'react';
import { thumbUrlFor, THUMB_WIDTH, THUMB_HEIGHT } from '@/lib/storage';

interface PhotoImgProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  /** Náhled má zlomek velikosti plné fotky — pro mřížky a karty. */
  thumb?: boolean;
  /** Hlavní fotka se načítá přednostně, ostatní až když se doscrollují. */
  priority?: boolean;
}

/**
 * Obrázek fotky nemovitosti.
 *
 * Náhled se odvozuje od adresy fotky. Starší fotky ho ještě nemají a fotky
 * z cizích serverů nikdy mít nebudou — proto se při chybě mlčky přepne na
 * plnou fotku. Bez toho by u starých nemovitostí zůstala prázdná dlaždice.
 */
export const PhotoImg: React.FC<PhotoImgProps> = ({ src, thumb = false, priority = false, ...rest }) => {
  const [fallback, setFallback] = useState(false);
  const useThumb = thumb && !fallback;

  return (
    <img
      src={useThumb ? thumbUrlFor(src) : src}
      onError={() => { if (useThumb) setFallback(true); }}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      {...(useThumb ? { width: THUMB_WIDTH, height: THUMB_HEIGHT } : {})}
      {...rest}
    />
  );
};
