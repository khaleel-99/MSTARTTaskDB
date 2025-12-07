import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import api from '../services/api';
import styles from './Orders.module.css';

function Orders({ userRole }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getAllOrders();
            setOrders(data);
            setError('');
        } catch (err) {
            setError('Failed to load orders: ' + (err.response?.data?.message || err.message || 'Unknown error'));
            console.error('Error loading orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingStatus(orderId);
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            // Update the order in the local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update order status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getStatusClass = (status) => {
        if (status === 'Completed') return styles.statusCompleted;
        if (status === 'Cancelled') return styles.statusCancelled;
        if (status === 'Pending') return styles.statusPending;
        if (status === 'Processing') return styles.statusProcessing;
        return styles.statusPending;
    };

    if (loading) return <div className={styles.loading}>⏳ Loading orders...</div>;
    if (error) return <div className={styles.error}>❌ {error}</div>;

    return (
        <div className={styles.ordersContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>📋 {userRole === 'Admin' ? 'All Orders' : 'My Orders'}</h2>
                <p className={styles.subtitle}>{userRole === 'Admin' ? 'View and manage all orders' : 'View your order history'}</p>
            </div>
            {error && <div className={styles.error}>❌ {error}</div>}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                        <tr>
                            <th>Order ID</th>
                            <th>User ID</th>
                            <th>Total Amount</th>
                            <th>Currency</th>
                            <th>Status</th>
                            <th>Created At</th>
                            {userRole === 'Admin' && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className={styles.orderId}>#{order.id}</td>
                                <td>{order.userId}</td>
                                <td className={styles.amount}>{order.totalAmount}</td>
                                <td>{order.currency}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                {userRole === 'Admin' && (
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            disabled={updatingStatus === order.id}
                                            className={styles.statusSelect}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {orders.length === 0 && <div className={styles.emptyState}>📭 No orders found</div>}
        </div>
    );
}

export default Orders;
