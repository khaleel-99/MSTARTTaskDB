import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { addToCart } from '../services/cartService';
import { useTheme } from '../context/ThemeContext';
import styles from './Products.module.css';

function Products({ onCartUpdate, onViewProduct }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { t } = useTheme();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();
            setProducts(data);
            setError('');
        } catch (err) {
            setError(t('productError') + ': ' + (err.message || t('unknownError')));
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        const cartProduct = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.amount),
            stock: product.quantity || Math.floor(Math.random() * 100) + 1
        };
        addToCart(cartProduct, 1);
        if (onCartUpdate) {
            onCartUpdate();
        }
        alert(`${product.name} ${t('addedToCart')}!`);
    };

    if (loading) return <div className={styles.loading}>⏳ {t('loading')}...</div>;
    if (error) return <div className={styles.error}>❌ {error}</div>;

    return (
        <div className={styles.productsContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>📦 {t('productsCatalog')}</h2>
                <p className={styles.subtitle}>{t('browseProducts')}</p>
            </div>
            <div className={styles.productsGrid}>
                {products.map((product) => (
                    <div
                        key={product.id}
                        className={styles.productCard}
                        onClick={() => onViewProduct && onViewProduct(product.id)}
                    >
                        {product.photo && (
                            <img
                                src={`data:image/jpeg;base64,${product.photo}`}
                                alt={product.name}
                                className={styles.productImage}
                            />
                        )}
                        <div className={styles.productContent}>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <p className={styles.productDescription}>{product.description || t('noDescription')}</p>
                            <div className={styles.priceContainer}>
                                <span className={styles.price}>{product.amount}</span>
                                <span className={styles.currency}>{product.currency}</span>
                            </div>
                            <span className={`${styles.statusBadge} ${product.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                                {product.status === 'Active' ? `✓ ${t('active')}` : `✗ ${t('inactive')}`}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(product);
                                }}
                                disabled={product.status !== 'Active'}
                                className={styles.addToCartButton}
                            >
                                {product.status === 'Active' ? `🛒 ${t('addToCart')}` : t('unavailable')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {products.length === 0 && <div className={styles.emptyState}>📭 {t('noProducts')}</div>}
        </div>
    );
}

export default Products;
