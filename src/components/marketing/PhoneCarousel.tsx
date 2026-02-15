import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhoneCarouselProps {
  images: string[];
}

const PhoneCarousel: React.FC<PhoneCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="phone-carousel-container">
      {/* Main Phone Display */}
      <div className="phone-carousel-wrapper">
        {/* Navigation Arrows */}
        <button 
          className="carousel-arrow carousel-arrow-left" 
          onClick={goToPrevious}
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Phone Image (already has frame) */}
        <img 
          src={images[currentIndex]} 
          alt={`Phone screenshot ${currentIndex + 1}`}
          className="phone-screenshot-direct"
        />

        <button 
          className="carousel-arrow carousel-arrow-right" 
          onClick={goToNext}
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dots Navigation */}
      <div className="carousel-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PhoneCarousel;
