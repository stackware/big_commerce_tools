import './global/jquery-migrate';
import './common/select-option-plugin';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import privacyCookieNotification from './global/cookieNotification';
import maintenanceMode from './global/maintenanceMode';
import carousel from './common/carousel';
import loadingProgressBar from './global/loading-progress-bar';
import svgInjector from './global/svg-injector';

// TMA Add custom JS
import customQtyBox from './custom/custom-qty-box';
import downloadForm from './custom/download-form';

export default class Global extends PageManager {
    onReady() {
        const {
            cartId,
        } = this.context;

        cartPreview(this.context.secureBaseUrl, this.context.cartId);
        quickSearch(this.context); // Chiara add context
        currencySelector(cartId);
        foundation($(document));
        quickView(this.context);
        carousel();
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        maintenanceMode(this.context.maintenanceMode);
        loadingProgressBar();
        svgInjector();

        // TMA Add custom global JS
        customQtyBox();
        downloadForm();
    }
}
