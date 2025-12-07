import React, { useState, useEffect } from 'react';
import profileService from '../services/profileService';
import styles from './Profile.module.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await profileService.getProfile();
            setProfile(data);
            setFormData({
                username: data.username,
                email: data.email,
                phone: data.phone || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            if (data.photo) {
                setPhotoPreview(`data:image/jpeg;base64,${data.photo}`);
            }
        } catch (err) {
            setError('Failed to load profile');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload
            setLoading(true);
            try {
                const response = await profileService.uploadPhoto(file);
                setMessage('Photo uploaded successfully');
                setError('');
                setTimeout(() => setMessage(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to upload photo');
                setMessage('');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeletePhoto = async () => {
        if (window.confirm('Are you sure you want to delete your profile photo?')) {
            setLoading(true);
            try {
                await profileService.deletePhoto();
                setPhotoPreview(null);
                setMessage('Photo deleted successfully');
                setError('');
                setTimeout(() => setMessage(''), 3000);
            } catch (err) {
                setError('Failed to delete photo');
                setMessage('');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validate password match
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        // Prepare update data
        const updateData = {
            username: formData.username,
            email: formData.email,
            phone: formData.phone
        };

        if (formData.currentPassword && formData.newPassword) {
            updateData.currentPassword = formData.currentPassword;
            updateData.newPassword = formData.newPassword;
        }

        setLoading(true);
        try {
            await profileService.updateProfile(updateData);
            setMessage('Profile updated successfully');
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setEditing(false);
            await loadProfile();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.profileContainer}>
            <h1>My Profile</h1>

            {message && <div className={styles.success}>{message}</div>}
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.profileContent}>
                {/* Photo Section */}
                <div className={styles.photoSection}>
                    <div className={styles.photoPreview}>
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile" />
                        ) : (
                            <div className={styles.noPhoto}>
                                <span>No Photo</span>
                            </div>
                        )}
                    </div>
                    <div className={styles.photoActions}>
                        <label className={styles.uploadBtn}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                disabled={loading}
                                style={{ display: 'none' }}
                            />
                            {photoPreview ? 'Change Photo' : 'Upload Photo'}
                        </label>
                        {photoPreview && (
                            <button
                                onClick={handleDeletePhoto}
                                disabled={loading}
                                className={styles.deleteBtn}
                            >
                                Delete Photo
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Info Section */}
                <div className={styles.infoSection}>
                    {!editing ? (
                        <>
                            <div className={styles.infoGroup}>
                                <label>Username:</label>
                                <span>{profile.username}</span>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Email:</label>
                                <span>{profile.email}</span>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Phone:</label>
                                <span>{profile.phone || 'Not provided'}</span>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Role:</label>
                                <span className={styles.roleBadge}>{profile.role}</span>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Member Since:</label>
                                <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                            </div>
                            <button onClick={() => setEditing(true)} className={styles.editBtn}>
                                Edit Profile
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Username:</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone:</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <hr />
                            <h3>Change Password (Optional)</h3>
                            <div className={styles.formGroup}>
                                <label>Current Password:</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>New Password:</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Confirm New Password:</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button type="submit" disabled={loading} className={styles.saveBtn}>
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false);
                                        setFormData({
                                            username: profile.username,
                                            email: profile.email,
                                            phone: profile.phone || '',
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                    }}
                                    className={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
