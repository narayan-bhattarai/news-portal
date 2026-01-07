import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, Edit, Save, X, AlertTriangle } from 'lucide-react';
import Snackbar from '../../components/ui/Snackbar';
import '../../pages/Admin.css';

interface User {
    id: number;
    username: string;
    role: string;
    email?: string;
    fullName?: string;
    createdAt?: string;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);

    // Create State
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'User',
        email: '',
        fullName: ''
    });

    // Edit State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editUserForm, setEditUserForm] = useState({
        username: '',
        role: 'User',
        newPassword: '',
        confirmPassword: '',
        email: '',
        fullName: ''
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Delete State
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const [snackbar, setSnackbar] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        isOpen: false,
        message: '',
        type: 'info'
    });

    const showSnackbar = (message: string, type: 'success' | 'error' | 'info') => {
        setSnackbar({ isOpen: true, message, type });
    };

    const closeSnackbar = () => {
        setSnackbar(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        api.getUsers().then(setUsers).catch(err => {
            console.error(err);
            showSnackbar('Failed to load users', 'error');
        });
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newUser.password !== newUser.confirmPassword) {
            showSnackbar("Passwords do not match!", 'error');
            return;
        }

        try {
            await api.createUser({
                username: newUser.username,
                password: newUser.password,
                role: newUser.role,
                email: newUser.email,
                fullName: newUser.fullName
            });
            showSnackbar('User created successfully!', 'success');
            setNewUser({ username: '', password: '', confirmPassword: '', role: 'User', email: '', fullName: '' });
            setIsModalOpen(false); // Close modal
            loadUsers();
        } catch (e) {
            console.error(e);
            showSnackbar('Failed to create user. Username may already exist.', 'error');
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setNewUser({ username: '', password: '', confirmPassword: '', role: 'User', email: '', fullName: '' });
        setIsModalOpen(true);
    };

    const startEditingUser = (user: User) => {
        setEditingUser(user);
        setEditUserForm({
            username: user.username,
            role: user.role,
            newPassword: '',
            confirmPassword: '',
            email: user.email || '',
            fullName: user.fullName || ''
        });
        setIsModalOpen(true);
    };

    const cancelEditing = () => {
        setEditingUser(null);
        setEditUserForm({ username: '', role: 'User', newPassword: '', confirmPassword: '', email: '', fullName: '' });
        setIsModalOpen(false);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editUserForm.newPassword && editUserForm.newPassword !== editUserForm.confirmPassword) {
            showSnackbar("New passwords do not match!", 'error');
            return;
        }

        if (!editingUser) return;

        try {
            await api.updateUser(editingUser.id, {
                username: editUserForm.username,
                role: editUserForm.role,
                newPassword: editUserForm.newPassword,
                email: editUserForm.email,
                fullName: editUserForm.fullName
            });
            showSnackbar('User updated successfully!', 'success');
            setEditingUser(null);
            setIsModalOpen(false); // Close modal
            loadUsers();
        } catch (e) {
            console.error(e);
            showSnackbar('Failed to update user', 'error');
        }
    };

    const initiateDeleteUser = (user: User) => {
        if (user.username === 'admin') {
            showSnackbar('Cannot delete root admin user.', 'error');
            return;
        }
        setUserToDelete(user);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await api.deleteUser(userToDelete.id);
            showSnackbar('User deleted successfully', 'success');
            loadUsers();
            setUserToDelete(null);
        } catch (e) {
            console.error(e);
            showSnackbar('Failed to delete user', 'error');
        }
    };

    return (
        <div className="admin-content">
            <div className="content-grid single-column">
                <div className="content-card compact" style={{ maxWidth: '1200px' }}>
                    <div className="card-header">
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>System Users</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>Manage registered users</p>
                        </div>
                        <button className="primary-btn compact" onClick={openCreateModal}>
                            <Plus size={16} /> Add New User
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="modern-table compact">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Username</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((u, index) => (
                                        <tr key={u.id} className={editingUser?.id === u.id ? 'highlight-row' : ''}>
                                            <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{u.username}</td>
                                            <td>{u.fullName || <span style={{ opacity: 0.5 }}>-</span>}</td>
                                            <td>{u.email || <span style={{ opacity: 0.5 }}>-</span>}</td>
                                            <td><span className={`badge ${u.role === 'Admin' ? 'badge-primary' : 'badge-secondary'}`}>{u.role}</span></td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => startEditingUser(u)}
                                                        className="icon-btn edit"
                                                        title="Edit User"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => initiateDeleteUser(u)}
                                                        className="icon-btn delete"
                                                        title="Delete"
                                                        disabled={u.username === 'admin'}
                                                        style={{ opacity: u.username === 'admin' ? 0.3 : 1 }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="empty-state">No users found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit User Modal */}
            {
                isModalOpen && (
                    <div className="modal-overlay" onClick={cancelEditing}>
                        <div className="modal-content user-form-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
                                <button onClick={cancelEditing} className="icon-btn"><X size={20} /></button>
                            </div>

                            {!editingUser ? (
                                // CREATE FORM
                                <form onSubmit={handleCreateUser} className="modern-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Username</label>
                                            <input
                                                value={newUser.username}
                                                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                                placeholder="Enter username"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                value={newUser.fullName}
                                                onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                                placeholder="Full Name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={newUser.email}
                                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                                placeholder="Email Address"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Role</label>
                                            <select
                                                value={newUser.role}
                                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                            >
                                                <option value="User">User (Standard)</option>
                                                <option value="Admin">Administrator</option>
                                            </select>
                                        </div>
                                    </div>

                                    <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border-color)' }} />

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Password</label>
                                            <input
                                                type="password"
                                                value={newUser.password}
                                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                placeholder="Enter password"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm Password</label>
                                            <input
                                                type="password"
                                                value={newUser.confirmPassword}
                                                onChange={e => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                                                placeholder="Confirm password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="modal-actions" style={{ marginTop: '1rem' }}>
                                        <button type="button" className="secondary-btn" onClick={cancelEditing}>Cancel</button>
                                        <button type="submit" className="primary-btn"><Plus size={18} /> Create User</button>
                                    </div>
                                </form>
                            ) : (
                                // EDIT FORM
                                <form onSubmit={handleUpdateUser} className="modern-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Username</label>
                                            <input
                                                value={editUserForm.username}
                                                onChange={e => setEditUserForm({ ...editUserForm, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                value={editUserForm.fullName}
                                                onChange={e => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={editUserForm.email}
                                                onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Role</label>
                                            <select
                                                value={editUserForm.role}
                                                onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })}
                                                disabled={editUserForm.username === 'admin'}
                                                style={{ opacity: editUserForm.username === 'admin' ? 0.6 : 1, cursor: editUserForm.username === 'admin' ? 'not-allowed' : 'pointer' }}
                                                title={editUserForm.username === 'admin' ? "Admin role cannot be changed" : ""}
                                            >
                                                <option value="User">User (Standard)</option>
                                                <option value="Admin">Administrator</option>
                                            </select>
                                        </div>
                                    </div>

                                    <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border-color)' }} />

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>New Password (Optional)</label>
                                            <input
                                                type="password"
                                                value={editUserForm.newPassword}
                                                onChange={e => setEditUserForm({ ...editUserForm, newPassword: e.target.value })}
                                                placeholder="Leave blank to keep current"
                                            />
                                        </div>

                                        {editUserForm.newPassword && (
                                            <div className="form-group">
                                                <label>Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={editUserForm.confirmPassword}
                                                    onChange={e => setEditUserForm({ ...editUserForm, confirmPassword: e.target.value })}
                                                    placeholder="Confirm new password"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="modal-actions" style={{ marginTop: '1rem' }}>
                                        <button type="button" className="secondary-btn" onClick={cancelEditing}>Cancel</button>
                                        <button type="submit" className="primary-btn"><Save size={18} /> Update User</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Custom Delete Confirmation Modal */}
            {
                userToDelete && (
                    <div className="modal-overlay" onClick={() => setUserToDelete(null)}>
                        <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
                            <div className="delete-modal-icon">
                                <AlertTriangle size={32} />
                            </div>
                            <h3>Delete User?</h3>
                            <p>
                                Are you sure you want to delete <strong>{userToDelete.username}</strong>?
                                <br />This action cannot be undone.
                            </p>
                            <div className="modal-actions">
                                <button className="secondary-btn" onClick={() => setUserToDelete(null)}>Cancel</button>
                                <button className="primary-btn danger" onClick={confirmDeleteUser}>Delete User</button>
                            </div>
                        </div>
                    </div>
                )
            }

            <Snackbar
                isOpen={snackbar.isOpen}
                message={snackbar.message}
                type={snackbar.type}
                onClose={closeSnackbar}
            />

            <style>{`
                .highlight-row {
                    background-color: var(--color-primary-light, #e0e7ff);
                }
                .action-buttons {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                .delete-modal {
                    max-width: 400px;
                    text-align: center;
                    padding: 2rem;
                }
                .delete-modal-icon {
                    width: 64px;
                    height: 64px;
                    background-color: #fee2e2;
                    color: #ef4444;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                .delete-modal h3 {
                    margin-bottom: 0.5rem;
                    color: #1f2937;
                }
                .delete-modal p {
                    color: #6b7280;
                    margin-bottom: 2rem;
                    line-height: 1.5;
                }
                .modal-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                .primary-btn.danger {
                    background-color: #ef4444;
                }
                .primary-btn.danger:hover {
                    background-color: #dc2626;
                }
                .user-form-modal {
                    max-width: 700px;
                    width: 100%;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .single-column {
                    grid-template-columns: 1fr;
                }
            `}</style>
        </div >
    );
}
