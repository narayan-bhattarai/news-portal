import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Snackbar from '../../components/ui/Snackbar';
import '../../pages/Admin.css';

export default function AdminCategories() {
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

    // Create/Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '' });

    // Delete State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Snackbar State
    const [snackbar, setSnackbar] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        isOpen: false,
        message: '',
        type: 'info'
    });

    const [showAddModal, setShowAddModal] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const showSnackbar = (message: string, type: 'success' | 'error' | 'info') => {
        setSnackbar({ isOpen: true, message, type });
    };

    const closeSnackbar = () => {
        setSnackbar(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = () => {
        api.getCategories().then(setCategories).catch(console.error);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleOpenEditModal = (category: { id: number; name: string }) => {
        startEditing(category);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) return;

        try {
            if (isEditing && currentCategoryId) {
                // Update
                await api.updateCategory(currentCategoryId, formData.name);
                showSnackbar('Category updated successfully', 'success');
            } else {
                // Create
                await api.createCategory(formData.name);
                showSnackbar('Category created successfully', 'success');
            }

            handleCloseModal();
            loadCategories();
        } catch (e: any) {
            console.error(e);
            showSnackbar(e.message || 'Operation failed', 'error');
        }
    };

    const startEditing = (category: { id: number; name: string }) => {
        setIsEditing(true);
        setCurrentCategoryId(category.id);
        setFormData({ name: category.name });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentCategoryId(null);
        setFormData({ name: '' });
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (deleteId === null) return;
        try {
            await api.deleteCategory(deleteId);
            showSnackbar('Category deleted successfully', 'success');
            loadCategories();
        } catch (e: any) {
            console.error(e);
            showSnackbar(e.message || 'Failed to delete category', 'error');
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(categories.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className="admin-content">
            <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="content-card compact" style={{ maxWidth: '1000px' }}>
                    <div className="card-header">
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Existing Categories</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>Manage category list</p>
                        </div>
                        <button className="primary-btn compact" onClick={handleOpenAddModal}>
                            <Plus size={16} /> Add Category
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="modern-table compact">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>ID</th>
                                    <th>Name</th>
                                    <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCategories.map(c => (
                                    <tr key={c.id} className={currentCategoryId === c.id ? 'highlight-row' : ''}>
                                        <td>#{c.id}</td>
                                        <td><span className="badge">{c.name}</span></td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleOpenEditModal(c)}
                                                    className="icon-btn edit"
                                                    title="Edit Category"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(c.id)}
                                                    className="icon-btn delete"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && <tr><td colSpan={3} className="empty-state">No categories found.</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
                            <button
                                className="icon-btn"
                                disabled={currentPage === 1}
                                onClick={() => paginate(currentPage - 1)}
                                style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                            >
                                &lt;
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    className={`icon-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                    onClick={() => paginate(i + 1)}
                                    style={{
                                        background: currentPage === i + 1 ? 'var(--primary-color)' : 'transparent',
                                        color: currentPage === i + 1 ? 'white' : 'inherit',
                                        border: currentPage === i + 1 ? 'none' : '1px solid var(--border-color)',
                                        width: '32px', height: '32px'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="icon-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => paginate(currentPage + 1)}
                                style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Category Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrapper">
                                <Plus size={20} className="text-primary" />
                                <h3>{isEditing ? 'Edit Category' : 'Add New Category'}</h3>
                            </div>
                            <button onClick={handleCloseModal} className="icon-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modern-form">
                            <div className="form-group">
                                <label>Category Name</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter category name"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="secondary-btn" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="primary-btn">
                                    {isEditing ? <Save size={18} /> : <Plus size={18} />}
                                    {isEditing ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Category"
                message="Are you sure you want to delete this category? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

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
                .text-primary {
                    color: var(--primary-color);
                }
            `}</style>
        </div>
    );
}
