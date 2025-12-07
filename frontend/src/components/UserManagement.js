import React, { useEffect, useState } from 'react';
import api from '../services/api';
import styles from './UserManagement.module.css';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'User'
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingUser) {
                const updateData = {
                    username: formData.username,
                    email: formData.email,
                    role: formData.role
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await api.put(`/users/${editingUser.id}`, updateData);
                alert('User updated successfully!');
            } else {
                await api.post('/users', formData);
                alert('User added successfully!');
            }

            setShowForm(false);
            setEditingUser(null);
            setFormData({ username: '', email: '', password: '', role: 'User' });
            loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save user');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            role: user.role
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingUser(null);
        setFormData({ username: '', email: '', password: '', role: 'User' });
        setError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await api.delete(`/users/${id}`);
            alert('User deleted successfully!');
            loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading users...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>User Management</h2>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className={styles.addButton}>
                        + Add New User
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {showForm && (
                <div className={styles.formCard}>
                    <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Username *</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter username"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter email"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Password {editingUser ? '(leave empty to keep current)' : '*'}</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required={!editingUser}
                                placeholder="Enter password"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Role *</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <div className={styles.formActions}>
                            <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                Cancel
                            </button>
                            <button type="submit" className={styles.saveButton}>
                                {editingUser ? 'Update User' : 'Add User'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.usersTable}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={user.role === 'Admin' ? styles.roleAdmin : styles.roleUser}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className={styles.editButton}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className={styles.deleteButton}
                                            disabled={user.role === 'Admin'}
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

export default UserManagement;
