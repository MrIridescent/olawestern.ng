'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { PropsWithChildren } from 'react';

export function EmblaCarousel({ children }: PropsWithChildren) {
  const [emblaRef] = useEmblaCarousel({ loop: true });

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">
        {children}
      </div>
    </div>
  );
}