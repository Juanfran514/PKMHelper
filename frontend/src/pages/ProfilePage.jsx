import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthStyles.css';

export default function ProfilePage() {
    const { user, updateUser, logout } = useAuth();
    
    // State for inputs
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [sdName, setSdName] = useState('');
    
    // Status states
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
            setSdName(user.sdName || '');
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const result = await updateUser(username, email, sdName);
        if (result.success) {
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } else {
            setError(result.error || 'Failed to update profile');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
        setSuccess('');
        if (user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
            setSdName(user.sdName || '');
        }
    };

    return (
        <div className="container mt-4 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="auth-card" style={{ background: 'rgba(20, 20, 30, 0.7)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', maxWidth: '500px' }}>
                <h2 className="auth-title text-center mb-4">YOUR PROFILE</h2>
                
                <form className="auth-form" onSubmit={handleSave}>
                    <div className="auth-form-group">
                        <label className="auth-label">USERNAME</label>
                        <input 
                            type="text" 
                            className="auth-input" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={!isEditing}
                            required
                        />
                    </div>
                    
                    <div className="auth-form-group">
                        <label className="auth-label">EMAIL</label>
                        <input 
                            type="email" 
                            className="auth-input" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">SHOWDOWN NAME</label>
                        <input 
                            type="text" 
                            className="auth-input" 
                            value={sdName}
                            onChange={(e) => setSdName(e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>

                    {error && <div className="auth-error text-center mt-2">{error}</div>}
                    {success && <div className="text-success text-center mt-2" style={{ fontFamily: 'Inter', fontSize: '12px' }}>{success}</div>}

                    <div className="d-flex justify-content-between mt-4">
                        {!isEditing ? (
                            <button 
                                type="button" 
                                className="auth-button" 
                                style={{ width: '48%' }} 
                                onClick={() => setIsEditing(true)}
                            >
                                EDIT
                            </button>
                        ) : (
                            <>
                                <button 
                                    type="button" 
                                    className="auth-button bg-secondary" 
                                    style={{ width: '48%' }} 
                                    onClick={handleCancel}
                                >
                                    CANCEL
                                </button>
                                <button 
                                    type="submit" 
                                    className="auth-button" 
                                    style={{ width: '48%', background: '#00cc66' }}
                                >
                                    SAVE
                                </button>
                            </>
                        )}
                        
                        {!isEditing && (
                            <button 
                                type="button" 
                                className="auth-button" 
                                style={{ width: '48%', background: '#ff3333' }} 
                                onClick={logout}
                            >
                                LOGOUT
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
