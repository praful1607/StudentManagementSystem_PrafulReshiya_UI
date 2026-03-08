import { useState, useEffect } from 'react';
import api from '../services/api';
import StudentForm from '../components/StudentForm';
import './StudentsPage.css';

const StudentsPage = () => {
    // Grid state
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const [sortColumn, setSortColumn] = useState('Id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [page, setPage] = useState(1);
    const pageSize = 2;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Modal state
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/Students', {
                params: {
                    search,
                    sortColumn,
                    sortDirection,
                    page,
                    pageSize
                }
            });
            setStudents(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Failed to load students', error);
        } finally {
            setLoading(false);
        }
    };

    // Load data on param change
    useEffect(() => {
        loadStudents();
    }, [page, sortColumn, sortDirection]);

    // Delay search to prevent spamming the API
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 1) {
                setPage(1); // Reset to first page
            } else {
                loadStudents();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ column }) => {
        if (sortColumn !== column) return <span className="sort-icon invisible">↕</span>;
        return <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.delete(`/Students/${id}`);
                loadStudents();
            } catch (error) {
                alert('Failed to delete student');
            }
        }
    };

    const openAddModal = () => {
        setEditingStudent(null);
        setShowForm(true);
    };

    const openEditModal = (student) => {
        setEditingStudent(student);
        setShowForm(true);
    };

    const handleFormComplete = () => {
        setShowForm(false);
        loadStudents();
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Students</h2>
                <button className="btn-primary" onClick={openAddModal}>
                    + Add Student
                </button>
            </div>

            <div className="filters-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid-container">
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('FirstName')} className="sortable-col">
                                First Name <SortIcon column="FirstName" />
                            </th>
                            <th onClick={() => handleSort('LastName')} className="sortable-col">
                                Last Name <SortIcon column="LastName" />
                            </th>
                            <th onClick={() => handleSort('EmailId')} className="sortable-col">
                                Email <SortIcon column="EmailId" />
                            </th>
                            <th onClick={() => handleSort('PhoneNumber')} className="sortable-col">
                                Phone <SortIcon column="PhoneNumber" />
                            </th>
                            <th>Enrolled Classes</th>
                            <th className="action-col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                        ) : students.length === 0 ? (
                            <tr><td colSpan="6" className="text-center">No students found</td></tr>
                        ) : (
                            students.map(student => (
                                <tr key={student.id}>
                                    <td>{student.firstName}</td>
                                    <td>{student.lastName}</td>
                                    <td>{student.emailId}</td>
                                    <td>{student.phoneNumber}</td>
                                    <td>
                                        <div className="class-pills">
                                            {student.classes.length > 0
                                                ? student.classes.map(c => <span key={c.id} className="pill">{c.name}</span>)
                                                : <span className="text-muted">None</span>}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="btn-icon check" onClick={() => openEditModal(student)}>✏️</button>
                                        <button className="btn-icon trash" onClick={() => handleDelete(student.id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <div className="page-info">
                    Showing {students.length > 0 ? ((page - 1) * pageSize) + 1 : 0} to {Math.min(page * pageSize, totalCount)} of {totalCount} records
                </div>
                <div className="page-controls">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(prev => prev - 1)}
                        className="btn-page"
                    >
                        Previous
                    </button>
                    <span className="page-current">Page {page} of {totalPages || 1}</span>
                    <button
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage(prev => prev + 1)}
                        className="btn-page"
                    >
                        Next
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <StudentForm
                            student={editingStudent}
                            onComplete={handleFormComplete}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsPage;
