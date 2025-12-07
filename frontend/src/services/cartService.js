import api from './api';

const CART_STORAGE_KEY = 'cart';

export const getCart = () => {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product, quantity = 1) => {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    return cart;
};

export const updateCartItemQuantity = (productId, quantity) => {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);

    if (item) {
        if (quantity <= 0) {
            return removeFromCart(productId);
        }
        item.quantity = quantity;
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    return cart;
};

export const removeFromCart = (productId) => {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    return cart;
};

export const clearCart = () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
};

export const getCartTotal = () => {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const checkout = async () => {
    const cart = getCart();
    if (cart.length === 0) {
        throw new Error('Cart is empty');
    }

    const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
    }));

    const response = await api.post('/orders', {
        orderItems: orderItems
    });

    clearCart();
    return response.data;
};
