const Router = {
    routes: {},
    currentRoute: null,

    register(route, handler) {
        this.routes[route] = handler;
    },

    navigate(hash) {
        if (!hash) hash = window.location.hash.slice(1) || 'products';
        
        const route = hash.split('?')[0];
        const params = this.parseParams(hash);
        
        this.currentRoute = { route, params };
        
        const handler = this.routes[route];
        if (handler) {
            handler(params);
        } else if (route === '404') {
            this.showNotFound();
        } else {
            this.showNotFound();
        }
        
        window.dispatchEvent(new CustomEvent('routeChange', { detail: { route, params } }));
    },

    showNotFound() {
        document.getElementById('app').innerHTML = `
            <div class="empty-state">
                <h2>Page Not Found</h2>
                <p style="margin: 1rem 0; color: #6b7280;">The page you're looking for doesn't exist.</p>
                <button class="btn" style="width: auto;" onclick="Router.goTo('products')">
                    Back to Products
                </button>
            </div>
        `;
    },

    parseParams(hash) {
        const [path, queryString] = hash.split('?');
        if (!queryString) return {};
        
        return queryString.split('&').reduce((params, pair) => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            return params;
        }, {});
    },

    goTo(route, params = {}) {
        const queryString = Object.keys(params).length 
            ? '?' + new URLSearchParams(params).toString()
            : '';
        window.location.hash = route + queryString;
    }
};

window.addEventListener('hashchange', () => {
    Router.navigate();
});
