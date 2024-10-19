import PageManager from "../../page-manager";

export default class CustomSubCategory  extends PageManager {
    constructor(context) {
        super(context);
        this.slideIndex = 1;
    }

    onReady() {

        // Add list items to cart
        this.listenAddToCart();

        // // Add item to cart
        // this.addItemsToCart();

        this.handleToggleProduct();

        // const slideIndex = 1;

        this.slider();

        // End custom JS
    }

    // Add item to cart
    listenAddToCart() {

        const $addListItemsToCart = $(".btn-add-all");
        const $addToCart = $(".individual-add-to-cart");

        $addListItemsToCart.on("click", (event) => {
            // handle add list items to cart
            this.handleAddListToCart();
        });

        $addToCart.on("click", (event) => {
            // handle add list items to cart
            this.handleAddToCart(event);
        })
    }

    getProductItems() {
        return document.querySelectorAll('.productList .product');
    }

    // Function to extract product details
    extractProductDetails(item) {
        const productId = item.querySelector('article').getAttribute('data-product-id');
        const productQuantity = item.querySelector('input').getAttribute('value');
        return {
            product_id: Number(productId),
            quantity: Number(productQuantity)
        };
    }

    // Function to filter products with quantity > 0
    filterProducts(products) {
        return products.filter(product => product.quantity > 0);
    }

    // Function to add products to cart
    async addItemsToCart(items) {
        const url = '/api/storefront/carts';

        try {
            // First, get the current cart or create a new one
            let cart = await fetch(url, { method: 'GET', credentials: 'include' })
                .then(response => response.json());

            let cartId;
            if (cart.length === 0) {
                // Create a new cart if one doesn't exist
                cart = await fetch(url, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lineItems: items
                    })
                }).then(response => response.json())
                    .then((data) => {
                        setTimeout(() => {
                            window.location.href = '/cart.php';
                        }, 1500);
                    });
                cartId = cart.id;
            } else {
                cartId = cart[0].id;
                // Add items to existing cart
                await fetch(`${url}/${cartId}/items`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lineItems: items
                    })
                }).then((data) => {
                    setTimeout(() => {
                        window.location.href = '/cart.php';
                    }, 1500);
                });;
            }

            console.log('Items added to cart successfully');
            // Optionally, you can redirect to the cart page or update the cart UI here
            // window.location.href = '/cart.php';
        } catch (error) {
            console.error('Error adding items to cart:', error);
        }
    }

    // Main function to handle adding list items to cart
    handleAddListToCart() {
        const productItems = this.getProductItems();
        const products = Array.from(productItems).map(this.extractProductDetails);
        const validProducts = products.filter(product => product.quantity > 0);

        if (validProducts.length === 0) {
            console.log('No products selected. Please select at least one product.');
            return;
        }

        const lineItems = validProducts.map(product => ({
            quantity: product.quantity,
            product_id: product.product_id
        }));

        this.addItemsToCart(lineItems);
    }

    // Add a item to cart
    handleAddToCart(event) {
        event.preventDefault();
        let productId = event.target.getAttribute('product-id');
        let quantity = $(`#qty_${productId}`).val();
        let qty = parseInt(quantity);
        if (qty > 0) {
            // AJAX call to add item to cart
            $.ajax({
                url: '/cart.php',
                method: 'POST',
                data: {
                    action: 'add',
                    product_id: productId,
                    qty: qty
                },
                success: function (response) {
                    // Handle successful add to cart
                    console.log('Added ' + qty + ' item(s) to cart!');
                    // You might want to update a cart icon or total here
                },
                error: function (xhr, status, error) {
                    // Handle error
                    console.log('Error adding to cart. Please try again.');
                }
            }).then((data) => {
                setTimeout(() => {
                    window.location.href = '/cart.php';
                }, 1500);
            });
        } else {
            console.log('Please select a quantity greater than 0.');
        }
    }

    // Handle toggle for product item
    handleToggleProduct() {
        $('body').on('click', '.listItemCollapsible', function (event) {
            $(this).next().toggleClass('is-open');
            $(this).toggleClass('expanded');
        });

        $('body').on('click', '.collapse-card', function (event) {
            this.classList.toggle("active");
            var content = this.children[1];
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    }

    // TMA handle image slider
    slider () {
        const $nextButton = $(".next");
        const $prevButton = $(".prev");
        $nextButton.on("click", (event) => {
            this.moveSlide(1);
        });

        $prevButton.on("click", (event) => {
            this.moveSlide(-1);
        })
    }

    moveSlide(n) {
        this.showSlides(this.slideIndex += n);
    }

    currentSlide(n) {
        this.showSlides(this.slideIndex = n);
    }

    showSlides(n) {
        
        let slides = document.getElementsByClassName("slide");
        let thumbs = document.getElementsByClassName("thumb");
        
        if (n > slides.length) { this.slideIndex = 1 }
        if (n < 1) { this.slideIndex = slides.length }
        
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";  
        }
        
        for (let i = 0; i < thumbs.length; i++) {
            thumbs[i].className = thumbs[i].className.replace(" active", "");
        }
        
        slides[this.slideIndex - 1].style.display = "flex";  
        // thumbs[this.slideIndex - 1].className += " active";
    }
}