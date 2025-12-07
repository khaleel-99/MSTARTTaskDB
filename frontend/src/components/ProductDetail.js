import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { addToCart } from '../services/cartService';
import { useTheme } from '../context/ThemeContext';
import styles from './ProductDetail.module.css';

function ProductDetail({ productId, onCartUpdate, onBack }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const { t } = useTheme();

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const data = await productService.getProductById(productId);
            setProduct(data);
            setError('');
        } catch (err) {
            setError(t('productError') + ': ' + (err.message || t('unknownError')));
            console.error('Error loading product:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        const cartProduct = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.amount),
            stock: 100
        };

        addToCart(cartProduct, quantity);
        if (onCartUpdate) {
            onCartUpdate();
        }
        alert(`${quantity}x ${product.name} ${t('addedToCart')}!`);
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= 99) {
            setQuantity(newQuantity);
        }
    };

    if (loading) return <div className={styles.loading}>⏳ {t('loading')}...</div>;
    if (error) return <div className={styles.error}>❌ {error}</div>;
    if (!product) return <div className={styles.error}>Product not found</div>;

    return (
        <div className={styles.container}>
            <button onClick={onBack} className={styles.backButton}>
                ← {t('backToProducts')}
            </button>

            <div className={styles.productContainer}>
                <div className={styles.imageSection}>
                    {product.photo ? (
                        <img
                            src={`data:image/jpeg;base64,${product.photo}`}
                            alt={product.name}
                            className={styles.productImage}
                        />
                    ) : (
                        <div className={styles.noImagePlaceholder}>
                            📦
                            <p>No image available</p>
                        </div>
                    )}
                </div>

                <div className={styles.detailsSection}>
                    <h1 className={styles.productName}>{product.name}</h1>

                    <div className={styles.statusContainer}>
                        <span className={`${styles.statusBadge} ${product.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                            {product.status === 'Active' ? `✓ ${t('active')}` : `✗ ${t('inactive')}`}
                        </span>
                        {product.status === 'Active' && (
                            <span className={styles.stockBadge}>✓ {t('stockAvailable')}</span>
                        )}
                    </div>

                    <div className={styles.priceContainer}>
                        <span className={styles.price}>{product.amount}</span>
                        <span className={styles.currency}>{product.currency}</span>
                    </div>

                    <div className={styles.descriptionSection}>
                        <h3 className={styles.sectionTitle}>{t('description')}</h3>
                        <p className={styles.description}>
                            {product.description || t('noDescription')}
                        </p>
                    </div>

                    {product.status === 'Active' && (
                        <div className={styles.cartActions}>
                            <div className={styles.quantitySelector}>
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    className={styles.quantityButton}
                                    disabled={quantity <= 1}
                                >
                                    −
                                </button>
                                <span className={styles.quantityDisplay}>{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className={styles.quantityButton}
                                    disabled={quantity >= 99}
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className={styles.addToCartButton}
                            >
                                🛒 {t('addToCart')}
                            </button>
                        </div>
                    )}

                    {product.status !== 'Active' && (
                        <div className={styles.unavailableMessage}>
                            {t('unavailable')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
