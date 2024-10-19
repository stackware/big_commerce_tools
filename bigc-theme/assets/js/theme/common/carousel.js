import 'slick-carousel';
import BlazeSlider from 'blaze-slider';

export default function () {
    const $carousel = $('[data-slick]');
    if ($carousel.length) {
        const multipleSlides = $carousel[0].childElementCount > 1;
        $carousel.slick({ dots: multipleSlides });
    }

    document.querySelectorAll('[data-blaze-slider]').forEach((el) => {
        const bs = new BlazeSlider(el, $(el).data('blazeSlider')); // eslint-disable-line no-new
        $(el).data('blazeSliderInstance', bs);
        try {
            const slides = Array.from(bs.slides);

            const updateActiveSlides = (_pageIndex, firstVisibleSlideIndex, lastVisibleSlideIndex) => {
                slides.forEach((slide, i) => {
                    if (i >= firstVisibleSlideIndex && i <= lastVisibleSlideIndex) {
                        slide.classList.add('_active');
                    } else {
                        slide.classList.remove('_active');
                    }
                });
            };

            bs.onSlide(updateActiveSlides);
            updateActiveSlides(bs.stateIndex, ...bs.states[bs.stateIndex].page);

            for (const link of el.querySelectorAll('[data-href][role=button]')) {
                link.addEventListener('click', (e) => {
                    if (e.target.tagName === 'A') return;
                    window.location = link.dataset.href;
                });
            }
        } catch (e) {
            // error
        }
    });

    // Alternative image styling for IE, which doesn't support objectfit
    if (typeof document.documentElement.style.objectFit === 'undefined') {
        $('.heroCarousel-slide').each((index, element) => {
            const $container = $(element);
            const imgUrl = $container.find('img').data('lazy');

            if (imgUrl) {
                $container.css('backgroundImage', `url(${imgUrl})`).addClass('compat-object-fit');
            }
        });
    }
}
