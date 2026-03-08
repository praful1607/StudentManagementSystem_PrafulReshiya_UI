import { useState, useEffect } from 'react';
import api from '../services/api';

const StudentForm = ({ student, onComplete, onCancel }) => {
    const [firstName, setFirstName] = useState(student?.firstName || '');
    const [lastName, setLastName] = useState(student?.lastName || '');
    const [emailId, setEmailId] = useState(student?.emailId || '');
    const [phoneNumber, setPhoneNumber] = useState(student?.phoneNumber || '');

    const [availableClasses, setAvailableClasses] = useState([]);
    const [selectedClassIds, setSelectedClassIds] = useState(
        student?.classes?.map(c => c.id) || []
    );

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isEdit = !!student;

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.get('/Classes');
                setAvailableClasses(response.data);
            } catch (err) {
                console.error("Failed to load classes", err);
            }
        };
        fetchClasses();
    }, []);

    const handleClassToggle = (classId) => {
        setSelectedClassIds(prev =>
            prev.includes(classId)
                ? prev.filter(id => id !== classId)
                : [...prev, classId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (phoneNumber.length > 10 || !/^\d+$/.test(phoneNumber)) {
            setError('Phone number must contain only digits and be max 10 digits.');
            return;
        }

        setLoading(true);

        const payload = {
            firstName,
            lastName,
            phoneNumber,
            emailId,
            classIds: selectedClassIds
        };

        try {
            if (isEdit) {
                await api.put(`/Students/${student.id}`, payload);
            } else {
                await api.post('/Students', payload);
            }
            onComplete();
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during save.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-form-container">
            <h3>{isEdit ? 'Edit Student' : 'Add New Student'}</h3>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group half">
                        <label>First Name *</label>
                        <input
                            type="text"
                            required
                            maxLength="100"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="form-group half">
                        <label>Last Name *</label>
                        <input
                            type="text"
                            required
                            maxLength="100"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Email Address *</label>
                    <input
                        type="email"
                        required
                        maxLength="256"
                        value={emailId}
                        onChange={(e) => setEmailId(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Phone Number (digits only, max 10) *</label>
                    <input
                        type="text"
                        required
                        maxLength="10"
                        pattern="\d*"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Enroll in Classes</label>
                    <div className="class-selection-box">
                        {availableClasses.length === 0 ? (
                            <div className="text-muted">No classes available</div>
                        ) : (
                            <div className="class-pills-selection">
                                {availableClasses.map(c => {
                                    const isSelected = selectedClassIds.includes(c.id);
                                    return (
                                        <div
                                            key={c.id}
                                            className={`class-selection-pill ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleClassToggle(c.id)}
                                        >
                                            {c.name}
                                            {isSelected && <span className="check-mark">✓</span>}
                                            {!isSelected && <span className="plus-mark">+</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Student'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
