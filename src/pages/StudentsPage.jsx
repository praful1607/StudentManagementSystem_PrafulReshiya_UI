import { useState, useEffect } from 'react';
import api from '../services/api';
import StudentForm from '../components/StudentForm';
import TableComponent from '../components/TableComponent';
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
        const pascaleCaseColumn = column.charAt(0).toUpperCase() + column.slice(1);
        if (sortColumn === pascaleCaseColumn) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(pascaleCaseColumn);
            setSortDirection('asc');
        }
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

            <TableComponent 
                columns={[
                    { key: 'firstName', label: 'First Name', sortable: true },
                    { key: 'lastName', label: 'Last Name', sortable: true },
                    { key: 'emailId', label: 'Email', sortable: true },
                    { key: 'phoneNumber', label: 'Phone', sortable: true },
                    { 
                        key: 'classes', 
                        label: 'Enrolled Classes', 
                        render: (row) => (
                            <div className="class-pills">
                                {row.classes.length > 0
                                    ? row.classes.map(c => <span key={c.id} className="pill">{c.name}</span>)
                                    : <span className="text-muted">None</span>}
                            </div>
                        )
                    },
                    {
                        key: 'actions',
                        label: 'Actions',
                        className: 'actions-cell',
                        render: (row) => (
                            <>
                                <button className="btn-icon check" title="Edit Student" onClick={() => openEditModal(row)}>📝</button>
                                <button className="btn-icon trash" title="Delete Student" onClick={() => handleDelete(row.id)}>❌</button>
                            </>
                        )
                    }
                ]}
                data={students}
                loading={loading}
                emptyMessage="No students found"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                totalPages={totalPages}
                onPageChange={setPage}
            />

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
