document.addEventListener('DOMContentLoaded', () => {
    Header.mount();
    
    if (!window.location.hash) {
        window.location.hash = 'products';
    } else {
        Router.navigate();
    }
    
    console.log('TechShop initialized!');
});
