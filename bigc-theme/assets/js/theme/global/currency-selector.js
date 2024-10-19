import swal from './sweet-alert';
import utils from '@bigcommerce/stencil-utils';

export default function (cartId) {
    function changeCurrency(url, currencyCode) {
        $.ajax({
            url,
            contentType: 'application/json',
            method: 'POST',
            data: JSON.stringify({ currencyCode }),
        }).done(() => {
            window.location.reload();
        }).fail((e) => {
            swal({
                text: JSON.parse(e.responseText).error,
                type: 'warning',
                showCancelButton: true,
            });
        });
    }

    $(document.body).on('click', '.currencySelector', () => {
        $('.currency-selection-list').toggleClass('active');
    });

    $(document.body).on('click', '[data-cart-currency-switch-url]', event => {
        const currencySessionSwitcher = event.target.href;
        if (!cartId) {
            return;
        }
        event.preventDefault();
        utils.api.cart.getCart({ cartId }, (err, response) => {
            if (err || response === undefined) {
                window.location.href = currencySessionSwitcher;
                return;
            }

            const showWarning = response.discounts.some(discount => discount.discountedAmount > 0) ||
                response.coupons.length > 0 ||
                response.lineItems.giftCertificates.length > 0;

            if (showWarning) {
                swal({
                    text: $(event.target).data('warning'),
                    type: 'warning',
                    showCancelButton: true,
                }).then(result => {
                    if (result === true || result.value && result.value === true) { // papathemes-chiara edited
                        changeCurrency($(event.target).data('cart-currency-switch-url'), $(event.target).data('currency-code'));
                    }
                });
            } else {
                changeCurrency($(event.target).data('cart-currency-switch-url'), $(event.target).data('currency-code'));
            }
        });
    });
}
