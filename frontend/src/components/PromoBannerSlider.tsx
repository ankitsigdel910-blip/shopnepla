import {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import electronicsBanner from '../assets/banners/electronics-deal.webp';
import fashionBanner from '../assets/banners/fashion-sale.webp';
import homeKitchenBanner from '../assets/banners/home-kitchen-deal.webp';
import beautyBanner from '../assets/banners/beauty-deal.webp';
import festivalBanner from '../assets/banners/dashain-tihar-sale.webp';

interface Banner {
  id: number;
  image: string;
  alt: string;
  link: string;
}

const banners: Banner[] = [
  {
    id: 1,
    image: electronicsBanner,
    alt: 'ShopNepal Electronics Deals',
    link: '/shop?category=electronics',
  },
  {
    id: 2,
    image: fashionBanner,
    alt: 'ShopNepal Fashion Sale',
    link: '/shop?category=fashion',
  },
  {
    id: 3,
    image: homeKitchenBanner,
    alt: 'ShopNepal Home and Kitchen Deals',
    link: '/shop',
  },
  {
    id: 4,
    image: beautyBanner,
    alt: 'ShopNepal Beauty Deals',
    link: '/shop',
  },
  {
    id: 5,
    image: festivalBanner,
    alt: 'ShopNepal Festival Mega Sale',
    link: '/shop?deals=true',
  },
];

const PromoBannerSlider = () => {
  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    paused,
    setPaused,
  ] = useState(false);

  const nextSlide = () => {
    setCurrentIndex(
      (current) =>
        (current + 1) %
        banners.length
    );
  };

  const previousSlide = () => {
    setCurrentIndex(
      (current) =>
        (current -
          1 +
          banners.length) %
        banners.length
    );
  };

  useEffect(() => {
    if (paused) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setCurrentIndex(
          (current) =>
            (current + 1) %
            banners.length
        );
      }, 5000);

    return () =>
      window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 shadow-md group"
      onMouseEnter={() =>
        setPaused(true)
      }
      onMouseLeave={() =>
        setPaused(false)
      }
      aria-label="Promotional offers"
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {banners.map(
          (banner) => (
            <Link
              key={banner.id}
              to={banner.link}
              className="relative min-w-full block"
            >
              <picture>
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full aspect-[3/1] object-cover"
                  draggable={false}
                />
              </picture>
            </Link>
          )
        )}
      </div>

      {/* Previous */}
      <button
        type="button"
        onClick={previousSlide}
        aria-label="Previous promotion"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/35 hover:bg-red-600 text-white backdrop-blur-sm flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10"
      >
        <ChevronLeft
          size={24}
        />
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next promotion"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/35 hover:bg-red-600 text-white backdrop-blur-sm flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10"
      >
        <ChevronRight
          size={24}
        />
      </button>

      {/* Navigation dots */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-2 sm:bottom-4 flex items-center gap-2 z-10">
        {banners.map(
          (banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() =>
                setCurrentIndex(
                  index
                )
              }
              aria-label={`Go to promotion ${index + 1}`}
              className={`rounded-full transition-all duration-300 ${
                index ===
                currentIndex
                  ? 'w-7 h-2 bg-red-600'
                  : 'w-2 h-2 bg-white/80 hover:bg-white'
              }`}
            />
          )
        )}
      </div>

      {/* Counter */}
      <div className="hidden sm:block absolute top-3 right-3 bg-black/45 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
        {currentIndex + 1}/
        {banners.length}
      </div>
    </section>
  );
};

export default PromoBannerSlider;