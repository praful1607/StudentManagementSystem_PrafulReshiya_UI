import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const ClassesPage = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importLoading, setImportLoading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    const loadClasses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/Classes');
            setClasses(response.data);
        } catch (error) {
            console.error('Failed to load classes', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClasses();
    }, []);

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset input so the same file can be selected again if needed
        e.target.value = null;
        setImportResult(null);

        // Max file limit frontend check (5MB) - server also enforces this
        if (file.size > 5 * 1024 * 1024) {
            setImportResult({ type: 'error', message: 'File size exceeds 5 MB limit.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setImportLoading(true);
            const response = await api.post('/Classes/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setImportResult({ 
                type: 'success', 
                data: response.data 
            });
            loadClasses();
            
        } catch (error) {
            console.error("Import failed:", error);
            
            if (error.response?.data?.errors?.length > 0) {
                // Return detailed validation errors
                setImportResult({ 
                    type: 'error', 
                    title: error.response.data.message || 'Import failed',
                    errors: error.response.data.errors 
                });
            } else {
                setImportResult({ 
                    type: 'error', 
                    message: error.response?.data?.message || 'An error occurred during import.' 
                });
            }
        } finally {
            setImportLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Classes</h2>
                <div>
                    <input 
                        type="file" 
                        accept=".csv" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange}
                    />
                    <button 
                        className="btn-secondary" 
                        onClick={handleImportClick}
                        disabled={importLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {importLoading ? 'Importing...' : '📥 Bulk Import CSV'}
                    </button>
                </div>
            </div>

            {/* Import Status Messages */}
            {importResult && importResult.type === 'success' && (
                <div className="alert success-alert" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '4px' }}>
                    Successfully imported {importResult.data.successCount} classes.
                    {importResult.data.failedCount > 0 && ` Failed rows: ${importResult.data.failedCount}`}
                </div>
            )}
            
            {importResult && importResult.type === 'error' && (
                <div className="alert error-alert" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '4px' }}>
                    <strong>{importResult.title || importResult.message}</strong>
                    {importResult.errors && (
                        <ul style={{ marginTop: '0.5rem', marginBottom: '0', paddingLeft: '1.5rem' }}>
                            {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    )}
                </div>
            )}

            <div className="grid-container">
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Class Name</th>
                            <th>Description</th>
                            <th>Enrolled Students</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                        ) : classes.length === 0 ? (
                            <tr><td colSpan="4" className="text-center">No classes found. You can bulk import using a CSV.</td></tr>
                        ) : (
                            classes.map(cls => (
                                <tr key={cls.id}>
                                    <td>{cls.id}</td>
                                    <td><strong>{cls.name}</strong></td>
                                    <td>{cls.description || <span className="text-muted">None</span>}</td>
                                    <td>
                                        <span className="pill">{cls.studentCount} student(s)</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                Note: Bulk import CSV must have columns: Name, Description (header row is supported).
            </div>
        </div>
    );
};

export default ClassesPage;
