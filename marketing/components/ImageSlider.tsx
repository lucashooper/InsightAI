import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImageSliderProps {
  images: string[];
  interval?: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, interval = 4000 }) => {
  return (
    <>
      <div className="image-slider-container">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          effect="slide"
          speed={700}
          autoplay={{
            delay: interval,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          navigation={{
            enabled: true,
            hideOnClick: false,
          }}
          pagination={{
            el: '.slider-dots',
            clickable: true,
            bulletClass: 'slider-dot',
            bulletActiveClass: 'active',
          }}
          loop={true}
          slidesPerView={1}
          spaceBetween={0}
          watchOverflow={false}
          allowTouchMove={true}
          simulateTouch={true}
          className="swiper-slider"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="slider-image"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Dot Indicators - Outside Container */}
      <div className="slider-dots"></div>
    </>
  );
};

export default ImageSlider;
