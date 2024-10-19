import PageManager from './page-manager';
import displayTypeFactory from '../chiara/display-type'; // Chiara MOD

export default class Brands extends PageManager {
    // Chiara MOD
    onReady() {
        displayTypeFactory();

        // Chiara
        this.initInfiniteScroll();
    }

    // Chiara
    initInfiniteScroll() {
        if (this.context.themeSettings.brandspage_infiniteScroll) {
            import('../chiara/infinite-scroll').then(module => module.initBrandsPage(this.context));
        }
    }
}
