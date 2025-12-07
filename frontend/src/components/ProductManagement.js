import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import api from '../services/api';
import styles from './ProductManagement.module.css';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        currency: 'USD',
        status: 'Active',
        quantity: '',
        photoFile: null,
        photoPreview: null
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                photoFile: file,
                photoPreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                status: formData.status,
                quantity: parseInt(formData.quantity) || 0
            };

            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, productData);

                if (formData.photoFile) {
                    const photoFormData = new FormData();
                    photoFormData.append('photo', formData.photoFile);
                    await api.post(`/products/${editingProduct.id}/photo`, photoFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }

                alert('Product updated successfully!');
            } else {
                const response = await api.post('/products', productData);

                if (formData.photoFile && response.data.id) {
                    const photoFormData = new FormData();
                    photoFormData.append('photo', formData.photoFile);
                    await api.post(`/products/${response.data.id}/photo`, photoFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }

                alert('Product added successfully!');
            }

            setShowForm(false);
            setEditingProduct(null);
            setFormData({ name: '', description: '', amount: '', currency: 'USD', status: 'Active', quantity: '', photoFile: null, photoPreview: null });
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            amount: product.amount.toString(),
            currency: product.currency || 'USD',
            status: product.status || 'Active',
            quantity: (product.quantity || 0).toString(),
            photoFile: null,
            photoPreview: product.photo ? `data:image/jpeg;base64,${product.photo}` : null
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await api.delete(`/products/${id}`);
            alert('Product deleted successfully!');
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete product');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({ name: '', description: '', amount: '', currency: 'USD', status: 'Active', quantity: '', photoFile: null, photoPreview: null });
        setError('');
    };

    if (loading) {
        return <div className={styles.loading}>Loading products...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Product Management</h2>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className={styles.addButton}>
                        + Add New Product
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {showForm && (
                <div className={styles.formCard}>
                    <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter product name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter product description"
                                rows="3"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Product Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className={styles.fileInput}
                            />
                            {formData.photoPreview && (
                                <div className={styles.photoPreview}>
                                    <img src={formData.photoPreview} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Amount ($) *</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Currency *</label>
                                <input
                                    type="text"
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="USD"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Quantity *</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="1"
                                placeholder="0"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Status *</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div className={styles.formActions}>
                            <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                Cancel
                            </button>
                            <button type="submit" className={styles.saveButton}>
                                {editingProduct ? 'Update Product' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.productsTable}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.description || '-'}</td>
                                <td>${product.amount?.toFixed(2) || '0.00'}</td>
                                <td>{product.currency || 'USD'}</td>
                                <td>
                                    <span className={styles.quantityBadge}>
                                        {product.quantity || 0} in stock
                                    </span>
                                </td>
                                <td>
                                    <span className={product.status === 'Active' ? styles.inStock : styles.outOfStock}>
                                        {product.status}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className={styles.editButton}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className={styles.deleteButton}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProductManagement;
