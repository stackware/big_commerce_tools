import mediaQueryListFactory from '../theme/common/media-query-list';


let mediumMediaQuery;
let uid = 1;

// Copied from blaze-slider/dist/blaze-slider.esm.js
const isTouch = () => 'ontouchstart' in window;
function handleAutoplay(slider) {
    const config = slider.config;
    if (!config.enableAutoplay) return;
    const dir = config.autoplayDirection === 'to left' ? 'next' : 'prev';
    if (slider.autoplayTimer) clearInterval(slider.autoplayTimer);
    // eslint-disable-next-line no-param-reassign
    slider.autoplayTimer = setInterval(() => {
        slider[dir]();
    }, config.autoplayInterval);
    if (config.stopAutoplayOnInteraction) {
        slider.el.addEventListener(isTouch() ? 'touchstart' : 'mousedown', () => {
            clearInterval(slider.autoplayTimer);
        }, { once: true });
    }
}

class YoutubeBlaze {
    constructor(blaze) {
        this.$blaze = $(blaze);
        this.blazeSlider = this.$blaze.data('blazeSliderInstance');
        this.$videos = this.$blaze.find('[data-youtube]');
        this.onSlide = this.onSlide.bind(this);
        this.onPlayerReady = this.onPlayerReady.bind(this);
        this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
        this.init();
        this.bindEvents();
    }

    bindEvents() {
        this.blazeSlider.onSlide(this.onSlide);
    }

    onPlayerReady(event) {
        // store player object for use later
        $(event.target.getIframe()).closest('.heroCarousel-slide').data('youtube-player', event.target);

        // On desktop: Play video if first slide is video
        if (mediumMediaQuery.matches) {
            setTimeout(() => {
                if ($(event.target.getIframe()).closest('.heroCarousel-slide').hasClass('_active')) {
                    this.blazeSlider.stopAutoplay();
                    if (this.$blaze.data('youtubeMute') !== undefined) {
                        event.target.mute();
                    }
                    event.target.playVideo();
                }
            }, 200);
        }
    }

    onPlayerStateChange(event) {
        // Stop blaze autoplay when video start playing
        if (event.data === YT.PlayerState.PLAYING) { // eslint-disable-line
            this.$blaze.addClass('blaze-video-playing');
            this.blazeSlider.stopAutoplay();
        }

        if (event.data === YT.PlayerState.PAUSED) { // eslint-disable-line
            this.$blaze.removeClass('blaze-video-playing');
        }

        // go to next slide and enable autoplay back when video ended
        if (event.data === YT.PlayerState.ENDED) { // eslint-disable-line
            this.$blaze.removeClass('blaze-video-playing');
            this.blazeSlider.next();
        }
    }

    init() {
        this.$videos.each((j, vid) => {
            const $vid = $(vid);
            const id = `youtube_player_${uid++}`;

            $vid.attr('id', id);

            // init player
            const player = new YT.Player(id, { // eslint-disable-line
                // host: 'http://www.youtube.com',
                videoId: $vid.data('youtube'),
                wmode: 'transparent',
                playerVars: {
                    controls: 0,
                    disablekb: 1,
                    enablejsapi: 1,
                    fs: 0,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    modestbranding: 1,
                    wmode: 'transparent',
                },
                events: {
                    onReady: this.onPlayerReady,
                    onStateChange: this.onPlayerStateChange,
                },
            });
        });
    }

    onSlide(pageIndex, firstSlideIndex, lastSlideIndex) {
        const slides = Array.from(this.blazeSlider.slides);

        // Stop previous slide video
        slides.filter((slide, i) => i < firstSlideIndex || i > lastSlideIndex)
            .map(slide => $(slide).data('youtube-player'))
            .forEach(player => player && player.stopVideo());

        // Enable auto slide
        handleAutoplay(this.blazeSlider);

        // On desktop:
        // - Auto play video when open next slide
        // - Stop auto slide
        if (mediumMediaQuery.matches) {
            slides.filter((slide, i) => i >= firstSlideIndex && i <= lastSlideIndex)
                .map(slide => $(slide).data('youtube-player'))
                .filter(player => player)
                .forEach((player) => {
                    this.blazeSlider.stopAutoplay();
                    if (this.$blaze.data('youtubeMute') !== undefined) {
                        player.mute();
                    }
                    player.playVideo();
                });
        }
    }
}

function initCarousel($carousel) {
    $carousel.each((i, blaze) => {
        const $blaze = $(blaze);
        if ($blaze.find('[data-youtube]').length > 0) {
            $blaze.addClass('_video');
            new YoutubeBlaze(blaze); // eslint-disable-line
        }
    });
}

export default function youtubeCarouselFactory($carousel) {
    if ($carousel.find('[data-youtube]').length > 0) {
        mediumMediaQuery = mediaQueryListFactory('medium');

        if (typeof window.onYouTubeIframeAPIReady === 'undefined') {
            window.onYouTubeIframeAPIReady = initCarousel.bind(window, $carousel);

            // Load the IFrame Player API code asynchronously.
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/player_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // $('body').append('<script src="https://www.youtube.com/iframe_api"></script>');
        } else {
            initCarousel($carousel);
        }
    }
}
