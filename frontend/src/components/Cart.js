import React, { useState, useEffect } from 'react';
import { getCart, updateCartItemQuantity, removeFromCart, getCartTotal, checkout } from '../services/cartService';
import styles from './Cart.module.css';

function Cart({ onClose, onCheckoutSuccess }) {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        setCart(getCart());
    };

    const handleQuantityChange = (productId, newQuantity) => {
        const updatedCart = updateCartItemQuantity(productId, newQuantity);
        setCart(updatedCart);
    };

    const handleRemove = (productId) => {
        const updatedCart = removeFromCart(productId);
        setCart(updatedCart);
    };

    const handleCheckout = async () => {
        alert('🛒 This system is just for testing purposes.\n\n✨ We hope this checkout feature will be added soon!\n\nThank you for your understanding.');
        return;
    };

    const total = getCartTotal();

    return (
        <div className={styles.cartOverlay}>
            <div className={styles.cartContainer}>
                <div className={styles.cartHeader}>
                    <h2>Shopping Cart</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {cart.length === 0 ? (
                    <div className={styles.emptyCart}>
                        <p>Your cart is empty</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.cartItems}>
                            {cart.map(item => (
                                <div key={item.id} className={styles.cartItem}>
                                    <div className={styles.itemInfo}>
                                        <h3>{item.name}</h3>
                                        <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <div className={styles.quantityControls}>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                className={styles.quantityButton}
                                            >
                                                -
                                            </button>
                                            <span className={styles.quantity}>{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                className={styles.quantityButton}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className={styles.removeButton}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className={styles.itemTotal}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.cartFooter}>
                            <div className={styles.total}>
                                <span>Total:</span>
                                <span className={styles.totalAmount}>${total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className={styles.checkoutButton}
                            >
                                {loading ? 'Processing...' : 'Checkout'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Cart;
