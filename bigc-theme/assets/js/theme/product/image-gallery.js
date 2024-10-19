/* eslint-disable camelcase */
// ============================================================================
// PAPATHEMES SARAHMARKET CUSTOMIZATION:
// - Using slick carousel for image thumbnails.
// - Using baguetteBox for image lightbox.
// ============================================================================

import 'jquery-zoom';
import 'easyzoom';
import _ from 'lodash';
import 'slick-carousel';
import { loadStyle } from '../../chiara/utils'; // papathemes-chiara

let baguetteBox;
let PhotoSwipe;
let PhotoSwipeUI_Default;

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export default class ImageGallery {
    constructor($gallery, { assetsUrl = '' } = {}) { // papathemes-chiara: add assetsUrl
        this.$mainCarousel = $gallery.find('[data-image-gallery-main]');
        this.$navCarousel = $gallery.find('[data-image-gallery-nav]');
        this.$videoPlayer = $gallery.find('[data-video-player]');
        this.$videoPlayerIframe = this.$videoPlayer.find('iframe').clone();
        this.enableNavCarousel = this.$navCarousel.is('[data-image-gallery-nav-slides]');
        this.lightboxType = this.$mainCarousel.data('lightboxType');

        this.defaultSlideIndex = 0;

        this.$videoPlayer.find('iframe').remove();

        const uid = _.uniqueId();

        if (this.$mainCarousel.attr('id') === '') {
            this.$mainCarousel.attr('id', `imageGalleryMainCarousel${uid}`);
        }

        if (this.$navCarousel.attr('id') === '') {
            this.$navCarousel.attr('id', `imageGalleryNavCarousel${uid}`);
        }

        if (this.lightboxType === 'baguettebox') {
            import('baguettebox').then(module => {
                baguetteBox = module.default;
            });
        }

        if (this.lightboxType === 'photoswipe') {
            import('../../chiara/photoswipe').then(module => {
                PhotoSwipe = module.PhotoSwipe;
                PhotoSwipeUI_Default = module.PhotoSwipeUI_Default;
                loadStyle(`${assetsUrl}vendor/photoswipe/photoswipe.min.css`);
                loadStyle(`${assetsUrl}vendor/photoswipe/default-skin/default-skin.min.css`);
            });
        }
    }

    init() {
        this.bindEvents();
    }

    setMainImage(imgObj) {
        this.currentImage = _.clone(imgObj);

        this.swapMainImage();
    }

    setAlternateImage(imgObj) {
        if (!this.savedImage) {
            this.savedImage = _.clone(this.currentImage);
        }
        this.setMainImage(imgObj);
    }

    restoreImage() {
        if (this.savedImage) {
            this.setMainImage(this.savedImage);
            delete this.savedImage;
        }
    }

    // Chiara not use - keep or code merging easier only
    selectNewImage(e) {
        e.preventDefault();
        const $target = $(e.currentTarget);
        const imgObj = {
            mainImageUrl: $target.attr('data-image-gallery-new-image-url'),
            zoomImageUrl: $target.attr('data-image-gallery-zoom-image-url'),
            $selectedThumb: $target,
        };

        this.setMainImage(imgObj);
    }

    setActiveThumb() {
        const i = this.$mainCarousel.slick('slickCurrentSlide');
        this.$navCarousel
            .find('.slick-slide')
            .removeClass('slick-current')
            .eq(i)
            .addClass('slick-current');
    }

    swapMainImage() {
        try {
            this.$mainCarousel.slick('slickGoTo', this.defaultSlideIndex, true);
        } catch (e) {
            // ignore
        }

        const $slide = this.$mainCarousel.find('.slick-slide').eq(this.defaultSlideIndex);

        $slide.find('img').attr('src', this.currentImage.mainImageUrl);
        $slide.find('img').attr('srcset', this.currentImage.mainImageSrcset);
        $slide.find('a').attr('href', this.currentImage.zoomImageUrl);

        if (!iOS) {
            $slide.find('[data-zoom-image]')
                .trigger('zoom.destroy') // destroy image zoom
                .zoom({ url: this.currentImage.zoomImageUrl, touch: false }); // re-init image zoom
        }

        this.$navCarousel.find('.productView-imageCarousel-nav-item').eq(this.defaultSlideIndex).removeClass('slick-current');

        // empty lightbox contents of current galley so that it will be created again
        $('#baguetteBox-slider').html('');
        if (baguetteBox && this.lightboxType === 'baguettebox') {
            baguetteBox.run(`#${this.$mainCarousel.attr('id')}`); // init again
        }
    }

    // Chiara not use - keep or code merging easier only
    checkImage() {
        const containerHeight = $('.productView-image').height();
        const containerWidth = $('.productView-image').width();
        const height = this.easyzoom.data('easyZoom').$zoom.context.height;
        const width = this.easyzoom.data('easyZoom').$zoom.context.width;
        if (height < containerHeight || width < containerWidth) {
            this.easyzoom.data('easyZoom').hide();
        }
    }

    // Chiara not use - keep or code merging easier only
    setImageZoom() {
        this.easyzoom = this.$mainImage.easyZoom({
            onShow: () => this.checkImage(),
            errorNotice: '',
            loadingNotice: '',
        });
    }

    stopVideo() {
        this.$videoPlayer.find('iframe').remove();
        this.$videoPlayer.addClass('hide');
    }

    showVideo(src) {
        this.$videoPlayer.removeClass('hide');
        this.$videoPlayerIframe.clone().attr('src', src).appendTo(this.$videoPlayer.find('[data-video-player-container]'));
    }

    bindEvents() {
        this.$mainCarousel
            .on('init reInit', (event, slick) => {
                const $slide = this.$mainCarousel.find('.slick-slide').eq(this.defaultSlideIndex);
                this.currentImage = {
                    mainImageUrl: $slide.find('img').attr('src'),
                    mainImageSrcset: $slide.find('img').attr('srcset'),
                    zoomImageUrl: $slide.find('a').attr('href'),
                    $selectedThumb: null,
                };

                if (!iOS) {
                    slick.$slides.eq(slick.currentSlide).find('[data-zoom-image]').each((j, zoomEl) => {
                        $(zoomEl).zoom({ url: $(zoomEl).data('zoomImage'), touch: false });
                    });
                }
            })
            .slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: false,
                initialSlide: this.defaultSlideIndex,
                asNavFor: this.enableNavCarousel ? `#${this.$navCarousel.attr('id')}` : null,
                swipe: false,
                arrows: false,
                responsive: [
                    {
                        breakpoint: 800,
                        settings: {
                            swipe: true,
                        },
                    },
                ],
            })
            .on('afterChange', (event, slick) => {
                if (!iOS) {
                    slick.$slides.eq(slick.currentSlide).find('[data-zoom-image]').each((j, zoomEl) => {
                        if ($(zoomEl).find('.zoomImg').length === 0) {
                            $(zoomEl).zoom({ url: $(zoomEl).data('zoomImage'), touch: false });
                        }
                    });
                }
                this.setActiveThumb();
                this.stopVideo();
            });

        if (this.enableNavCarousel) {
            setTimeout(() => {
                this.$navCarousel.on('setPosition', () => {
                    try {
                        const slick = this.$navCarousel.slick('getSlick');
                        if (slick.options.slidesToShow >= slick.slideCount) {
                            this.$navCarousel.find('.slick-track').css('transform', 'none');
                        }
                    } catch (e) {
                        // ignore
                    }
                });

                if (this.$navCarousel.data('imageGalleryNavHorizontal')) {
                    this.$navCarousel
                        .slick({
                            slidesToShow: parseInt(this.$navCarousel.data('image-gallery-nav-slides'), 10),
                            slidesToScroll: 1,
                            infinite: false,
                            initialSlide: this.defaultSlideIndex,
                            asNavFor: `#${this.$mainCarousel.attr('id')}`,
                            arrows: true,
                            focusOnSelect: true,
                            centerPadding: 0,
                            adaptiveHeight: true,
                            // variableWidth: true,
                            responsive: [
                                {
                                    breakpoint: 550,
                                    settings: {
                                        arrows: false,
                                        slidesToShow: 4,
                                    },
                                },
                                {
                                    breakpoint: 800,
                                    settings: {
                                        arrows: false,
                                        slidesToShow: 6,
                                    },
                                },
                            ],
                        });
                } else {
                    this.$navCarousel
                        .slick({
                            slidesToShow: parseInt(this.$navCarousel.data('image-gallery-nav-slides'), 10),
                            slidesToScroll: 1,
                            infinite: false,
                            initialSlide: this.defaultSlideIndex,
                            asNavFor: `#${this.$mainCarousel.attr('id')}`,
                            arrows: true,
                            vertical: true,
                            verticalSwiping: true,
                            focusOnSelect: true,
                            centerPadding: 0,
                            adaptiveHeight: true,
                            responsive: [
                                {
                                    breakpoint: 550,
                                    settings: {
                                        vertical: false,
                                        verticalSwiping: false,
                                        // slidesToShow: 1,
                                        arrows: false,
                                        slidesToShow: 4,
                                        // variableWidth: true,
                                    },
                                },
                            ],
                        });
                }
            }, 200);
        }

        if (!this.enableNavCarousel) {
            this.$navCarousel.find('.productView-imageCarousel-nav-item button').on('click', event => {
                const i = $(event.target).closest('.productView-imageCarousel-nav-item').index();
                this.$mainCarousel.slick('slickGoTo', i);
            });
        }

        this.$navCarousel.find('.productView-imageCarousel-nav-item').eq(this.defaultSlideIndex).on('click', () => {
            this.restoreImage();
        });

        if (baguetteBox && this.lightboxType === 'baguettebox') {
            baguetteBox.run(`#${this.$mainCarousel.attr('id')}`);
        }

        if (this.lightboxType === 'photoswipe') {
            this.$mainCarousel.find('.productView-imageCarousel-main-item a').not('[data-video-id]')
                .off('click')
                .on('click', event => {
                    event.preventDefault();
                    if (PhotoSwipe) {
                        const items = this.$mainCarousel.find('.productView-imageCarousel-main-item').get()
                            .map(el => $(el).find('a'))
                            .map($a => ($a.data('videoId') ? {
                                html: `<div class="pswp__iframe-wrapper"><iframe data-video-player type="text/html" width="815" height="496" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen src="" data-src="${$a.attr('href').replace('autoplay=1', '')}"></iframe></div>`,
                            } : {
                                src: $a.attr('href'),
                                w: ($a.data('sizes') ? $a.data('sizes').split('x')[0] : 1280),
                                h: ($a.data('sizes') ? $a.data('sizes').split('x')[1] : 1280),
                            }));

                        const index = $(event.target).closest('[data-slick-index]').data('slickIndex');
                        const gallery = new PhotoSwipe($('.pswp').get(0), PhotoSwipeUI_Default, items, { index, history: false });

                        gallery.listen('afterChange', () => {
                            $('iframe', gallery.container).attr('src', '');

                            const $curIframe = $('iframe', gallery.currItem.container);
                            $curIframe.attr('src', $curIframe.data('src'));
                        });
                        gallery.init();
                    }
                });
        }

        const onVideoClick = (event) => {
            event.preventDefault();
            this.showVideo($(event.currentTarget).prop('href'));
        };
        this.$mainCarousel.on('click', '[data-video-id]', onVideoClick);
    }
}
