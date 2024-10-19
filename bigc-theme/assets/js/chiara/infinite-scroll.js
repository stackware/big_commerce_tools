import _ from 'lodash';
import { api } from '@bigcommerce/stencil-utils';

class InfiniteScroll {
    constructor($scope, options, context) {
        const defaultOptions = {
            containerSelector: '.productGrid',
            paginationSelector: '.pagination',
            nextLinkSelector: '.pagination-item--next .pagination-link',
            loadingClass: 'is-loading',
            threshold: 100,
            appendSelector: '.product',
            template: 'chiara/category/ajax-product-listing',
            config: {},
        };
        this.options = _.extend({}, defaultOptions, options);
        this.$scope = $scope;
        this.context = context;
        this.isRequesting = false;

        this.onScroll = this.onScroll.bind(this);
        this.bindEvents();
    }

    bindEvents() {
        $(window).on('scroll', _.debounce(this.onScroll, 200));
    }

    onScroll() {
        if (this.isRequesting) {
            return;
        }

        const $pagination = $(this.options.paginationSelector, this.$scope);

        const $nextLink = $(this.options.nextLinkSelector, $pagination);
        if ($nextLink.length === 0) {
            return;
        }

        const top = $nextLink.offset().top - this.options.threshold;
        const y1 = $(window).scrollTop();
        const y2 = y1 + $(window).height();

        if (top >= y1 && top <= y2) {
            const href = $nextLink.attr('href').replace(/&?limit=[0-9]+/, '') + `&limit=${this.context.themeSettings.products_per_page}`;
            
            this.request(href);
        }
    }

    request(url) {
        const $container = $(this.options.containerSelector, this.$scope);
        const $pagination = $(this.options.paginationSelector, this.$scope);

        this.isRequesting = true;
        $pagination.addClass(this.options.loadingClass);
        $container.addClass(this.options.loadingClass);

        api.getPage(url, {
            template: this.options.template,
            config: this.options.config,
        }, (err, resp) => {
            this.isRequesting = false;
            $pagination.removeClass(this.options.loadingClass);
            $container.removeClass(this.options.loadingClass);

            if (err) {
                return err;
            }

            const $resp = $(resp);

            const $append = $(this.options.appendSelector, $resp);
            if ($append.length > 0) {
                $container.append($append);
            }

            const $newPagination = $resp.find(this.options.paginationSelector);
            $pagination
                .empty()
                .append($newPagination.children());
        });
    }
}

export default InfiniteScroll;

export function initBrandPage(context) {
    $('[data-brand-infinite-scroll]').each((i, el) => {
        new InfiniteScroll($(el), { // eslint-disable-line
            template: 'chiara/brand/ajax-product-listing',
            config: {
                brand: {
                    products: {
                        limit: parseInt(context.themeSettings.products_per_page, 10),
                    },
                },
            },
        }, context);
    });
}

export function initCategoryPage(context) {
    $('[data-category-infinite-scroll]').each((i, el) => {
        new InfiniteScroll($(el), { // eslint-disable-line
            config: {
                category: {
                    products: {
                        limit: parseInt(context.themeSettings.products_per_page, 10),
                    },
                },
            },
        }, context);
    });
}

export function initBrandsPage(context) {
    $('[data-brands-infinite-scroll]').each((i, el) => {
        const infScroll = new InfiniteScroll($(el), { // eslint-disable-line
            containerSelector: '.brandGrid',
            appendSelector: '.brand',
            template: 'chiara/brand/ajax-brand-listing',
            config: {
                brands: {
                    limit: parseInt(context.themeSettings.products_per_page, 10),
                },
            },
        }, context);
    });
}

export function initSearchPage(context) {
    $('[data-search-infinite-scroll]').each((i, el) => {
        const infScroll = new InfiniteScroll($(el), { // eslint-disable-line
            template: 'chiara/search/ajax-product-listing',
            config: {
                product_results: {
                    limit: parseInt(context.themeSettings.products_per_page, 10),
                },
            },
        }, context);
    });
}
