import _ from 'lodash';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import ProductDetails from '../common/product-details';
import { defaultModal } from './modal';
import 'slick-carousel';

// Chiara
import mediaQueryListFactory from '../common/media-query-list';

export default function (context) {
    const modal = defaultModal();

    // Chiara
    const mq = mediaQueryListFactory('medium');

    // Chiara - add .quickview-alt to support Choose Options show quickview
    $('body').on('click', '.quickview, .quickview-alt', event => {
        const $el = $(event.currentTarget);
        // Chiara - Do normal link if not desktop
        // .quickview-alt should work on desktop only
        if ($el.hasClass('quickview-alt')) {
            if (!mq || !mq.matches) {
                const href = $el.data('href') || $el.attr('href');
                if (href) {
                    window.location.href = href;
                }
                return;
            }
        }

        event.preventDefault();

        const productId = $el.data('productId');

        modal.open({ size: 'large' });

        const config = {
            product: {
                videos: {
                    limit: context.themeSettings.productpage_videos_count,
                },
                related_products: {
                    limit: context.themeSettings.productpage_related_products_count,
                },
                similar_by_views: {
                    limit: context.themeSettings.productpage_similar_by_views_count,
                },
            },
        };

        utils.api.product.getById(productId, { template: 'products/quick-view', config }, (err, response) => {
            modal.updateContent(response);

            modal.$content.find('.productView').addClass('productView--quickView');

            modal.$content.find('[data-slick]').slick();

            // Papathemes Also Bought MOD {{{
            const $quickView = modal.$content.find('.quickView');
            if ($('[data-also-bought] .productView-alsoBought-item', $quickView).length > 0) {
                return new ProductDetails($quickView, _.extend(context, { enableAlsoBought: true }));
            }
            return new ProductDetails($quickView, context);
            // }}}
        });
    });

    // Prevent redirect on clicking on "Choose Option" button when enabling data tags
    $('body').on('mouseenter', '.quickview-alt', event => {
        const $el = $(event.currentTarget);

        if ($el.attr('href')) {
            $el.attr('data-href', $el.attr('href')).removeAttr('href');
        }
    });
}
