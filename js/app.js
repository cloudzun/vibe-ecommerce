// Register Phase 4 routes
Router.register('login', () => LoginPage.mount());
Router.register('register', () => RegisterPage.mount());
Router.register('account', () => AccountPage.mount());

document.addEventListener('DOMContentLoaded', () => {
    Header.mount();
    
    if (!window.location.hash) {
        window.location.hash = 'products';
    } else {
        Router.navigate();
    }
    
    console.log('TechShop initialized!');
});
