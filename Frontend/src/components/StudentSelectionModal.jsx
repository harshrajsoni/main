// Frontend/src/components/StudentSelectionModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentsByCollegeThunk, requestVideoCallThunk } from '../store/slice/videoCallRequestSlice';

const StudentSelectionModal = ({ isOpen, onClose, college, conversationId }) => {
    const dispatch = useDispatch();
    const { students, studentsLoading, studentsError, loading } = useSelector(state => state.videoCallRequests);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        if (isOpen && college) {
            dispatch(getStudentsByCollegeThunk(college.collegeName || college.name));
            setSelectedStudents([]);
            setStatusMsg('');
        }
    }, [isOpen, college, dispatch]);

    const handleStudentToggle = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s._id));
        }
    };

    const handleSubmitRequest = async () => {
        if (selectedStudents.length === 0) {
            setStatusMsg('Please select at least one student.');
            return;
        }

        try {
            await dispatch(requestVideoCallThunk({
                collegeId: college._id,
                conversationId,
                studentIds: selectedStudents
            })).unwrap();
            setStatusMsg('Video call request sent successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            setStatusMsg('Error: ' + error);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }} onClick={onClose}>
            <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: 28,
                minWidth: 500,
                maxWidth: '90vw',
                maxHeight: '80vh',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.3rem' }}>
                        Select Students from {college?.collegeName || college?.name}
                    </h3>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 24,
                            cursor: 'pointer',
                            color: '#888',
                            padding: 0,
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ×
                    </button>
                </div>

                {studentsLoading && (
                    <div style={{ textAlign: 'center', padding: 20 }}>Loading students...</div>
                )}

                {studentsError && (
                    <div style={{ color: '#d32f2f', textAlign: 'center', padding: 20 }}>
                        Error: {studentsError}
                    </div>
                )}

                {students.length > 0 && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <span style={{ fontWeight: 600 }}>
                                {selectedStudents.length} of {students.length} students selected
                            </span>
                            <button
                                onClick={handleSelectAll}
                                style={{
                                    background: 'none',
                                    border: '1px solid #1976d2',
                                    color: '#1976d2',
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div style={{ 
                            flex: 1, 
                            overflowY: 'auto', 
                            maxHeight: 300, 
                            border: '1px solid #eee', 
                            borderRadius: 8, 
                            padding: 12 
                        }}>
                            {students.map(student => (
                                <div key={student._id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 8px',
                                    borderBottom: '1px solid #f0f0f0',
                                    cursor: 'pointer',
                                    background: selectedStudents.includes(student._id) ? '#e3f2fd' : 'transparent',
                                    borderRadius: 6,
                                    marginBottom: 4
                                }} onClick={() => handleStudentToggle(student._id)}>
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.includes(student._id)}
                                        onChange={() => handleStudentToggle(student._id)}
                                        style={{ marginRight: 12 }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{student.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                            {student.rollNumber} • {student.course}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                            {student.email}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {students.length === 0 && !studentsLoading && !studentsError && (
                    <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
                        No students found for this college.
                    </div>
                )}

                {statusMsg && (
                    <div style={{
                        color: statusMsg.startsWith('Error') ? '#d32f2f' : '#388e3c',
                        fontWeight: 500,
                        marginTop: 16,
                        textAlign: 'center',
                        padding: 8,
                        borderRadius: 6,
                        background: statusMsg.startsWith('Error') ? '#ffebee' : '#e8f5e9'
                    }}>
                        {statusMsg}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f5f5f5',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmitRequest}
                        disabled={loading || selectedStudents.length === 0}
                        style={{
                            background: selectedStudents.length === 0 ? '#ccc' : '#1976d2',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: 8,
                            cursor: selectedStudents.length === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Sending...' : `Request Video Call (${selectedStudents.length} students)`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentSelectionModal;
