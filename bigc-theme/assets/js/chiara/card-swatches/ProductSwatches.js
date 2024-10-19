import inView from 'in-view';
import { debounce } from 'lodash';
import Card from './Card';

class ProductSwatches {
    constructor({
        cardSelector = '.product .card, .productCarousel-slide .card',
        productIdSelector = '[data-product-id]',
        findProductIdByImg = false,
        swatchesContainerSelector = '.card-text--colorswatches',
        cardImageSelector = '.card-image',
        addToCartFormSelector = 'form[data-cart-item-add]',
        productViewFile = 'products/product-view',
        attributesTemplate = `
            <div class="productSwatches-attributes">
                {{#attributes}}
                    <div class="productSwatches-swatches" data-swatches>
                        {{#.}}
                            <a href="#" class="productSwatches-swatches-item" title="{{label}}"
                                data-attribute-id="{{attributeId}}"
                                data-attribute-value="{{attributeValue}}">{{&content}}</a>
                        {{/.}}
                        <button type="button" class="productSwatches-swatches-more" data-more>+ More</button>
                        <button type="button" class="productSwatches-swatches-less" data-less>- Less</button>
                    </div>
                {{/attributes}}
            </div>
        `,
        templateCustomTags = null,
        imageSize = '590x590',
        inputFinderFunc = null,
        swatchesLimit = 0,
        imageReplacerFunc = null,
        displayInStockOnly = false,
        autoSelectOptionValues = true,
        graphQLToken = ''
    } = {}) {
        this.config = {
            cardSelector,
            productIdSelector,
            findProductIdByImg,
            swatchesContainerSelector,
            cardImageSelector,
            addToCartFormSelector,
            productViewFile,
            attributesTemplate,
            templateCustomTags,
            imageSize,
            inputFinderFunc,
            swatchesLimit,
            imageReplacerFunc,
            displayInStockOnly,
            autoSelectOptionValues,
            graphQLToken,
        };
        this.onWindowScroll = debounce(this.onWindowScroll.bind(this, null), 200);

        this.bindEvents();
    }

    bindEvents() {
        $(window).on('scroll resize load', this.onWindowScroll);

        const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        if (MutationObserver) {
            this.mutationObserver = new MutationObserver(mutations => {
                const $newElements = mutations.reduce((accumulate, mutation) => [...accumulate, ...mutation.addedNodes], []);
                this.onWindowScroll($newElements);
            });
            this.mutationObserver.observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        
        }
    }

    unbindEvents() {
        $(window).off('scroll resize load', this.onWindowScroll);

        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
    }

    onWindowScroll($body = null) {
        const cards = [];

        $(this.config.cardSelector, $body).each((i, el) => {
            const $scope = $(el);
            if ($scope.data('productSwatchesCard') || !inView.is(el)) {
                return;
            }

            let productId = $scope.find(this.config.productIdSelector).data('productId');
            if (!productId) {
                // try to find product ID by img src
                if (!this.config.findProductIdByImg) {
                    return;
                }
                productId = $scope.find('img').get().reduce((id, img) => {
                    if (id) {
                        return id;
                    }
                    const m = String(img.src).match(/products\/([0-9]+)\//);
                    return m ? Number(m[1]) : id;
                }, null);
                if (!productId) {
                    return;
                }
            }

            const $attributesContainer = $scope.find(this.config.swatchesContainerSelector);
            if ($attributesContainer.length === 0) {
                return;
            }

            const {
                productViewFile,
                attributesTemplate,
                templateCustomTags,
                addToCartFormSelector,
                imageSize,
                inputFinderFunc,
                swatchesLimit,
                imageReplacerFunc,
                displayInStockOnly,
                autoSelectOptionValues,
                graphQLToken,
            } = this.config;

            const $cardImage = $scope.find(this.config.cardImageSelector).first();

            const card = new Card({
                $scope,
                $attributesContainer,
                productId,
                productViewFile,
                attributesTemplate,
                templateCustomTags,
                addToCartFormSelector,
                $cardImage,
                imageSize,
                inputFinderFunc,
                swatchesLimit,
                imageReplacerFunc,
                displayInStockOnly,
                autoSelectOptionValues,
                autoInit: !graphQLToken,
            });
            cards.push(card);

            $scope.data('productSwatchesCard', card);
            $scope.addClass('productSwatchesLoaded');
        });

        if (this.config.graphQLToken && cards.length > 0) {
            const ids = cards.map(card => card.productId);
            $.ajax({
                url: '/graphql',
                method: 'POST',
                data: JSON.stringify({
                    query: `
                        query {
                            site {
                                products (entityIds: ${JSON.stringify(ids)}, first: ${ids.length}) {
                                    edges {
                                        node {
                                            entityId
                                            name
                                            minPurchaseQuantity
                                            productOptions {
                                                edges {
                                                    node {
                                                        entityId
                                                        displayName
                                                        ... on CheckboxOption {
                                                            checkedByDefault
                                                        }
                                                        ... on MultipleChoiceOption {
                                                            values {
                                                                edges {
                                                                    node {
                                                                        entityId
                                                                        isDefault
                                                                        ... on SwatchOptionValue {
                                                                            label
                                                                            hexColors
                                                                            imageUrl(width: 100)
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    `
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.graphQLToken}`,
                },
                xhrFields: {
                    withCredentials: true,
                },
                success: (resp) => {
                    resp.data.site.products.edges.forEach(edge => {
                        cards.filter(card => card.productId == edge.node.entityId).forEach(card => {
                            card.graphQLNode = edge.node;
                            card.init();
                        });
                    })
                },
            });
        }
    }
}

export default ProductSwatches;
