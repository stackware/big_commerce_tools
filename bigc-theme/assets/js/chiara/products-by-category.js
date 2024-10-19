import utils from '@bigcommerce/stencil-utils';

class ProductsByCategory {
    constructor($scope) {
        this.$scope = $scope;
        this.url = this.$scope.data('url');
        this.type = this.$scope.data('type');
        this.$content = this.$scope.is('[data-content]') ? this.$scope : this.$scope.find('[data-content]');

        this.loadProducts();
    }

    loadProducts() {
        const template = `chiara/products-by-category/${this.type == 'carousel' ? 'carousel' : 'grid'}`;
        utils.api.getPage(this.url, { template }, (err, resp) => {
            this.$scope.find('[data-loader]').remove();
            this.$content.append(resp);
            this.$content.find('[data-slick]').slick();
        });
    }
}

export default function (selector = '[data-products-by-category]') {
    return $(selector).get().map(el => new ProductsByCategory($(el)));
}
