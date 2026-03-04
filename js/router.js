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
        
        const handler = this.routes[route] || this.routes['products'];
        if (handler) {
            handler(params);
        }
        
        window.dispatchEvent(new CustomEvent('routeChange', { detail: { route, params } }));
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
