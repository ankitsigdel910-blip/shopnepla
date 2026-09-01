import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import electronicsBanner from '../assets/banners/electronics-deal.webp';
import fashionBanner from '../assets/banners/fashion-sale.webp';
import homeKitchenBanner from '../assets/banners/home-kitchen-deal.webp';
import beautyBanner from '../assets/banners/beauty-deal.webp';
import festivalBanner from '../assets/banners/dashain-tihar-sale.webp';

/* ============================================================
   TYPES
============================================================ */

interface Banner {
  id: number;
  image: string;
  alt: string;
  link: string;
}

/* ============================================================
   BANNERS
============================================================ */

const banners: Banner[] = [
  {
    id: 1,
    image:
      electronicsBanner,
    alt:
      'ShopNepal Electronics Deals',
    link:
      '/shop?category=electronics',
  },

  {
    id: 2,
    image:
      fashionBanner,
    alt:
      'ShopNepal Fashion Sale',
    link:
      '/shop?category=fashion',
  },

  {
    id: 3,
    image:
      homeKitchenBanner,
    alt:
      'ShopNepal Home and Kitchen Deals',
    link:
      '/shop',
  },

  {
    id: 4,
    image:
      beautyBanner,
    alt:
      'ShopNepal Beauty Deals',
    link:
      '/shop',
  },

  {
    id: 5,
    image:
      festivalBanner,
    alt:
      'ShopNepal Festival Mega Sale',
    link:
      '/shop?deals=true',
  },
];

/* ============================================================
   SLIDER
============================================================ */

const PromoBannerSlider =
  () => {
    const [
      currentIndex,
      setCurrentIndex,
    ] = useState(0);

    const [
      paused,
      setPaused,
    ] = useState(false);

    /* ========================================================
       NEXT / PREVIOUS
    ======================================================== */

    const nextSlide =
      useCallback(() => {
        setCurrentIndex(
          (current) =>
            (current + 1) %
            banners.length
        );
      }, []);

    const previousSlide =
      useCallback(() => {
        setCurrentIndex(
          (current) =>
            (current -
              1 +
              banners.length) %
            banners.length
        );
      }, []);

    /* ========================================================
       AUTOPLAY
    ======================================================== */

    useEffect(() => {
      if (
        paused ||
        banners.length <= 1
      ) {
        return;
      }

      const timer =
        window.setInterval(
          nextSlide,
          5000
        );

      return () => {
        window.clearInterval(
          timer
        );
      };
    }, [
      paused,
      nextSlide,
    ]);

    /* ========================================================
       KEYBOARD
    ======================================================== */

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLElement>
    ) => {
      if (
        event.key ===
        'ArrowLeft'
      ) {
        event.preventDefault();
        previousSlide();
      }

      if (
        event.key ===
        'ArrowRight'
      ) {
        event.preventDefault();
        nextSlide();
      }
    };

    /* ========================================================
       UI
    ======================================================== */

    return (
      <section
        className="group relative w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm dark:bg-zinc-900 sm:shadow-md"
        onMouseEnter={() =>
          setPaused(true)
        }
        onMouseLeave={() =>
          setPaused(false)
        }
        onFocus={() =>
          setPaused(true)
        }
        onBlur={(
          event
        ) => {
          if (
            !event.currentTarget.contains(
              event.relatedTarget as Node
            )
          ) {
            setPaused(false);
          }
        }}
        onKeyDown={
          handleKeyDown
        }
        aria-label="Promotional offers"
        aria-roledescription="carousel"
      >
        {/* =====================================================
            SLIDES
        ====================================================== */}

        <div
          className="flex transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{
            transform:
              `translateX(-${
                currentIndex *
                100
              }%)`,
          }}
        >
          {banners.map(
            (
              banner,
              index
            ) => (
              <Link
                key={
                  banner.id
                }
                to={
                  banner.link
                }
                className="relative block min-w-full bg-black/5 dark:bg-white/5"
                aria-hidden={
                  index !==
                  currentIndex
                }
                tabIndex={
                  index ===
                  currentIndex
                    ? 0
                    : -1
                }
              >
                <img
                  src={
                    banner.image
                  }
                  alt={
                    banner.alt
                  }
                  draggable={
                    false
                  }
                  loading={
                    index === 0
                      ? 'eager'
                      : 'lazy'
                  }
                  className="aspect-[3/1] w-full select-none object-contain sm:object-cover"
                />
              </Link>
            )
          )}
        </div>

        {/* =====================================================
            PREVIOUS / NEXT
        ====================================================== */}

        {banners.length >
          1 && (
          <>
            <button
              type="button"
              onClick={
                previousSlide
              }
              aria-label="Previous promotion"
              className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-red-600 sm:flex sm:opacity-0 sm:group-hover:opacity-100 md:left-4 md:h-11 md:w-11"
            >
              <ChevronLeft
                size={23}
              />
            </button>

            <button
              type="button"
              onClick={
                nextSlide
              }
              aria-label="Next promotion"
              className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-red-600 sm:flex sm:opacity-0 sm:group-hover:opacity-100 md:right-4 md:h-11 md:w-11"
            >
              <ChevronRight
                size={23}
              />
            </button>
          </>
        )}

        {/* =====================================================
            DOTS
        ====================================================== */}

        {banners.length >
          1 && (
          <div className="absolute bottom-1.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/20 px-2 py-1 backdrop-blur-[2px] sm:bottom-3 sm:gap-2">
            {banners.map(
              (
                banner,
                index
              ) => {
                const active =
                  index ===
                  currentIndex;

                return (
                  <button
                    key={
                      banner.id
                    }
                    type="button"
                    onClick={() =>
                      setCurrentIndex(
                        index
                      )
                    }
                    aria-label={`Go to promotion ${
                      index + 1
                    }`}
                    aria-current={
                      active
                        ? 'true'
                        : undefined
                    }
                    className={
                      active
                        ? 'h-1.5 w-5 rounded-full bg-red-600 transition-all sm:h-2 sm:w-7'
                        : 'h-1.5 w-1.5 rounded-full bg-white/90 transition-all hover:bg-white sm:h-2 sm:w-2'
                    }
                  />
                );
              }
            )}
          </div>
        )}

        {/* =====================================================
            COUNTER
        ====================================================== */}

        <div
          className="absolute right-3 top-3 hidden rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm sm:block"
          aria-live="polite"
        >
          {currentIndex + 1}/
          {banners.length}
        </div>
      </section>
    );
  };

export default PromoBannerSlider;