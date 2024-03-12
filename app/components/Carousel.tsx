"use client"

import React, { ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';


interface CarouselProps {
    children: ReactNode;
}

const CarouselComponent: React.FC<CarouselProps> = ({ children }) => {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);

    return (
        <div className="embla" ref={emblaRef}>
            <div className="embla__container flex flex-row">{children}</div>
        </div>
    );
};

export default CarouselComponent;