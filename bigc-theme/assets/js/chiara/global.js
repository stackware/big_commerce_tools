import _ from 'lodash';
import PageManager from '../theme/page-manager';
import 'slick-carousel';
import collapsibleFactory, { CollapsibleEvents } from '../theme/common/collapsible';
import mediaQueryListFactory from '../theme/common/media-query-list';
import remoteBanner from './remote-banners';
import loginForm from './login-form';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'; // Chiara - enable/disable body scroll on iOS
import ajaxAddToCart from './ajax-addtocart';
import initLocalBanners from './local-banners';
import utils from '@bigcommerce/stencil-utils';
import { getCookie, setCookie } from './utils';
import swal from '../theme/global/sweet-alert';
import inView from 'in-view';
import initPageBuilder from './page-builder';

const mediumMedia = mediaQueryListFactory('medium');

function initBrandsCarousel() {
    const $carousel = $('[data-brands-slick]');

    $carousel.each((id, el) => {
        const $el = $(el);

        $el.slick({
            arrows: true,
            mobileFirst: true,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: $el.data('speed') || 5000,
            lazyLoad: 'progressive',
            centerMode: true,
            variableWidth: true,
        });
    });
}

/**
 * Function to make collapsible elements open/close same as the active element
 */
function toggleSameCollapsible() {
    function onCollapsibleToggle(event) {
        const collapse = $(event.target).data('collapsibleInstance');
        if (!collapse) {
            return;
        }
        const id = collapse.targetId;

        $('[data-collapsible]').each((i, el) => {
            if (el !== event.target) {
                const $el = $(el);
                const obj = $el.data('collapsibleInstance');

                if (obj && obj.targetId === id) {
                    if (event.type === 'open') {
                        obj.open({ notify: false });
                    } else {
                        obj.close({ notify: false });
                    }
                }
            }
        });
    }

    $('body')
        .on(CollapsibleEvents.open, '[data-collapsible]', onCollapsibleToggle)
        .on(CollapsibleEvents.close, '[data-collapsible]', onCollapsibleToggle);
}

function bindMobileCollapse() {
    $('body').on('click', '[data-emthemesmodez-mobile-collapse-handle]', (event) => {
        event.preventDefault();

        const $toggle = $(event.currentTarget);
        const $parent = $toggle.closest('[data-emthemesmodez-mobile-collapse]');
        const $content = $parent.find('[data-emthemesmodez-mobile-collapse-content]');

        $toggle.toggleClass('is-active');
        $content.toggleClass('is-active');
    });
}

function bindMobileSidebarToggle() {
    $('body').on('click', '[data-collapsible="mobileSidebar-panel"]', event => {
        if ($(event.currentTarget).hasClass('is-open')) {
            $('body').addClass('has-mobileSidebar');
        } else {
            $('body').removeClass('has-mobileSidebar');
        }
    });
}

function bindCollapsibleGroups() {
    $('body').on(CollapsibleEvents.open, '[data-group-collapsible]', (event, collapsible) => {
        const $target = $(event.target);
        const group = $target.data('groupCollapsible');

        if (!collapsible || !collapsible.targetId) {
            return;
        }

        $(`[data-group-collapsible="${group}"]`).each((i, el) => {
            const otherCollapsible = $(el).data('collapsibleInstance');

            if (otherCollapsible && otherCollapsible.targetId && otherCollapsible.targetId !== collapsible.targetId) {
                otherCollapsible.close();
            }
        });
    });
}

function bindLockBodyScroll() {
    // Stop if not iOS Safari
    if (!/Mobi/i.test(navigator.userAgent) || !/Safari/i.test(navigator.userAgent)) {
        // console.log('Disable lockBodyScroll for not Safari/Mobile');
        return;
    }

    $('body')
        .on(CollapsibleEvents.open, '[data-collapsible]', (event, collapsible) => {
            if (collapsible) {
                const el = collapsible.$target.find('[data-lock-body-scroll]').get(0);
                if (el) {
                    // console.log('lock', el);
                    disableBodyScroll(el);
                }
            }
        })
        .on(CollapsibleEvents.close, '[data-collapsible]', (event, collapsible) => {
            // console.log('close: ', event.target, collapsible.$toggle);
            if (collapsible) {
                const el = collapsible.$target.find('[data-lock-body-scroll]').get(0);
                if (el) {
                    // console.log('unlock', el);
                    enableBodyScroll(el);
                } else {
                    // console.log('unlock 1');
                    clearAllBodyScrollLocks();
                }
            } else {
                // console.log('unlock 2');
                clearAllBodyScrollLocks();
            }
        });
}

function initStickyHeader() {
    const $stickyMenus = $('[data-stickymenu]');
    if ($stickyMenus.length > 0) {
        $stickyMenus.each((i, el) => {
            $(el).data('stickymenuOriginalTop', $(el).offset().top)
                .after('<div class="chiara-stickymenu-placeholder"></div>')
                .next().height($(el).outerHeight());
        });

        $(window)
            .on('scroll', _.debounce(() => {
                if (!mediumMedia || !mediumMedia.matches) {
                    $stickyMenus.removeClass('is-sticky');
                    return;
                }

                $stickyMenus.each((i, el) => {
                    if ($(window).scrollTop() > $(el).data('stickymenuOriginalTop')) {
                        $(el).addClass('is-sticky');
                    } else {
                        $(el).removeClass('is-sticky');
                    }
                });
            }, 10))

            .on('resize', _.debounce(() => {
                $stickyMenus.each((i, el) => {
                    $(el).removeClass('is-sticky');

                    $(el).data('stickymenuOriginalTop', $(el).offset().top);
                });
            }, 100));
    }
}

function initNavPagesDropdown() {
    const $main = $('#navPages-main');
    const $toggle = $main.children('.navPages-item--dropdown-toggle');
    const $dropdown = $('#navPages-dropdown');
    const $navPagesContainer = $('.navPages-container');

    const resize = () => {
        $navPagesContainer.removeClass('initialized');

        if (!$toggle.is('.u-hiddenVisually')) {
            $toggle.before($dropdown.children());
            $toggle.addClass('u-hiddenVisually');
        }

        if (!mediumMedia.matches) {
            return;
        }

        do { // eslint-disable-line
            const $lastItem = $main.children('.navPages-item').not(':last-child').not('.u-hiddenVisually-desktop').last();
            const lastItemRight = Math.round($lastItem.offset().left - $main.offset().left + $lastItem.width());
            const mainWidth = Math.round($main.width());

            if ($dropdown.children().length > 0) {
                const toggleRight = Math.round($toggle.offset().left - $main.offset().left + $toggle.width());
                if (toggleRight > mainWidth) {
                    $dropdown.prepend($lastItem);
                } else {
                    break;
                }
            } else if (lastItemRight > mainWidth) {
                $dropdown.prepend($lastItem);
                $toggle.removeClass('u-hiddenVisually');
            } else {
                break;
            }
        } while (true); // eslint-disable-line no-constant-condition

        $navPagesContainer.addClass('initialized');
    };

    $(window).on('resize', _.debounce(resize, 200));

    resize();
}

function initCardImageSliderClicks(context) {
    if (context.themeSettings.card_show_img_slider) {
        $('body').on('click', '.card-image-link--slider', event => {
            const $activeImg = $(event.currentTarget).find('.is-active');
            const $arrow = $(event.target).closest('.card-image-prev, .card-image-next');

            if ($arrow.hasClass('card-image-prev')) {
                event.preventDefault();

                if (!$activeImg.hasClass('first')) {
                    $activeImg.removeClass('is-active')
                        .prev()
                        .addClass('is-active');
                }
            } else if ($arrow.hasClass('card-image-next')) {
                event.preventDefault();

                if (!$activeImg.hasClass('last')) {
                    $activeImg.removeClass('is-active')
                        .next()
                        .addClass('is-active');
                }
            }
        });
    }
}

async function initWOWAsync(context) {
    const [{ WOW }] = await Promise.all([
        import('wowjs'),
        // import('animate-css'),
    ]);

    window.WOW = WOW;

    $('.productGrid').each((j, list) => {
        $(list).children('.product').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 4)}ms`);
        }).addClass('wow fadeIn');
    });

    $('.productGrid--maxCol5').each((j, list) => {
        $(list).children('.product').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 5)}ms`);
        });
    });

    $('.productGrid--maxCol6').each((j, list) => {
        $(list).children('.product').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 6)}ms`);
        });
    });

    $('.productGrid--maxCol8').each((j, list) => {
        $(list).children('.product').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 8)}ms`);
        });
    });

    $('.productGrid--maxCol3').each((j, list) => {
        $(list).children('.product').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 3)}ms`);
        });
    });

    $('.productGrid--maxCol2').each((j, list) => {
        $(list).children('.product').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 2)}ms`);
        });
    });

    $('.productGrid--maxCol1').each((j, list) => {
        $(list).children('.product').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', '0');
        });
    });

    $('.productCarousel').each((j, list) => {
        $(list).find('.productCarousel-slide').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 4)}ms`);
        }).addClass('wow fadeIn');
    });

    $('.chiara-banners-list').each((j, list) => {
        $(list).children('.chiara-banners-item').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * i}ms`);
        }).addClass('wow fadeIn');
    });

    $('.chiara-categoriesList-list').each((j, list) => {
        $(list).children('.chiara-categoriesList-item').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 2)}ms`);
        }).addClass('wow fadeIn');
    });

    $('.chiara-recentBlog-posts').each((j, list) => {
        $(list).children('.blog').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 4)}ms`);
        }).addClass('wow fadeIn');
    });

    $('.chiara-section--brandsCarousel, .footer-newsletterTop, .footer-copyright').filter((i, el) => !inView.is(el)).addClass('wow fadeIn');

    $('.footer-info-left').each((j, list) => {
        $(list).children('.footer-info-col').filter((i, el) => !inView.is(el)).each((i, el) => {
            $(el).attr('data-wow-delay', `${200 * (i % 3)}ms`);
        }).addClass('wow fadeIn');
    });

    $('.footer-info-right > .footer-info-col').filter((i, el) => !inView.is(el)).attr('data-wow-delay', '800ms').addClass('wow fadeIn');

    if (typeof (context.wow) === 'undefined') {
        context.wow = new WOW({ // eslint-disable-line no-param-reassign
            mobile: false,
            live: true,
        });
    }

    context.wow.init();
}

async function initTweenMaxAsync() {
    const { TweenMax } = await import('tweenmax');

    $('.chiara-banners-item img + img').css('transition', 'none');

    $('.chiara-banners-item')
        .mousemove(e => {
            const $el = $(e.currentTarget);
            const $target = $el.find('img + img');

            if ($target.length > 0) {
                const relX = e.pageX - $el.offset().left;
                const relY = e.pageY - $el.offset().top;
                const movement = -50;

                TweenMax.to($target.get(0), 1, {
                    x: (relX - $el.width() / 2) / $el.width() * movement,
                    y: (relY - $el.height() / 2) / $el.height() * movement,
                    scale: 1,
                });
            }
        })
        .mouseout(e => {
            const $el = $(e.currentTarget);
            const $target = $el.find('img + img');

            if ($target.length > 0) {
                TweenMax.to($target.get(0), 1, { x: 0, y: 0, scale: 1 });
            }
        });
}

function bindLazysizesEvents() {
    //
    // Append store CDN to image urls start with '/product_images/'
    // before lazyload
    //
    let cdn;

    $('head link[rel*=dns-prefetch]').each((i, el) => {
        if (cdn) {
            return;
        }
        const href = $(el).attr('href');
        if (href.match(/^https:\/\/cdn(.+)\.bigcommerce\.com\/[^\/]+$/i)) {
            cdn = href;
        }
    });

    if (!cdn) {
        return;
    }

    $(document).on('lazybeforeunveil', event => {
        const $el = $(event.target);
        const dataSrc = $el.data('src');
        if (dataSrc && dataSrc.indexOf('/product_images/') === 0) {
            event.preventDefault();
            $el.attr('src', `${cdn}${dataSrc}`);
        }
    });
}

function cardAddWishlist(context) {
    let $activeWishlist;

    const showForm = ($el) => {
        const $wishlist = $el.parent().find('.wishlist-dropdown');

        if ($activeWishlist && $activeWishlist.get(0) === $wishlist.get(0)) {
            $activeWishlist.hide();
            $activeWishlist = null;
            return true;
        }

        if ($activeWishlist) {
            $activeWishlist.hide();
            $activeWishlist = null;
        }

        if ($wishlist.length > 0) {
            $wishlist.show();
            $activeWishlist = $wishlist;
            return true;
        }

        return false;
    };

    $('body').on('click', '.card-figcaption-button.wishlist', event => {
        event.preventDefault();
        const $el = $(event.currentTarget);

        if (!showForm($el)) {
            const [_, productId] = $el.attr('href').match(/product_id=([0-9]+)/); // eslint-disable-line no-shadow,no-unused-vars

            if (productId) {
                const $wishlist = $(`<ul class="dropdown-menu wishlist-dropdown is-open f-open-dropdown"><li class="loading"><img src="${context.loadingImg}" alt="loading"/></li></ul>`);
                $el.parent().append($wishlist);

                utils.api.product.getById(productId, { template: 'products/card-wishlist-dropdown' }, (err, resp) => {
                    if (!err) {
                        $wishlist.html($(resp).html());
                        $wishlist.find('[data-card-wishlist-add]').on('click', (event2) => {
                            event2.preventDefault();
                            $('<form method="post" style="width:0;height:0;visibility:hidden;overflow:hidden"><input type="submit" value=""></form>')
                                .appendTo('body')
                                .prop('action', $(event2.target).attr('href'))
                                .find('input[type=submit]').click();
                        });
                        showForm($el);
                    } else {
                        $wishlist.remove();
                    }
                });
            }
        }
    });

    $('body').on('click', event => {
        if ($activeWishlist && !$(event.target).is('.card-figcaption-button.wishlist') && $(event.target).closest('.wishlist-dropdown, .card-figcaption-button.wishlist').length === 0) {
            $activeWishlist.hide();
            $activeWishlist = null;
        }
    });
}

function initProductsByCategory() {
    if ($('[data-products-by-category]').length > 0) {
        import('./products-by-category').then(module => module.default());
    }
}

function initPopupBanner(context) {
    const {
        url,
        width = 600,
        delay = 0,
        expire = 0,
        cookieName = 'CHIARA_POPUPBANNER',
    } = context.chiaraSettings.popupBanner || {};

    if (!context.chiaraSettings.popupBanner || !url || getCookie(cookieName)) {
        return;
    }

    utils.api.getPage(url, { template: 'chiara/popup-banner' }, (err, resp) => {
        if (err || !resp) {
            return;
        }
        const $resp = $(resp);
        const $el = $resp.is('main') ? $resp : $resp.find('main');
        const html = $el.html();
        const text = String($el.text()).trim();
        if (text || $el.find('img').length > 0) {
            setTimeout(() => {
                swal({
                    html,
                    showCloseButton: true,
                    showConfirmButton: false,
                    width,
                    useRejections: false,
                    onClose: () => {
                        setCookie(cookieName, 1, expire);
                    },
                });
            }, delay * 1000);
        }
    });
}

async function async(func, ...args) {
    func(...args);
}
export default class ChiaraGlobal extends PageManager {
    onReady() {
        if (!this.context.chiaraSettings.disableAutoSizeNavPages) {
            initNavPagesDropdown();
        }

        if (this.context.themeSettings.card_show_swatches && this.context.graphQLToken) {
            const config = Object.assign({
                graphQLToken: this.context.graphQLToken,
                imageSize: this.context.themeSettings.productgallery_size,
            }, this.context.chiaraSettings.cardSwatchesOptions);
            import('./card-swatches/ProductSwatches').then(({ default: ProductSwatches }) => new ProductSwatches(config));
        }

        // async calls
        async(bindLazysizesEvents);
        async(initBrandsCarousel);
        if (this.context.themeSettings.use_remote_banner) {
            async(remoteBanner, this.context);
        }
        async(loginForm, this.context);
        async(bindMobileSidebarToggle);
        async(bindCollapsibleGroups);
        async(bindLockBodyScroll);
        async(ajaxAddToCart, this.context);
        async(cardAddWishlist, this.context);
        async(initStickyHeader);
        async(initLocalBanners);
        async(initCardImageSliderClicks, this.context);
        async(initProductsByCategory);
        async(initPopupBanner, this.context);

        collapsibleFactory('#navUser-more-toggle, #navUser-more-toggle2, #navUser-more-close, [data-collapsible]');
        toggleSameCollapsible();
        bindMobileCollapse();

        //
        // Last
        //

        if (this.context.themeSettings.use_wow) {
            initWOWAsync(this.context);
        }

        if (this.context.themeSettings.use_tweenmax) {
            initTweenMaxAsync();
        }

        if (this.context.themeSettings.navigation_widgets && this.context.themeSettings.navigation_design === 'simple') {
            initPageBuilder();
        }
    }
}
